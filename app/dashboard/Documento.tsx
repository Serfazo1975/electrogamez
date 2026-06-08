'use client'

import { useState } from 'react'
import { X, Printer, MessageCircle, FileText } from 'lucide-react'

// Datos fijos del negocio (Factura C - Monotributo)
const NEGOCIO = {
  nombre: 'ElectroGamez — E-Gtech',
  titular: 'Sergio Fazzini',
  domicilio: 'Los Pozos 458, Río Gallegos, Santa Cruz',
  cuit: '20-00000000-0',
  iibb: 'Exento',
  inicio: '01/2024',
  condicion: 'Responsable Monotributo',
  whatsapp: '+54 9 11 5697 5880',
  email: 'sergiofazzini@gmail.com',
}

export type DocItem = { desc: string; qty: number; price: number }

export type DocData = {
  tipo: 'presupuesto' | 'factura'
  numero: string
  fecha: string
  cliente: string
  telefono?: string
  email?: string
  items: DocItem[]
  notas?: string
}

const money = (n: number) =>
  '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

function buildWhatsappText(d: DocData, total: number) {
  const titulo = d.tipo === 'factura' ? `FACTURA C N° ${d.numero}` : `PRESUPUESTO N° ${d.numero}`
  const lineas = d.items
    .map(i => `• ${i.desc} x${i.qty} — ${money(i.price * i.qty)}`)
    .join('\n')
  return (
    `*${NEGOCIO.nombre}*\n` +
    `${titulo}\n` +
    `Fecha: ${d.fecha}\n` +
    `Cliente: ${d.cliente}\n\n` +
    `${lineas}\n\n` +
    `*TOTAL: ${money(total)}*\n\n` +
    (d.notas ? `${d.notas}\n\n` : '') +
    `${NEGOCIO.domicilio}\n${NEGOCIO.whatsapp}`
  )
}

