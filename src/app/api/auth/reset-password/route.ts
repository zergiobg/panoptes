import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
    try {
        const { token, newPassword } = await request.json();

        if (!token || !newPassword) {
            return NextResponse.json({ error: 'Token y nueva contraseña son obligatorios.' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'El enlace de recuperación es inválido o ha expirado.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        return NextResponse.json({ message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.' }, { status: 200 });

    } catch (error) {
        console.error('Reset Password Error:', error);
        return NextResponse.json({ error: 'Error interno procesando la solicitud.' }, { status: 500 });
    }
}
