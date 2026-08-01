import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      type, category, description, location, eventDate, photoUrl, photoUrls, aiSuggestedCategory, 
      latitude, longitude, radiusKm, color, licensePlate, brandModel,
      name, petType, breed, clothing, ageRange, distinctiveFeatures, cognitiveCondition, height, gender, appearance,
      creatorId
    } = body;

    // Optional validation logic for requiring approval for vehicles or specific categories
    const isVehicleOrHighValue = category === 'Vehículo' || category === 'Dispositivos' || category === 'Otro';
    const requiresApproval = isVehicleOrHighValue;
    const approvalStatus = requiresApproval ? 'PENDING' : 'APPROVED';

    const report = await prisma.report.create({
      data: {
        type, // 'FOUND' or 'LOST'
        category,
        description,
        location,
        eventDate: new Date(eventDate),
        photoUrl,
        photoUrls: photoUrls || [],
        aiSuggestedCategory,
        latitude,
        longitude,
        radiusKm: radiusKm || 1.0,
        color,
        licensePlate,
        brandModel,
        name,
        petType,
        breed,
        clothing,
        ageRange,
        distinctiveFeatures,
        cognitiveCondition,
        height,
        gender,
        appearance,
        creatorId,
        requiresApproval,
        approvalStatus
      }
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Create Report Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create report' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const admin = searchParams.get('admin') === 'true';
    const date = searchParams.get('date');

    const where: any = {};
    if (type) where.type = type;
    if (category) where.category = category;
    
    if (date === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.createdAt = {
        gte: today
      };
    }

    // Si no es admin, solo mostrar los aprobados
    if (!admin) {
      where.approvalStatus = 'APPROVED';
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        sightings: true,
        matchClaims: true
      }
    });

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error('Get Reports Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reports' }, { status: 500 });
  }
}