export default function Documento({ data, onClose }: { data: DocData; onClose: () => void }) {
  const [doc, setDoc] = useState<DocData>(data)
  const total = doc.items.reduce((s, i) => s + i.price * i.qty, 0)
  const esFactura = doc.tipo === 'factura'
  const titulo = esFactura ? 'Factura C' : 'Presupuesto'

  function updateItem(idx: number, patch: Partial<DocItem>) {
    setDoc(d => ({ ...d, items: d.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) }))
  }
  function addItem() {
    setDoc(d => ({ ...d, items: [...d.items, { desc: '', qty: 1, price: 0 }] }))
  }
  function removeItem(idx: number) {
    setDoc(d => ({ ...d, items: d.items.filter((_, i) => i !== idx) }))
  }

  function handlePrint() {
    window.print()
  }

  function handleWhatsapp() {
    const tel = (doc.telefono || '').replace(/\D/g, '')
    const text = encodeURIComponent(buildWhatsappText(doc, total))
    const url = tel ? `https://wa.me/${tel}?text=${text}` : `https://wa.me/?text=${text}`
    window.open(url, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto print:bg-white print:p-0 print:overflow-visible print:static">
      <div className="bg-white text-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl my-4 print:my-0 print:max-w-none print:rounded-none print:shadow-none">

        {/* Barra superior (no se imprime) */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 print:hidden">
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <FileText className="w-5 h-5 text-blue-600" /> {titulo}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleWhatsapp}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
              <Printer className="w-4 h-4" /> Imprimir / PDF
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Documento imprimible */}
        <div className="px-6 sm:px-8 py-6 print:px-10 print:py-8" id="documento-print">

          {/* Encabezado */}
          <div className="flex items-start justify-between border-b-2 border-gray-900 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{NEGOCIO.nombre}</h1>
              <p className="text-sm text-gray-600 mt-1">{NEGOCIO.domicilio}</p>
              <p className="text-sm text-gray-600">{NEGOCIO.whatsapp} · {NEGOCIO.email}</p>
              <p className="text-xs text-gray-500 mt-1">{NEGOCIO.condicion}</p>
            </div>
            <div className="text-right">
              {esFactura ? (
                <>
                  <div className="border-2 border-gray-900 rounded-lg px-3 py-1 inline-block mb-2">
                    <span className="text-3xl font-bold">C</span>
                  </div>
                  <p className="text-sm font-semibold">FACTURA</p>
                </>
              ) : (
                <p className="text-xl font-bold uppercase tracking-wide text-gray-800">Presupuesto</p>
              )}
              <p className="text-sm text-gray-700 mt-1">N° <span className="font-mono font-semibold">{doc.numero}</span></p>
              <p className="text-sm text-gray-600">Fecha: {doc.fecha}</p>
              {esFactura && <p className="text-xs text-gray-500 mt-1">CUIT: {NEGOCIO.cuit}</p>}
            </div>
          </div>

          {/* Cliente */}
          <div className="mt-4 bg-gray-50 rounded-lg px-4 py-3 print:bg-transparent print:px-0">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Cliente</p>
            <p className="font-semibold text-gray-900">{doc.cliente || '—'}</p>
            {doc.telefono && <p className="text-sm text-gray-600">{doc.telefono}</p>}
            {doc.email && <p className="text-sm text-gray-600">{doc.email}</p>}
          </div>

          {/* Items */}
          <table className="w-full mt-5 text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-gray-600 text-xs uppercase">
                <th className="text-left py-2">Detalle</th>
                <th className="text-center py-2 w-16">Cant.</th>
                <th className="text-right py-2 w-28">Precio</th>
                <th className="text-right py-2 w-28">Subtotal</th>
                <th className="w-8 print:hidden" />
              </tr>
            </thead>
            <tbody>
              {doc.items.map((it, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-2 pr-2">
                    <input value={it.desc} onChange={e => updateItem(idx, { desc: e.target.value })}
                      placeholder="Descripción del trabajo o repuesto"
                      className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none py-0.5 print:border-none" />
                  </td>
                  <td className="py-2 text-center">
                    <input type="number" min={1} value={it.qty}
                      onChange={e => updateItem(idx, { qty: parseInt(e.target.value) || 1 })}
                      className="w-12 text-center bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none print:border-none" />
                  </td>
                  <td className="py-2 text-right">
                    <input type="number" min={0} value={it.price}
                      onChange={e => updateItem(idx, { price: parseFloat(e.target.value) || 0 })}
                      className="w-24 text-right bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none print:border-none" />
                  </td>
                  <td className="py-2 text-right font-medium">{money(it.price * it.qty)}</td>
                  <td className="py-2 text-center print:hidden">
                    <button onClick={() => removeItem(idx)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={addItem}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium print:hidden">
            + Agregar línea
          </button>

          {/* Total */}
          <div className="flex justify-end mt-4">
            <div className="w-64">
              <div className="flex justify-between py-2 border-t-2 border-gray-900 text-lg font-bold">
                <span>TOTAL</span>
                <span>{money(total)}</span>
              </div>
              {esFactura && (
                <p className="text-xs text-gray-500 text-right mt-1">
                  IVA no corresponde — Responsable Monotributo
                </p>
              )}
            </div>
          </div>

          {/* Notas */}
          <div className="mt-5 print:mt-6">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1 print:hidden">Notas / Condiciones</p>
            <textarea value={doc.notas ?? ''} onChange={e => setDoc(d => ({ ...d, notas: e.target.value }))}
              rows={2} placeholder="Validez del presupuesto, garantía, forma de pago..."
              className="w-full text-sm bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 focus:outline-none focus:border-blue-500 resize-none print:bg-transparent print:border-none print:p-0 print:text-gray-700" />
          </div>

          <p className="text-center text-xs text-gray-400 mt-6 print:mt-10">
            {esFactura
              ? 'Documento no válido como factura fiscal sin CAE de AFIP. Verificar datos antes de emitir.'
              : 'Presupuesto sin valor de factura. Precios sujetos a confirmación.'}
          </p>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #documento-print, #documento-print * { visibility: visible; }
          #documento-print { position: absolute; left: 0; top: 0; width: 100%; }
          @page { margin: 1.5cm; }
        }
      `}</style>
    </div>
  )
}
