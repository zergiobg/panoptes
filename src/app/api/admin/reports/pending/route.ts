import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const pendingReports = await prisma.report.findMany({
      where: {
        approvalStatus: 'PENDING'
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, reports: pendingReports });
  } catch (error) {
    console.error('Fetch pending reports error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch pending reports' }, { status: 500 });
  }
}
