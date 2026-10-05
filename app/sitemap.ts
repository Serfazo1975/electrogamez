import type { MetadataRoute } from 'next'

// ============================================================
// app/sitemap.ts — ARCHIVO NUEVO → genera /sitemap.xml
// Lista de páginas públicas para Google Search Console y Bing.
// Cuando se agreguen páginas nuevas (ej. /reparacion-ps5-rio-gallegos)
// se suman acá.
// ============================================================
const BASE = 'https://electrogamez.ar'

export default function sitemap(): MetadataRoute.Sitemap {
  const hoy = new Date()
  return [
    { url: `${BASE}/`,            lastModified: hoy, changeFrequency: 'weekly',  priority: 1 },
    { url: `${BASE}/tienda`,      lastModified: hoy, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/seguimiento`, lastModified: hoy, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/portal`,      lastModified: hoy, changeFrequency: 'weekly',  priority: 0.5 },
    { url: `${BASE}/reparacion-playstation-rio-gallegos`, lastModified: hoy, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/legales`,     lastModified: hoy, changeFrequency: 'yearly',  priority: 0.3 },
  ]
}
