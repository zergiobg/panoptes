import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendSMS } from '@/lib/sms';
import { authenticateAndCheckSuspension } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const auth = await authenticateAndCheckSuspension();
        if (!auth.isAuthenticated || !auth.user) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
        }

        const { phone } = await request.json();
        if (!phone) {
            return NextResponse.json({ success: false, error: 'El teléfono es requerido' }, { status: 400 });
        }

        // Generar código OTP de 6 dígitos
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Expiración: 10 minutos desde ahora
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Guardar OTP en la base de datos (relacionado con el email del usuario para seguridad)
        await prisma.oTP.create({
            data: {
                email: auth.user.email,
                code: otpCode,
                expiresAt
            }
        });

        // Enviar el SMS usando nuestro adaptador (Dummy por ahora)
        const message = `Tu codigo de verificacion para Panoptes es: ${otpCode}. Expira en 10 minutos.`;
        await sendSMS(phone, message);

        return NextResponse.json({ success: true, message: 'OTP enviado correctamente (Dummy)' });

    } catch (error: any) {
        console.error('Send OTP Error:', error);
        return NextResponse.json({ success: false, error: 'Error al enviar el OTP' }, { status: 500 });
    }
}
