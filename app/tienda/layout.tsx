import type { Metadata } from 'next'

// ARCHIVO NUEVO — título y descripción propios para /tienda (antes repetía los de la portada)
export const metadata: Metadata = {
  title: 'Tienda de repuestos y accesorios | ElectroGamez Río Gallegos',
  description: 'Repuestos, accesorios y componentes para PlayStation, PC y notebooks en Río Gallegos, Santa Cruz. Consultá stock y precios y pedí por WhatsApp.',
  alternates: { canonical: '/tienda' },
  openGraph: {
    title: 'Tienda ElectroGamez — Repuestos y accesorios en Río Gallegos',
    description: 'Repuestos y accesorios para PlayStation, PC y notebooks. Pedidos por WhatsApp.',
    url: 'https://electrogamez.ar/tienda',
  },
}

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return children
}
