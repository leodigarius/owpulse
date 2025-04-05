import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Simple middleware to handle trailing slashes and redirects
  const { pathname } = request.nextUrl;
  
  // Skip API routes and static files
  if (pathname.startsWith('/api/') || pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // Ensure trailing slash for non-API routes
  if (!pathname.endsWith('/')) {
    const url = request.nextUrl.clone();
    url.pathname = `${pathname}/`;
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/|_static/|_vercel|public/|favicon.ico).*)']
}; 