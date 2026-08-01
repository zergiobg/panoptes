import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        // Un secreto fuerte que solo tú y yo conocemos por ahora
        if (secret !== process.env.RESET_SECRET && secret !== 'bochica_genesis_reset_2026') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const email = 'sergio@bochica.network';

        // Buscamos al usuario
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuario Génesis no encontrado en la BD.' }, { status: 404 });
        }

        // Borramos todos los autenticadores (Passkeys) asociados a este usuario
        const deletedCount = await prisma.authenticator.deleteMany({
            where: { userId: user.id }
        });

        // Limpiamos cualquier desafío pendiente
        await prisma.user.update({
            where: { id: user.id },
            data: { currentChallenge: null }
        });

        return NextResponse.json({ 
            message: 'Passkeys del usuario Génesis reseteados con éxito. Ya puedes volver a registrar un nuevo dispositivo.',
            deletedAuthenticators: deletedCount.count
        }, { status: 200 });

    } catch (error) {
        console.error('Error al resetear passkeys:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
