import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ContadorVisitas from '@/components/ContadorVisitas'
const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'ElectroGamez - Servicio Técnico Especializado',
  description: 'Reparación de Computadoras y PlayStation en Argentina. Diagnóstico rápido, garantía en reparaciones.',
  keywords: 'servicio técnico, reparación computadoras, reparación PlayStation, Rio Gallegos Argentina',
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <ContadorVisitas />
      </body>
    </html>
  )
}
