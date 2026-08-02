import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { reportId, latitude, longitude, comment, photoUrl } = await req.json();

    // In production, we'd extract the user from the session cookie here.
    // For now, we allow anonymous sightings (reporterId = undefined).
    
    const sighting = await prisma.sighting.create({
      data: {
        reportId,
        reporterId: undefined, // Replace with actual user ID when sessions are added
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
