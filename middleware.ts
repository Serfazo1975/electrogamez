import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-session'

export async function middleware(request: NextRequest) {
  const isAdmin = await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value)

  if (!isAdmin) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/facturas.html'],
}
