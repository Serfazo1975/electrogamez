import type { Metadata } from 'next'
import PaginaServicio, { servicioJsonLd, type ServicioData } from '@/components/PaginaServicio'

// Ruta: app/reparacion-pc-rio-gallegos/page.tsx — PÁGINA NUEVA

const d: ServicioData = {
  "slug": "reparacion-pc-rio-gallegos",
  "eyebrow": "Servicio técnico · Río Gallegos, Santa Cruz",
  "tituloAntes": "Reparación de",
  "tituloDestacado": "PC de escritorio",
  "lead": "PC que no enciende, se reinicia, anda lenta o tiene Windows dañado. Diagnosticamos placa, fuente y componentes, y te decimos qué tiene y cuánto cuesta antes de empezar.",
  "img": "/svc-pc.jpg",
  "imgAlt": "Reparación de PC de escritorio en el taller de ElectroGamez, Río Gallegos",
  "fallasTitulo": "¿Qué le pasa a tu PC?",
  "fallas": [
    {
      "nombre": "No enciende",
      "sintoma": "No prende, prende y se apaga, o enciende sin imagen.",
      "tipo": "Diagnóstico"
    },
    {
      "nombre": "Se reinicia o se cuelga",
      "sintoma": "Pantallazos azules, reinicios al jugar o al cargar programas.",
      "tipo": "Diagnóstico"
    },
    {
      "nombre": "Cambio de componentes",
      "sintoma": "Fuente, disco SSD, memoria RAM, placa de video o placa madre.",
      "tipo": "Reparación"
    },
    {
      "nombre": "Instalación de Windows",
      "sintoma": "Windows no inicia, está dañado o con virus. Instalación con drivers.",
      "tipo": "Software"
    },
    {
      "nombre": "Anda lenta",
      "sintoma": "Optimización, limpieza de programas y migración a disco SSD.",
      "tipo": "Software"
    },
    {
      "nombre": "Recalentamiento",
      "sintoma": "Ventiladores ruidosos o temperaturas altas. Limpieza y pasta térmica.",
      "tipo": "Mantenimiento"
    }
  ],
  "precios": [
    {
      "servicio": "Diagnóstico completo y presupuesto escrito",
      "precio": "$20.000*"
    },
    {
      "servicio": "Instalación de Windows + drivers",
      "precio": "$65.000"
    },
    {
      "servicio": "Limpieza + pasta térmica",
      "precio": "$55.000"
    },
    {
      "servicio": "Cambio de componentes",
      "precio": "Según diagnóstico"
    }
  ],
  "faqs": [
    {
      "q": "¿Pierdo mis archivos si reinstalan Windows?",
      "a": "Antes de reinstalar te consultamos y, si el disco funciona, podemos resguardar tus archivos."
    },
    {
      "q": "¿Consiguen los repuestos?",
      "a": "Sí. Te pasamos el presupuesto con el repuesto incluido antes de hacer el cambio."
    },
    {
      "q": "¿Arman o mejoran PCs gamer?",
      "a": "Sí. Consultanos por WhatsApp qué querés mejorar y te armamos una propuesta."
    },
    {
      "q": "¿Tiene garantía?",
      "a": "Todas las reparaciones incluyen garantía por escrito sobre el trabajo realizado y el repuesto colocado."
    },
    {
      "q": "¿Atienden a domicilio?",
      "a": "Sí, en Río Gallegos coordinamos atención a domicilio o retiro del equipo. Escribinos y acordamos día y horario."
    }
  ],
  "waTexto": "Hola ElectroGamez! Tengo una PC para reparar.",
  "cierre": "¿Tu PC no anda?"
}

export const metadata: Metadata = {
  title: "Reparación de PC en Río Gallegos | No enciende, lenta, Windows | ElectroGamez",
  description: "Reparación de computadoras de escritorio en Río Gallegos: diagnóstico, cambio de componentes, instalación de Windows y optimización. Diagnóstico en 24h y garantía escrita.",
  alternates: { canonical: 'https://electrogamez.ar/reparacion-pc-rio-gallegos' },
  openGraph: {
    title: "Reparación de PC en Río Gallegos | No enciende, lenta, Windows | ElectroGamez",
    description: "Reparación de computadoras de escritorio en Río Gallegos: diagnóstico, cambio de componentes, instalación de Windows y optimización. Diagnóstico en 24h y garantía escrita.",
    url: 'https://electrogamez.ar/reparacion-pc-rio-gallegos',
    siteName: 'ElectroGamez',
    locale: 'es_AR',
    type: 'website',
    images: [{ url: 'https://electrogamez.ar/svc-pc.jpg' }],
  },
}

export default function ReparacionPcPage() {
  return <PaginaServicio d={d} jsonLd={servicioJsonLd(d, "Reparación de PC de escritorio")} />
}
