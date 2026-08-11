import { NextRequest, NextResponse } from 'next/server'
import { dbReady, fmtDate } from '@/lib/api-helpers'
export const dynamic = 'force-dynamic'

// Asegura que las columnas extras existan (SQL crudo, no toca schema Prisma)
let columnasListas = false
async function ensureColumnas(prisma: any) {
  if (columnasListas) return
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS cuit TEXT`)
    await prisma.$executeRawUnsafe(`ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "condIva" TEXT`)
    columnasListas = true
  } catch (e) { console.error('No se pudo asegurar columnas extras:', e) }
}

// Lee campos extras de un cliente por id (cuit, condIva) — SQL crudo
async function leerExtras(prisma: any, ids: string[]): Promise<Record<string, { cuit: string; condIva: string }>> {
  if (!ids.length) return {}
  try {
    const filas: any[] = await prisma.$queryRawUnsafe(`SELECT id, cuit, "condIva" FROM "Client"`)
    const mapa: Record<string, { cuit: string; condIva: string }> = {}
    for (const row of filas) {
      mapa[row.id] = { cuit: row.cuit || '', condIva: row.condIva || '' }
    }
    return mapa
  } catch { return {} }
}

export async function GET() {
  if (!dbReady()) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    const { prisma } = await import('@/lib/prisma')
    await ensureColumnas(prisma)
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { repairs: true } },
        repairs: { orderBy: { receivedAt: 'desc' }, take: 1, select: { receivedAt: true } },
      },
    })
    const extras = await leerExtras(prisma, clients.map((c: any) => c.id))
    return NextResponse.json(clients.map((c: any) => ({
      id: c.id,
      name: c.name,
      phone: c.phone ?? '',
      email: c.email ?? '',
      address: c.address ?? '',
      cuit: extras[c.id]?.cuit ?? '',
      condIva: extras[c.id]?.condIva ?? '',
      repairs: c._count.repairs,
      lastRepair: c.repairs[0] ? fmtDate(c.repairs[0].receivedAt) : '—',
    })))
  } catch { return NextResponse.json({ error: 'fail' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    const { prisma } = await import('@/lib/prisma')
    await ensureColumnas(prisma)
    const body = await req.json()
    const client = await prisma.client.create({
      data: {
        name: (body.name ?? '').trim() || 'Sin nombre',
        phone: body.phone ? String(body.phone).trim() : null,
        email: body.email ? String(body.email).trim() : null,
        address: body.address ? String(body.address).trim() : null,
      },
    })
    const cuit = body.cuit ? String(body.cuit).replace(/[^0-9]/g, '').trim() : ''
    const condIva = body.condIva ? String(body.condIva).trim() : ''
    if (cuit || condIva) {
      await prisma.$executeRawUnsafe(
        `UPDATE "Client" SET cuit = $1, "condIva" = $2 WHERE id = $3`,
        cuit || null, condIva || null, client.id
      )
    }
    return NextResponse.json({
      id: client.id, name: client.name, phone: client.phone ?? '', email: client.email ?? '',
      address: client.address ?? '', cuit, condIva, repairs: 0, lastRepair: fmtDate(client.createdAt),
    })
  } catch { return NextResponse.json({ error: 'fail' }, { status: 500 }) }
}

export async function PUT(req: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    const { prisma } = await import('@/lib/prisma')
    await ensureColumnas(prisma)
    const body = await req.json()
    const id = String(body.id ?? '').trim()
    if (!id) return NextResponse.json({ error: 'sin-id' }, { status: 400 })
    const client = await prisma.client.update({
      where: { id },
      data: {
        name: (body.name ?? '').trim() || 'Sin nombre',
        phone: body.phone ? String(body.phone).trim() : null,
        email: body.email ? String(body.email).trim() : null,
        address: body.address ? String(body.address).trim() : null,
      },
    })
    const cuit = body.cuit ? String(body.cuit).replace(/[^0-9]/g, '').trim() : ''
    const condIva = body.condIva ? String(body.condIva).trim() : ''
    await prisma.$executeRawUnsafe(
      `UPDATE "Client" SET cuit = $1, "condIva" = $2 WHERE id = $3`,
      cuit || null, condIva || null, id
    )
    return NextResponse.json({
      id: client.id, name: client.name, phone: client.phone ?? '', email: client.email ?? '',
      address: client.address ?? '', cuit, condIva,
    })
  } catch { return NextResponse.json({ error: 'fail' }, { status: 500 }) }
}
