import { prisma } from './prisma'

export async function getPortalSession(token: string | undefined) {
  if (!token) return null
  const session = await prisma.portalSession.findUnique({
    where: { token },
    include: { user: true },
  })
  if (!session) return null
  if (session.expiresAt < new Date()) {
    await prisma.portalSession.delete({ where: { id: session.id } })
    return null
  }
  return session
}

export function portalSessionCookieName() {
  return 'eg_portal_session'
}
