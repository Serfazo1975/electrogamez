import { NextRequest, NextResponse } from 'next/server'
import { dbReady, fmtMoney, parseMoney } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

type PartRow = {
  id: string
  name: string
  sku: string | null
  stock: number
  minStock: number
  salePrice: number | null
}

function toDTO(p: PartRow) {
  return {
    id: p.id,
    name: p.name,
    sku: p.sku ?? '',
    stock: p.stock,
    minStock: p.minStock,
    salePrice: fmtMoney(p.salePrice) ?? '-',
  }
}

export async function GET() {
  if (!dbReady()) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    const { prisma } = await import('@/lib/prisma')
    const parts = await prisma.part.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(parts.map(toDTO))
  } catch {
    return NextResponse.json({ error: 'fail' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    const { prisma } = await import('@/lib/prisma')
    const body = await req.json()
    const part = await prisma.part.create({
      data: {
        name: (body.name ?? '').trim() || 'Sin nombre',
        sku: body.sku ? String(body.sku).trim() : null,
        brand: body.brand ? String(body.brand).trim() : null,
        stock: parseInt(body.stock) || 0,
        minStock: parseInt(body.minStock) || 2,
        salePrice: parseMoney(body.salePrice),
      },
    })
    return NextResponse.json(toDTO(part))
  } catch {
    return NextResponse.json({ error: 'fail' }, { status: 500 })
  }
}
