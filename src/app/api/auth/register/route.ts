import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, otpCode, photoUrl, password } = body;

        // Strict KYC Requirements + OTP
        if (!name || !email || !phone || !otpCode || !password) {
            return NextResponse.json({ error: 'Nombre, email, teléfono, contraseña y código OTP son obligatorios para el KYC.' }, { status: 400 });
        }

        // Validar el Código Estricto
        const validOtp = await prisma.oTP.findFirst({
            where: {
                email,
                code: otpCode,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!validOtp) {
            return NextResponse.json({ error: 'Código de acceso inválido o expirado.' }, { status: 401 });
        }

        // Verificar unicidad en la red
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { phone: phone }
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'El reconocimiento facial/datos indican que ya existes en la red.' }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el usuario con estado Pendiente de 3 endosos.
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                photoUrl,
                password: hashedPassword,
                status: 'PENDING',
            }
        });

        // Borramos el registro OTP por seguridad
        await prisma.oTP.deleteMany({ where: { email } });

        // Auto-Login: Generate JWT
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role, status: newUser.status },
            process.env.JWT_SECRET || 'fallback-secret-panoptes',
            { expiresIn: '7d' }
        );

        const response = NextResponse.json({
            message: 'Registro exitoso. Iniciando sesión...',
            user: { id: newUser.id, name: newUser.name, status: newUser.status }
        }, { status: 201 });

        // Set Cookie
        response.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'Error del servidor en registro.' }, { status: 500 });
    }
}
