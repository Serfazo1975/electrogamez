import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-session'

export async function middleware(request: NextRequest) {
  const isAdmin = await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value)

  if (!isAdmin) {
    // NUEVO: las APIs internas del panel responden 401 (antes eran públicas:
    // cualquiera podía leer teléfonos/CUIT de clientes o modificar reparaciones)
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // ── lo que ya estaba (sin cambios) ──
    '/dashboard/:path*', '/admin/:path*', '/facturas.html',
    // ── NUEVO ──
    '/clientes.html',
    '/api/clients/:path*',
    '/api/repairs/:path*',
    '/api/parts/:path*',
    '/api/historial/:path*',
  ],
}
