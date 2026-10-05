import type { Metadata } from 'next'
import PaginaServicio, { servicioJsonLd, type ServicioData } from '@/components/PaginaServicio'

// Ruta: app/reparacion-notebook-rio-gallegos/page.tsx — PÁGINA NUEVA

const d: ServicioData = {
  "slug": "reparacion-notebook-rio-gallegos",
  "eyebrow": "Servicio técnico · Técnico autorizado Lenovo",
  "tituloAntes": "Reparación de",
  "tituloDestacado": "notebooks",
  "lead": "Pantalla rota, bisagras flojas, batería que no carga, teclado o recalentamiento. Reparamos todas las marcas y somos técnico autorizado Lenovo. Diagnóstico en 24 horas y garantía escrita.",
  "img": "/svc-laptop.jpg",
  "imgAlt": "Reparación de notebooks en el taller de ElectroGamez, Río Gallegos",
  "fallasTitulo": "¿Qué le pasa a tu notebook?",
  "fallas": [
    {
      "nombre": "Pantalla rota o sin imagen",
      "sintoma": "Pantalla quebrada, con manchas, líneas o sin imagen.",
      "tipo": "Reparación"
    },
    {
      "nombre": "Bisagras rotas",
      "sintoma": "La tapa se afloja, cruje o se despega de la base.",
      "tipo": "Reparación"
    },
    {
      "nombre": "Batería",
      "sintoma": "No carga, dura poco o la notebook solo anda enchufada.",
      "tipo": "Reparación"
    },
    {
      "nombre": "Teclado y touchpad",
      "sintoma": "Teclas que no responden, se trabaron o se mojaron.",
      "tipo": "Reparación"
    },
    {
      "nombre": "No enciende o no carga",
      "sintoma": "Falla de placa o del conector de carga.",
      "tipo": "Microsoldadura"
    },
    {
      "nombre": "Recalentamiento",
      "sintoma": "Se calienta mucho o se apaga sola. Limpieza y pasta térmica.",
      "tipo": "Mantenimiento"
    }
  ],
  "precios": [
    {
      "servicio": "Diagnóstico completo y presupuesto escrito",
      "precio": "$20.000*"
    },
    {
      "servicio": "Cambio de pantalla (incluye pantalla e instalación)",
      "precio": "$175.000"
    },
    {
      "servicio": "Limpieza + pasta térmica",
      "precio": "$55.000"
    },
    {
      "servicio": "Instalación de Windows + drivers",
      "precio": "$65.000"
    },
    {
      "servicio": "Bisagras, batería y teclado",
      "precio": "Según modelo"
    }
  ],
  "faqs": [
    {
      "q": "¿Reparan todas las marcas?",
      "a": "Sí. Reparamos Lenovo, HP, Dell, Asus, Acer, Bangho, Exo y otras. Somos técnico autorizado Lenovo."
    },
    {
      "q": "¿Se pierden mis archivos?",
      "a": "En cambios de pantalla, bisagras, batería o teclado no tocamos el disco. Si hay que hacerlo te avisamos antes."
    },
    {
      "q": "¿Consiguen la pantalla para mi modelo?",
      "a": "Pasanos el modelo por WhatsApp y te confirmamos disponibilidad y precio antes de traerla."
    },
    {
      "q": "¿Tiene garantía?",
      "a": "Todas las reparaciones incluyen garantía por escrito sobre el trabajo realizado y el repuesto colocado."
    },
    {
      "q": "¿Atienden a domicilio?",
      "a": "Sí, en Río Gallegos coordinamos retiro y entrega. Escribinos y acordamos día y horario."
    }
  ],
  "waTexto": "Hola ElectroGamez! Tengo una notebook para reparar.",
  "cierre": "¿Tu notebook no anda?"
}

export const metadata: Metadata = {
  title: "Reparación de notebooks en Río Gallegos | Pantalla, bisagras, batería | ElectroGamez",
  description: "Reparación de notebooks y laptops en Río Gallegos: cambio de pantalla, bisagras, batería, teclado y recalentamiento. Técnico autorizado Lenovo. Diagnóstico en 24h y garantía escrita.",
  alternates: { canonical: 'https://electrogamez.ar/reparacion-notebook-rio-gallegos' },
  openGraph: {
    title: "Reparación de notebooks en Río Gallegos | Pantalla, bisagras, batería | ElectroGamez",
    description: "Reparación de notebooks y laptops en Río Gallegos: cambio de pantalla, bisagras, batería, teclado y recalentamiento. Técnico autorizado Lenovo. Diagnóstico en 24h y garantía escrita.",
    url: 'https://electrogamez.ar/reparacion-notebook-rio-gallegos',
    siteName: 'ElectroGamez',
    locale: 'es_AR',
    type: 'website',
    images: [{ url: 'https://electrogamez.ar/svc-laptop.jpg' }],
  },
}

export default function ReparacionNotebookPage() {
  return <PaginaServicio d={d} jsonLd={servicioJsonLd(d, "Reparación de notebooks")} />
}
