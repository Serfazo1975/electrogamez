import { fmtMoney, fmtDate } from '@/lib/api-helpers'

export type RepairWithClient = {
  id: string
  trackingCode: string
  deviceType: string
  deviceBrand: string | null
  deviceModel: string | null
  issueDescription: string
  status: string
  priority: string
  estimatedCost: number | null
  receivedAt: Date
  client: { name: string } | null
}

export type PaymentInfo = { payment: 'pending' | 'paid'; paidDate: string | null }

export function toDTO(r: RepairWithClient, pay?: PaymentInfo) {
  return {
    id: r.id,
    code: r.trackingCode,
    client: r.client?.name ?? '',
    device: [r.deviceBrand, r.deviceModel].filter(Boolean).join(' ') || r.deviceType,
    type: r.deviceType,
    issue: r.issueDescription,
    status: r.status,
    priority: r.priority,
    date: fmtDate(r.receivedAt),
    cost: fmtMoney(r.estimatedCost),
    // Estado de pago (tabla aparte: repair_payments). Sin registro = pendiente de pago.
    payment: pay?.payment ?? 'pending',
    paidDate: pay?.paidDate ?? null,
  }
}
