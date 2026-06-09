'use client'

import { useState, useEffect } from 'react'
import { X, Download, MessageCircle, FileText, Plus, Loader2, Star } from 'lucide-react'

const REVIEW_URL = 'https://maps.app.goo.gl/4H4MGMC7uVY5sKeY9'

const NEG = {
  razonSocial:  'ELECTROGAMEZ SERVICIO TECNICO RG',
  titular:      'FAZZINI SERGIO FEDERICO',
  domicilio:    'Los Pozos 458 Dpto:8, Rio Gallegos, Santa Cruz',
  cuit:         '20214293286',
  iibb:         '1-28775',
  inicio:       '01/04/2017',
  condIva:      'Responsable Monotributo',
  puntoVenta:   '00002',
  whatsapp:     '+54 9 11 5697 5880',
  email:        'sergiofazzini@gmail.com',
  slogan:       '"Somos un Grupo de Técnicos dedicados a la informática. Atención a Empresas y Usuarios."',
}

export type DocItem = {
  codigo?: string
  desc: string
  qty: number
  unidad?: string
  price: number
  bonif?: number
}

export type DocData = {
  tipo: 'presupuesto' | 'factura'
  numero: string
  fecha: string
  cliente: string
  clienteCuit?: string
  clienteCondIva?: string
  clienteDomicilio?: string
  condVenta?: string
  telefono?: string
  email?: string
  refComercial?: string
  items: DocItem[]
  caeNumero?: string
  caeFechaVto?: string
  notas?: string
}

const ARS = (n: number) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function whatsappText(d: DocData, total: number) {
  const titulo = d.tipo === 'factura'
    ? `FACTURA C  Pto.Vta ${NEG.puntoVenta}  Nro: ${d.numero}`
    : `PRESUPUESTO Nro: ${d.numero}`
  const items = d.items
    .map(i => `• ${i.desc}  x${i.qty} ${i.unidad ?? 'u.'}  $${ARS(i.price * i.qty)}`)
    .join('\n')
  return [
    `*${NEG.razonSocial}*`,
    titulo,
    `Fecha: ${d.fecha}`,
    '',
    `👤 Cliente: ${d.cliente}`,
    d.clienteCuit ? `CUIT/DNI: ${d.clienteCuit}` : '',
    d.refComercial ? `Ref: ${d.refComercial}` : '',
    '',
    items,
    '',
    `*IMPORTE TOTAL: $${ARS(total)}*`,
    d.notas ? `\n${d.notas}` : '',
    '',
    `${NEG.domicilio}`,
    NEG.whatsapp,
  ].filter(l => l !== null).join('\n')
}

const inp = 'bg-transparent focus:outline-none border-b border-dashed border-gray-400 focus:border-blue-600'

