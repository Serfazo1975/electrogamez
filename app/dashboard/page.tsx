'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Wrench, Users, Package, LogOut,
  Plus, Search, Filter, MoreVertical, TrendingUp,
  Clock, CheckCircle2, AlertCircle, Gamepad2, Monitor,
  Laptop, ChevronRight, Bell, Settings, Menu, X,
  FileText, Receipt, ClipboardList, MessageCircle
} from 'lucide-react'
import Documento, { DocData } from './Documento'
import Comprobante, { ReceiptData } from './Comprobante'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Repair = { id?: string; code: string; client: string; device: string; type: string; issue: string; status: string; priority: string; date: string; cost: string | null }
type Client = { id?: string; name: string; phone: string; email: string; repairs: number; lastRepair: string }
type Part   = { id?: string; name: string; sku: string; stock: number; minStock: number; salePrice: string }

// ── Datos iniciales ───────────────────────────────────────────────────────────

const INITIAL_REPAIRS: Repair[] = [
  { code: 'EG-2025-0001', client: 'Juan Pérez',     device: 'HP Pavilion 15',  type: 'laptop',      issue: 'Se apaga sola',    status: 'in_progress',   priority: 'high',   date: '03/06/2025', cost: '$25.000' },
  { code: 'EG-2025-0002', client: 'María González', device: 'PlayStation 5',   type: 'playstation', issue: 'Sin imagen HDMI',  status: 'waiting_parts', priority: 'medium', date: '02/06/2025', cost: '$45.000' },
  { code: 'EG-2025-0003', client: 'Carlos Torres',  device: 'PC escritorio',   type: 'pc',          issue: 'No enciende',      status: 'diagnosing',    priority: 'high',   date: '04/06/2025', cost: null },
  { code: 'EG-2025-0004', client: 'Ana Morales',    device: 'Laptop Lenovo',   type: 'laptop',      issue: 'Pantalla rota',    status: 'ready',         priority: 'low',    date: '01/06/2025', cost: '$38.000' },
  { code: 'EG-2025-0005', client: 'Pedro Soto',     device: 'PlayStation 4',   type: 'playstation', issue: 'Lector blu-ray',   status: 'completed',     priority: 'medium', date: '28/05/2025', cost: '$22.000' },
]

const INITIAL_CLIENTS: Client[] = [
  { name: 'Juan Pérez',     phone: '+54 9 11 1234 5678', email: 'juan@gmail.com',     repairs: 2, lastRepair: '03/06/2025' },
  { name: 'María González', phone: '+54 9 11 8765 4321', email: 'maria@hotmail.com',  repairs: 1, lastRepair: '02/06/2025' },
  { name: 'Carlos Torres',  phone: '+54 9 11 1111 2222', email: '',                   repairs: 3, lastRepair: '04/06/2025' },
  { name: 'Ana Morales',    phone: '+54 9 11 3333 4444', email: 'ana@gmail.com',      repairs: 1, lastRepair: '01/06/2025' },
]

