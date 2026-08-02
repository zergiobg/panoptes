import { NextResponse } from 'next/server';
import { authenticateAndCheckSuspension } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const auth = await authenticateAndCheckSuspension();
        
        if (!auth.isAuthenticated || !auth.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Even suspended users can contact support!
        const { message, subject } = await req.json();

        if (!message || !subject) {
            return NextResponse.json({ error: 'Mensaje y asunto requeridos.' }, { status: 400 });
        }

        // Simulated sending...
        console.log(`[SUPPORT TICKET] From: ${auth.user.email} | Subject: ${subject}`);
        console.log(`[SUPPORT TICKET] Message: ${message}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Support message error:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
