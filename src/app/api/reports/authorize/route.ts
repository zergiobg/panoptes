import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { reportId } = await req.json();

    // The endorser ID could come from a session cookie.
    // For prototype, we use the Genesis admin user.
    const user = await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 400 });
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { searchEndorsements: true }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    if (report.approvalStatus === 'APPROVED') {
      return NextResponse.json({ message: 'Already approved' }, { status: 200 });
    }

    // Add Endorsement
    await prisma.searchEndorsement.create({
      data: {
        reportId,
        endorserId: user.id
      }
    });

    // Count total endorsements for this report
    const totalEndorsements = await prisma.searchEndorsement.count({
      where: { reportId }
    });

    // Buisness Rule: 3 endorsements OR 1 from Admin (Role = ADMIN)
    const isAdmin = user.role === 'ADMIN';
    const isApproved = isAdmin || totalEndorsements >= 3;

    if (isApproved) {
      await prisma.report.update({
        where: { id: reportId },
        data: { approvalStatus: 'APPROVED' }
      });
      return NextResponse.json({ success: true, message: 'Search authorized!', status: 'APPROVED' });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Endorsement recorded. ${3 - totalEndorsements} more needed.`, 
      status: 'PENDING' 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to authorize search' }, { status: 500 });
  }
}
