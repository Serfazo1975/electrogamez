import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)
  if (isAdmin) return NextResponse.json({ ok: true })
  return NextResponse.json({ ok: false }, { status: 401 })
}
