import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { reportIds, sightingIds, matchIds } = await request.json();

    const fetchReports = async (ids: string[]) => {
      if (!ids || ids.length === 0) return [];
      return await prisma.report.findMany({
        where: {
          OR: [
            { id: { in: ids } },
            { creatorId: { in: ids } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
    };

    const myReports = await fetchReports(reportIds);
    const mySightings = await fetchReports(sightingIds);
    const myMatches = await fetchReports(matchIds);

    return NextResponse.json({
      success: true,
      myReports,
      mySightings,
      myMatches
    });
  } catch (error) {
    console.error('Get Activity Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch activity' }, { status: 500 });
  }
}
