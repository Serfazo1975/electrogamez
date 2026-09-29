// ============================================================
// lib/portal-public.ts — ARCHIVO NUEVO
// Limpia lo que el portal muestra al público:
//  • thumbnail: solo si es una IMAGEN (jpg, png, webp, gif, avif, svg o data:image).
//    Un link de OneDrive/Drive o de una página web NO se publica (evita filtrar
//    links privados y que la portada salga rota).
//  • fileUrl: nunca se publica; la descarga pasa por /api/portal/download/[id],
//    que exige iniciar sesión.
// ============================================================

export function thumbnailPublico(url: unknown): string | null {
  if (typeof url !== 'string') return null
  const u = url.trim()
  if (/^data:image\//i.test(u)) return u
  if (!/^https:\/\//i.test(u)) return null
  try {
    const path = new URL(u).pathname
    return /\.(jpe?g|png|webp|gif|avif|svg)$/i.test(path) ? u : null
  } catch {
    return null
  }
}

export function proyectoPublico<T extends Record<string, any>>(p: T): T {
  const limpio: any = { ...p, thumbnail: thumbnailPublico(p.thumbnail) }
  if (Array.isArray(p.files)) {
    limpio.files = p.files.map(({ fileUrl, ...resto }: any) => resto)
  }
  return limpio
}
