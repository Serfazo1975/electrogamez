import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ContadorVisitas from '@/components/ContadorVisitas'
const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  // NUEVO: base para que las URLs de imágenes y canonical sean absolutas
  metadataBase: new URL('https://electrogamez.ar'),
  alternates: { canonical: '/' },
  title: 'ElectroGamez - Servicio Técnico en Río Gallegos | Reparación PlayStation y PC',
  description: 'Reparación de PlayStation, PC y notebooks a nivel componente en Río Gallegos, Santa Cruz. Microsoldadura, Diagnóstico en 24h y garantía escrita. Técnico autorizado Lenovo.',
  keywords: 'Servicio técnico Río Gallegos, Reparación PlayStation Río Gallegos, Reparación PC Santa Cruz, microsoldadura, Reparación notebooks, ElectroGamez',
  openGraph: {
    title: 'ElectroGamez - Servicio Técnico en Río Gallegos',
    description: 'Reparación de PlayStation, PC y notebooks a nivel componente. Diagnóstico en 24h y garantía escrita.',
    url: 'https://electrogamez.ar',
    siteName: 'ElectroGamez',
    locale: 'es_AR',
    type: 'website',
    // NUEVO: foto al compartir el link en WhatsApp / Facebook / Google
    images: [{ url: '/hero-sergio.jpg', width: 1400, height: 1045, alt: 'Taller de ElectroGamez en Río Gallegos' }],
  },
  // NUEVO: tarjeta grande en X/Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'ElectroGamez - Servicio Técnico en Río Gallegos',
    description: 'Reparación de PlayStation, PC y notebooks a nivel componente. Diagnóstico en 24h y garantía escrita.',
    images: ['/hero-sergio.jpg'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  // Para verificar en Google Search Console y Bing Webmaster (pegar el código en Netlify → variables)
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || 'pKiFnwiABYpwxBo31AdXqiZt47UI6ZE9Jmh9YKk-T_Q',
    other: process.env.NEXT_PUBLIC_BING_VERIFICATION ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION } : undefined,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'ElectroGamez Servicio Técnico RG',
  image: 'https://electrogamez.ar/hero-sergio.jpg',
  '@id': 'https://electrogamez.ar',
  url: 'https://electrogamez.ar',
  // Teléfono principal = línea local de Río Gallegos (igual que en el sitio y en Google Maps)
  telephone: '+542966383251',
  contactPoint: [
    { '@type': 'ContactPoint', telephone: '+542966383251', contactType: 'customer service', areaServed: 'AR', availableLanguage: 'es' },
    { '@type': 'ContactPoint', telephone: '+5491156975880', contactType: 'customer service', contactOption: 'WhatsApp', areaServed: 'AR', availableLanguage: 'es' },
  ],
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Los Pozos 458',
    addressLocality: 'Río Gallegos',
    addressRegion: 'Santa Cruz',
    addressCountry: 'AR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    // Mismas coordenadas que tu ficha de Google Maps (antes estaban ~1,5 km corridas)
    latitude: -51.6349395,
    longitude: -69.2026117,
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '10:00', closes: '19:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '14:00' },
  ],
  // NUEVO: más datos para Google (zona que atendés y qué hacés)
  alternateName: 'ElectroGamez',
  description: 'Servicio técnico de PlayStation, PC y notebooks a nivel componente en Río Gallegos, Santa Cruz.',
  email: 'sergiofazzini@gmail.com',
  areaServed: [
    { '@type': 'City', name: 'Río Gallegos' },
    { '@type': 'State', name: 'Santa Cruz' },
  ],
  knowsAbout: ['Reparación de PlayStation 5', 'Reparación de PlayStation 4', 'Reparación de notebooks', 'Reparación de PC', 'Microsoldadura', 'Cambio de puerto HDMI'],
  hasMap: 'https://www.google.com/maps/search/?api=1&query=Electrogamez+R%C3%ADo+Gallegos',
  sameAs: [
    'https://www.instagram.com/electro_gamez/',
    'https://www.facebook.com/Electrogamez.service.tecnico',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
        <ContadorVisitas />
      </body>
    </html>
  )
}
