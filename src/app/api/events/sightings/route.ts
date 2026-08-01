import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { eventId, reporterId, latitude, longitude, comment, photoUrl, voiceNoteUrl } = body;

        // Validación Básica
        if (!eventId || !reporterId || latitude == null || longitude == null) {
            return NextResponse.json({
                error: 'Las coordenadas y el ID del evento son determinantes para un reporte veraz.'
            }, { status: 400 });
        }

        // Verificar KYC del reportero
        const reporter = await prisma.user.findUnique({ where: { id: reporterId } });
        if (!reporter || reporter.status !== 'ACTIVE') {
            return NextResponse.json({ error: 'Solo miembros validados pueden emitir avistamientos (KYC requerido).' }, { status: 403 });
        }

        // Insertar Avistamiento pasivo
        const sighting = await prisma.sighting.create({
            data: {
                eventId,
                reporterId,
                latitude,
                longitude,
                comment,
                photoUrl,
                voiceNoteUrl
            }
        });

        // Nota de Arquitectura: En este punto dispararíamos Web Sockets o Serveless Push Notifications 
        // al Propietario del Evento y al grafo de gente cercana.
        // Ej: In-App Notification (Pusher, Socket.io, Firebase)

        return NextResponse.json({
            message: 'Avistamiento reportado a la red de vigilancia con éxito.',
            sighting
        }, { status: 201 });

    } catch (error) {
        console.error('Sighting Report Error:', error);
        return NextResponse.json({ error: 'Falla estocástica en el servidor al cargar avistamiento.' }, { status: 500 });
    }
}
