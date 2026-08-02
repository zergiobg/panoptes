import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateAndCheckSuspension } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const auth = await authenticateAndCheckSuspension();
    if (auth.isSuspended) {
        return NextResponse.json({ error: 'Cuenta Suspendida. Interacciones desactivadas.' }, { status: 403 });
    }

    const { reportId, latitude, longitude, comment, photoUrl } = await req.json();

    const sighting = await prisma.sighting.create({
      data: {
        reportId,
        reporterId: auth.user?.id || undefined,
        latitude,
        longitude,
        comment,
        photoUrl
      }
    });

    return NextResponse.json(sighting, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create sighting' }, { status: 500 });
  }
}
