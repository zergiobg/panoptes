import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { targetUserId, endorserEmail, action } = body;
        // action: "APPROVE" | "REJECT"

        if (!targetUserId || !endorserEmail || !action) {
            return NextResponse.json({ error: 'Faltan parámetros requeridos.' }, { status: 400 });
        }

        const endorser = await prisma.user.findUnique({ where: { email: endorserEmail } });
        if (!endorser || (endorser.status !== 'ACTIVE' && endorser.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Tu cuenta no tiene los privilegios para endosar.' }, { status: 403 });
        }

        const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
        if (!targetUser) {
            return NextResponse.json({ error: 'Usuario objetivo no encontrado.' }, { status: 404 });
        }

        if (action === 'REJECT') {
            // El rechazo puede ser inmediato si alguien marca Red Flag, o lo ponemos SUSPENDED.
            await prisma.user.update({
                where: { id: targetUserId },
                data: { status: 'SUSPENDED' }
            });
            return NextResponse.json({ message: 'Usuario rechazado en la red.' }, { status: 200 });
        }

        // Acción APPROVE
        // Registrar el endoso en la tabla Many-to-Many
        try {
            await prisma.endorsement.create({
                data: {
                    endorserId: endorser.id,
                    endorseeId: targetUserId
                }
            });
        } catch {
            // Ignoramos si ya lo endosó previamente esta misma persona (Unique Constraint Error)
            return NextResponse.json({ error: 'Ya has endosado a esta persona previamente.' }, { status: 409 });
        }

        // Verificar cuántos endosos tiene en total
        const totalEndorsements = await prisma.endorsement.count({
            where: { endorseeId: targetUserId }
        });

        // LÓGICA DE NEGOCIO PANOPTES: O es endosado por ADMIN (creador), o requiere llegar a 3 endosos normales.
        if (endorser.role === 'ADMIN' || totalEndorsements >= 3) {
            const updatedUser = await prisma.user.update({
                where: { id: targetUserId },
                data: {
                    status: 'ACTIVE',
                    kycVerifiedAt: new Date()
                }
            });
            return NextResponse.json({
                message: '¡El usuario ha acumulado los endosos requeridos y ahora está ACTIVO en la red!',
                user: updatedUser
            }, { status: 200 });
        }

        return NextResponse.json({
            message: `Endoso registrado con éxito. El usuario tiene ${totalEndorsements} de los 3 requeridos.`
        }, { status: 200 });

    } catch (error) {
        console.error('Endorsement Error:', error);
        return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
    }
}
