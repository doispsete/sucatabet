import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;
  // Simplifica as verificações de rota
  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/cadastro' || 
                       pathname === '/login/' || pathname === '/cadastro/';
  const isApiRoute = pathname.startsWith('/api');

  // Redirecionamento de usuários logados tentando acessar a Landing Page
  if (token && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Proteção de rotas: se não houver token e não for pública nem API, redireciona
  if (!token && !isPublicPage && !isApiRoute) {
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
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
