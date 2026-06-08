// Utilidades compartidas por las rutas API del dashboard.

export function dbReady() {
  const url = process.env.DATABASE_URL
  return !!url && !url.includes('file:')
}

export function fmtMoney(n: number | null | undefined): string | null {
  if (n == null) return null
  return '$' + Math.round(n).toLocaleString('es-AR')
}

export function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

// "$25.000" | "25000" | 25000  →  25000
export function parseMoney(v: unknown): number | null {
  if (v == null || v === '') return null
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : null
}
