import { NextResponse } from 'next/server';

const categories = ['Persona', 'Mascota', 'Vehículo', 'Llaves', 'Dispositivos', 'Artículo personal', 'Ropa', 'Documento'];

export async function POST(request: Request) {
  try {
    const { imageUrl, description } = await request.json();

    // TODO: Connect real AI Provider (e.g., Google Gemini, OpenAI)
    // Replace this check with your actual environment variable
    const AI_API_KEY = process.env.PANOPTES_AI_API_KEY;

    if (AI_API_KEY) {
      // --- SKELETON FOR REAL AI INTEGRATION ---
      // const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', { ... });
      // const suggestedCategory = extractFromAI(aiResponse);
      // return NextResponse.json({ success: true, suggestedCategory });
      console.log('AI Integration is configured but not fully implemented yet.');
    }

    // --- FALLBACK MOCK LOGIC ---
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
