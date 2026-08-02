import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export type AuthResult = {
    isAuthenticated: boolean;
    isAdmin: boolean;
    isSuspended: boolean;
    user: any | null;
    error?: string;
};

export async function authenticateAndCheckSuspension(): Promise<AuthResult> {
    const cookieStore = await cookies();
    
    // Check genesis admin
    const isAdminSession = cookieStore.get('admin_session')?.value === 'true';
    if (isAdminSession) {
        const genesisUser = await prisma.user.findUnique({
            where: { email: 'sergio@bochica.network' },
            select: { id: true, name: true, email: true, photoUrl: true, role: true, status: true }
        });
        
        return {
            isAuthenticated: true,
            isAdmin: true,
            isSuspended: false,
            user: genesisUser
        };
    }

    // Check normal user token
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
        return { isAuthenticated: false, isAdmin: false, isSuspended: false, user: null };
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-panoptes') as any;
        
        // Fetch fresh status from DB
        const dbUser = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, name: true, email: true, photoUrl: true, role: true, status: true, phone: true }
        });

        if (!dbUser) {
            return { isAuthenticated: false, isAdmin: false, isSuspended: false, user: null, error: 'User not found' };
        }

        const isSuspended = dbUser.status === 'SUSPENDED';

        return {
            isAuthenticated: true,
            isAdmin: dbUser.role === 'ADMIN',
            isSuspended,
            user: dbUser
        };
    } catch (err) {
        return { isAuthenticated: false, isAdmin: false, isSuspended: false, user: null, error: 'Invalid token' };
    }
}
