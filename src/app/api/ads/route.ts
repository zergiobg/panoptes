import { NextResponse } from 'next/server';

export interface Ad {
    id: string;
    title: string;
    imageUrl: string;
    linkUrl: string;
    category: 'PET' | 'PERSON' | 'THING' | 'GENERAL';
    priority: number;
}

// In-memory data store for ads
let adsStore: Ad[] = [
    {
        id: 'ad-1',
        title: 'Alimento Premium NutriPet - 20% de Descuento',
        imageUrl: 'https://placehold.co/728x90/1a1d24/ff7e33?text=Comida+para+Mascotas+NutriPet',
        linkUrl: 'https://example.com/nutripet',
        category: 'PET',
        priority: 1,
    },
    {
        id: 'ad-2',
        title: 'Collares GPS Inteligentes para Mascotas - Rastreo 24/7',
        imageUrl: 'https://placehold.co/728x90/1a1d24/3399ff?text=Collares+GPS+Mascotas',
        linkUrl: 'https://example.com/pet-gps',
        category: 'PET',
        priority: 2,
    },
    {
        id: 'ad-3',
        title: 'Seguro y Red de Búsqueda Familiar Panoptes Protect',
        imageUrl: 'https://placehold.co/728x90/1a1d24/33cc66?text=Seguro+de+Rescate+Familiar',
        linkUrl: 'https://example.com/family-protect',
        category: 'PERSON',
        priority: 1,
    },
    {
        id: 'ad-4',
        title: 'Etiquetas QR Resistentes para Objetos y Llaves',
        imageUrl: 'https://placehold.co/728x90/1a1d24/cc33ff?text=Etiquetas+QR+Objetos',
        linkUrl: 'https://example.com/smart-qr-tags',
        category: 'THING',
        priority: 1,
    },
    {
        id: 'ad-5',
        title: 'Únete a la Red Panoptes Plus - Cobertura Comunitaria Global',
        imageUrl: 'https://placehold.co/728x90/1a1d24/ff7e33?text=Red+Voluntarios+Panoptes',
        linkUrl: 'https://example.com/panoptes-plus',
        category: 'GENERAL',
        priority: 1,
    },
];

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const contextParam = searchParams.get('context')?.toUpperCase();

        let filteredAds = adsStore;

        if (contextParam) {
            filteredAds = adsStore.filter(
                (ad) => ad.category === contextParam || ad.category === 'GENERAL'
            );
        }

        // Sort by priority ascending (1 is top priority)
        filteredAds.sort((a, b) => a.priority - b.priority);

        // Fallback to all ads if filtered is empty
        if (filteredAds.length === 0) {
            filteredAds = adsStore;
        }

        return NextResponse.json({ ads: filteredAds }, { status: 200 });
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

        const newAd: Ad = {
            id: `ad-${Date.now()}`,
            title: title.trim(),
            imageUrl: imageUrl.trim(),
            linkUrl: linkUrl.trim(),
            category: uppercaseCategory as 'PET' | 'PERSON' | 'THING' | 'GENERAL',
            priority: priority ? Number(priority) : 1,
        };

        adsStore.unshift(newAd);

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
