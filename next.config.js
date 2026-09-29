/** @type {import('next').NextConfig} */

// ============================================================
// Cabeceras de seguridad para TODO el sitio (NUEVO)
// ============================================================
const cabecerasSeguridad = [
  // Nadie puede meter tu sitio dentro de otro (evita engaños tipo "clickjacking")
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests" },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(self), payment=(), usb=(), interest-cohort=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

const nextConfig = {
  // NUEVO: no anunciar la tecnología del servidor
  poweredByHeader: false,

  // ANTES: remotePatterns con hostname '**' permitía que cualquiera usara tu
  // servidor para procesar imágenes de otros sitios (gasta tu cuota de Netlify).
  // El sitio no usa next/image, así que se desactiva el optimizador remoto.
  images: {
    unoptimized: true,
    remotePatterns: [],
  },

  async headers() {
    return [
      { source: '/:path*', headers: cabecerasSeguridad },
      // Páginas privadas: que no queden guardadas en caché ni indexadas
      {
        source: '/(dashboard|admin|login|clientes.html|facturas.html)(.*)',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
