import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateAndCheckSuspension } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const auth = await authenticateAndCheckSuspension();
        if (!auth.isAuthenticated || !auth.user) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
        }

        const { code, phone } = await request.json();
        
        if (!code || !phone) {
            return NextResponse.json({ success: false, error: 'Faltan datos' }, { status: 400 });
        }

        // Buscar el OTP más reciente y no expirado para este email y código
        const otpRecord = await prisma.oTP.findFirst({
            where: {
                email: auth.user.email,
                code: code,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!otpRecord) {
            return NextResponse.json({ success: false, error: 'Código inválido o expirado' }, { status: 400 });
        }

        // Marcar el teléfono y actualizar el estado del usuario si es PENDING
        await prisma.user.update({
            where: { id: auth.user.id },
            data: {
                phone: phone,
                kycVerifiedAt: new Date(),
                status: auth.user.status === 'PENDING' ? 'ACTIVE' : auth.user.status
            }
        });

        // Opcional: Borrar el OTP usado
        await prisma.oTP.deleteMany({
            where: { email: auth.user.email }
        });

        return NextResponse.json({ success: true, message: 'Identidad verificada exitosamente.' });

    } catch (error: any) {
        console.error('Verify OTP Error:', error);
        return NextResponse.json({ success: false, error: 'Error al verificar el OTP' }, { status: 500 });
    }
}
