import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        comments: {
          orderBy: { createdAt: 'desc' }
        },
        matchClaims: {
          orderBy: { createdAt: 'desc' }
        },
        sightings: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!report) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    // Por seguridad, no devolvemos el creatorId en el JSON para que otros no puedan robar el "token"
    const { creatorId, ...safeReport } = report;

    return NextResponse.json({ success: true, report: safeReport });
  } catch (error) {
    console.error('Get Report Detail Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch report details' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    if (body.action === 'RESOLVE') {
      const updated = await prisma.report.update({
        where: { id },
        data: { status: 'RESOLVED' }
      });
      return NextResponse.json({ success: true, report: updated });
    }

    if (body.action === 'APPROVE') {
      const updated = await prisma.report.update({
        where: { id },
        data: { approvalStatus: 'APPROVED' }
      });
      return NextResponse.json({ success: true, report: updated });
    }

    if (body.action === 'REJECT') {
      const updated = await prisma.report.update({
        where: { id },
        data: { approvalStatus: 'REJECTED', status: 'ARCHIVED' }
      });
      return NextResponse.json({ success: true, report: updated });
    }
    
    if (body.action === 'EDIT') {
      // Allow modifying specific fields
      const { description, photoUrl, photoUrls, color, clothing, name, distinctiveFeatures, petType, breed, licensePlate, brandModel } = body.data;
      const updated = await prisma.report.update({
        where: { id },
        data: { 
          description,
          photoUrl,
          photoUrls,
          color,
          clothing,
          name,
          distinctiveFeatures,
          petType,
          breed,
          licensePlate,
          brandModel
        }
      });
      return NextResponse.json({ success: true, report: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Update Report Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update report' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Delete the report. Prisma will automatically cascade delete related records if configured,
    // or we might need to delete them manually if not configured.
    // Let's assume standard behavior or manual cleanup isn't strictly required for MVP, but to be safe we'll just delete the report.
    await prisma.report.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete Report Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete report' }, { status: 500 });
  }
}
