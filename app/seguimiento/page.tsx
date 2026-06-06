'use client'

import { useState } from 'react'
import { Search, Monitor, Gamepad2, Laptop, CheckCircle2, Clock, Package, Wrench, Bell, Truck, XCircle } from 'lucide-react'

interface StatusHistoryItem {
  status: string
  note: string | null
  createdAt: string
}

interface RepairData {
  trackingCode: string
  deviceType: string
  deviceBrand: string | null
  deviceModel: string | null
  issueDescription: string
  status: string
  statusLabel: string
  priority: string
  estimatedCost: number | null
  finalCost: number | null
  paid: boolean
  receivedAt: string
  estimatedAt: string | null
  completedAt: string | null
  client: { name: string }
  statusHistory: StatusHistoryItem[]
  statusOrder: string[]
  statusLabels: Record<string, string>
}

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  laptop:      <Laptop className="w-6 h-6" />,
  pc:          <Monitor className="w-6 h-6" />,
  playstation: <Gamepad2 className="w-6 h-6" />,
  other:       <Wrench className="w-6 h-6" />,
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  received:      <Bell className="w-4 h-4" />,
  diagnosing:    <Search className="w-4 h-4" />,
  waiting_parts: <Package className="w-4 h-4" />,
  in_progress:   <Wrench className="w-4 h-4" />,
  ready:         <CheckCircle2 className="w-4 h-4" />,
  delivered:     <Truck className="w-4 h-4" />,
  cancelled:     <XCircle className="w-4 h-4" />,
}

const PRIORITY_COLORS: Record<string, string> = {
  high:   'text-red-400',
  medium: 'text-yellow-400',
  low:    'text-green-400',
}

const PRIORITY_LABELS: Record<string, string> = {
  high:   'Alta',
  medium: 'Media',
  low:    'Baja',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatCLP(amount: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount)
}

