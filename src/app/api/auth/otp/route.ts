import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'El email es requerido.' }, { status: 400 });
        }

        const code = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos de validez

        await prisma.oTP.create({
            data: {
                email,
                code,
                expiresAt
            }
        });

        // Configuración real de Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"Panoptes Validation" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Tu código de acceso a la Red Panoptes',
            text: `Entrando a la red.\nTu código es: ${code}\nExpira en 10 minutos.`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; text-align: center; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #ffcc00; margin-bottom: 20px;">Red Comunitaria Panoptes</h2>
          <p style="color: #555;">Estás a un paso de integrarte a la red activa. Por favor, usa este código provisional de seguridad:</p>
          <div style="background-color: #f7f7f7; padding: 20px; font-size: 35px; letter-spacing: 12px; margin: 30px 0; font-weight: bold; border-left: 5px solid #ffcc00;">
            ${code}
          </div>
          <p style="color: #999; font-size: 13px;">Nota: Este código expirará en 10 minutos por razones de seguridad estricta.</p>
        </div>
      `
        };

        // Si existen variables, enviarlo de verdad!
        if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
            await transporter.sendMail(mailOptions);
        } else {
            // Si faltan, cae en modo simulación
            console.log(`\n=================================\n✉️ MOCK EMAIL ENVIADO A: ${email}\n🔐 Tu código OTP en Panoptes es: ${code}\n=================================\n`);
            return NextResponse.json({ error: 'Configura tus variables de entorno EMAIL_USER y EMAIL_APP_PASSWORD en .env para correos reales.' }, { status: 400 });
        }

        return NextResponse.json({ message: 'OTP real generado y disparado a tu cuenta de Email con éxito.' }, { status: 201 });
    } catch (error) {
        console.error('OTP Generation Error:', error);
        return NextResponse.json({ error: 'Error del servidor o credenciales invalidas procesando el correo.' }, { status: 500 });
    }
}
