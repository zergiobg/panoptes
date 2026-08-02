import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy_client_id';
    
    // We get the origin from the request or use the dev server origin
    const url = new URL(request.url);
    const redirectUri = `${url.origin}/api/auth/google/callback`;

    // CSRF token (state) could be added here for security
    const state = 'panoptes_oauth'; 

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('openid email profile')}` +
        `&access_type=offline` +
        `&state=${state}`;

    return NextResponse.redirect(googleAuthUrl);
}
