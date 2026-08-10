import { NextRequest, NextResponse } from 'next/server'
import { dbReady, fmtDate } from '@/lib/api-helpers'
export const dynamic = 'force-dynamic'

// ------------------------------------------------------------
// Asegura que la columna "cuit" exista en la tabla Client.
// Se crea sola la primera vez, con SQL crudo (no toca el schema
// de Prisma ni depende del build). Patrón "resguardar lo viejo".
// ------------------------------------------------------------
let columnaCuitLista = false
async function ensureColumnaCuit(prisma: any) {
  if (columnaCuitLista) return
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS cuit TEXT`)
    columnaCuitLista = true
  } catch (e) {
    // Si falla, seguimos igual (no rompemos la carga de clientes)
    console.error('No se pudo asegurar columna cuit:', e)
  }
}

// Lee el CUIT de un cliente por id, usando SQL crudo (porque el
// cliente de Prisma no "conoce" la columna cuit al no estar en el schema)
async function leerCuit(prisma: any, id: string): Promise<string> {
  try {
    const filas: any[] = await prisma.$queryRawUnsafe(
      `SELECT cuit FROM "Client" WHERE id = $1`, id
    )
    return filas.length && filas[0].cuit ? String(filas[0].cuit) : ''
  } catch {
    return ''
  }
}

export async function GET() {
  if (!dbReady()) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    const { prisma } = await import('@/lib/prisma')
    await ensureColumnaCuit(prisma)

    // Traemos los clientes por Prisma (como siempre)
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { repairs: true } },
        repairs: { orderBy: { receivedAt: 'desc' }, take: 1, select: { receivedAt: true } },
      },
    })

    // Traemos los CUIT en una sola consulta cruda y los mapeamos por id
    const cuits: any[] = await prisma.$queryRawUnsafe(`SELECT id, cuit FROM "Client"`)
    const mapaCuit: Record<string, string> = {}
    for (const row of cuits) mapaCuit[row.id] = row.cuit ? String(row.cuit) : ''

    return NextResponse.json(clients.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone ?? '',
      email: c.email ?? '',
      cuit: mapaCuit[c.id] ?? '',
      repairs: c._count.repairs,
      lastRepair: c.repairs[0] ? fmtDate(c.repairs[0].receivedAt) : '—',
    })))
  } catch {
    return NextResponse.json({ error: 'fail' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    const { prisma } = await import('@/lib/prisma')
    await ensureColumnaCuit(prisma)
    const body = await req.json()

    // Creamos el cliente con Prisma (campos de siempre)
    const client = await prisma.client.create({
      data: {
        name: (body.name ?? '').trim() || 'Sin nombre',
        phone: body.phone ? String(body.phone).trim() : null,
        email: body.email ? String(body.email).trim() : null,
      },
    })

    // Guardamos el CUIT aparte, con SQL crudo (solo si vino)
    const cuit = body.cuit ? String(body.cuit).replace(/[^0-9]/g, '').trim() : ''
    if (cuit) {
      await prisma.$executeRawUnsafe(`UPDATE "Client" SET cuit = $1 WHERE id = $2`, cuit, client.id)
    }

    return NextResponse.json({
      id: client.id,
      name: client.name,
      phone: client.phone ?? '',
      email: client.email ?? '',
      cuit,
      repairs: 0,
      lastRepair: fmtDate(client.createdAt),
    })
  } catch {
    return NextResponse.json({ error: 'fail' }, { status: 500 })
  }
}

// ------------------------------------------------------------
// PUT: editar un cliente existente (nombre, tel, email, cuit)
// NUEVO — antes no se podían editar clientes.
// ------------------------------------------------------------
export async function PUT(req: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    const { prisma } = await import('@/lib/prisma')
    await ensureColumnaCuit(prisma)
    const body = await req.json()
    const id = String(body.id ?? '').trim()
    if (!id) return NextResponse.json({ error: 'sin-id' }, { status: 400 })

    // Actualizamos los campos de siempre con Prisma
    const client = await prisma.client.update({
      where: { id },
      data: {
        name: (body.name ?? '').trim() || 'Sin nombre',
        phone: body.phone ? String(body.phone).trim() : null,
        email: body.email ? String(body.email).trim() : null,
      },
    })

    // Actualizamos el CUIT con SQL crudo
    const cuit = body.cuit ? String(body.cuit).replace(/[^0-9]/g, '').trim() : ''
    await prisma.$executeRawUnsafe(`UPDATE "Client" SET cuit = $1 WHERE id = $2`, cuit || null, id)

    return NextResponse.json({
      id: client.id,
      name: client.name,
      phone: client.phone ?? '',
      email: client.email ?? '',
      cuit,
    })
  } catch {
    return NextResponse.json({ error: 'fail' }, { status: 500 })
  }
}
