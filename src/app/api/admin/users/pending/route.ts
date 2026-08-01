import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        // Nota local: En producción aquí validaríamos un JWT de administrador.
        // Por ahora, como es backend API, traemos la queue de aprobación KYC.
        const pendingUsers = await prisma.user.findMany({
            where: {
                status: {
                    in: ['PENDING', 'RED_FLAG']
                }
            },
            include: {
                endorser: {
                    select: { name: true, email: true, status: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ users: pendingUsers }, { status: 200 });
    } catch (error) {
        console.error('Fetch Pending Users Error:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
