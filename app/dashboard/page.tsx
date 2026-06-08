'use client'

import { useState } from 'react'
import {
  LayoutDashboard, Wrench, Users, Package, LogOut,
  Plus, Search, Filter, MoreVertical, TrendingUp,
  Clock, CheckCircle2, AlertCircle, Gamepad2, Monitor,
  Laptop, ChevronRight, Bell, Settings, Menu, X
} from 'lucide-react'

// ── Datos mock (hasta conectar la base de datos) ──────────────────────────────

const STATS = [
  { label: 'Reparaciones activas', value: '12', icon: <Wrench className="w-5 h-5" />, color: 'text-blue-400', bg: 'bg-blue-600/20' },
  { label: 'Listas para retirar', value: '3', icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-400', bg: 'bg-green-600/20' },
  { label: 'Esperando repuestos', value: '2', icon: <Clock className="w-5 h-5" />, color: 'text-yellow-400', bg: 'bg-yellow-600/20' },
  { label: 'Ingresos del mes', value: '$185.000', icon: <TrendingUp className="w-5 h-5" />, color: 'text-cyan-400', bg: 'bg-cyan-600/20' },
]

const REPAIRS = [
  { code: 'EG-2025-0001', client: 'Juan Pérez', device: 'HP Pavilion 15', type: 'laptop', issue: 'Se apaga sola', status: 'in_progress', priority: 'high', date: '03/06/2025', cost: '$25.000' },
  { code: 'EG-2025-0002', client: 'María González', device: 'PlayStation 5', type: 'playstation', issue: 'Sin imagen HDMI', status: 'waiting_parts', priority: 'medium', date: '02/06/2025', cost: '$45.000' },
  { code: 'EG-2025-0003', client: 'Carlos Torres', device: 'PC escritorio', type: 'pc', issue: 'No enciende', status: 'diagnosing', priority: 'high', date: '04/06/2025', cost: null },
  { code: 'EG-2025-0004', client: 'Ana Morales', device: 'Laptop Lenovo', type: 'laptop', issue: 'Pantalla rota', status: 'ready', priority: 'low', date: '01/06/2025', cost: '$38.000' },
  { code: 'EG-2025-0005', client: 'Pedro Soto', device: 'PlayStation 4', type: 'playstation', issue: 'Lector blu-ray', status: 'completed', priority: 'medium', date: '28/05/2025', cost: '$22.000' },
]

const CLIENTS = [
  { name: 'Juan Pérez', phone: '+56 9 1234 5678', email: 'juan@gmail.com', repairs: 2, lastRepair: '03/06/2025' },
  { name: 'María González', phone: '+56 9 8765 4321', email: 'maria@hotmail.com', repairs: 1, lastRepair: '02/06/2025' },
  { name: 'Carlos Torres', phone: '+56 9 1111 2222', email: '', repairs: 3, lastRepair: '04/06/2025' },
  { name: 'Ana Morales', phone: '+56 9 3333 4444', email: 'ana@gmail.com', repairs: 1, lastRepair: '01/06/2025' },
]

const INVENTORY = [
  { name: 'Ventilador laptop genérico', sku: 'FAN-LAP-001', stock: 8, minStock: 3, salePrice: '$8.000' },
  { name: 'Chip HDMI PS5', sku: 'PS5-HDMI-001', stock: 2, minStock: 3, salePrice: '$35.000' },
  { name: 'Memoria RAM DDR4 8GB', sku: 'RAM-DDR4-8G', stock: 5, minStock: 2, salePrice: '$38.000' },
  { name: 'Pasta térmica Thermal Grizzly', sku: 'PASTE-TG-001', stock: 12, minStock: 5, salePrice: '$4.500' },
  { name: 'Pantalla laptop 15.6" FHD', sku: 'SCR-156-FHD', stock: 1, minStock: 2, salePrice: '$65.000' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  received:      { label: 'Recibido',           color: 'bg-gray-700 text-gray-300' },
  diagnosing:    { label: 'Diagnóstico',         color: 'bg-purple-900/50 text-purple-300' },
  waiting_parts: { label: 'Esperando repuestos', color: 'bg-yellow-900/50 text-yellow-300' },
  in_progress:   { label: 'En reparación',       color: 'bg-blue-900/50 text-blue-300' },
  ready:         { label: 'Listo para retirar',  color: 'bg-green-900/50 text-green-300' },
  completed:     { label: 'Completado',          color: 'bg-gray-700 text-gray-400' },
  cancelled:     { label: 'Cancelado',           color: 'bg-red-900/50 text-red-300' },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  high:   { label: 'Alta',  color: 'text-red-400' },
  medium: { label: 'Media', color: 'text-yellow-400' },
  low:    { label: 'Baja',  color: 'text-green-400' },
}

const DEVICE_ICON: Record<string, React.ReactNode> = {
  laptop:      <Laptop className="w-4 h-4" />,
  pc:          <Monitor className="w-4 h-4" />,
  playstation: <Gamepad2 className="w-4 h-4" />,
}

type Tab = 'resumen' | 'reparaciones' | 'clientes' | 'inventario'

// ── Componente principal ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('resumen')
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'resumen',       label: 'Resumen',     icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'reparaciones',  label: 'Reparaciones', icon: <Wrench className="w-5 h-5" /> },
    { id: 'clientes',      label: 'Clientes',     icon: <Users className="w-5 h-5" /> },
    { id: 'inventario',    label: 'Inventario',   icon: <Package className="w-5 h-5" /> },
  ]

  const filteredRepairs = REPAIRS.filter((r) =>
    r.client.toLowerCase().includes(search.toLowerCase()) ||
    r.code.toLowerCase().includes(search.toLowerCase()) ||
    r.device.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gray-800/95 border-r border-gray-700 flex flex-col
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-700 flex items-center justify-between">
          <a href="/" className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            ElectroGamez
          </a>
          <button className="lg:hidden text-gray-400" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-gray-700 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
            <Settings className="w-5 h-5" /> Configuración
          </button>
          <a href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
            <LogOut className="w-5 h-5" /> Ver sitio público
          </a>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' })
              window.location.href = '/login'
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Overlay móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Contenido principal ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="bg-gray-800/50 border-b border-gray-700 px-4 lg:px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-400" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-semibold text-lg capitalize">
                {NAV.find((n) => n.id === tab)?.label}
              </h1>
              <p className="text-gray-400 text-xs hidden sm:block">
                {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">S</div>
          </div>
        </header>

        {/* Contenido con scroll */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">

          {/* ── TAB: RESUMEN ── */}
          {tab === 'resumen' && (
            <div className="space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map((s) => (
                  <div key={s.label} className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
                    <div className={`p-2.5 ${s.bg} rounded-xl w-fit mb-3 ${s.color}`}>{s.icon}</div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Últimas reparaciones */}
              <div className="bg-gray-800/60 border border-gray-700 rounded-2xl">
                <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                  <h2 className="font-semibold">Reparaciones recientes</h2>
                  <button onClick={() => setTab('reparaciones')} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors">
                    Ver todas <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="divide-y divide-gray-700">
                  {REPAIRS.slice(0, 4).map((r) => (
                    <div key={r.code} className="px-6 py-4 flex items-center gap-4">
                      <div className="p-2 bg-gray-700 rounded-lg text-gray-400">
                        {DEVICE_ICON[r.type] ?? <Wrench className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{r.client}</p>
                        <p className="text-gray-400 text-xs truncate">{r.device} — {r.issue}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${STATUS_CONFIG[r.status]?.color}`}>
                        {STATUS_CONFIG[r.status]?.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alertas de inventario */}
              {INVENTORY.filter((i) => i.stock <= i.minStock).length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-semibold text-yellow-300">Stock bajo</h3>
                  </div>
                  <div className="space-y-2">
                    {INVENTORY.filter((i) => i.stock <= i.minStock).map((i) => (
                      <div key={i.sku} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{i.name}</span>
                        <span className="text-yellow-400 font-medium">{i.stock} unidades</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: REPARACIONES ── */}
          {tab === 'reparaciones' && (
            <div className="space-y-5">
              {/* Barra de acciones */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Buscar por cliente, código o equipo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2.5 rounded-xl text-sm transition-colors">
                  <Filter className="w-4 h-4" /> Filtrar
                </button>
                <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
                  <Plus className="w-4 h-4" /> Nueva reparación
                </button>
              </div>

              {/* Tabla */}
              <div className="bg-gray-800/60 border border-gray-700 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
                        <th className="px-5 py-3 text-left">Código</th>
                        <th className="px-5 py-3 text-left">Cliente</th>
                        <th className="px-5 py-3 text-left hidden md:table-cell">Equipo</th>
                        <th className="px-5 py-3 text-left hidden lg:table-cell">Problema</th>
                        <th className="px-5 py-3 text-left">Estado</th>
                        <th className="px-5 py-3 text-left hidden sm:table-cell">Prioridad</th>
                        <th className="px-5 py-3 text-left hidden lg:table-cell">Costo</th>
                        <th className="px-5 py-3 text-left hidden md:table-cell">Fecha</th>
                        <th className="px-5 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {filteredRepairs.map((r) => (
                        <tr key={r.code} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-5 py-4 font-mono text-xs text-blue-400">{r.code}</td>
                          <td className="px-5 py-4 font-medium">{r.client}</td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <div className="flex items-center gap-2 text-gray-300">
                              <span className="text-gray-500">{DEVICE_ICON[r.type]}</span>
                              {r.device}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-gray-400 hidden lg:table-cell max-w-xs truncate">{r.issue}</td>
                          <td className="px-5 py-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${STATUS_CONFIG[r.status]?.color}`}>
                              {STATUS_CONFIG[r.status]?.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell">
                            <span className={`text-xs font-medium ${PRIORITY_CONFIG[r.priority]?.color}`}>
                              {PRIORITY_CONFIG[r.priority]?.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-300 hidden lg:table-cell">
                            {r.cost ?? <span className="text-gray-600">Por definir</span>}
                          </td>
                          <td className="px-5 py-4 text-gray-400 text-xs hidden md:table-cell">{r.date}</td>
                          <td className="px-5 py-4">
                            <button className="text-gray-500 hover:text-gray-300 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredRepairs.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No se encontraron reparaciones
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: CLIENTES ── */}
          {tab === 'clientes' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Buscar clientes..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
                  <Plus className="w-4 h-4" /> Nuevo cliente
                </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CLIENTS.map((c) => (
                  <div key={c.phone} className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 hover:border-gray-600 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-blue-600/30 rounded-full flex items-center justify-center text-blue-400 font-semibold">
                        {c.name[0]}
                      </div>
                      <button className="text-gray-500 hover:text-gray-300 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="text-gray-400 text-sm mt-0.5">{c.phone}</p>
                    {c.email && <p className="text-gray-500 text-xs mt-0.5 truncate">{c.email}</p>}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700 text-xs text-gray-400">
                      <span>{c.repairs} reparación{c.repairs !== 1 ? 'es' : ''}</span>
                      <span>Última: {c.lastRepair}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB: INVENTARIO ── */}
          {tab === 'inventario' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Buscar repuestos..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
                  <Plus className="w-4 h-4" /> Agregar repuesto
                </button>
              </div>

              <div className="bg-gray-800/60 border border-gray-700 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
                        <th className="px-5 py-3 text-left">Repuesto</th>
                        <th className="px-5 py-3 text-left hidden sm:table-cell">SKU</th>
                        <th className="px-5 py-3 text-center">Stock</th>
                        <th className="px-5 py-3 text-left hidden md:table-cell">Precio venta</th>
                        <th className="px-5 py-3 text-left">Estado</th>
                        <th className="px-5 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {INVENTORY.map((item) => {
                        const isLow = item.stock <= item.minStock
                        const isOut = item.stock === 0
                        return (
                          <tr key={item.sku} className="hover:bg-gray-700/30 transition-colors">
                            <td className="px-5 py-4 font-medium">{item.name}</td>
                            <td className="px-5 py-4 font-mono text-xs text-gray-400 hidden sm:table-cell">{item.sku}</td>
                            <td className="px-5 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-xs transition-colors">−</button>
                                <span className={`font-semibold w-8 text-center ${isOut ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-white'}`}>
                                  {item.stock}
                                </span>
                                <button className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-xs transition-colors">+</button>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-gray-300 hidden md:table-cell">{item.salePrice}</td>
                            <td className="px-5 py-4">
                              {isOut ? (
                                <span className="text-xs px-2.5 py-1 rounded-full bg-red-900/50 text-red-300 font-medium">Agotado</span>
                              ) : isLow ? (
                                <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-900/50 text-yellow-300 font-medium">Stock bajo</span>
                              ) : (
                                <span className="text-xs px-2.5 py-1 rounded-full bg-green-900/50 text-green-300 font-medium">OK</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <button className="text-gray-500 hover:text-gray-300 transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
