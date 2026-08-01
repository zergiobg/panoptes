import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, type, latitude, longitude, photoUrl, reporterId } = body;

        // Validación de integridad
        if (!title || !type || latitude == null || longitude == null || !reporterId) {
            return NextResponse.json({ error: 'Faltan parámetros obligatorios del reporte espacial.' }, { status: 400 });
        }

        // Verificación de KYC en la red "Panoptes":
        const reporter = await prisma.user.findUnique({ where: { id: reporterId } });
        if (!reporter || reporter.status !== 'ACTIVE') {
            return NextResponse.json({
                error: 'Confianza Insuficiente. Solo miembros ACTIVOS (validados por endosos KYC) pueden activar alarmas de búsqueda.'
            }, { status: 403 });
        }

        // Creación del evento. El radio inicial por defecto en Prisma es 1.0 km.
        const newEvent = await prisma.report.create({
            data: {
                type: 'LOST', // default
                category: type, // PERSON, PET, THING mapped to category
                description: title ? `${title}: ${description}` : description,
                location: 'Desconocida',
                eventDate: new Date(),
                latitude,
                longitude,
                photoUrl,
                userId: reporterId
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
