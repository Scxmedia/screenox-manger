import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Cookie check karein
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Agar user logout hai (token nahi hai) aur wo Dashboard (/) par hai
  if (!token && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Agar user login hai aur wapas login page par ja raha hai
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Ye config batati hai ki middleware kin pages par nazar rakhega
export const config = {
  matcher: ['/', '/login', '/tasks/:path*'],
};