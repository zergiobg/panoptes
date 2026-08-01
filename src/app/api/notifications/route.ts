import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { latitude, longitude } = await request.json();
    
    // Alertas Globales de Alta Prioridad (Personas, Mascotas, Vehículos) en los últimos 7 días
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const globalAlerts = await prisma.report.findMany({
      where: {
        type: 'LOST',
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        category: { in: ['Persona', 'Vehículo', 'Mascota'] },
        createdAt: { gte: sevenDaysAgo }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Alertas Locales (Objetos perdidos o encontrados cerca de mí)
    // Para simplificar sin PostGIS, buscaremos los que tengan lat/lng cercano matemáticamente (aprox 10km)
    // 1 grado lat/lng ~ 111km. 10km ~ 0.09 grados
    let localAlerts: any[] = [];
    
    if (latitude && longitude) {
      const latRange = 0.09;
      const lngRange = 0.09;
      
      localAlerts = await prisma.report.findMany({
        where: {
          status: 'ACTIVE',
          approvalStatus: 'APPROVED',
          category: { notIn: ['Persona', 'Vehículo', 'Mascota'] }, // Ya las trajimos en globales
          latitude: { gte: latitude - latRange, lte: latitude + latRange },
          longitude: { gte: longitude - lngRange, lte: longitude + lngRange },
          createdAt: { gte: sevenDaysAgo }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
      
      // Si no encontramos nada con ubicación estricta, o los reportes de prueba no tienen lat/lng,
      // traemos los más recientes a nivel general como fallback
      if (localAlerts.length === 0) {
        localAlerts = await prisma.report.findMany({
          where: {
            status: 'ACTIVE',
            approvalStatus: 'APPROVED',
            category: { notIn: ['Persona', 'Vehículo', 'Mascota'] },
            createdAt: { gte: sevenDaysAgo }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        });
      }
    } else {
      // Si no dan ubicación, traer los últimos objetos también de manera global (fallback)
      localAlerts = await prisma.report.findMany({
        where: {
          status: 'ACTIVE',
          approvalStatus: 'APPROVED',
          category: { notIn: ['Persona', 'Vehículo', 'Mascota'] },
          createdAt: { gte: sevenDaysAgo }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    }

    return NextResponse.json({ 
      success: true, 
      notifications: {
        global: globalAlerts,
        local: localAlerts
      } 
    });
  } catch (error) {
    console.error('Notifications API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
