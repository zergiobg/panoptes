import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Usuarios por estado (PENDING, ACTIVE, SUSPENDED, RED_FLAG)
    const userGroups = await prisma.user.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const userStats = userGroups.reduce((acc: any, group) => {
      acc[group.status] = group._count.id;
      acc.TOTAL = (acc.TOTAL || 0) + group._count.id;
      return acc;
    }, { PENDING: 0, ACTIVE: 0, RED_FLAG: 0, SUSPENDED: 0, TOTAL: 0 });

    // 2. Reportes por Tipo (LOST vs FOUND)
    const typeGroups = await prisma.report.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
    });
    const reportTypes = typeGroups.reduce((acc: any, group) => {
      acc[group.type] = group._count.id;
      return acc;
    }, { LOST: 0, FOUND: 0 });

    // 3. Reportes por Categoría
    const categoryGroups = await prisma.report.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: { id: 'desc' }
      }
    });

    // 4. Datos demográficos para categoría "Persona"
    const genderGroups = await prisma.report.groupBy({
      by: ['gender'],
      where: { category: 'Persona', gender: { not: null } },
      _count: { id: true }
    });

    const ageGroups = await prisma.report.groupBy({
      by: ['ageRange'],
      where: { category: 'Persona', ageRange: { not: null } },
      _count: { id: true }
    });

    const cognitiveGroups = await prisma.report.groupBy({
      by: ['cognitiveCondition'],
      where: { category: 'Persona', cognitiveCondition: { not: null } },
      _count: { id: true }
    });

    const locationGroups = await prisma.report.groupBy({
      by: ['location'],
      where: { category: 'Persona', location: { not: '' } },
      _count: { id: true }
    });

    return NextResponse.json({
      success: true,
      users: userStats,
      reports: {
        byType: reportTypes,
        byCategory: categoryGroups.map(g => ({ category: g.category, count: g._count.id })),
        demographics: {
          gender: genderGroups.map(g => ({ name: g.gender, count: g._count.id })),
          ageRange: ageGroups.map(g => ({ name: g.ageRange, count: g._count.id })),
          cognitive: cognitiveGroups.map(g => ({ name: g.cognitiveCondition, count: g._count.id })),
          location: locationGroups.map(g => ({ name: g.location, count: g._count.id }))
        }
      }
    });
  } catch (error) {
    console.error('Stats Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load stats' }, { status: 500 });
  }
}
