import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbReady, fmtDate } from '@/lib/api-helpers'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-session'
import { toDTO } from '@/lib/repair-dto'
import { getPaymentMap } from '@/lib/repair-payments'

// ============================================================
// app/api/historial/route.ts  —  ARCHIVO NUEVO
// Historial por cliente: reparaciones + presupuestos + facturas.
// Tabla NUEVA e independiente (cliente_documentos). No toca el
// schema de Prisma ni las tablas existentes (solo las LEE).
// Solo administrador (cookie firmada eg_admin).
// ============================================================

export const dynamic = 'force-dynamic'

let tablaLista = false
async function ensureTabla(prisma: any) {
  if (tablaLista) return
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS cliente_documentos (
      id          SERIAL PRIMARY KEY,
      tipo        TEXT NOT NULL,              -- 'presupuesto' | 'factura'
      numero      TEXT NOT NULL,              -- P-202609-1234 | EG-2026-0001 | 00001-00000012
      cliente_id  TEXT,                       -- id del Client (si se conoce)
      nombre      TEXT,
      telefono    TEXT,
      cuit        TEXT,
      total       NUMERIC(14,2) NOT NULL DEFAULT 0,
      items       JSONB,
      notas       TEXT,
      extra       JSONB,                      -- cae, origen, etc.
      creado      TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (tipo, numero)
    )
  `)
  tablaLista = true
}

async function esAdmin() {
  return verifyAdminToken(cookies().get(ADMIN_COOKIE)?.value)
}

const soloDigitos = (v: unknown) => String(v ?? '').replace(/\D/g, '')
// Últimos 10 dígitos del teléfono: "+5492966270616" y "2966270616" quedan iguales
const telClave = (v: unknown) => soloDigitos(v).slice(-10)
const normNombre = (v: unknown) =>
  String(v ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim()

// Busca el cliente que corresponde a un documento guardado
function perteneceA(doc: any, cli: any) {
  if (doc.cliente_id && doc.cliente_id === cli.id) return true
  const cuit = soloDigitos(cli.cuit)
  if (cuit && soloDigitos(doc.cuit) === cuit) return true
  const tel = telClave(cli.phone)
  if (tel.length >= 8 && telClave(doc.telefono) === tel) return true
  const n = normNombre(cli.name)
  return !!n && normNombre(doc.nombre) === n
}

// ── GET ──────────────────────────────────────────────────────
//   /api/historial?resumen=1        → { [clientId]: { presupuestos, facturas } }
//   /api/historial?clientId=XXXX    → ficha completa del cliente
export async function GET(req: NextRequest) {
  if (!(await esAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!dbReady()) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    const { prisma } = await import('@/lib/prisma')
    await ensureTabla(prisma)
    const url = new URL(req.url)
    const clientId = url.searchParams.get('clientId')

    // Clientes con sus datos extra (cuit)
    const clientes: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, name, phone, email, address, cuit, "condIva" FROM "Client"`
    )
    const docs: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, tipo, numero, cliente_id, nombre, telefono, cuit,
              total::float AS total, items, notas, extra, creado
       FROM cliente_documentos ORDER BY creado DESC LIMIT 5000`
    )
    let facturas: any[] = []
    try {
      facturas = await prisma.$queryRawUnsafe(
        `SELECT id, pto_vta, cbte_nro::text AS cbte_nro, doc_tipo, doc_nro::text AS doc_nro,
                imp_total::float AS imp_total, cae, cae_vto, resultado, detalle, entorno, creado
         FROM facturas_afip ORDER BY id DESC LIMIT 2000`
      )
    } catch { /* si todavía no existe la tabla de facturas, seguimos sin ellas */ }

    // Facturas de un cliente: por CUIT/DNI o por el vínculo guardado al emitir
    const facturasDe = (cli: any) => {
      const cuit = soloDigitos(cli.cuit)
      const vinculos = docs.filter(d => d.tipo === 'factura' && perteneceA(d, cli))
      const claves = new Set(vinculos.map(d => d.numero))
      return facturas
        .filter(f => {
          const clave = `${String(f.pto_vta).padStart(5, '0')}-${String(f.cbte_nro).padStart(8, '0')}`
          return claves.has(clave) || (cuit.length >= 7 && soloDigitos(f.doc_nro) === cuit)
        })
        .map(f => ({
          id: f.id,
          numero: `${String(f.pto_vta).padStart(5, '0')}-${String(f.cbte_nro).padStart(8, '0')}`,
          fecha: fmtDate(f.creado),
          total: Number(f.imp_total) || 0,
          cae: f.cae || '',
          caeVto: f.cae_vto || '',
          resultado: f.resultado || '',
          entorno: f.entorno || '',
          items: Array.isArray(f.detalle) ? f.detalle : [],
        }))
    }

    if (!clientId) {
      const mapa: Record<string, { presupuestos: number; facturas: number }> = {}
      for (const c of clientes) {
        mapa[c.id] = {
          presupuestos: docs.filter(d => d.tipo === 'presupuesto' && perteneceA(d, c)).length,
          facturas: facturasDe(c).length,
        }
      }
      return NextResponse.json(mapa)
    }

    const cli = clientes.find(c => c.id === clientId)
    if (!cli) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    const repairs = await prisma.repair.findMany({
      where: { clientId },
      orderBy: { receivedAt: 'desc' },
      include: { client: { select: { name: true } } },
    })
    const pays = await getPaymentMap()

    const presupuestos = docs
      .filter(d => d.tipo === 'presupuesto' && perteneceA(d, cli))
      .map(d => ({
        id: d.id,
        numero: d.numero,
        fecha: fmtDate(d.creado),
        total: Number(d.total) || 0,
        items: Array.isArray(d.items) ? d.items : [],
        notas: d.notas || '',
        origen: d.extra?.origen || '',
      }))

    return NextResponse.json({
      cliente: {
        id: cli.id, name: cli.name, phone: cli.phone ?? '', email: cli.email ?? '',
        address: cli.address ?? '', cuit: cli.cuit ?? '', condIva: cli.condIva ?? '',
      },
      reparaciones: repairs.map(r => ({
        ...toDTO(r as any, pays.get(r.id)),
        diagnosis: (r as any).diagnosis ?? '',
        resolution: (r as any).resolution ?? '',
      })),
      presupuestos,
      facturas: facturasDe(cli),
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'fail', detalle: String(e?.message || e) }, { status: 500 })
  }
}

// ── POST: guardar un presupuesto o vincular una factura ──────
// { tipo, numero, clienteId?, nombre, telefono?, cuit?, total, items?, notas?, extra? }
export async function POST(req: NextRequest) {
  if (!(await esAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!dbReady()) return NextResponse.json({ error: 'no-db' }, { status: 503 })
  try {
    const { prisma } = await import('@/lib/prisma')
    await ensureTabla(prisma)
    const b = await req.json()
    const tipo = b.tipo === 'factura' ? 'factura' : 'presupuesto'
    const numero = String(b.numero ?? '').trim()
    if (!numero) return NextResponse.json({ error: 'sin-numero' }, { status: 400 })

    // Si no vino el id del cliente, lo buscamos por CUIT, teléfono o nombre
    let clienteId: string | null = b.clienteId ? String(b.clienteId) : null
    if (!clienteId) {
      const clientes: any[] = await prisma.$queryRawUnsafe(`SELECT id, name, phone, cuit FROM "Client"`)
      const doc = { nombre: b.nombre, telefono: b.telefono, cuit: b.cuit, cliente_id: null }
      const hallado = clientes.find(c => perteneceA(doc, c))
      clienteId = hallado?.id ?? null
    }

    // ON CONFLICT: volver a generar el mismo presupuesto lo actualiza (no se duplica)
    await prisma.$executeRawUnsafe(
      `INSERT INTO cliente_documentos (tipo, numero, cliente_id, nombre, telefono, cuit, total, items, notas, extra)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10::jsonb)
       ON CONFLICT (tipo, numero) DO UPDATE SET
         cliente_id = COALESCE(EXCLUDED.cliente_id, cliente_documentos.cliente_id),
         nombre = EXCLUDED.nombre, telefono = EXCLUDED.telefono, cuit = EXCLUDED.cuit,
         total = EXCLUDED.total, items = EXCLUDED.items, notas = EXCLUDED.notas, extra = EXCLUDED.extra`,
      tipo, numero, clienteId,
      String(b.nombre ?? '').trim() || 'Consumidor Final',
      b.telefono ? String(b.telefono).trim() : null,
      b.cuit ? soloDigitos(b.cuit) : null,
      Number(b.total) || 0,
      JSON.stringify(Array.isArray(b.items) ? b.items : []),
      b.notas ? String(b.notas) : null,
      JSON.stringify(b.extra && typeof b.extra === 'object' ? b.extra : {})
    )
    return NextResponse.json({ ok: true, clienteId })
  } catch (e: any) {
    return NextResponse.json({ error: 'fail', detalle: String(e?.message || e) }, { status: 500 })
  }
}
