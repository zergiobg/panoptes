import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, otpCode, photoUrl } = body;

        // Strict KYC Requirements + OTP
        if (!name || !email || !phone || !otpCode) {
            return NextResponse.json({ error: 'Nombre, email, teléfono y código OTP son obligatorios para el KYC.' }, { status: 400 });
        }

        // Validar el Código Estricto
        const validOtp = await prisma.oTP.findFirst({
            where: {
                email,
                code: otpCode,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!validOtp) {
            return NextResponse.json({ error: 'Código de acceso inválido o expirado.' }, { status: 401 });
        }

        // Verificar unicidad en la red
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { phone: phone }
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'El reconocimiento facial/datos indican que ya existes en la red.' }, { status: 409 });
        }

        // Crear el usuario con estado Pendiente de 3 endosos.
        // OJO: Ya no usamos `endorsedById` de manera lineal, la tabla de Endosos es el nexo M:N ahora.
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                photoUrl,
                status: 'PENDING',
            }
        });

        // Borramos el registro OTP por seguridad
        await prisma.oTP.deleteMany({ where: { email } });

        return NextResponse.json({
            message: 'Validación por OTP pasada con éxito. Quedas pendiente a requerir el soporte de 3 Testigos Comunitarios válidamente Activos o la revisión interna.',
            user: { id: newUser.id, name: newUser.name, status: newUser.status }
        }, { status: 201 });

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'Error del servidor en registro.' }, { status: 500 });
    }
}
