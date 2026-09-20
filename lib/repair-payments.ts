import { fmtDate } from '@/lib/api-helpers'
import type { PaymentInfo } from '@/lib/repair-dto'

// Tabla nueva e independiente: no toca el schema de Prisma ni la tabla de reparaciones.
let ready = false

async function ensureTable() {
  if (ready) return
  const { prisma } = await import('@/lib/prisma')
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS repair_payments (
       repair_id TEXT PRIMARY KEY,
       payment   TEXT NOT NULL DEFAULT 'pending',
       paid_at   TIMESTAMPTZ
     )`
  )
  ready = true
}

type Row = { repair_id: string; payment: string; paid_at: Date | null }

export async function getPaymentMap(): Promise<Map<string, PaymentInfo>> {
  const map = new Map<string, PaymentInfo>()
  try {
    await ensureTable()
    const { prisma } = await import('@/lib/prisma')
    const rows = await prisma.$queryRawUnsafe<Row[]>('SELECT repair_id, payment, paid_at FROM repair_payments')
    for (const r of rows) {
      map.set(r.repair_id, {
        payment: r.payment === 'paid' ? 'paid' : 'pending',
        paidDate: r.paid_at ? fmtDate(new Date(r.paid_at)) : null,
      })
    }
  } catch {
    // si falla, las reparaciones se muestran como "Pendiente de pago" y el resto sigue funcionando
  }
  return map
}

export async function setPayment(repairId: string, payment: 'pending' | 'paid') {
  await ensureTable()
  const { prisma } = await import('@/lib/prisma')
  const paidAt = payment === 'paid' ? new Date() : null
  await prisma.$executeRawUnsafe(
    `INSERT INTO repair_payments (repair_id, payment, paid_at)
     VALUES ($1, $2, $3::timestamptz)
     ON CONFLICT (repair_id) DO UPDATE SET payment = EXCLUDED.payment, paid_at = EXCLUDED.paid_at`,
    repairId,
    payment,
    paidAt
  )
}

export async function getPayment(repairId: string): Promise<PaymentInfo | undefined> {
  const map = await getPaymentMap()
  return map.get(repairId)
}
