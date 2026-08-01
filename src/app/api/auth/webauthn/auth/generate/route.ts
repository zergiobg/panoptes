import { generateAuthenticationOptions } from '@simplewebauthn/server';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { authenticators: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const host = req.headers.get('host') || '192.168.2.56:3000';
    const rpID = host.split(':')[0];

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: user.authenticators.map((auth: any) => ({
        id: Buffer.from(auth.credentialID).toString('base64url'),
        type: 'public-key',
        transports: auth.transports ? JSON.parse(auth.transports) : undefined,
      })),
      userVerification: 'preferred',
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { currentChallenge: options.challenge },
    });

    return NextResponse.json({ ...options, hasAuthenticators: user.authenticators.length > 0 });
  } catch (err: any) {
    console.error('Error al generar opciones de autenticación WebAuthn:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}