export default function SeguimientoPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RepairData | null>(null)
  const [error, setError] = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setError('')
    setData(null)

    try {
      const res = await fetch(`/api/seguimiento?codigo=${encodeURIComponent(code.trim())}`)
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Error al buscar la reparación')
      } else {
        setData(json)
      }
    } catch {
      setError('No se pudo conectar. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const completedSteps = data
    ? data.statusHistory.map((h) => h.status)
    : []

  const currentStepIndex = data
    ? data.statusOrder.indexOf(data.status)
    : -1

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              ElectroGamez
            </span>
            <span className="ml-2 text-gray-400 text-sm">Seguimiento de reparación</span>
          </div>
          <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            Volver al inicio
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Search box */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">¿Cómo va tu equipo?</h1>
          <p className="text-gray-400">Ingresa el código que te entregamos al dejar tu equipo</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ej: EG-2025-0042"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-lg tracking-wider"
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-center">
            {error === 'Reparación no encontrada'
              ? 'No encontramos ninguna reparación con ese código. Revisa que esté bien escrito o llámanos.'
              : error}
          </div>
        )}

        {data && (
          <div className="space-y-6 animate-fade-in">
            {/* Estado principal */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400">
                    {DEVICE_ICONS[data.deviceType] ?? <Wrench className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">{data.trackingCode}</p>
                    <h2 className="font-semibold text-lg">
                      {[data.deviceBrand, data.deviceModel].filter(Boolean).join(' ') || 'Dispositivo'}
                    </h2>
                    <p className="text-sm text-gray-400">{data.client.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium ${PRIORITY_COLORS[data.priority]}`}>
                    Prioridad {PRIORITY_LABELS[data.priority]}
                  </span>
                </div>
              </div>

              <p className="text-gray-300 text-sm bg-gray-900/50 rounded-lg px-4 py-3 mb-4">
                <span className="text-gray-500 text-xs block mb-1">Problema reportado</span>
                {data.issueDescription}
              </p>

              {/* Estado actual destacado */}
              <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                data.status === 'ready'
                  ? 'bg-green-900/40 border border-green-700 text-green-300'
                  : data.status === 'delivered'
                  ? 'bg-gray-700/40 border border-gray-600 text-gray-300'
                  : data.status === 'cancelled'
                  ? 'bg-red-900/40 border border-red-700 text-red-300'
                  : 'bg-blue-900/30 border border-blue-700 text-blue-300'
              }`}>
                {STATUS_ICONS[data.status]}
                <span className="font-semibold">{data.statusLabel}</span>
                {data.status === 'ready' && (
                  <span className="ml-auto text-sm">¡Ya puedes venir a buscarlo!</span>
                )}
              </div>
            </div>

            {/* Timeline de estados */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
              <h3 className="font-semibold mb-5 text-gray-200">Progreso de la reparación</h3>
              <div className="space-y-0">
                {data.statusOrder
                  .filter((s) => s !== 'cancelled')
                  .map((step, idx) => {
                    const isDone = completedSteps.includes(step)
                    const isCurrent = data.status === step
                    const historyEntry = data.statusHistory.find((h) => h.status === step)

                    return (
                      <div key={step} className="flex gap-4">
                        {/* Línea y círculo */}
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                            isCurrent
                              ? 'bg-blue-600 border-blue-400 text-white'
                              : isDone
                              ? 'bg-green-700 border-green-500 text-white'
                              : 'bg-gray-700 border-gray-600 text-gray-500'
                          }`}>
                            {isDone && !isCurrent
                              ? <CheckCircle2 className="w-4 h-4" />
                              : STATUS_ICONS[step]}
                          </div>
                          {idx < data.statusOrder.filter((s) => s !== 'cancelled').length - 1 && (
                            <div className={`w-0.5 h-8 mt-1 ${
                              currentStepIndex > idx ? 'bg-green-700' : 'bg-gray-700'
                            }`} />
                          )}
                        </div>

                        {/* Contenido */}
                        <div className="pb-6 pt-1 flex-1">
                          <p className={`font-medium text-sm ${
                            isCurrent ? 'text-blue-300' : isDone ? 'text-gray-200' : 'text-gray-500'
                          }`}>
                            {data.statusLabels[step]}
                          </p>
                          {historyEntry && (
                            <>
                              {historyEntry.note && (
                                <p className="text-xs text-gray-400 mt-0.5">{historyEntry.note}</p>
                              )}
                              <p className="text-xs text-gray-600 mt-0.5">
                                {formatDate(historyEntry.createdAt)}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Costos */}
            {(data.estimatedCost !== null || data.finalCost !== null) && (
              <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
                <h3 className="font-semibold mb-4 text-gray-200">Presupuesto</h3>
                <div className="space-y-2">
                  {data.estimatedCost !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Costo estimado</span>
                      <span>{formatCLP(data.estimatedCost)}</span>
                    </div>
                  )}
                  {data.finalCost !== null && (
                    <div className="flex justify-between text-sm font-semibold border-t border-gray-700 pt-2 mt-2">
                      <span>Total</span>
                      <span className="text-cyan-400">{formatCLP(data.finalCost)}</span>
                    </div>
                  )}
                  {data.finalCost !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Estado pago</span>
                      <span className={data.paid ? 'text-green-400' : 'text-yellow-400'}>
                        {data.paid ? 'Pagado' : 'Pendiente de pago'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fechas */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
              <h3 className="font-semibold mb-4 text-gray-200">Fechas</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Recibido</span>
                  <span>{formatDate(data.receivedAt)}</span>
                </div>
                {data.estimatedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entrega estimada</span>
                    <span>{formatDate(data.estimatedAt)}</span>
                  </div>
                )}
                {data.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reparación completada</span>
                    <span className="text-green-400">{formatDate(data.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contacto */}
            <div className="text-center text-gray-500 text-sm">
              ¿Tienes dudas?{' '}
              <a href="tel:+56900000000" className="text-blue-400 hover:text-blue-300 transition-colors">
                Llámanos
              </a>{' '}
              o escríbenos por{' '}
              <a
                href="https://wa.me/56900000000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
