import { NextResponse } from 'next/server';

const categories = ['Persona', 'Mascota', 'Vehículo', 'Llaves', 'Dispositivos', 'Artículo personal', 'Ropa', 'Documento'];

export async function POST(request: Request) {
  try {
    const { imageUrl, description } = await request.json();

    // Mock processing delay for realism
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let suggestedCategory = 'Otro';
    
    if (description) {
      const lowerDesc = description.toLowerCase();
      if (lowerDesc.includes('perro') || lowerDesc.includes('gato')) {
        suggestedCategory = 'Mascota';
      } else if (lowerDesc.includes('llave')) {
        suggestedCategory = 'Llaves';
      } else if (lowerDesc.includes('celular') || lowerDesc.includes('iphone') || lowerDesc.includes('laptop')) {
        suggestedCategory = 'Dispositivos';
      } else if (lowerDesc.includes('cartera') || lowerDesc.includes('bolso')) {
        suggestedCategory = 'Artículo personal';
      } else {
        suggestedCategory = categories[Math.floor(Math.random() * categories.length)];
      }
    } else {
      suggestedCategory = categories[Math.floor(Math.random() * categories.length)];
    }

    return NextResponse.json({ success: true, suggestedCategory });
  } catch (error) {
    console.error('AI Categorize Error:', error);
    return NextResponse.json({ success: false, error: 'AI categorization failed' }, { status: 500 });
  }
}
