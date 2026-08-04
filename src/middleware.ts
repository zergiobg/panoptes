import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin protection: check admin_session cookie (works with any locale prefix)
  // Matches /admin/..., /es/admin/..., /en/admin/...
  const isAdminPath = /^(\/[a-z]{2})?\/admin(\/|$)/.test(pathname);
  const isAdminLogin = /^(\/[a-z]{2})?\/admin\/login(\/|$)/.test(pathname);

  if (isAdminPath && !isAdminLogin) {
    const session = request.cookies.get('admin_session');
    if (!session || session.value !== 'true') {
      // Determine locale prefix if present
      const localeMatch = pathname.match(/^(\/[a-z]{2})\//);
      const prefix = localeMatch ? localeMatch[1] : '';
      const loginUrl = new URL(`${prefix}/admin/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Skip intl middleware for API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('/uploads/') ||
    pathname.match(/\.(ico|png|svg|jpg|jpeg|webp|json|js|css|woff|woff2|txt|xml)$/)
  ) {
    return NextResponse.next();
  }

  // Apply next-intl locale detection and routing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all paths except API, _next, and static assets
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ]
};
