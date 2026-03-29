import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/login';
  const isApiRoute = pathname.startsWith('/api');

  // Proteção de rotas: se não houver token, redireciona para login
  // (Ignora páginas de login, arquivos estáticos e chamadas de API)
  if (!token && !isLoginPage && !isApiRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
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
