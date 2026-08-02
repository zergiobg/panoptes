import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const report = await prisma.report.update({
      where: { id },
      data: { status: 'RESOLVED' },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Error resolving report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resolve report' },
      { status: 500 }
    );
  }
}
