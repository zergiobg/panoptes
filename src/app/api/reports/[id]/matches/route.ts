import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { message, photoUrl } = await request.json();
    
    if (!photoUrl) {
      return NextResponse.json({ success: false, error: 'Photo is required for a Match Claim' }, { status: 400 });
    }

    const matchClaim = await prisma.matchClaim.create({
      data: {
        message: message || null,
        photoUrl,
        reportId: id
      }
    });

    return NextResponse.json({ success: true, matchClaim });
  } catch (error) {
    console.error('Create MatchClaim Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create match claim' }, { status: 500 });
  }
}
