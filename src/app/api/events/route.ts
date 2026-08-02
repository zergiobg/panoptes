import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, type, latitude, longitude, photoUrl, reporterId } = body;

        // Validación de integridad
        if (!title || !type || latitude == null || longitude == null) {
            return NextResponse.json({ error: 'Faltan parámetros obligatorios del reporte espacial.' }, { status: 400 });
        }

        // KYC check temporarily removed to allow anonymous reports
        const finalReporterId = reporterId || null;

        const newEvent = await prisma.report.create({
            data: {
                type: 'LOST', // default
                category: type,
                description: title + '\n' + description,
                location: `${latitude},${longitude}`,
                latitude,
                longitude,
                eventDate: new Date(),
                photoUrl: photoUrl || null,
                creatorId: finalReporterId,
                status: 'ACTIVE',
            }
        });

        return NextResponse.json({
            message: 'Evento distribuido con éxito en la red comunitaria.',
            event: newEvent
        }, { status: 201 });

    } catch (error) {
        console.error('Event Creation Error:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
