import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                receivedEndorsements: {
                    include: {
                        endorser: {
                            select: { name: true, email: true, status: true }
                        }
                    }
                },
                reports: {
                    select: { id: true, type: true, category: true, description: true, eventDate: true }
                },
                sightings: {
                    select: { id: true, createdAt: true, report: { select: { type: true, category: true } } }
                }
            }
        });

        // Map the data so the frontend doesn't break if it expects a single endorser (just take the first one or none)
        const formattedUsers = users.map(user => {
            const firstEndorsement = user.receivedEndorsements?.[0];
            return {
                ...user,
                endorser: firstEndorsement ? firstEndorsement.endorser : null
            };
        });

        return NextResponse.json({ users: formattedUsers }, { status: 200 });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Error del servidor al obtener usuarios.' }, { status: 500 });
    }
}
