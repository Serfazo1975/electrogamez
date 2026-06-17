import { NextRequest, NextResponse } from 'next/server'
import { getPortalSession } from '@/lib/portal-auth'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('eg_portal_session')?.value
  const session = await getPortalSession(token)
  if (!session) return NextResponse.json({ user: null })
  return NextResponse.json({
    user: { id: session.user.id, username: session.user.username, role: session.user.role },
  })
}