const INITIAL_PARTS: Part[] = [
  { name: 'Ventilador laptop genérico',    sku: 'FAN-LAP-001',  stock: 8,  minStock: 3, salePrice: '$8.000'  },
  { name: 'Chip HDMI PS5',                 sku: 'PS5-HDMI-001', stock: 2,  minStock: 3, salePrice: '$35.000' },
  { name: 'Memoria RAM DDR4 8GB',          sku: 'RAM-DDR4-8G',  stock: 5,  minStock: 2, salePrice: '$38.000' },
  { name: 'Pasta térmica Thermal Grizzly', sku: 'PASTE-TG-001', stock: 12, minStock: 5, salePrice: '$4.500'  },
  { name: 'Pantalla laptop 15.6" FHD',     sku: 'SCR-156-FHD',  stock: 1,  minStock: 2, salePrice: '$65.000' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  received:      { label: 'Recibido',           color: 'bg-gray-700 text-gray-300',          dot: 'bg-gray-400' },
  diagnosing:    { label: 'Diagnóstico',         color: 'bg-purple-900/50 text-purple-300',   dot: 'bg-purple-400' },
  waiting_parts: { label: 'Esperando repuestos', color: 'bg-yellow-900/50 text-yellow-300',   dot: 'bg-yellow-400' },
  in_progress:   { label: 'En reparación',       color: 'bg-blue-900/50 text-blue-300',       dot: 'bg-blue-400' },
  ready:         { label: 'Listo para retirar',  color: 'bg-green-900/50 text-green-300',     dot: 'bg-green-400' },
  completed:     { label: 'Completado',          color: 'bg-teal-900/50 text-teal-300',       dot: 'bg-teal-400' },
  delivered:     { label: 'Entregado',           color: 'bg-gray-700 text-gray-400',          dot: 'bg-gray-500' },
  cancelled:     { label: 'Cancelado',           color: 'bg-red-900/50 text-red-300',         dot: 'bg-red-400' },
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

function today() {
  return new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── Acceso a la API ───────────────────────────────────────────────────────────

async function apiJSON(method: string, url: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(String(res.status))
  return res.json()
}

function nextCode(repairs: Repair[]) {
  const nums = repairs.map(r => parseInt(r.code.split('-')[2] ?? '0'))
  const next = Math.max(...nums, 0) + 1
  return `EG-${new Date().getFullYear()}-${String(next).padStart(4, '0')}`
}

// ── Modal genérico ────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="font-semibold text-lg">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm text-gray-400 block mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"
const selectCls = "w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"

type Tab = 'resumen' | 'reparaciones' | 'clientes' | 'inventario'
type PendingNotif = { repair: Repair; phone: string; message: string }

const SEGUIMIENTO = 'https://electrogamez.netlify.app/seguimiento'

const NOTIF: Record<string, (r: Repair) => string> = {
  diagnosing: r => [
    `Hola ${r.client}! 👋`,
    '',
    `Queríamos avisarte que tu *${r.device}* ya lo estamos analizando.`,
    '',
    `🔍 Estado actual: *En diagnóstico*`,
    `📋 Código de seguimiento: *${r.code}*`,
    '',
    `Podés ver el estado en cualquier momento en:`,
    SEGUIMIENTO,
    '',
    `En cuanto tengamos el diagnóstico completo te avisamos. 🔧`,
    '',
    `*ElectroGamez Servicio Técnico*`,
    `📍 Los Pozos 458, Río Gallegos`,
    `📱 +54 9 11 5697 5880`,
  ].join('\n'),

  waiting_parts: r => [
    `Hola ${r.client}! 👋`,
    '',
    `Novedades sobre tu *${r.device}*:`,
    '',
    `⏳ Estado actual: *Esperando repuestos*`,
    `📋 Código: *${r.code}*`,
    '',
    `Ya diagnosticamos el problema. Estamos esperando que lleguen los repuestos necesarios. Apenas los tengamos arrancamos la reparación.`,
    '',
    `Seguí el estado en: ${SEGUIMIENTO}`,
    '',
    `*ElectroGamez Servicio Técnico* · 📱 +54 9 11 5697 5880`,
  ].join('\n'),

  in_progress: r => [
    `Hola ${r.client}! 👋`,
    '',
    `¡Buenas noticias! Tu *${r.device}* ya está en reparación. 🔧`,
    '',
    `⚙️ Estado actual: *En reparación*`,
    `📋 Código: *${r.code}*`,
    '',
    `Nuestro técnico ya está trabajando en él. En cuanto esté listo te avisamos.`,
    `Seguí el avance en: ${SEGUIMIENTO}`,
    '',
    `*ElectroGamez Servicio Técnico* · 📱 +54 9 11 5697 5880`,
  ].join('\n'),

  ready: r => [
    `Hola ${r.client}! 🎉`,
    '',
    `¡Tu *${r.device}* está *LISTO para retirar*!`,
    '',
    `✅ Estado: *Listo para retirar*`,
    `📋 Código: *${r.code}*`,
    '',
    `Podés pasar a retirarlo por nuestro local:`,
    `📍 Los Pozos 458, Río Gallegos`,
    `🕐 Lunes a Viernes 10:00–19:00 · Sábados 10:00–14:00`,
    '',
    `Recordá traer este código al retirar. 😊`,
    '',
    `*ElectroGamez Servicio Técnico* · 📱 +54 9 11 5697 5880`,
  ].join('\n'),

  completed: r => [
    `Hola ${r.client}! 👋`,
    '',
    `Tu reparación del *${r.device}* quedó registrada como *Completada*.`,
    `📋 Código: *${r.code}*`,
    '',
    `¡Gracias por elegirnos! Si el equipo tiene algún inconveniente no dudes en contactarnos.`,
    '',
    `*ElectroGamez Servicio Técnico* · 📱 +54 9 11 5697 5880`,
  ].join('\n'),

  cancelled: r => [
    `Hola ${r.client}!`,
    '',
    `Te informamos que la reparación de tu *${r.device}* (código *${r.code}*) fue cancelada.`,
    '',
    `Si querés consultar el motivo o reagendar, escribinos por acá.`,
    '',
    `*ElectroGamez Servicio Técnico* · 📱 +54 9 11 5697 5880`,
  ].join('\n'),
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('resumen')
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [repairs, setRepairs] = useState<Repair[]>(INITIAL_REPAIRS)
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS)
  const [parts,   setParts]   = useState<Part[]>(INITIAL_PARTS)
  const [dbOn, setDbOn] = useState(false)   // true cuando los datos vienen de la base
  const [saving, setSaving] = useState(false)

  // Cargar datos reales desde la base al abrir el dashboard
  useEffect(() => {
    let active = true
    Promise.all([
      apiJSON('GET', '/api/repairs'),
      apiJSON('GET', '/api/clients'),
      apiJSON('GET', '/api/parts'),
    ])
      .then(([r, c, p]) => {
        if (!active) return
        setRepairs(r); setClients(c); setParts(p); setDbOn(true)
      })
      .catch(() => { /* sin base: se mantienen los datos de ejemplo (modo local) */ })
    return () => { active = false }
  }, [])

  // Modales
  const [showNewRepair,  setShowNewRepair]  = useState(false)
  const [showNewClient,  setShowNewClient]  = useState(false)
  const [showNewPart,    setShowNewPart]    = useState(false)

  // Documento (presupuesto / factura C)
  const [doc, setDoc] = useState<DocData | null>(null)

  // Cambio de estado inline
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null)

  // Notificación WhatsApp pendiente tras cambio de estado
  const [pendingNotif, setPendingNotif] = useState<PendingNotif | null>(null)

  // Modal de configuración
  const [showConfig, setShowConfig] = useState(false)

  function openDoc(tipo: 'presupuesto' | 'factura', r: Repair) {
    const cliente = clients.find(c => c.name === r.client)
    const costNum = r.cost ? parseInt(r.cost.replace(/\D/g, '')) || 0 : 0
    const seq = r.code.split('-')[2] ?? '0001'
    const numero = tipo === 'factura'
      ? String(parseInt(seq)).padStart(8, '0')
      : r.code
    setDoc({
      tipo,
      numero,
      fecha: today(),
      cliente: r.client,
      telefono: cliente?.phone,
      email: cliente?.email,
      refComercial: r.code,
      items: [{ desc: `Reparación ${r.device} — ${r.issue}`, qty: 1, unidad: 'unidades', price: costNum }],
      notas: tipo === 'presupuesto'
        ? 'Presupuesto válido por 7 días. No incluye repuestos no detallados.'
        : undefined,
    })
  }

  // Formulario nueva reparación
  const [repairForm, setRepairForm] = useState({ client: '', phone: '', email: '', deviceType: 'laptop', deviceBrand: '', deviceModel: '', issue: '', priority: 'medium', cost: '' })

  // Comprobante de recepción (se muestra al crear una reparación)
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)

  // Formulario nuevo cliente
  const [clientForm, setClientForm] = useState({ name: '', phone: '', email: '' })

  // Formulario nuevo repuesto
  const [partForm, setPartForm] = useState({ name: '', sku: '', brand: '', stock: '', minStock: '2', salePrice: '' })

  const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'resumen',      label: 'Resumen',      icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'reparaciones', label: 'Reparaciones', icon: <Wrench className="w-5 h-5" /> },
    { id: 'clientes',     label: 'Clientes',     icon: <Users className="w-5 h-5" /> },
    { id: 'inventario',   label: 'Inventario',   icon: <Package className="w-5 h-5" /> },
  ]

  const filteredRepairs = repairs.filter(r =>
    r.client.toLowerCase().includes(search.toLowerCase()) ||
    r.code.toLowerCase().includes(search.toLowerCase()) ||
    r.device.toLowerCase().includes(search.toLowerCase())
  )

  async function submitRepair(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const device = [repairForm.deviceBrand, repairForm.deviceModel].filter(Boolean).join(' ') || repairForm.deviceType
    const local: Repair = {
      code: nextCode(repairs),
      client: repairForm.client,
      device,
      type: repairForm.deviceType,
      issue: repairForm.issue,
      status: 'received',
      priority: repairForm.priority,
      date: today(),
      cost: repairForm.cost ? `$${repairForm.cost}` : null,
    }
    let saved: Repair = local
    try {
      saved = dbOn ? await apiJSON('POST', '/api/repairs', repairForm) : local
      setRepairs(prev => [saved, ...prev])
    } catch {
      setRepairs(prev => [local, ...prev])
    } finally {
      setSaving(false)
    }
    // Mostrar comprobante de recepción con el código generado
    setReceipt({
      code: saved.code,
      fecha: saved.date,
      cliente: repairForm.client,
      telefono: repairForm.phone || undefined,
      email: repairForm.email || undefined,
      deviceType: repairForm.deviceType,
      deviceBrand: repairForm.deviceBrand,
      deviceModel: repairForm.deviceModel,
      issue: repairForm.issue,
      priority: repairForm.priority,
      cost: saved.cost,
    })
    setRepairForm({ client: '', phone: '', email: '', deviceType: 'laptop', deviceBrand: '', deviceModel: '', issue: '', priority: 'medium', cost: '' })
    setShowNewRepair(false)
    setTab('reparaciones')
  }

  // Reabrir el comprobante de recepción de una reparación existente
  function openReceipt(r: Repair) {
    const cliente = clients.find(c => c.name === r.client)
    setReceipt({
      code: r.code,
      fecha: r.date,
      cliente: r.client,
      telefono: cliente?.phone || undefined,
      email: cliente?.email || undefined,
      deviceType: r.type,
      deviceBrand: r.device,
      deviceModel: '',
      issue: r.issue,
      priority: r.priority,
      cost: r.cost,
    })
  }

  async function submitClient(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const local: Client = { ...clientForm, repairs: 0, lastRepair: today() }
    try {
      const created = dbOn ? await apiJSON('POST', '/api/clients', clientForm) : local
      setClients(prev => [created, ...prev])
    } catch {
      setClients(prev => [local, ...prev])
    } finally {
      setSaving(false)
    }
    setClientForm({ name: '', phone: '', email: '' })
    setShowNewClient(false)
    setTab('clientes')
  }

  async function submitPart(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const local: Part = {
      name: partForm.name,
      sku: partForm.sku,
      stock: parseInt(partForm.stock) || 0,
      minStock: parseInt(partForm.minStock) || 2,
      salePrice: partForm.salePrice ? `$${partForm.salePrice}` : '-',
    }
    try {
      const created = dbOn ? await apiJSON('POST', '/api/parts', partForm) : local
      setParts(prev => [created, ...prev])
    } catch {
      setParts(prev => [local, ...prev])
    } finally {
      setSaving(false)
    }
    setPartForm({ name: '', sku: '', brand: '', stock: '', minStock: '2', salePrice: '' })
    setShowNewPart(false)
    setTab('inventario')
  }

  // Cambiar estado de una reparación
  async function changeStatus(repair: Repair, newStatus: string) {
    const updated = { ...repair, status: newStatus }
    setRepairs(prev => prev.map(r => r.code === repair.code ? updated : r))
    setStatusDropdown(null)
    if (dbOn && repair.id) {
      apiJSON('PATCH', `/api/repairs/${repair.id}`, { status: newStatus }).catch(() => {})
    }
    const cliente = clients.find(c => c.name === repair.client)
    const phone = cliente?.phone?.trim()
    if (phone && NOTIF[newStatus]) {
      setPendingNotif({ repair: updated, phone, message: NOTIF[newStatus](updated) })
    }
  }

  // Cambiar stock (persiste en la base si está conectada)
  function changeStock(idx: number, delta: number) {
    const part = parts[idx]
    const newStock = Math.max(0, part.stock + delta)
    setParts(p => p.map((x, i) => i === idx ? { ...x, stock: newStock } : x))
    if (dbOn && part.id) {
      apiJSON('PATCH', `/api/parts/${part.id}`, { stock: newStock }).catch(() => {})
    }
  }

  const STATS = [
    { label: 'Reparaciones activas', value: String(repairs.filter(r => !['completed','cancelled'].includes(r.status)).length), icon: <Wrench className="w-5 h-5" />, color: 'text-blue-400', bg: 'bg-blue-600/20' },
    { label: 'Listas para retirar',  value: String(repairs.filter(r => r.status === 'ready').length),          icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-400',  bg: 'bg-green-600/20' },
    { label: 'Esperando repuestos',  value: String(repairs.filter(r => r.status === 'waiting_parts').length),  icon: <Clock className="w-5 h-5" />,        color: 'text-yellow-400', bg: 'bg-yellow-600/20' },
    { label: 'Total clientes',       value: String(clients.length),                                            icon: <TrendingUp className="w-5 h-5" />,    color: 'text-cyan-400',   bg: 'bg-cyan-600/20' },
  ]

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800/95 border-r border-gray-700 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="px-6 py-5 border-b border-gray-700 flex items-center justify-between">
          <a href="/" className="text-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ElectroGamez</a>
          <button className="lg:hidden text-gray-400" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => (
            <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === item.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
              {item.icon}{item.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-700 space-y-1">
          <button onClick={() => setShowConfig(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
            <Settings className="w-5 h-5" /> Configuración
          </button>
          <a href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
            <LogOut className="w-5 h-5" /> Ver sitio público
          </a>
          <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/login' }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors">
            <LogOut className="w-5 h-5" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-gray-800/50 border-b border-gray-700 px-4 lg:px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-400" onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
            <div>
              <h1 className="font-semibold text-lg capitalize">{NAV.find(n => n.id === tab)?.label}</h1>
              <p className="text-gray-400 text-xs hidden sm:block">{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              {repairs.filter(r => r.status === 'ready').length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">S</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">

          {/* ── RESUMEN ── */}
          {tab === 'resumen' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map(s => (
                  <div key={s.label} className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
                    <div className={`p-2.5 ${s.bg} rounded-xl w-fit mb-3 ${s.color}`}>{s.icon}</div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Acciones rápidas */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Nueva reparación', icon: <Wrench className="w-5 h-5" />, action: () => setShowNewRepair(true) },
                  { label: 'Nuevo cliente',    icon: <Users className="w-5 h-5" />,  action: () => setShowNewClient(true) },
                  { label: 'Agregar repuesto', icon: <Package className="w-5 h-5" />, action: () => setShowNewPart(true) },
                ].map(a => (
                  <button key={a.label} onClick={a.action}
                    className="bg-gray-800/60 border border-gray-700 hover:border-blue-500/50 rounded-2xl p-5 flex flex-col items-center gap-3 transition-colors group">
                    <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400 group-hover:bg-blue-600/30 transition-colors">{a.icon}</div>
                    <span className="text-sm font-medium text-gray-300">{a.label}</span>
                  </button>
                ))}
              </div>

              <div className="bg-gray-800/60 border border-gray-700 rounded-2xl">
                <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                  <h2 className="font-semibold">Reparaciones recientes</h2>
                  <button onClick={() => setTab('reparaciones')} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors">
                    Ver todas <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="divide-y divide-gray-700">
                  {repairs.slice(0, 4).map(r => (
                    <div key={r.code} className="px-6 py-4 flex items-center gap-4">
                      <div className="p-2 bg-gray-700 rounded-lg text-gray-400">{DEVICE_ICON[r.type] ?? <Wrench className="w-4 h-4" />}</div>
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

              {parts.filter(i => i.stock <= i.minStock).length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3"><AlertCircle className="w-5 h-5 text-yellow-400" /><h3 className="font-semibold text-yellow-300">Stock bajo</h3></div>
                  <div className="space-y-2">
                    {parts.filter(i => i.stock <= i.minStock).map(i => (
                      <div key={i.id ?? i.sku ?? i.name} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{i.name}</span>
                        <span className="text-yellow-400 font-medium">{i.stock} unidades</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── REPARACIONES ── */}
          {tab === 'reparaciones' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Buscar por cliente, código o equipo..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2.5 rounded-xl text-sm transition-colors">
                  <Filter className="w-4 h-4" /> Filtrar
                </button>
                <button onClick={() => setShowNewRepair(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
                  <Plus className="w-4 h-4" /> Nueva reparación
                </button>
              </div>

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
                      {filteredRepairs.map(r => (
                        <tr key={r.code} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-5 py-4 font-mono text-xs text-blue-400">{r.code}</td>
                          <td className="px-5 py-4 font-medium">{r.client}</td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <div className="flex items-center gap-2 text-gray-300">
                              <span className="text-gray-500">{DEVICE_ICON[r.type]}</span>{r.device}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-gray-400 hidden lg:table-cell max-w-xs truncate">{r.issue}</td>
                          <td className="px-5 py-4 relative">
                            <button
                              onClick={e => { e.stopPropagation(); setStatusDropdown(statusDropdown === r.code ? null : r.code) }}
                              className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap hover:opacity-80 transition-opacity ${STATUS_CONFIG[r.status]?.color}`}>
                              {STATUS_CONFIG[r.status]?.label} ▾
                            </button>
                            {statusDropdown === r.code && (
                              <div className="absolute left-0 top-8 z-30 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl py-1 min-w-[200px]">
                                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                  <button key={key} onClick={() => changeStatus(r, key)}
                                    className={`w-full flex items-center gap-2.5 text-left px-3 py-2 text-xs hover:bg-gray-700 transition-colors ${r.status === key ? 'text-white font-semibold' : 'text-gray-300'}`}>
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                                    {cfg.label}
                                    {r.status === key && <span className="ml-auto text-blue-400">✓</span>}
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell">
                            <span className={`text-xs font-medium ${PRIORITY_CONFIG[r.priority]?.color}`}>{PRIORITY_CONFIG[r.priority]?.label}</span>
                          </td>
                          <td className="px-5 py-4 text-gray-300 hidden lg:table-cell">{r.cost ?? <span className="text-gray-600">Por definir</span>}</td>
                          <td className="px-5 py-4 text-gray-400 text-xs hidden md:table-cell">{r.date}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1 justify-end">
                              <button onClick={() => openReceipt(r)} title="Comprobante de recepción"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-900/30 transition-colors">
                                <ClipboardList className="w-4 h-4" />
                              </button>
                              <button onClick={() => openDoc('presupuesto', r)} title="Presupuesto"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-900/30 transition-colors">
                                <FileText className="w-4 h-4" />
                              </button>
                              <button onClick={() => openDoc('factura', r)} title="Factura C"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-900/30 transition-colors">
                                <Receipt className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredRepairs.length === 0 && <div className="text-center py-12 text-gray-500">No se encontraron reparaciones</div>}
              </div>
            </div>
          )}

          {/* ── CLIENTES ── */}
          {tab === 'clientes' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Buscar clientes..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <button onClick={() => setShowNewClient(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
                  <Plus className="w-4 h-4" /> Nuevo cliente
                </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map(c => (
                  <div key={c.id ?? c.phone ?? c.name} className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 hover:border-gray-600 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-blue-600/30 rounded-full flex items-center justify-center text-blue-400 font-semibold">{c.name[0]}</div>
                      <button className="text-gray-500 hover:text-gray-300 transition-colors"><MoreVertical className="w-4 h-4" /></button>
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

          {/* ── INVENTARIO ── */}
          {tab === 'inventario' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Buscar repuestos..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <button onClick={() => setShowNewPart(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
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
                      {parts.map((item, idx) => {
                        const isLow = item.stock <= item.minStock && item.stock > 0
                        const isOut = item.stock === 0
                        return (
                          <tr key={idx} className="hover:bg-gray-700/30 transition-colors">
                            <td className="px-5 py-4 font-medium">{item.name}</td>
                            <td className="px-5 py-4 font-mono text-xs text-gray-400 hidden sm:table-cell">{item.sku}</td>
                            <td className="px-5 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => changeStock(idx, -1)}
                                  className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-xs transition-colors">−</button>
                                <span className={`font-semibold w-8 text-center ${isOut ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-white'}`}>{item.stock}</span>
                                <button onClick={() => changeStock(idx, 1)}
                                  className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-xs transition-colors">+</button>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-gray-300 hidden md:table-cell">{item.salePrice}</td>
                            <td className="px-5 py-4">
                              {isOut  ? <span className="text-xs px-2.5 py-1 rounded-full bg-red-900/50 text-red-300 font-medium">Agotado</span>
                              : isLow ? <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-900/50 text-yellow-300 font-medium">Stock bajo</span>
                              :         <span className="text-xs px-2.5 py-1 rounded-full bg-green-900/50 text-green-300 font-medium">OK</span>}
                            </td>
                            <td className="px-5 py-4">
                              <button className="text-gray-500 hover:text-gray-300 transition-colors"><MoreVertical className="w-4 h-4" /></button>
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

      {/* ── MODAL NUEVA REPARACIÓN ── */}
      {showNewRepair && (
        <Modal title="Nueva reparación" onClose={() => setShowNewRepair(false)}>
          <form onSubmit={submitRepair} className="space-y-4">
            <Field label="Cliente *">
              <input required value={repairForm.client} onChange={e => setRepairForm(f => ({ ...f, client: e.target.value }))}
                placeholder="Nombre del cliente" className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Teléfono / WhatsApp">
                <input value={repairForm.phone} onChange={e => setRepairForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+54 9 11 XXXX XXXX" className={inputCls} />
              </Field>
              <Field label="Email">
                <input type="email" value={repairForm.email} onChange={e => setRepairForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="cliente@email.com" className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tipo de equipo">
                <select value={repairForm.deviceType} onChange={e => setRepairForm(f => ({ ...f, deviceType: e.target.value }))} className={selectCls}>
                  <option value="laptop">Laptop</option>
                  <option value="pc">PC escritorio</option>
                  <option value="playstation">PlayStation</option>
                  <option value="other">Otro</option>
                </select>
              </Field>
              <Field label="Prioridad">
                <select value={repairForm.priority} onChange={e => setRepairForm(f => ({ ...f, priority: e.target.value }))} className={selectCls}>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Marca">
                <input value={repairForm.deviceBrand} onChange={e => setRepairForm(f => ({ ...f, deviceBrand: e.target.value }))}
                  placeholder="HP, Sony, etc." className={inputCls} />
              </Field>
              <Field label="Modelo">
                <input value={repairForm.deviceModel} onChange={e => setRepairForm(f => ({ ...f, deviceModel: e.target.value }))}
                  placeholder="Pavilion 15, PS5..." className={inputCls} />
              </Field>
            </div>
            <Field label="Problema reportado *">
              <textarea required rows={3} value={repairForm.issue} onChange={e => setRepairForm(f => ({ ...f, issue: e.target.value }))}
                placeholder="Describe el problema del equipo..." className={inputCls + ' resize-none'} />
            </Field>
            <Field label="Costo estimado ($)">
              <input type="number" value={repairForm.cost} onChange={e => setRepairForm(f => ({ ...f, cost: e.target.value }))}
                placeholder="25000" className={inputCls} />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowNewRepair(false)}
                className="flex-1 border border-gray-700 hover:border-gray-500 py-2.5 rounded-xl text-sm transition-colors">Cancelar</button>
              <button type="submit" disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 py-2.5 rounded-xl text-sm font-semibold transition-all">
                {saving ? 'Guardando...' : 'Crear reparación'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL NUEVO CLIENTE ── */}
      {showNewClient && (
        <Modal title="Nuevo cliente" onClose={() => setShowNewClient(false)}>
          <form onSubmit={submitClient} className="space-y-4">
            <Field label="Nombre completo *">
              <input required value={clientForm.name} onChange={e => setClientForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Juan García" className={inputCls} />
            </Field>
            <Field label="Teléfono / WhatsApp *">
              <input required value={clientForm.phone} onChange={e => setClientForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+54 9 11 XXXX XXXX" className={inputCls} />
            </Field>
            <Field label="Email">
              <input type="email" value={clientForm.email} onChange={e => setClientForm(f => ({ ...f, email: e.target.value }))}
                placeholder="juan@email.com" className={inputCls} />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowNewClient(false)}
                className="flex-1 border border-gray-700 hover:border-gray-500 py-2.5 rounded-xl text-sm transition-colors">Cancelar</button>
              <button type="submit" disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 py-2.5 rounded-xl text-sm font-semibold transition-all">
                {saving ? 'Guardando...' : 'Crear cliente'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL NUEVO REPUESTO ── */}
      {showNewPart && (
        <Modal title="Agregar repuesto" onClose={() => setShowNewPart(false)}>
          <form onSubmit={submitPart} className="space-y-4">
            <Field label="Nombre del repuesto *">
              <input required value={partForm.name} onChange={e => setPartForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Chip HDMI PS5" className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="SKU / Código">
                <input value={partForm.sku} onChange={e => setPartForm(f => ({ ...f, sku: e.target.value }))}
                  placeholder="PS5-HDMI-001" className={inputCls} />
              </Field>
              <Field label="Marca">
                <input value={partForm.brand} onChange={e => setPartForm(f => ({ ...f, brand: e.target.value }))}
                  placeholder="Sony, Kingston..." className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Stock inicial *">
                <input required type="number" min="0" value={partForm.stock} onChange={e => setPartForm(f => ({ ...f, stock: e.target.value }))}
                  placeholder="5" className={inputCls} />
              </Field>
              <Field label="Stock mínimo">
                <input type="number" min="0" value={partForm.minStock} onChange={e => setPartForm(f => ({ ...f, minStock: e.target.value }))}
                  placeholder="2" className={inputCls} />
              </Field>
            </div>
            <Field label="Precio de venta ($)">
              <input type="number" value={partForm.salePrice} onChange={e => setPartForm(f => ({ ...f, salePrice: e.target.value }))}
                placeholder="35000" className={inputCls} />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowNewPart(false)}
                className="flex-1 border border-gray-700 hover:border-gray-500 py-2.5 rounded-xl text-sm transition-colors">Cancelar</button>
              <button type="submit" disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 py-2.5 rounded-xl text-sm font-semibold transition-all">
                {saving ? 'Guardando...' : 'Agregar repuesto'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── DOCUMENTO (presupuesto / factura C) ── */}
      {doc && <Documento data={doc} onClose={() => setDoc(null)} />}

      {/* ── COMPROBANTE DE RECEPCIÓN ── */}
      {receipt && <Comprobante data={receipt} onClose={() => setReceipt(null)} />}

      {/* Overlay para cerrar el dropdown de estado */}
      {statusDropdown && (
        <div className="fixed inset-0 z-20" onClick={() => setStatusDropdown(null)} />
      )}

      {/* ── MODAL CONFIGURACIÓN ── */}
      {showConfig && (
        <Modal title="Configuración" onClose={() => setShowConfig(false)}>
          <div className="space-y-4">
            {/* Estado de la base */}
            <div className="bg-gray-900 rounded-xl p-4 space-y-2.5">
              <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Sistema</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Base de datos</span>
                <span className={`font-medium flex items-center gap-1.5 ${dbOn ? 'text-green-400' : 'text-yellow-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${dbOn ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  {dbOn ? 'Conectada (Neon)' : 'Modo local'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Reparaciones guardadas</span>
                <span className="text-white font-medium">{repairs.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Clientes</span>
                <span className="text-white font-medium">{clients.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Repuestos en inventario</span>
                <span className="text-white font-medium">{parts.length}</span>
              </div>
            </div>

            {/* Datos del negocio */}
            <div className="bg-gray-900 rounded-xl p-4 space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Negocio</p>
              {[
                ['Razón Social', 'ELECTROGAMEZ SERVICIO TECNICO RG'],
                ['Titular', 'FAZZINI SERGIO FEDERICO'],
                ['CUIT', '20-21429328-6'],
                ['Ingresos Brutos', '1-28775'],
                ['Inicio actividades', '01/04/2017'],
                ['Domicilio', 'Los Pozos 458 Dpto:8, Río Gallegos'],
                ['Punto de Venta', '00002'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{k}</span>
                  <span className="text-white font-mono text-xs">{v}</span>
                </div>
              ))}
            </div>

            {/* Contraseña */}
            <div className="bg-gray-900 rounded-xl p-4">
              <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Contraseña de acceso</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Para cambiarla, actualizá la variable{' '}
                <code className="bg-gray-800 text-blue-300 px-1.5 py-0.5 rounded text-xs">ADMIN_PASSWORD</code>{' '}
                en el panel de Netlify → Site settings → Environment variables y hacé un nuevo deploy.
              </p>
            </div>

            <button onClick={() => setShowConfig(false)}
              className="w-full border border-gray-700 hover:border-gray-500 py-2.5 rounded-xl text-sm transition-colors">
              Cerrar
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal: notificación WhatsApp al cliente ── */}
      {pendingNotif && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <div className="flex items-center gap-2 text-green-400">
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">Notificar al cliente</span>
              </div>
              <button onClick={() => setPendingNotif(null)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Para:</span>
                <span className="font-medium text-white">{pendingNotif.repair.client}</span>
                <span className="text-green-400 font-mono text-xs ml-auto">{pendingNotif.phone}</span>
              </div>
              <textarea
                rows={10}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-green-500 transition-colors font-mono leading-relaxed"
                value={pendingNotif.message}
                onChange={e => setPendingNotif(n => n ? { ...n, message: e.target.value } : n)}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const tel = pendingNotif.phone.replace(/\D/g, '')
                    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(pendingNotif.message)}`, '_blank')
                    setPendingNotif(null)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
                </button>
                <button
                  onClick={() => setPendingNotif(null)}
                  className="px-5 border border-gray-700 hover:border-gray-500 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Omitir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
