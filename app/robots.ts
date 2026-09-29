import type { MetadataRoute } from 'next'

// ============================================================
// app/robots.ts — ARCHIVO NUEVO → genera /robots.txt
// Indica a Google/Bing qué páginas indexar y dónde está el sitemap.
// ============================================================
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard', '/admin', '/login', '/portal/admin', '/portal/login', '/clientes.html', '/facturas.html', '/clientes', '/facturas'],
      },
    ],
    sitemap: 'https://electrogamez.ar/sitemap.xml',
    host: 'https://electrogamez.ar',
  }
}
