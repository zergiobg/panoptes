import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email y contraseña son obligatorios.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || !user.password) {
            return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, status: user.status },
            process.env.JWT_SECRET || 'fallback-secret-panoptes',
            { expiresIn: '7d' }
        );

        const response = NextResponse.json({
            message: 'Inicio de sesión exitoso.',
            user: { id: user.id, name: user.name, status: user.status, role: user.role }
        }, { status: 200 });

        response.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        // Set admin session if this is the genesis admin
        if (user.email === 'sergio@bochica.network' || user.role === 'ADMIN') {
            response.cookies.set({
                name: 'admin_session',
                value: 'true',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });
        }

        return response;

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
