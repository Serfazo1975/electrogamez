import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const isAdmin = request.cookies.get('eg_admin')?.value === 'true'

  if (!isAdmin) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
