import { NextRequest, NextResponse } from 'next/server'
import { listProductos, createProducto } from '@/lib/productos'

export const dynamic = 'force-dynamic'

function isAdmin(req: NextRequest) {
  return req.cookies.get('eg_admin')?.value === 'true'
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
  if (!isAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
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
