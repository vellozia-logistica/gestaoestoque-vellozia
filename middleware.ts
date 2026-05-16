import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    if (token?.mustChangePassword && pathname !== '/trocar-senha' && pathname !== '/api/trocar-senha') {
      return NextResponse.redirect(new URL('/trocar-senha', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico|logo.jpg).*)'],
}
