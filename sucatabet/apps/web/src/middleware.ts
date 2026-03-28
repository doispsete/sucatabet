import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/login';
  const isApiRoute = pathname.startsWith('/api');

  // 1. Redirecionar para login se não houver token (exceto p/ login e API pública)
  if (!token && !isLoginPage && !isApiRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Injetar o header Authorization nas requisições p/ a API
  if (isApiRoute) {
    const requestHeaders = new Headers(request.headers);
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
