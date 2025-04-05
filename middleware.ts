// Middleware disabled for static export mode
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//   // Middleware fully re-enabled with simplified functionality
//   // Only handle trailing slashes for non-API routes
  
//   const { pathname } = request.nextUrl;
  
//   // Don't rewrite API routes or static files
//   if (pathname.startsWith('/api/') || pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js)$/)) {
//     return NextResponse.next();
//   }
  
//   // Ensure trailing slash for routes
//   if (!pathname.endsWith('/') && !pathname.includes('.')) {
//     const url = request.nextUrl.clone();
//     url.pathname = `${pathname}/`;
//     return NextResponse.redirect(url);
//   }
  
//   return NextResponse.next();
// }

export const config = {
  // No middleware active when using static export
  matcher: [],
}; 