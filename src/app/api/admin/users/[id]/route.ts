import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AccountStatus } from '@prisma/client';

// PATCH: Cambiar estado (ej: a SUSPENDED o ACTIVE)
export async function PATCH(request: Request, { params }: { params: any }) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    
    // Validar status
    if (!Object.values(AccountStatus).includes(status)) {
        return NextResponse.json({ success: false, error: 'Status inválido' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Update User Status Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update user status' }, { status: 500 });
  }
}

// DELETE: Eliminar permanentemente
export async function DELETE(request: Request, { params }: { params: any }) {
  try {
    const { id } = await params;
    
    // 1. Encontrar al usuario
    const user = await prisma.user.findUnique({
      where: { id },
      include: { reports: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // 2. Borrar todos los reportes, sightings, etc asociados a sus reportes o a él mismo
    // Nota: Algunas relaciones (como Authenticators y PushSubscriptions) tienen onDelete: Cascade en el schema,
    // pero los Reports no. Eliminaremos primero los Reportes creados por él.
    
    const userReportIds = user.reports.map(r => r.id);

    // Borrar Sightings que hizo
    await prisma.sighting.deleteMany({
      where: { reporterId: user.id }
    });

    // Borrar Sightings de SUS reportes (en caso de que otros hayan comentado)
    if (userReportIds.length > 0) {
      await prisma.sighting.deleteMany({
        where: { reportId: { in: userReportIds } }
      });
      // Borrar Comments, MatchClaims, etc
      await prisma.comment.deleteMany({
        where: { reportId: { in: userReportIds } }
      });
      await prisma.matchClaim.deleteMany({
        where: { reportId: { in: userReportIds } }
      });
      await prisma.searchEndorsement.deleteMany({
        where: { reportId: { in: userReportIds } }
      });
    }

    // Borrar sus SearchEndorsements (que dio a reportes de otros)
    await prisma.searchEndorsement.deleteMany({
      where: { endorserId: user.id }
    });

    // Finalmente, borrar los Reportes del usuario
    await prisma.report.deleteMany({
      where: { userId: user.id }
    });

    // 3. Borrar al Usuario
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete User Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}
