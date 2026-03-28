import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  /* Removed to prevent infinite loop with invalid/expired tokens */
  /* if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  } */

  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Note: Decoding JWT in Edge Middleware would require a library like 'jose'.
    // For now, we rely on the existence of the token and the client-side/API guard.
    // If a more robust check is needed, we'd decode the JWT here.
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
