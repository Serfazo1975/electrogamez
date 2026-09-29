import HomeClient from '@/components/HomeClient'
import { listDescargas } from '@/lib/descargas'

// ============================================================
// app/page.tsx — Portada
// La portada (todo su diseño) está en components/HomeClient.tsx, sin cambios.
// Este archivo solo le pasa desde el servidor los PRECIOS y DESCARGAS reales,
// para que Google vea los precios actuales y no los de ejemplo.
// Se actualiza sola cada 5 minutos, y al instante cuando editás precios o descargas.
// ============================================================

export const revalidate = 300

async function leerPrecios(): Promise<any[] | undefined> {
  try {
    const { prisma } = await import('@/lib/prisma')
    const filas: any[] = await prisma.$queryRawUnsafe(`SELECT datos FROM precios_web WHERE id = 1`)
    const datos = filas[0]?.datos
    return Array.isArray(datos) && datos.length ? datos : undefined
  } catch {
    return undefined // sin base: la portada usa los precios de ejemplo, como antes
  }
}

async function leerDescargas() {
  try {
    const url = process.env.DATABASE_URL
    if (!url || url.includes('file:')) return []
    // JSON ida y vuelta: convierte fechas en texto para pasarlas al navegador
    return JSON.parse(JSON.stringify(await listDescargas()))
  } catch {
    return []
  }
}

export default async function Page() {
  const [precios, apps] = await Promise.all([leerPrecios(), leerDescargas()])
  return <HomeClient initialApps={apps} initialPrecios={precios} />
}
