import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ContadorVisitas from '@/components/ContadorVisitas'
const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'ElectroGamez - Servicio Técnico en Río Gallegos | Reparación PlayStation y PC',
  description: 'Reparación de PlayStation, PC y notebooks a nivel componente en Río Gallegos, Santa Cruz. Microsoldadura, diagnóstico en 24h y garantía escrita. Técnico autorizado Lenovo.',
  keywords: 'Servicio técnico Río Gallegos, Reparación PlayStation Río Gallegos, Reparación PC Santa Cruz, microsoldadura, Reparación notebooks, ElectroGamez',
  openGraph: {
    title: 'ElectroGamez - Servicio Técnico en Río Gallegos',
    description: 'Reparación de PlayStation, PC y notebooks a nivel componente. Diagnóstico en 24h y garantía escrita.',
    url: 'https://electrogamez.ar',
    siteName: 'ElectroGamez',
    locale: 'es_AR',
    type: 'website',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'ElectroGamez Servicio Técnico RG',
  image: 'https://electrogamez.ar/hero-sergio.jpg',
  '@id': 'https://electrogamez.ar',
  url: 'https://electrogamez.ar',
  telephone: '+5491156975880',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Los Pozos 458 Dpto:8',
    addressLocality: 'Río Gallegos',
    addressRegion: 'Santa Cruz',
    addressCountry: 'AR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -51.6226,
    longitude: -69.2181,
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '10:00', closes: '19:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '10:00', closes: '14:00' },
  ],
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
