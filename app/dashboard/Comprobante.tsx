'use client'

import { useState, useEffect } from 'react'
import { X, Download, Image as ImageIcon, MessageCircle, Mail, Loader2, CheckCircle2, Copy, Star } from 'lucide-react'
import { captureCanvas, canvasToPdf, downloadCanvasJpg, tryShareFile } from '@/lib/docExport'

const REVIEW_URL = 'https://maps.app.goo.gl/4H4MGMC7uVY5sKeY9'

const NEG = {
  razonSocial: 'ELECTROGAMEZ SERVICIO TECNICO RG',
  titular:     'Fazzini Sergio Federico',
  domicilio:   'Los Pozos 458 Dpto:8, Río Gallegos, Santa Cruz',
  whatsapp:    '+54 9 11 5697 5880',
  email:       'sergiofazzini@gmail.com',
  web:         'electrogamez.netlify.app',
}
const SEGUIMIENTO_URL = 'https://electrogamez.netlify.app/seguimiento'

const DEVICE_LABEL: Record<string, string> = {
  laptop: 'Notebook / Laptop',
  pc: 'PC de escritorio',
  playstation: 'PlayStation',
  other: 'Otro',
}

export type ReceiptData = {
  code: string
  fecha: string
  cliente: string
  telefono?: string
  email?: string
  deviceType: string
  deviceBrand?: string
  deviceModel?: string
  issue: string
  priority?: string
  cost?: string | null
}

function buildMessage(d: ReceiptData) {
  const equipo = [DEVICE_LABEL[d.deviceType] ?? d.deviceType, d.deviceBrand, d.deviceModel]
    .filter(Boolean).join(' ')
  return [
    `*${NEG.razonSocial}*`,
    'Comprobante de recepción de equipo',
    '',
    `📋 *Código: ${d.code}*`,
    `📅 Fecha: ${d.fecha}`,
    `👤 Cliente: ${d.cliente}`,
    `💻 Equipo: ${equipo}`,
    `🔧 Falla: ${d.issue}`,
    d.cost ? `💲 Presupuesto estimado: ${d.cost}` : '',
    '',
    `Seguí el estado de tu reparación en:`,
    `${SEGUIMIENTO_URL}`,
    `Ingresá tu código: *${d.code}*`,
    '',
    `${NEG.whatsapp}`,
  ].filter(Boolean).join('\n')
}

