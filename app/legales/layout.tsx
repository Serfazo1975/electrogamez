import type { Metadata } from 'next'

// ARCHIVO NUEVO — metadatos de /legales
export const metadata: Metadata = {
  title: 'Términos, garantía y privacidad | ElectroGamez',
  description: 'Condiciones del servicio técnico, garantía de reparaciones, devoluciones y privacidad de ElectroGamez, Río Gallegos.',
  alternates: { canonical: '/legales' },
}

export default function LegalesLayout({ children }: { children: React.ReactNode }) {
  return children
}
