import type { Metadata } from 'next'

// ARCHIVO NUEVO — metadatos de /seguimiento
export const metadata: Metadata = {
  title: 'Seguimiento de reparación | ElectroGamez Río Gallegos',
  description: 'Consultá el estado de la reparación de tu PlayStation, PC o notebook con el código de tu comprobante.',
  alternates: { canonical: '/seguimiento' },
}

export default function SeguimientoLayout({ children }: { children: React.ReactNode }) {
  return children
}