export default function Comprobante({ data, onClose }: { data: ReceiptData; onClose: () => void }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [qr, setQr] = useState<string>('')
  const fileBase = `Comprobante-${data.code}`

  // Generar el QR de reseñas (Google Maps) como imagen local
  useEffect(() => {
    import('qrcode').then(QRCode => {
      QRCode.toDataURL(REVIEW_URL, { margin: 1, width: 240, errorCorrectionLevel: 'M' })
        .then(setQr).catch(() => {})
    })
  }, [])
  const equipo = [data.deviceBrand, data.deviceModel].filter(Boolean).join(' ') || '—'

  function copyCode() {
    navigator.clipboard?.writeText(data.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }).catch(() => {})
  }

  async function downloadPDF() {
    setBusy('pdf')
    try {
      const canvas = await captureCanvas('comprobante-print')
      const pdf = await canvasToPdf(canvas)
      pdf.save(`${fileBase}.pdf`)
    } catch { alert('No se pudo generar el PDF.') }
    finally { setBusy(null) }
  }

  async function downloadJPG() {
    setBusy('jpg')
    try {
      const canvas = await captureCanvas('comprobante-print')
      downloadCanvasJpg(canvas, `${fileBase}.jpg`)
    } catch { alert('No se pudo generar la imagen.') }
    finally { setBusy(null) }
  }

  async function sendWhatsApp() {
    setBusy('wa')
    const text = buildMessage(data)
    const tel = (data.telefono ?? '').replace(/\D/g, '')
    const waUrl = tel
      ? `https://wa.me/${tel}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`
    try {
      const canvas = await captureCanvas('comprobante-print')
      const pdf = await canvasToPdf(canvas)
      const file = new File([pdf.output('blob')], `${fileBase}.pdf`, { type: 'application/pdf' })
      const shared = await tryShareFile(file, text, fileBase)
      if (shared) return
      pdf.save(`${fileBase}.pdf`)
      window.open(waUrl, '_blank')
      alert('Se descargó el comprobante. Adjuntalo en el chat de WhatsApp (ícono 📎).')
    } catch {
      window.open(waUrl, '_blank')
    } finally { setBusy(null) }
  }

  async function sendEmail() {
    setBusy('mail')
    try {
      const canvas = await captureCanvas('comprobante-print')
      const pdf = await canvasToPdf(canvas)
      pdf.save(`${fileBase}.pdf`)
      const subject = `Comprobante de recepción ${data.code} - ElectroGamez`
      const body = buildMessage(data).replace(/\*/g, '')
      const to = data.email ?? ''
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      setTimeout(() => alert('Se descargó el comprobante en PDF. Adjuntalo al email que se abrió.'), 400)
    } catch { alert('No se pudo generar el comprobante.') }
    finally { setBusy(null) }
  }

  const btn = 'flex items-center gap-1.5 text-white text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60'

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto flex items-start justify-center py-6 px-2">

      {/* Toolbar */}
      <div className="no-print fixed top-3 left-1/2 -translate-x-1/2 z-50 flex flex-wrap items-center justify-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 shadow-2xl max-w-[95vw]">
        <span className="text-white font-medium text-sm mr-1 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-green-400" /> Comprobante
        </span>
        <button onClick={downloadPDF} disabled={busy !== null} className={`${btn} bg-blue-600 hover:bg-blue-500`}>
          {busy === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} PDF
        </button>
        <button onClick={downloadJPG} disabled={busy !== null} className={`${btn} bg-indigo-600 hover:bg-indigo-500`}>
          {busy === 'jpg' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />} JPG
        </button>
        <button onClick={sendWhatsApp} disabled={busy !== null} className={`${btn} bg-green-600 hover:bg-green-500`}>
          {busy === 'wa' ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />} WhatsApp
        </button>
        <button onClick={sendEmail} disabled={busy !== null} className={`${btn} bg-orange-600 hover:bg-orange-500`}>
          {busy === 'mail' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Email
        </button>
        <button onClick={onClose} className="ml-1 text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── Comprobante ── */}
      <div id="comprobante-print" className="bg-white text-black w-full max-w-xl mt-20 rounded-xl shadow-2xl overflow-hidden"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>

        {/* Encabezado */}
        <div className="px-7 py-5 border-b-2 border-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{NEG.razonSocial}</h1>
              <p className="text-xs text-gray-600 mt-0.5">{NEG.titular}</p>
              <p className="text-xs text-gray-600">{NEG.domicilio}</p>
              <p className="text-xs text-gray-600">{NEG.whatsapp} · {NEG.email}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Comprobante</p>
              <p className="text-[11px] text-gray-600">de recepción</p>
            </div>
          </div>
        </div>

        {/* Código destacado */}
        <div className="px-7 py-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-center">
          <p className="text-xs uppercase tracking-widest opacity-90">Código de seguimiento</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-3xl font-bold tracking-wider font-mono">{data.code}</p>
            <button onClick={copyCode}
              className="no-print p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              title="Copiar código">
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs opacity-90 mt-1">Guardá este código para consultar el estado</p>
        </div>

        {/* Detalle */}
        <div className="px-7 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Detail label="Fecha de ingreso" value={data.fecha} />
            <Detail label="Cliente" value={data.cliente} />
            <Detail label="Tipo de equipo" value={DEVICE_LABEL[data.deviceType] ?? data.deviceType} />
            <Detail label="Marca / Modelo" value={equipo} />
            {data.telefono && <Detail label="Teléfono" value={data.telefono} />}
            {data.cost && <Detail label="Presupuesto estimado" value={data.cost} />}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Falla reportada</p>
            <p className="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">{data.issue || '—'}</p>
          </div>

          {/* Seguimiento */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-center">
            <p className="text-xs text-gray-700">Seguí tu reparación online en</p>
            <p className="text-sm font-semibold text-blue-700">{NEG.web}/seguimiento</p>
            <p className="text-[11px] text-gray-500 mt-0.5">con el código <b>{data.code}</b></p>
          </div>

          {/* Reseña en Google */}
          <a href={REVIEW_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 hover:bg-amber-100 transition-colors">
            {qr
              ? <img src={qr} alt="QR reseña Google" className="w-20 h-20 flex-shrink-0 rounded" />
              : <div className="w-20 h-20 flex-shrink-0 rounded bg-gray-100 animate-pulse" />}
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-amber-500">
                {[0,1,2,3,4].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm font-semibold text-gray-900 mt-1">¿Te gustó nuestro servicio?</p>
              <p className="text-xs text-gray-600">Escaneá el código y dejanos tu reseña en Google. ¡Nos ayuda muchísimo!</p>
            </div>
          </a>
        </div>

        {/* Pie */}
        <div className="px-7 py-3 border-t border-gray-200 text-center">
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Conservá este comprobante. El equipo se retira presentando el código.
            ElectroGamez no se responsabiliza por equipos no retirados luego de 90 días.
          </p>
        </div>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">{label}</p>
      <p className="text-gray-900 font-medium">{value}</p>
    </div>
  )
}
