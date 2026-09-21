// Sesión de administrador FIRMADA (HMAC-SHA256).
// Reemplaza a la cookie eg_admin='true', que cualquiera podía falsificar.
// Funciona tanto en middleware (Edge) como en las rutas API (Node).

export const ADMIN_COOKIE = 'eg_admin'
export const ADMIN_TTL_SECONDS = 60 * 60 * 8 // 8 horas

const enc = new TextEncoder()

// Clave de firma: ADMIN_SESSION_SECRET (recomendada) o, si no existe, ADMIN_PASSWORD.
function getSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null
}

async function firmar(payload: string, secret: string): Promise<string> {
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(payload))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Comparación en tiempo constante
function iguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let r = 0
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}

// Crea el valor de la cookie: v1.<vencimiento>.<firma>
export async function createAdminToken(): Promise<string | null> {
  const secret = getSecret()
  if (!secret) return null
  const payload = `v1.${Date.now() + ADMIN_TTL_SECONDS * 1000}`
  return `${payload}.${await firmar(payload, secret)}`
}

// true solo si la cookie tiene firma válida y no venció
export async function verifyAdminToken(token?: string | null): Promise<boolean> {
  if (!token) return false
  const secret = getSecret()
  if (!secret) return false
  const partes = token.split('.')
  if (partes.length !== 3 || partes[0] !== 'v1') return false
  const exp = Number(partes[1])
  if (!Number.isFinite(exp) || exp < Date.now()) return false
  const esperada = await firmar(`v1.${partes[1]}`, secret)
  return iguales(esperada, partes[2])
}
