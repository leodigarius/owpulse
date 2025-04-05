import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // If the pathname is '/' then don't add a trailing slash (root URL special case)
  if (pathname === '/') {
    return NextResponse.next();
  }

  // If the path doesn't end with a slash and doesn't have a file extension
  if (!pathname.endsWith('/') && !pathname.includes('.')) {
    // Create a new URL with the same pathname but with a trailing slash
    const url = request.nextUrl.clone();
    url.pathname = `${pathname}/`;
    
    // Redirect to the new URL
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Ensure the middleware runs on these paths
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - API routes
     * - Files with extensions (e.g. .jpg, .png, etc.)
     * - Paths that begin with _next, static, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}; 