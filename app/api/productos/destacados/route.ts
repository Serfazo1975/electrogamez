import { NextResponse } from 'next/server'
import { listDestacados } from '@/lib/productos'

// NUEVO — Público: los 3-4 productos para el carrusel de la portada.
// Devuelve solo lo necesario (no la lista completa con todas las fotos),
// y se guarda 5 minutos en caché para no pegarle a la base en cada visita.
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const productos = await listDestacados(4)
    return NextResponse.json(
      productos.map(p => ({
        id: p.id,
        nombre: p.nombre,
        categoria: p.categoria,
        precio: p.precio,
        imagen: p.imagen,
      })),
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch {
    return NextResponse.json([]) // sin base: el carrusel simplemente no se muestra
  }
}
