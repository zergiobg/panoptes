import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { latitude, longitude, photoUrl, comment } = await request.json();
    
    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ success: false, error: 'Latitude and longitude are required' }, { status: 400 });
    }

    const sighting = await prisma.sighting.create({
      data: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        photoUrl: photoUrl || null,
        comment: comment || null,
        reportId: id
      }
    });

    return NextResponse.json({ success: true, sighting });
  } catch (error) {
    console.error('Create Sighting Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create sighting' }, { status: 500 });
  }
}
