import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// "middleware" function ko default export banayein
export default function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Agar token nahi hai aur user login ke alawa kisi page par jana chahta hai
  if (!token && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Agar login hai aur user wapas login page par jana chahta hai
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Ye config batati hai ki middleware kin paths par apply hoga
export const config = {
  matcher: [
    /*
     * Un sabhi paths ko match karein jo niche diye gaye patterns mein nahi aate:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};