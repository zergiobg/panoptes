import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { authenticateAndCheckSuspension } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const auth = await authenticateAndCheckSuspension();
        
        if (!auth.isAuthenticated || !auth.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { current, new: newPass } = await req.json();

        if (!current || !newPass || newPass.length < 6) {
            return NextResponse.json({ error: 'Datos inválidos o contraseña muy corta.' }, { status: 400 });
        }

        // Fetch user with password
        const dbUser = await prisma.user.findUnique({
            where: { id: auth.user.id }
        });

        if (!dbUser || !dbUser.password) {
            return NextResponse.json({ error: 'Usuario no encontrado o no usa contraseña.' }, { status: 400 });
        }

        const isMatch = await bcrypt.compare(current, dbUser.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Contraseña actual incorrecta.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPass, 10);

        await prisma.user.update({
            where: { id: auth.user.id },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
