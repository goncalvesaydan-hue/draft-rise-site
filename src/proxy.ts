import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PORTAL_PREFIXES = ['/questionario', '/acesso', '/ajuda', '/cliente', '/equipa'];

export function proxy(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;
  const isMaintenanceActive = process.env.NEXT_PUBLIC_MAINTENANCE === '1';
  const isLocalHost =
    !process.env.VERCEL && (hostname === 'localhost' || hostname === '127.0.0.1');
  const isPortalEnabled =
    process.env.NEXT_PUBLIC_PORTAL_ENABLED === '1' ||
    process.env.PORTAL_LOCAL_MODE === '1' ||
    process.env.PORTAL_REMOTE_ENABLED === '1' ||
    isLocalHost;

  if (pathname === '/api' || pathname.startsWith('/api/')) {
    if (isMaintenanceActive || !isPortalEnabled) {
      return NextResponse.json(
        { error: 'Serviço temporariamente indisponível.' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    return NextResponse.next();
  }

  if (isMaintenanceActive && pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (
    !isPortalEnabled &&
    PORTAL_PREFIXES.some(
      prefix => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/questionario/:path*',
    '/acesso/:path*',
    '/ajuda/:path*',
    '/cliente/:path*',
    '/equipa/:path*',
    '/privacidade/:path*',
    '/termos/:path*',
  ],
};


