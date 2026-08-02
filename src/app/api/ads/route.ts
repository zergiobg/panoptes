import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const contextParam = searchParams.get('context')?.toUpperCase();

        const whereClause = contextParam ? {
            OR: [
                { category: contextParam },
                { category: 'GENERAL' }
            ]
        } : {};

        let ads = await prisma.ad.findMany({
            where: whereClause,
            orderBy: { priority: 'asc' }
        });

        if (ads.length === 0) {
            ads = await prisma.ad.findMany({
                orderBy: { priority: 'asc' }
            });
        }

        return NextResponse.json({ ads }, { status: 200 });
    } catch (error) {
        console.error('Error fetching ads:', error);
        return NextResponse.json(
            { error: 'Error al obtener los anuncios de publicidad' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, imageUrl, linkUrl, category, priority } = body;

        if (!title || !imageUrl || !linkUrl || !category) {
            return NextResponse.json(
                { error: 'Todos los campos obligatorios (título, imageUrl, linkUrl, category) deben especificarse.' },
                { status: 400 }
            );
        }

        const validCategories = ['PET', 'PERSON', 'THING', 'GENERAL'];
        const uppercaseCategory = category.toUpperCase();

        if (!validCategories.includes(uppercaseCategory)) {
            return NextResponse.json(
                { error: 'Categoría no válida. Las categorías permitidas son: PET, PERSON, THING, GENERAL.' },
                { status: 400 }
            );
        }

        const newAd = await prisma.ad.create({
            data: {
                title: title.trim(),
                imageUrl: imageUrl.trim(),
                linkUrl: linkUrl.trim(),
                category: uppercaseCategory,
                priority: priority ? Number(priority) : 1,
            }
        });

        return NextResponse.json(
            { message: 'Anuncio registrado correctamente', ad: newAd },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating ad:', error);
        return NextResponse.json(
            { error: 'Error al registrar el anuncio' },
            { status: 500 }
        );
    }
}
