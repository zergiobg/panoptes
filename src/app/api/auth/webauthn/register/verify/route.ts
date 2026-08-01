import { verifyRegistrationResponse } from '@simplewebauthn/server';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, response } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.currentChallenge) {
      return NextResponse.json({ error: 'Desafío no encontrado o expirado' }, { status: 400 });
    }

    const host = req.headers.get('host') || '192.168.2.56:3000';
    const rpID = host.split(':')[0];
    const origin = req.headers.get('origin') || `http://${host}`;

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const info = verification.registrationInfo as any;
      const credential = info.credential || info;

      const credentialID = credential.id || info.credentialID || response.id;
      const pubKey = credential.publicKey || info.credentialPublicKey;
      const counter = credential.counter ?? info.counter ?? 0;
      const transports = credential.transports ? JSON.stringify(credential.transports) : info.transports ? JSON.stringify(info.transports) : null;
      const deviceType = info.credentialDeviceType || 'singleDevice';
      const backedUp = info.credentialBackedUp ?? false;

      const pubKeyBase64 = typeof pubKey === 'string' ? pubKey : Buffer.from(pubKey).toString('base64');

      await prisma.authenticator.create({
        data: {
          credentialID: Buffer.from(credentialID, 'base64url'),
          credentialPublicKey: Buffer.from(pubKeyBase64, 'base64url'),
          counter: BigInt(counter),
          credentialDeviceType: deviceType,
          credentialBackedUp: backedUp,
          transports,
          userId: user.id,
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { currentChallenge: null },
      });

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false, error: 'Verificación fallida' }, { status: 400 });
  } catch (err: any) {
    console.error('Error al verificar registro WebAuthn:', err);
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}
