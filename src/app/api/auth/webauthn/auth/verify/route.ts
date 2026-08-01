import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, response } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
      include: { authenticators: true },
    });

    if (!user || !user.currentChallenge) {
      return NextResponse.json({ error: 'Usuario o desafío no encontrado' }, { status: 400 });
    }

    const authenticator = user.authenticators.find(
      (auth: any) => Buffer.from(auth.credentialID).toString('base64url') === response.id
    );

    if (!authenticator) {
      return NextResponse.json({ error: 'Autenticador no encontrado en la cuenta' }, { status: 400 });
    }

    const host = req.headers.get('host') || '192.168.2.56:3000';
    const rpID = host.split(':')[0];
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const origin = req.headers.get('origin') || `${protocol}://${host}`;

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: Buffer.from(authenticator.credentialID).toString('base64url'),
        publicKey: new Uint8Array(authenticator.credentialPublicKey),
        counter: Number(authenticator.counter),
        transports: authenticator.transports ? JSON.parse(authenticator.transports) : undefined,
      },
    });

    if (verification.verified) {
      const newCounter = verification.authenticationInfo?.newCounter;
      if (newCounter !== undefined) {
        await prisma.authenticator.update({
          where: { id: authenticator.id },
          data: { counter: BigInt(newCounter) },
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { currentChallenge: null },
      });

      // Set secure HTTP-only cookie
      const cookieStore = await cookies();
      cookieStore.set('admin_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false, error: 'Autenticación fallida' }, { status: 400 });
  } catch (err: any) {
    console.error('Error al verificar autenticación WebAuthn:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}
