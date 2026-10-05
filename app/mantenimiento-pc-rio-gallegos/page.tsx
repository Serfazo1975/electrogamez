import type { Metadata } from 'next'
import PaginaServicio, { servicioJsonLd, type ServicioData } from '@/components/PaginaServicio'

// Ruta: app/mantenimiento-pc-rio-gallegos/page.tsx — PÁGINA NUEVA

const d: ServicioData = {
  "slug": "mantenimiento-pc-rio-gallegos",
  "eyebrow": "Mantenimiento preventivo · Río Gallegos",
  "tituloAntes": "Limpieza y",
  "tituloDestacado": "mantenimiento preventivo",
  "lead": "El polvo y la pasta térmica seca son la causa más común de recalentamiento, ruido y apagones. Una limpieza a tiempo evita reparaciones caras en PC, notebooks y PlayStation.",
  "img": "/svc-ventilador.jpg",
  "imgAlt": "Limpieza y mantenimiento de equipos en ElectroGamez, Río Gallegos",
  "fallasTitulo": "¿Qué incluye el mantenimiento?",
  "fallas": [
    {
      "nombre": "Limpieza interna profunda",
      "sintoma": "Desarmado, limpieza de polvo en placa, disipadores y ventiladores.",
      "tipo": "Mantenimiento"
    },
    {
      "nombre": "Cambio de pasta térmica",
      "sintoma": "Pasta térmica nueva en procesador y placa de video para bajar temperaturas.",
      "tipo": "Mantenimiento"
    },
    {
      "nombre": "Revisión general",
      "sintoma": "Control de ventiladores, fuente, disco y temperaturas.",
      "tipo": "Diagnóstico"
    },
    {
      "nombre": "Optimización del sistema",
      "sintoma": "Limpieza de programas de inicio y revisión del estado del disco.",
      "tipo": "Software"
    }
  ],
  "precios": [
    {
      "servicio": "Limpieza + pasta térmica (PC, notebook o PlayStation)",
      "precio": "$55.000"
    },
    {
      "servicio": "Diagnóstico completo y presupuesto escrito",
      "precio": "$20.000*"
    },
    {
      "servicio": "Mantenimiento para empresas",
      "precio": "A convenir"
    }
  ],
  "faqs": [
    {
      "q": "¿Cada cuánto conviene hacer la limpieza?",
      "a": "En general una vez por año. Si el equipo está en un lugar con mucho polvo o se usa muchas horas para jugar, cada seis meses."
    },
    {
      "q": "¿Cómo sé si mi equipo la necesita?",
      "a": "Si hace más ruido que antes, se calienta, se pone lento al jugar o se apaga solo, es momento de hacerla."
    },
    {
      "q": "¿Sirve para PlayStation?",
      "a": "Sí. En PS4 y PS5 la limpieza baja el ruido del ventilador y evita apagones por temperatura."
    },
    {
      "q": "¿Hacen mantenimiento para empresas?",
      "a": "Sí. Hacemos mantenimiento programado de PCs, servidores, UPS e impresoras en toda la provincia de Santa Cruz."
    },
    {
      "q": "¿Tiene garantía?",
      "a": "Sí, el trabajo incluye garantía por escrito."
    }
  ],
  "waTexto": "Hola ElectroGamez! Quiero hacer una limpieza y mantenimiento.",
  "cierre": "¿Tu equipo hace ruido o se calienta?"
}

export const metadata: Metadata = {
  title: "Limpieza y mantenimiento de PC, notebook y PlayStation en Río Gallegos | ElectroGamez",
  description: "Limpieza profunda, cambio de pasta térmica y revisión general de PC, notebooks y PlayStation en Río Gallegos. Evitá recalentamiento y fallas. Garantía escrita.",
  alternates: { canonical: 'https://electrogamez.ar/mantenimiento-pc-rio-gallegos' },
  openGraph: {
    title: "Limpieza y mantenimiento de PC, notebook y PlayStation en Río Gallegos | ElectroGamez",
    description: "Limpieza profunda, cambio de pasta térmica y revisión general de PC, notebooks y PlayStation en Río Gallegos. Evitá recalentamiento y fallas. Garantía escrita.",
    url: 'https://electrogamez.ar/mantenimiento-pc-rio-gallegos',
    siteName: 'ElectroGamez',
    locale: 'es_AR',
    type: 'website',
    images: [{ url: 'https://electrogamez.ar/svc-ventilador.jpg' }],
  },
}

export default function MantenimientoPage() {
  return <PaginaServicio d={d} jsonLd={servicioJsonLd(d, "Mantenimiento preventivo de PC, notebooks y consolas")} />
}
