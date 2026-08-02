import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { subscription, userId } = body;

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: 'Suscripción inválida' }, { status: 400 });
        }

        // The auth and p256dh keys are inside subscription.keys
        const { keys } = subscription;
        if (!keys || !keys.p256dh || !keys.auth) {
            return NextResponse.json({ error: 'Llaves de suscripción faltantes' }, { status: 400 });
        }

        // Upsert the subscription based on endpoint
        const savedSub = await prisma.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: {
                userId: userId || null, // Optional link to a user
                p256dh: keys.p256dh,
                auth: keys.auth,
            },
            create: {
                endpoint: subscription.endpoint,
                userId: userId || null,
                p256dh: keys.p256dh,
                auth: keys.auth,
            }
        });

        return NextResponse.json({ success: true, id: savedSub.id }, { status: 201 });
    } catch (error) {
        console.error('Subscription error:', error);
        return NextResponse.json({ error: 'Fallo al guardar la suscripción' }, { status: 500 });
    }
}
