import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const isMaintenanceActive = process.env.NEXT_PUBLIC_MAINTENANCE === '1';

  if (isMaintenanceActive && request.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/questionario/:path*',
    '/acesso/:path*',
    '/ajuda/:path*',
    '/cliente/:path*',
    '/equipa/:path*',
    '/privacidade/:path*',
    '/termos/:path*',
  ],
};

