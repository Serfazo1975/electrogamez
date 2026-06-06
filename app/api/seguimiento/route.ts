import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const STATUS_LABELS: Record<string, string> = {
  received:      'Recibido',
  diagnosing:    'En diagnóstico',
  waiting_parts: 'Esperando repuestos',
  in_progress:   'En reparación',
  ready:         'Listo para retirar',
  delivered:     'Entregado',
  cancelled:     'Cancelado',
}

const STATUS_ORDER = [
  'received',
  'diagnosing',
  'waiting_parts',
  'in_progress',
  'ready',
  'delivered',
]

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('codigo')

  if (!code) {
    return NextResponse.json({ error: 'Código requerido' }, { status: 400 })
  }

  const repair = await prisma.repair.findUnique({
    where: { trackingCode: code.toUpperCase() },
    select: {
      trackingCode: true,
      deviceType: true,
      deviceBrand: true,
      deviceModel: true,
      issueDescription: true,
      status: true,
      priority: true,
      estimatedCost: true,
      finalCost: true,
      paid: true,
      receivedAt: true,
      estimatedAt: true,
      completedAt: true,
      client: { select: { name: true } },
      statusHistory: {
        orderBy: { createdAt: 'asc' },
        select: { status: true, note: true, createdAt: true },
      },
    },
  })

  if (!repair) {
    return NextResponse.json({ error: 'Reparación no encontrada' }, { status: 404 })
  }

  return NextResponse.json({
    ...repair,
    statusLabel: STATUS_LABELS[repair.status] ?? repair.status,
    statusOrder: STATUS_ORDER,
    statusLabels: STATUS_LABELS,
  })
}
