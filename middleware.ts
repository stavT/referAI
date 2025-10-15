import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isQuestionnaire = req.nextUrl.pathname.startsWith('/questionnaire');
    const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
    const isSearch = req.nextUrl.pathname.startsWith('/search');

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return null;
    }

    if (!isAuth && (isQuestionnaire || isDashboard || isSearch)) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    return null;
  },
  {
    callbacks: {
      authorized: ({ token }) => true, // We handle auth logic in the middleware function
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/questionnaire/:path*', '/search/:path*', '/auth/:path*'],
};

