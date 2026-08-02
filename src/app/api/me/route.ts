import { NextResponse } from 'next/server';
import { authenticateAndCheckSuspension } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await authenticateAndCheckSuspension();

    if (auth.isAuthenticated) {
      return NextResponse.json({
        loggedIn: true,
        isAdmin: auth.isAdmin,
        isSuspended: auth.isSuspended,
        user: auth.user
      });
    }

    return NextResponse.json({ loggedIn: false, isAdmin: false, isSuspended: false });
  } catch (error) {
    console.error('Error in /api/me:', error);
    return NextResponse.json({ loggedIn: false, isAdmin: false, isSuspended: false }, { status: 500 });
  }
}
