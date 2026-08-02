import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const isAdminSession = cookieStore.get('admin_session')?.value === 'true';

    // Para el MVP, la única sesión es la del admin genesis
    if (isAdminSession) {
      const user = await prisma.user.findUnique({
        where: { email: 'sergio@bochica.network' },
        select: { id: true, name: true, email: true, photoUrl: true }
      });
      
      if (user) {
        return NextResponse.json({
          loggedIn: true,
          isAdmin: true,
          user
        });
      }
    }

    // TODO: Cuando se integre OAuth o sesiones de usuarios normales, revisar cookie 'user_session'

    return NextResponse.json({ loggedIn: false, isAdmin: false });
  } catch (error) {
    console.error('Error in /api/me:', error);
    return NextResponse.json({ loggedIn: false, isAdmin: false }, { status: 500 });
  }
}
