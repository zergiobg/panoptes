import { NextResponse } from 'next/server';

export async function GET() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || 'BGd9xIiNvj1TS6CLUz9SPB1Ev79WnzqhwoPoW12Ll5z6QoiYSy6-D9PBEBWRH5PG1EICQSjKg1VbR1_ikWgDQr8';
    return NextResponse.json({ publicKey });
}
