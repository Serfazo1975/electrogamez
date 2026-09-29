import { NextRequest, NextResponse } from 'next/server'

// ============================================================
// app/api/seguimiento/route.ts — Seguimiento público SEGURO
// Antes: con solo el código (EG-2026-0001, 0002…) cualquiera veía
// nombre del cliente, equipo, falla y costos de TODAS las reparaciones.
// Ahora:
//   • Solo con el código → estado y progreso (sin datos personales)
//   • Código + últimos 4 dígitos del teléfono → detalle completo
//   • Nombre del cliente enmascarado ("Marcos C.")
//   • Límite de intentos por IP para evitar que prueben códigos en serie
// ============================================================

export const dynamic = 'force-dynamic'

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

// ── Límite de intentos (por instancia; frena barridos automáticos) ──
const intentos = new Map<string, { n: number; desde: number }>()
const VENTANA_MS = 10 * 60 * 1000 // 10 minutos
const MAX_FALLOS = 15

function ipDe(req: NextRequest) {
  return (req.headers.get('x-nf-client-connection-ip')
    || req.headers.get('x-forwarded-for')?.split(',')[0]
    || 'desconocida').trim()
}
function bloqueado(ip: string) {
  const r = intentos.get(ip)
  if (!r) return false
  if (Date.now() - r.desde > VENTANA_MS) { intentos.delete(ip); return false }
  return r.n >= MAX_FALLOS
}
function registrarFallo(ip: string) {
  const r = intentos.get(ip)
  if (!r || Date.now() - r.desde > VENTANA_MS) intentos.set(ip, { n: 1, desde: Date.now() })
  else r.n++
  if (intentos.size > 5000) intentos.clear() // evita crecer sin límite
}
const esperar = (ms: number) => new Promise(r => setTimeout(r, ms))

// "Marcos Carrillo" → "Marcos C."
function enmascarar(nombre: string) {
  const p = nombre.trim().split(/\s+/)
  if (p.length === 1) return p[0]
  return `${p[0]} ${p[p.length - 1][0].toUpperCase()}.`
}

export async function GET(request: NextRequest) {
  const ip = ipDe(request)
  if (bloqueado(ip)) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Esperá unos minutos o escribinos por WhatsApp.' },
      { status: 429 }
    )
  }

  const code = (request.nextUrl.searchParams.get('codigo') || '').trim().toUpperCase()
  const tel = (request.nextUrl.searchParams.get('tel') || '').replace(/\D/g, '')

  if (!code) {
    return NextResponse.json({ error: 'Código requerido' }, { status: 400 })
  }
  if (!/^[A-Z0-9-]{4,30}$/.test(code)) {
    registrarFallo(ip)
    return NextResponse.json({ error: 'Reparación no encontrada' }, { status: 404 })
  }

  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('file:')) {
    return NextResponse.json(
      { error: 'Base de datos no configurada. Contactate con nosotros por WhatsApp.' },
      { status: 503 }
    )
  }

  try {
    const { prisma } = await import('@/lib/prisma')

    const repair = await prisma.repair.findUnique({
      where: { trackingCode: code },
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
        client: { select: { name: true, phone: true } },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          select: { status: true, note: true, createdAt: true },
        },
      },
    })

    if (!repair) {
      registrarFallo(ip)
      await esperar(400)
      return NextResponse.json({ error: 'Reparación no encontrada' }, { status: 404 })
    }

    // ¿Coinciden los últimos 4 dígitos del teléfono del cliente?
    const telCliente = String(repair.client?.phone || '').replace(/\D/g, '')
    const tieneTelefono = telCliente.length >= 4
    let verificado = false
    if (tel) {
      verificado = tieneTelefono && tel.length >= 4 && telCliente.endsWith(tel.slice(-4))
      if (!verificado) {
        registrarFallo(ip)
        await esperar(600)
      }
    }

    // Datos públicos (sin información personal)
    const base = {
      trackingCode: repair.trackingCode,
      deviceType: repair.deviceType,
      status: repair.status,
      statusLabel: STATUS_LABELS[repair.status] ?? repair.status,
      statusOrder: STATUS_ORDER,
      statusLabels: STATUS_LABELS,
      receivedAt: repair.receivedAt,
      estimatedAt: repair.estimatedAt,
      completedAt: repair.completedAt,
      statusHistory: repair.statusHistory.map(h => ({
        status: h.status,
        createdAt: h.createdAt,
        note: verificado ? h.note : null,
      })),
      verificado,
      requiereTelefono: tieneTelefono,
      telIncorrecto: !!tel && !verificado,
    }

    if (!verificado) return NextResponse.json(base)

    return NextResponse.json({
      ...base,
      deviceBrand: repair.deviceBrand,
      deviceModel: repair.deviceModel,
      issueDescription: repair.issueDescription,
      priority: repair.priority,
      estimatedCost: repair.estimatedCost,
      finalCost: repair.finalCost,
      paid: repair.paid,
      client: { name: enmascarar(repair.client?.name || '') },
    })
  } catch {
    return NextResponse.json(
      { error: 'Error al buscar la reparación. Intentá nuevamente.' },
      { status: 500 }
    )
  }
}
