import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const isAdmin = req.cookies.get('eg_admin')?.value === 'true'
  if (isAdmin) return NextResponse.json({ ok: true })
  return NextResponse.json({ ok: false }, { status: 401 })
}
