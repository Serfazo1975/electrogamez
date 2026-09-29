import type { Metadata } from 'next'

// ARCHIVO NUEVO — que Google no indexe la página de acceso
export const metadata: Metadata = {
  title: 'Acceso | ElectroGamez',
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
