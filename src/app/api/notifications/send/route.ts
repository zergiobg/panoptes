import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import webpush from 'web-push';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, message, url, targetUserId } = body;

        if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_SUBJECT) {
            return NextResponse.json({ error: 'Configuración Web Push incompleta.' }, { status: 500 });
        }

        webpush.setVapidDetails(
            process.env.VAPID_SUBJECT,
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );

        // Fetch subscriptions
        const whereClause = targetUserId ? { userId: targetUserId } : {};
        const subscriptions = await prisma.pushSubscription.findMany({ where: whereClause });

        if (subscriptions.length === 0) {
            return NextResponse.json({ message: 'No hay usuarios suscritos a notificaciones.' }, { status: 200 });
        }

        const payload = JSON.stringify({
            title: title || 'Alerta Panoptes',
            body: message || 'Tienes una nueva alerta en tu red local.',
            url: url || '/',
        });

        const sendPromises = subscriptions.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    auth: sub.auth,
                    p256dh: sub.p256dh
                }
            };

            try {
                await webpush.sendNotification(pushSubscription, payload);
            } catch (err: any) {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    // Subscription has expired or is no longer valid, delete it
                    await prisma.pushSubscription.delete({ where: { id: sub.id } });
                } else {
                    console.error('Error sending push:', err);
                }
            }
        });

        await Promise.allSettled(sendPromises);

        return NextResponse.json({ success: true, sentTo: subscriptions.length }, { status: 200 });

    } catch (error) {
        console.error('Push Send Error:', error);
        return NextResponse.json({ error: 'Fallo al enviar notificación Push' }, { status: 500 });
    }
}