export default function Documento({ data, onClose }: { data: DocData; onClose: () => void }) {
  const [doc, setDoc] = useState<DocData>(data)
  const [busy, setBusy] = useState<'pdf' | 'wa' | null>(null)
  const [reviewQr, setReviewQr] = useState('')
  const esF = doc.tipo === 'factura'

  useEffect(() => {
    import('qrcode').then(QRCode =>
      QRCode.toDataURL(REVIEW_URL, { margin: 1, width: 200, errorCorrectionLevel: 'M' })
        .then(setReviewQr).catch(() => {})
    )
  }, [])

  const subtotal = doc.items.reduce((s, i) => {
    const b = (i.bonif ?? 0) / 100
    return s + i.price * i.qty * (1 - b)
  }, 0)

  const fileName = `${esF ? 'FacturaC' : 'Presupuesto'}-${doc.numero.replace(/[^\w-]/g, '')}.pdf`

  const upd = <K extends keyof DocData>(k: K, v: DocData[K]) =>
    setDoc(d => ({ ...d, [k]: v }))
  const updItem = (idx: number, p: Partial<DocItem>) =>
    setDoc(d => ({ ...d, items: d.items.map((it, i) => i === idx ? { ...it, ...p } : it) }))

  // Genera el PDF capturando el documento. Reemplaza inputs por texto plano
  // para que se vea limpio y en una sola página.
  async function buildPdf() {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ])
    const el = document.getElementById('doc-print')!
    const canvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: '#ffffff',
      windowWidth: el.scrollWidth,
      onclone: (cloned) => {
        const root = cloned.getElementById('doc-print') as HTMLElement
        root.querySelectorAll('.no-print').forEach(n => ((n as HTMLElement).style.display = 'none'))
        const flatten = (node: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, txt: string) => {
          const cs = cloned.defaultView!.getComputedStyle(node)
          const span = cloned.createElement('span')
          span.textContent = txt
          span.style.fontSize = cs.fontSize
          span.style.fontWeight = cs.fontWeight
          span.style.textAlign = cs.textAlign
          span.style.color = '#000'
          span.style.fontFamily = cs.fontFamily
          span.style.display = 'inline-block'
          span.style.minWidth = cs.width
          span.style.whiteSpace = 'pre-wrap'
          span.style.verticalAlign = 'bottom'
          node.parentNode?.replaceChild(span, node)
        }
        root.querySelectorAll('input').forEach(n =>
          flatten(n as HTMLInputElement, (n as HTMLInputElement).value || ''))
        root.querySelectorAll('textarea').forEach(n =>
          flatten(n as HTMLTextAreaElement, (n as HTMLTextAreaElement).value || ''))
        root.querySelectorAll('select').forEach(n => {
          const sel = n as HTMLSelectElement
          flatten(sel, sel.options[sel.selectedIndex]?.text || '')
        })
      },
    })

    const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const margin = 8
    const imgW = pageW - margin * 2
    const imgH = (canvas.height * imgW) / canvas.width
    const img = canvas.toDataURL('image/jpeg', 0.95)

    let heightLeft = imgH
    let position = margin
    pdf.addImage(img, 'JPEG', margin, position, imgW, imgH)
    heightLeft -= (pageH - margin * 2)
    while (heightLeft > 0) {
      position = margin - (imgH - heightLeft)
      pdf.addPage()
      pdf.addImage(img, 'JPEG', margin, position, imgW, imgH)
      heightLeft -= (pageH - margin * 2)
    }
    return pdf
  }

  async function downloadPdf() {
    setBusy('pdf')
    try {
      const pdf = await buildPdf()
      pdf.save(fileName)
    } catch {
      alert('No se pudo generar el PDF. Intentá de nuevo.')
    } finally {
      setBusy(null)
    }
  }

  async function sendWA() {
    setBusy('wa')
    const text = whatsappText(doc, subtotal)
    const tel = (doc.telefono ?? '').replace(/\D/g, '')
    const waUrl = tel
      ? `https://wa.me/${tel}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`
    try {
      const pdf = await buildPdf()
      const blob = pdf.output('blob')
      const file = new File([blob], fileName, { type: 'application/pdf' })

      // En el celular: menú nativo para compartir el PDF directo a WhatsApp
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], text, title: fileName } as ShareData)
        return
      }
      // En la computadora: descargo el PDF y abro WhatsApp con el texto
      pdf.save(fileName)
      window.open(waUrl, '_blank')
      alert('Se descargó el PDF. Adjuntalo en el chat de WhatsApp que se abrió (ícono del clip 📎).')
    } catch {
      window.open(waUrl, '_blank')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto flex items-start justify-center py-6 px-2">

      {/* Toolbar */}
      <div className="no-print fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 shadow-2xl">
        <span className="text-white font-medium text-sm mr-1 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-blue-400" />
          {esF ? 'Factura C' : 'Presupuesto'}
        </span>
        <button onClick={downloadPdf} disabled={busy !== null}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
          {busy === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Descargar PDF
        </button>
        <button onClick={sendWA} disabled={busy !== null}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
          {busy === 'wa' ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
          WhatsApp PDF
        </button>
        <button onClick={onClose} className="ml-1 text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── Documento ── */}
      <div id="doc-print" className="bg-white text-black w-full max-w-3xl mt-14 rounded-xl shadow-2xl overflow-hidden"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12px', lineHeight: '1.4' }}>
        <div className="px-8 py-5">

          {/* ORIGINAL */}
          <div className="text-center font-bold tracking-widest uppercase border-b-2 border-black pb-1 mb-3"
            style={{ fontSize: '14px' }}>
            ORIGINAL
          </div>

          {/* Header 3 columnas */}
          <div className="flex border border-black" style={{ minHeight: '90px' }}>
            {/* Emisor */}
            <div className="flex-1 p-3 border-r border-black">
              <p className="font-bold" style={{ fontSize: '13px' }}>{NEG.razonSocial}</p>
              <p className="mt-2"><b>Razón Social:</b> {NEG.titular}</p>
              <p><b>Domicilio Comercial:</b> {NEG.domicilio}</p>
              <p><b>Condición frente al IVA:</b> {NEG.condIva}</p>
            </div>
            {/* Centro: letra */}
            <div className="flex flex-col items-center justify-center px-4 border-r border-black" style={{ minWidth: '90px' }}>
              <div className="border-2 border-black font-bold flex items-center justify-center"
                style={{ width: '52px', height: '52px', fontSize: '38px', lineHeight: '1' }}>
                {esF ? 'C' : 'P'}
              </div>
              <p className="mt-1 text-center" style={{ fontSize: '9px' }}>{esF ? 'COD. 011' : 'PPTO.'}</p>
              <p className="font-bold mt-0.5" style={{ fontSize: '13px' }}>{esF ? 'FACTURA' : 'PRESUPUESTO'}</p>
            </div>
            {/* Datos del comprobante */}
            <div className="flex-1 p-3">
              <p>
                <b>Punto de Venta:</b> {NEG.puntoVenta}&nbsp;&nbsp;
                <b>Comp. Nro:</b>{' '}
                <input value={doc.numero} onChange={e => upd('numero', e.target.value)}
                  className={`${inp} w-28 text-right`} />
              </p>
              <p><b>Fecha de Emisión:</b> {doc.fecha}</p>
              <p className="mt-2"><b>CUIT:</b> {NEG.cuit}</p>
              <p><b>Ingresos Brutos:</b> {NEG.iibb}</p>
              <p><b>Fecha de Inicio de Actividades:</b> {NEG.inicio}</p>
            </div>
          </div>

          {/* Receptor */}
          <div className="border border-t-0 border-black p-3" style={{ fontSize: '11px' }}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <p>
                <b>CUIT:</b>{' '}
                <input value={doc.clienteCuit ?? ''} onChange={e => upd('clienteCuit', e.target.value)}
                  placeholder="Sin especificar / Consumidor Final"
                  className={`${inp} w-44`} style={{ fontSize: '11px' }} />
              </p>
              <p>
                <b>Apellido y Nombre / Razón Social:</b>{' '}
                <span className="font-semibold">{doc.cliente}</span>
              </p>
              <p>
                <b>Condición frente al IVA:</b>{' '}
                <input value={doc.clienteCondIva ?? 'Consumidor Final'} onChange={e => upd('clienteCondIva', e.target.value)}
                  className={`${inp} w-36`} style={{ fontSize: '11px' }} />
              </p>
              <p>
                <b>Domicilio:</b>{' '}
                <input value={doc.clienteDomicilio ?? ''} onChange={e => upd('clienteDomicilio', e.target.value)}
                  placeholder="—"
                  className={`${inp} w-48`} style={{ fontSize: '11px' }} />
              </p>
            </div>
            <p className="mt-1">
              <b>Condición de venta:</b>{' '}
              <select value={doc.condVenta ?? 'Contado'} onChange={e => upd('condVenta', e.target.value as DocData['condVenta'])}
                className="bg-transparent border-b border-dashed border-gray-400 focus:outline-none"
                style={{ fontSize: '11px' }}>
                <option>Contado</option>
                <option>Cuenta Corriente</option>
                <option>Tarjeta de Débito</option>
                <option>Tarjeta de Crédito</option>
                <option>Transferencia</option>
              </select>
            </p>
          </div>

          {/* Tabla de ítems */}
          <div className="border border-t-0 border-black">
            {/* Referencia comercial */}
            <div className="px-3 py-1.5 border-b border-black bg-gray-50" style={{ fontSize: '11px' }}>
              <b>Referencia Comercial:</b>{' '}
              <input value={doc.refComercial ?? ''} onChange={e => upd('refComercial', e.target.value)}
                placeholder="(opcional)"
                className={`${inp} w-64`} style={{ fontSize: '11px' }} />
            </div>

            <table className="w-full" style={{ fontSize: '11px', borderCollapse: 'collapse' }}>
              <thead>
                <tr className="bg-gray-50 border-b border-black text-center" style={{ fontSize: '10px' }}>
                  <th className="px-2 py-1.5 text-left border-r border-gray-300 w-12">Código</th>
                  <th className="px-2 py-1.5 text-left border-r border-gray-300">Producto / Servicio</th>
                  <th className="px-2 py-1.5 border-r border-gray-300 w-16">Cantidad</th>
                  <th className="px-2 py-1.5 border-r border-gray-300 w-20">U. Medida</th>
                  <th className="px-2 py-1.5 border-r border-gray-300 w-24">Precio Unit.</th>
                  <th className="px-2 py-1.5 border-r border-gray-300 w-14">% Bonif</th>
                  <th className="px-2 py-1.5 border-r border-gray-300 w-20">Imp. Bonif.</th>
                  <th className="px-2 py-1.5 w-24">Subtotal</th>
                  <th className="no-print w-6" />
                </tr>
              </thead>
              <tbody>
                {doc.items.map((it, idx) => {
                  const b = it.bonif ?? 0
                  const bonifAmt = it.price * it.qty * (b / 100)
                  const sub = it.price * it.qty - bonifAmt
                  return (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="px-2 py-1.5 border-r border-gray-200">
                        <input value={it.codigo ?? ''} onChange={e => updItem(idx, { codigo: e.target.value })}
                          className={`${inp} w-10`} style={{ fontSize: '11px' }} />
                      </td>
                      <td className="px-2 py-1.5 border-r border-gray-200">
                        <input value={it.desc} onChange={e => updItem(idx, { desc: e.target.value })}
                          placeholder="Descripción del trabajo o repuesto"
                          className={`${inp} w-full`} style={{ fontSize: '11px' }} />
                      </td>
                      <td className="px-2 py-1.5 border-r border-gray-200 text-right">
                        <input type="number" min={0.01} step="0.01" value={it.qty}
                          onChange={e => updItem(idx, { qty: parseFloat(e.target.value) || 1 })}
                          className={`${inp} w-12 text-right`} style={{ fontSize: '11px' }} />
                      </td>
                      <td className="px-2 py-1.5 border-r border-gray-200">
                        <input value={it.unidad ?? 'unidades'} onChange={e => updItem(idx, { unidad: e.target.value })}
                          className={`${inp} w-16`} style={{ fontSize: '11px' }} />
                      </td>
                      <td className="px-2 py-1.5 border-r border-gray-200 text-right">
                        <input type="number" min={0} value={it.price}
                          onChange={e => updItem(idx, { price: parseFloat(e.target.value) || 0 })}
                          className={`${inp} w-20 text-right`} style={{ fontSize: '11px' }} />
                      </td>
                      <td className="px-2 py-1.5 border-r border-gray-200 text-right">
                        <input type="number" min={0} max={100} value={b}
                          onChange={e => updItem(idx, { bonif: parseFloat(e.target.value) || 0 })}
                          className={`${inp} w-10 text-right`} style={{ fontSize: '11px' }} />
                      </td>
                      <td className="px-2 py-1.5 border-r border-gray-200 text-right">{ARS(bonifAmt)}</td>
                      <td className="px-2 py-1.5 text-right font-medium">{ARS(sub)}</td>
                      <td className="no-print px-1 py-1.5 text-center">
                        <button onClick={() => setDoc(d => ({ ...d, items: d.items.filter((_, i) => i !== idx) }))}
                          className="text-gray-300 hover:text-red-500 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="no-print px-3 py-1.5">
              <button
                onClick={() => setDoc(d => ({ ...d, items: [...d.items, { desc: '', qty: 1, unidad: 'unidades', price: 0 }] }))}
                className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Agregar ítem
              </button>
            </div>
          </div>

          {/* Totales */}
          <div className="border border-t-0 border-black px-4 py-3">
            <div className="flex justify-end">
              <div className="text-right space-y-1" style={{ fontSize: '12px' }}>
                <p>Subtotal: <b>$ {ARS(subtotal)}</b></p>
                <p>Importe Otros Tributos: <b>$ 0,00</b></p>
                <p className="font-bold border-t border-black pt-1 mt-1" style={{ fontSize: '13px' }}>
                  Importe Total: <span>$ {ARS(subtotal)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Slogan */}
          <div className="border border-t-0 border-black px-4 py-2 text-center italic"
            style={{ fontSize: '11px', color: '#555' }}>
            {NEG.slogan}
          </div>

          {/* Notas (presupuesto) */}
          {!esF && (
            <div className="border border-t-0 border-black px-3 py-2">
              <p className="font-bold text-xs mb-1">Condiciones:</p>
              <textarea value={doc.notas ?? ''} onChange={e => upd('notas', e.target.value)}
                rows={2} placeholder="Validez 7 días. No incluye repuestos no detallados."
                className="w-full text-xs bg-transparent border border-dashed border-gray-300 focus:border-blue-500 focus:outline-none rounded px-2 py-1 resize-none" />
            </div>
          )}

          {/* CAE + pie */}
          <div className="flex items-end justify-between pt-3 mt-2 border-t border-black"
            style={{ fontSize: '11px' }}>
            <p>Pág. 1/1</p>
            <div className="text-right space-y-0.5">
              <p>
                <b>CAE N°:</b>{' '}
                <input value={doc.caeNumero ?? ''} onChange={e => upd('caeNumero', e.target.value)}
                  placeholder="(completar desde AFIP/ARCA)"
                  className={`${inp} w-44`} style={{ fontSize: '11px' }} />
              </p>
              <p>
                <b>Fecha de Vto. de CAE:</b>{' '}
                <input value={doc.caeFechaVto ?? ''} onChange={e => upd('caeFechaVto', e.target.value)}
                  placeholder="DD/MM/AAAA"
                  className={`${inp} w-28`} style={{ fontSize: '11px' }} />
              </p>
              <p className="font-bold mt-1">Comprobante {esF ? 'Autorizado' : 'no fiscal'}</p>
            </div>
          </div>

          {/* QR de reseña Google — solo en factura */}
          {esF && (
            <div style={{ marginTop: 16, borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
              <a href={REVIEW_URL} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 hover:bg-amber-100 transition-colors">
                {reviewQr
                  ? <img src={reviewQr} alt="QR reseña Google" style={{ width: 72, height: 72, flexShrink: 0 }} className="rounded" />
                  : <div style={{ width: 72, height: 72, flexShrink: 0 }} className="bg-gray-100 rounded animate-pulse" />}
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-1">
                    {[0,1,2,3,4].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm font-semibold text-gray-900">¿Te gustó nuestro servicio?</p>
                  <p className="text-xs text-gray-600">Escaneá el código y dejanos tu reseña en Google</p>
                </div>
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
