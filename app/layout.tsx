import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ElectroGamez - Servicio Técnico Especializado',
  description: 'Reparación de computadoras y PlayStation en Santiago, Chile. Diagnóstico rápido, garantía en reparaciones.',
  keywords: 'servicio técnico, reparación computadoras, reparación PlayStation, Santiago Chile',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
