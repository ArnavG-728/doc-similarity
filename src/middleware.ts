// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(req: NextRequest) {
//   const token = req.cookies.get('token')?.value;
//   const role = req.cookies.get('role')?.value;

//   const url = req.nextUrl.pathname;

//   // Redirect unauthenticated users
//   if (!token && (url.startsWith('/ar-dashboard') || url.startsWith('/recruiter-admin'))) {
//     return NextResponse.redirect(new URL('/login', req.url));
//   }

//   // Role-specific restrictions
//   if (url.startsWith('/ar-dashboard') && role !== 'AR Requestor') {
//     return NextResponse.redirect(new URL('/components/unauthorized', req.url));
//   }

//   if (url.startsWith('/recruiter-admin') && role !== 'Recruiter Admin') {
//     return NextResponse.redirect(new URL('/components/unauthorized', req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     '/ar-dashboard/:path*',
//     '/recruiter-admin/:path*'
//   ]
// };




// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const pathname = request.nextUrl.pathname;

  if (!token) {
    if (pathname.startsWith('/ar-dashboard') || pathname.startsWith('/recruiter-admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/ar-dashboard') && role !== 'AR Requestor') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/recruiter-admin') && role !== 'Recruiter Admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/ar-dashboard/:path*', '/recruiter-admin/:path*'],
};
