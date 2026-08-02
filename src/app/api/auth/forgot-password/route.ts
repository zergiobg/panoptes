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

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            // Para evitar enumeración de usuarios, siempre decimos que se envió el correo.
            return NextResponse.json({ message: 'Si el correo existe, se ha enviado un enlace de recuperación.' }, { status: 200 });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        await prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry }
        });

        // Use standard URL if available, else fallback
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://panoptes.bochica.network';
        const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"Panoptes Seguridad" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Recuperación de Contraseña - Panoptes',
            text: `Has solicitado recuperar tu contraseña.\nIngresa a este enlace para cambiarla: ${resetLink}\nExpira en 1 hora.`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #ffcc00; margin-bottom: 20px;">Red Panoptes</h2>
          <p style="color: #555;">Has solicitado recuperar tu contraseña de acceso.</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #ffcc00; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; margin: 20px 0;">Restablecer Contraseña</a>
          <p style="color: #555; font-size: 14px;">Si no fuiste tú, puedes ignorar este correo de forma segura.</p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">El enlace expirará en 1 hora.</p>
        </div>
      `
        };

        if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
            await transporter.sendMail(mailOptions);
        } else {
            console.log(`\n=================================\n✉️ [TODO] MOCK EMAIL RECUPERACION A: ${email}\n🔗 Enlace: ${resetLink}\n=================================\n`);
        }

        return NextResponse.json({ message: 'Si el correo existe, se ha enviado un enlace de recuperación.' }, { status: 200 });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        return NextResponse.json({ error: 'Error interno procesando la solicitud.' }, { status: 500 });
    }
}
