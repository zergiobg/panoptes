import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { text, author } = await request.json();
    
    if (!text) {
      return NextResponse.json({ success: false, error: 'Text is required' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        author: author || 'Anónimo',
        reportId: id
      }
    });

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error('Create Comment Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create comment' }, { status: 500 });
  }
}
