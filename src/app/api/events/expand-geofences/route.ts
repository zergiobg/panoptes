import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// API pensada para ser llamada como un CRON JOB todos los días a media noche.
export async function POST(request: Request) {
    try {
        // Validar un token interno o Secret para evitar accesos indebidos al expansion-job si se monta.
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'dev_secret'}`) {
            return NextResponse.json({ error: 'Sin autorización para ejecutar CronJobs.' }, { status: 401 });
        }

        const now = new Date();
        // Consideramos que un evento requiere expansión si pasaron 24hr desde la última.
        // 24 * 60 * 60 * 1000 = 86400000ms
        const expansionThreshold = new Date(now.getTime() - 86400000);

        const eventsToExpand = await prisma.lossEvent.findMany({
            where: {
                status: 'ACTIVE',
                lastExpandedAt: {
                    lte: expansionThreshold // lastExpandedAt <= hace 24 hrs
                }
            }
        });

        if (eventsToExpand.length === 0) {
            return NextResponse.json({ message: 'Sin anillos para expandir hoy.' }, { status: 200 });
        }

        let updatedCount = 0;

        // Expandimos los radios y reseteamos el último momento de expansión
        // Diferentes lógicas pueden aplicar (mascotas +2km, personas +5km).
        for (const event of eventsToExpand) {
            let increment = 1.0;
            if (event.type === 'PERSON') increment = 5.0;
            if (event.type === 'PET') increment = 3.0;

            await prisma.lossEvent.update({
                where: { id: event.id },
                data: {
                    radiusKm: { increment },
                    lastExpandedAt: now
                }
            });

            updatedCount++;
        }

        return NextResponse.json({
            message: `Anillos de búsqueda expandidos matemáticamente.`,
            expandedCount: updatedCount
        }, { status: 200 });

    } catch (error) {
        console.error('Geo-Expansion Cron Error:', error);
        return NextResponse.json({ error: 'Error del servidor expandiendo anillos.' }, { status: 500 });
    }
}
