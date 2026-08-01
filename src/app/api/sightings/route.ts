import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { reportId, latitude, longitude, comment, photoUrl } = await req.json();

    // The current reporter ID could come from a session cookie.
    // For now we use the Genesis user ID or a placeholder if auth isn't fully active on this route.
    // Assuming Genesis user exists for testing purposes, or we find a generic user.
    const user = await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 400 });
    }

    const sighting = await prisma.sighting.create({
      data: {
        reportId,
        reporterId: user.id,
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
