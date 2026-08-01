import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');
    
    // Simplification for prototype: return all APPROVED reports.
    // In production, we would use PostGIS or Haversine filtering.
    let reports = await prisma.report.findMany({
      where: {
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
      },
      include: {
        sightings: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Para efectos de prueba (prototipo), si un reporte no tiene coordenadas,
    // le asignamos unas coordenadas simuladas cerca de la ubicación enviada (lat, lng)
    reports = reports.map((report, index) => {
      if (report.latitude === null || report.longitude === null) {
        // Offset simple para que no queden todos en el mismo punto exacto
        return {
          ...report,
          latitude: lat + (Math.random() * 0.02 - 0.01),
          longitude: lng + (Math.random() * 0.02 - 0.01),
        };
      }
      return report;
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch nearby events' }, { status: 500 });
  }
}
