import { NextRequest, NextResponse } from 'next/server'
import { listProductos, createProducto } from '@/lib/productos'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

async function isAdmin(req: NextRequest) {
  return verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)
}

// Público: lista de productos para la tienda
export async function GET() {
  try {
    return NextResponse.json(await listProductos())
  } catch {
    return NextResponse.json([])
  }
}

// Admin: crear un producto
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  const d = await req.json()
  if (!d.nombre) {
    return NextResponse.json({ error: 'Falta el nombre' }, { status: 400 })
  }
  try {
    const res = await createProducto(d)
    return NextResponse.json(res)
  } catch {
    return NextResponse.json({ error: 'No se pudo guardar' }, { status: 500 })
  }
}
