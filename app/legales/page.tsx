'use client'

import { ArrowLeft, ShieldCheck, FileText, RotateCcw, Store } from 'lucide-react'

// ⚠️ COMPLETÁ el CUIT real donde dice [CUIT] antes de vender.
const VENDEDOR = {
  razonSocial: 'ELECTROGAMEZ SERVICIO TÉCNICO RG',
  titular: 'Fazzini Sergio Federico',
  condicion: 'Monotributista',
  cuit: '20-21429328-6',
  domicilio: 'Los Pozos 458 Dpto:8, Río Gallegos, Santa Cruz, Argentina',
  email: 'sergiofazzini@gmail.com',
  whatsapp: '11 5697-5880',
}

export default function LegalesPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800/60">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">ElectroGamez</span>
          <a href="/tienda" className="ml-auto flex items-center gap-2 text-gray-400 hover:text-white text-sm transition"><ArrowLeft className="w-4 h-4" /> Volver a la tienda</a>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        <header>
          <h1 className="text-3xl font-bold mb-2">Información legal</h1>
          <p className="text-gray-400">Datos del vendedor, botón de arrepentimiento y términos de compra, conforme a la Ley de Defensa del Consumidor (Ley 24.240) de Argentina.</p>
        </header>

        {/* Datos del vendedor */}
        <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4"><Store className="w-5 h-5 text-cyan-400" /><h2 className="text-xl font-semibold">Datos del vendedor</h2></div>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2"><dt className="text-gray-500 w-40 shrink-0">Razón social</dt><dd>{VENDEDOR.razonSocial}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-40 shrink-0">Titular</dt><dd>{VENDEDOR.titular}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-40 shrink-0">Condición fiscal</dt><dd>{VENDEDOR.condicion}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-40 shrink-0">CUIT</dt><dd>{VENDEDOR.cuit}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-40 shrink-0">Domicilio</dt><dd>{VENDEDOR.domicilio}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500 w-40 shrink-0">Contacto</dt><dd>{VENDEDOR.email} · WhatsApp {VENDEDOR.whatsapp}</dd></div>
          </dl>
        </section>

        {/* Botón de arrepentimiento */}
        <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4"><RotateCcw className="w-5 h-5 text-emerald-400" /><h2 className="text-xl font-semibold">Botón de arrepentimiento</h2></div>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            Si te arrepentiste de tu compra, tenés derecho a revocarla dentro de los <strong>10 días corridos</strong> desde que recibiste el producto, sin costo ni justificación (art. 34, Ley 24.240). El producto debe estar sin uso y en su embalaje original.
          </p>
          <a
            href={`https://wa.me/5491156975880?text=${encodeURIComponent('Hola ElectroGamez, quiero ejercer el BOTÓN DE ARREPENTIMIENTO de mi compra. Datos del pedido: ')}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-3 rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4" /> Iniciar arrepentimiento de compra
          </a>
        </section>

        {/* Términos */}
        <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4"><FileText className="w-5 h-5 text-blue-400" /><h2 className="text-xl font-semibold">Términos y condiciones de compra</h2></div>
          <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
            <p><strong className="text-white">Precios y pago.</strong> Los precios están en pesos argentinos (ARS) e incluyen impuestos. El pago se realiza por transferencia al alias informado o por link de MercadoPago. El pedido se confirma una vez acreditado el pago.</p>
            <p><strong className="text-white">Envíos.</strong> Realizamos envíos a domicilio sin cargo dentro de Río Gallegos. Los plazos de entrega se coordinan por WhatsApp al confirmar el pedido.</p>
            <p><strong className="text-white">Garantía.</strong> Los productos cuentan con la garantía legal establecida por la Ley 24.240. Ante fallas, contactanos por WhatsApp para gestionar la reparación o el cambio.</p>
            <p><strong className="text-white">Devoluciones.</strong> Además del botón de arrepentimiento, aceptamos devoluciones por producto defectuoso. Los gastos de devolución en caso de arrepentimiento corren por cuenta del vendedor.</p>
            <p><strong className="text-white">Datos personales.</strong> Los datos que nos brindás (nombre, teléfono, dirección) se usan únicamente para procesar y entregar tu pedido. No se comparten con terceros.</p>
          </div>
        </section>

        {/* Defensa del consumidor */}
        <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4"><ShieldCheck className="w-5 h-5 text-cyan-400" /><h2 className="text-xl font-semibold">Defensa del consumidor</h2></div>
          <p className="text-sm text-gray-300 leading-relaxed">
            Ante cualquier inconveniente, podés comunicarte con la Dirección de Defensa del Consumidor de Santa Cruz. También podés iniciar un reclamo en la Ventanilla Única Federal de Defensa del Consumidor: <a href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">argentina.gob.ar/defensadelconsumidor</a>.
          </p>
        </section>

        <footer className="text-center text-gray-600 text-sm pt-4">
          <p className="font-semibold text-gray-400">{VENDEDOR.razonSocial}</p>
          <p className="mt-1">{VENDEDOR.domicilio}</p>
        </footer>
      </main>
    </div>
  )
}
