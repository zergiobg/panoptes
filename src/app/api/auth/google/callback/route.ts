import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');

        if (!code) {
            return NextResponse.redirect(`${url.origin}/login?error=NoCodeProvided`);
        }

        const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy_client_id';
        const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret';
        const redirectUri = `${url.origin}/api/auth/google/callback`;

        let tokenData;

        // If using dummy keys, we mock the Google response to simulate a successful login for testing
        if (GOOGLE_CLIENT_ID === 'dummy_client_id') {
            console.log('⚠️ USANDO DUMMY GOOGLE LOGIN ⚠️');
            tokenData = { access_token: 'dummy_access_token' };
        } else {
            // Real OAuth 2.0 Token Exchange
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code,
                    client_id: GOOGLE_CLIENT_ID,
                    client_secret: GOOGLE_CLIENT_SECRET,
                    redirect_uri: redirectUri,
                    grant_type: 'authorization_code',
                })
            });

            tokenData = await tokenResponse.json();
            if (tokenData.error) {
                console.error('Google Token Error:', tokenData);
                return NextResponse.redirect(`${url.origin}/login?error=GoogleTokenError`);
            }
        }

        let googleUser;

        if (GOOGLE_CLIENT_ID === 'dummy_client_id') {
            // Mock user for testing the UI
            googleUser = {
                email: 'test.google@dummy.com',
                name: 'Test Google User',
                picture: 'https://placehold.co/400x400/444444/ffffff?text=TG'
            };
        } else {
            // Fetch real user info using the access token
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` }
            });
            googleUser = await userInfoResponse.json();
        }

        if (!googleUser || !googleUser.email) {
            return NextResponse.redirect(`${url.origin}/login?error=NoEmailReturned`);
        }

        // Upsert User in DB
        let user = await prisma.user.findUnique({ where: { email: googleUser.email } });

        if (!user) {
            // New user registration via Google
            user = await prisma.user.create({
                data: {
                    email: googleUser.email,
                    name: googleUser.name,
                    photoUrl: googleUser.picture,
                    status: 'PENDING' // They still need to verify their phone via KYC!
                }
            });
        }

        // Check if suspended
        if (user.status === 'SUSPENDED') {
            return NextResponse.redirect(`${url.origin}/login?error=AccountSuspended`);
        }

        // Create JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, status: user.status },
            process.env.JWT_SECRET || 'fallback-secret-panoptes',
            { expiresIn: '7d' }
        );

        // Redirect to /kyc if status is PENDING, otherwise to /mi-actividad or home
        const redirectTo = user.status === 'PENDING' ? '/kyc' : '/';
        const response = NextResponse.redirect(`${url.origin}${redirectTo}`);

        // Set Cookie
        response.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        if (user.email === 'sergio@bochica.network' || user.role === 'ADMIN') {
            response.cookies.set({
                name: 'admin_session',
                value: 'true',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7
            });
        }

        return response;

    } catch (error) {
        console.error('Google Auth Error:', error);
        return NextResponse.redirect(`${new URL(request.url).origin}/login?error=InternalError`);
    }
}
