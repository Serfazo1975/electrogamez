import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Devuelve 200 si el visitante ya tiene sesión de admin (cookie del dashboard),
// 401 si no. Se usa para entrar directo al panel de la tienda desde el dashboard.
export async function GET(req: NextRequest) {
  const isAdmin = req.cookies.get('eg_admin')?.value === 'true'
  if (isAdmin) return NextResponse.json({ ok: true })
  return NextResponse.json({ ok: false }, { status: 401 })
