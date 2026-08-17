'use client'

import { useState, useEffect } from 'react'
import {
  Monitor, Gamepad2, Wrench, Shield, Clock, Star,
  Mail, MapPin, Zap, CheckCircle,
  Menu, X, Search, Cpu,
  MessageCircle, Download, ExternalLink, Instagram,
  Facebook, Plus, Trash2, Edit3, Save, Globe,
  ChevronRight, Package, Sparkles, ArrowUpRight,
  Settings, LogOut,
  Server, Wifi, BatteryCharging, Printer, Building2,
  ShoppingCart
} from 'lucide-react'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface AppCard {
  id: string
  titulo: string
  descripcion: string
  imagen: string
  linkDescarga: string
  sitioFuente: string
  categoria: string
  fechaAgregado: string
  destacado: boolean
}

interface ProyectoProduccion {
  id: string
  nombre: string
  descripcion: string
  url: string
  imagen: string
  estado: 'activo' | 'beta' | 'nuevo'
  tecnologia: string
}

// ─── DATOS FIJOS INICIALES ────────────────────────────────────────────────────

const PROYECTOS_PRODUCCION_DEFAULT: ProyectoProduccion[] = [
  {
    id: 'tecnigest',
    nombre: 'TecniGest',
    descripcion: 'Sistema de gestión para talleres técnicos. Control de reparaciones, clientes, inventario y seguimiento online.',
    url: 'https://tecnigest.netlify.app/#/',
    imagen: '/proyecto-tecnigest.jpg',
    estado: 'activo',
    tecnologia: 'Next.js · PostgreSQL'
  },
  {
    id: 'firmadoc',
    nombre: 'FirmaDoc',
    descripcion: 'Firma digital de documentos PDF desde el navegador. Sin instalaciones. Freemium.',
    url: 'https://firmadocpdf.netlify.app',
    imagen: '/proyecto-firmadoc.jpg',
    estado: 'activo',
    tecnologia: 'HTML · pdf-lib · PWA'
  },
  {
    id: 'barberia',
    nombre: 'Directorio Barber',
    descripcion: 'Directorio de barberías para buscar y solicitar turnos online. Los barberos se registran gratis para aparecer en su ciudad.',
    url: 'https://barberiaia.netlify.app/',
    imagen: '',
    estado: 'activo',
    tecnologia: 'Web · Turnos'
  },
  {
    id: 'egtechpos',
    nombre: 'E-Gtech POS',
    descripcion: 'Sistema de punto de venta profesional: ventas, control de inventario, códigos de barras y reportes. Adaptable a distintos rubros.',
    url: 'https://seviciosrg.netlify.app/',
    imagen: '',
    estado: 'activo',
    tecnologia: 'Web · POS'
  }
]

const NAV_LINKS = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Tienda', href: '/tienda' },
  { label: 'Empresas', href: '#empresas' },
  { label: 'Novedades', href: '#novedades' },
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Testimonios', href: '#testimonios' },
  { label: 'Contacto', href: '#contacto' },
  { label: 'Portal', href: '/portal' },
]

const SERVICES = [
  {
    icon: <Gamepad2 className="w-8 h-8" />,
    title: 'PlayStation 3, 4 & 5',
    img: '/svc-playstation.jpg',
    desc: 'Reparación especializada de consolas PlayStation. HDMI, ventiladores, lectores de disco, problemas de encendido y más.',
    items: [' HDMI PS5', 'Limpieza de ventiladores', 'Reparación lector blu-ray', 'Problemas de encendido'],
    color: 'from-blue-600/20 to-blue-600/5',
    border: 'hover:border-blue-500/50',
    iconColor: 'text-blue-400 bg-blue-600/20',
  },
  {
    icon: <Monitor className="w-8 h-8" />,
    title: 'PC & Escritorio',
    img: '/svc-pc.jpg',
    desc: 'Diagnóstico, reparación y actualización de computadoras de escritorio. Cambio de componentes y optimización.',
    items: ['Diagnóstico completo', 'Cambio de componentes', 'Instalación de Windows', 'Optimización de rendimiento'],
    color: 'from-cyan-600/20 to-cyan-600/5',
    border: 'hover:border-cyan-500/50',
    iconColor: 'text-cyan-400 bg-cyan-600/20',
  },
  {
    icon: <Cpu className="w-8 h-8" />,
    title: 'Laptops & Notebooks',
    img: '/svc-laptop.jpg',
    desc: 'Reparación de pantallas, teclados, bisagras y problemas de sobrecalentamiento en todo tipo de laptops.',
    items: ['Cambio de pantalla', 'Reparación de bisagras', 'Cambio de batería', 'Teclados y touchpad'],
    color: 'from-violet-600/20 to-violet-600/5',
    border: 'hover:border-violet-500/50',
    iconColor: 'text-violet-400 bg-violet-600/20',
  },
  {
    icon: <Wrench className="w-8 h-8" />,
    title: 'Mantenimiento Preventivo',
    img: '/svc-ventilador.jpg',
    desc: 'Limpieza profunda, cambio de pasta térmica y revisión general para extender la vida útil de tus equipos.',
    items: ['Limpieza interna profunda', 'Cambio de pasta térmica', 'Revisión general', 'Optimización del sistema'],
    color: 'from-emerald-600/20 to-emerald-600/5',
    border: 'hover:border-emerald-500/50',
    iconColor: 'text-emerald-400 bg-emerald-600/20',
  },
]

const STATS = [
  { value: '+500', label: 'Equipos reparados' },
  { value: '15+', label: 'Años de experiencia' },
  { value: '98%', label: 'Clientes satisfechos' },
  { value: '24h', label: 'Diagnóstico express' },
]

const TESTIMONIALS = [
  {
    name: 'Carlos M.',
    device: 'PlayStation 5',
    text: 'Me arreglaron la ficha HDMI de la PS5 en 48 horas. Excelente trabajo, precio justo y con garantía.',
    stars: 5,
  },
  {
    name: 'Valentina R.',
    device: 'Laptop HP',
    text: 'Llevé mi laptop que se apagaba sola. La limpiaron, le cambiaron la pasta térmica y quedó como nueva.',
    stars: 5,
  },
  {
    name: 'Rodrigo P.',
    device: 'PC de escritorio',
    text: 'Muy profesionales. Me explicaron todo el proceso y el precio fue exactamente lo que me cotizaron.',
    stars: 5,
  },
]

const ESTADO_BADGE: Record<string, { label: string; color: string }> = {
  activo: { label: 'En producción', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  beta: { label: 'Beta', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  nuevo: { label: 'Nuevo', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [formSent, setFormSent] = useState(false)

  // Apps/Novedades
  const [apps, setApps] = useState<AppCard[]>([])
  const [adminMode, setAdminMode] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [editingApp, setEditingApp] = useState<AppCard | null>(null)
  const [showAppForm, setShowAppForm] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState('Todos')
  const [newApp, setNewApp] = useState<Omit<AppCard, 'id' | 'fechaAgregado'>>({
    titulo: '', descripcion: '', imagen: '', linkDescarga: '',
    sitioFuente: '', categoria: 'Utilidades', destacado: false
  })

  const CATEGORIAS = ['Todos', 'Utilidades', 'Seguridad', 'Multimedia', 'Juegos', 'Drivers', 'Oficina', 'Sistema']
  const ADMIN_PASS = 'electrogamez2025'

  useEffect(() => {
    // Las descargas se leen de la base de datos → iguales en todas las PC / visitantes
    fetch('/api/descargas')
      .then(r => r.ok ? r.json() : [])
      .then(setApps)
      .catch(() => setApps([]))
  }, [])

  function saveApps(newApps: AppCard[]) {
    setApps(newApps)
  }

  function handleAdminLogin() {
    if (adminPassword === ADMIN_PASS) {
      setAdminMode(true)
      localStorage.setItem('eg_admin', '1')  // recordar sesión en este equipo
      setShowAdminLogin(false)
      setAdminPassword('')
    } else {
      alert('Contraseña incorrecta')
    }
  }

  function handleAdminLogout() {
    setAdminMode(false)
    localStorage.removeItem('eg_admin')
  }

  function handleAddApp() {
    if (!newApp.titulo || !newApp.linkDescarga) return
    const app: AppCard = {
      ...newApp,
      id: Date.now().toString(),
      fechaAgregado: new Date().toISOString()
    }
    saveApps([app, ...apps])
    setNewApp({ titulo: '', descripcion: '', imagen: '', linkDescarga: '', sitioFuente: '', categoria: 'Utilidades', destacado: false })
    setShowAppForm(false)
  }

  function handleSaveEdit() {
    if (!editingApp) return
    saveApps(apps.map(a => a.id === editingApp.id ? editingApp : a))
    setEditingApp(null)
  }

  function handleDeleteApp(id: string) {
    if (!confirm('¿Eliminar esta aplicación?')) return
    saveApps(apps.filter(a => a.id !== id))
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    const msg = encodeURIComponent(`Hola ElectroGamez! Mi nombre es ${form.name}.\n\n${form.message}`)
    window.open(`https://wa.me/5491156975880?text=${msg}`, '_blank')
    setFormSent(true)
  }

  const appsFiltradas = filtroCategoria === 'Todos'
    ? apps
    : apps.filter(a => a.categoria === filtroCategoria)

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800/60">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              ElectroGamez
            </span>
          </a>

          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              l.href === '/tienda' ? (
                <a key={l.label} href={l.href} className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-semibold">
                  <ShoppingCart className="w-4 h-4" /> {l.label}
                </a>
              ) : (
                <a key={l.label} href={l.href} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  {l.label}
                </a>
              )
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="/seguimiento"
              className="flex items-center gap-2 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-all"
            >
              <Search className="w-4 h-4" /> Seguir reparación
            </a>
            <a
              href="https://wa.me/5491156975880"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>

          <button className="md:hidden text-gray-400 p-1" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-4 space-y-1">
            {NAV_LINKS.map((l) => {
              const isNovedades = l.href === '#novedades'
              const isProyectos = l.href === '#proyectos'
              const isTienda = l.href === '/tienda'
              return (
                <a
                  key={l.label}
                  href={l.href}
                  className={`flex items-center gap-2 py-2 px-2 rounded-lg text-sm transition-colors ${
                    isTienda
                      ? 'text-cyan-400 hover:bg-cyan-900/20 font-semibold'
                      : isNovedades
                      ? 'text-cyan-400 hover:bg-cyan-900/20'
                      : isProyectos
                      ? 'text-violet-400 hover:bg-violet-900/20'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {isTienda && <ShoppingCart className="w-4 h-4" />}
                  {isNovedades && <Download className="w-4 h-4" />}
                  {isProyectos && <Globe className="w-4 h-4" />}
                  {l.label}
                  {isNovedades && <span className="ml-auto text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">Gratis</span>}
                  {isTienda && <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">Nuevo</span>}
                </a>
              )
            })}
            <div className="border-t border-gray-800/60 pt-2 mt-2 space-y-1">
              <a href="/seguimiento" className="flex items-center gap-2 py-2 px-2 rounded-lg text-blue-400 hover:bg-blue-900/20 text-sm transition-colors" onClick={() => setMenuOpen(false)}>
                <Search className="w-4 h-4" /> Seguir mi reparación
              </a>
              <a href="https://wa.me/5491156975880" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-2 px-2 rounded-lg text-green-400 hover:bg-green-900/20 text-sm transition-colors">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ── DASHBOARD (hero + servicios + sidebar) ── */}
      <section className="pt-24 pb-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 tech-grid pointer-events-none" />
        <div className="absolute top-10 right-0 w-[32rem] h-[32rem] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative grid lg:grid-cols-[1fr_320px] gap-6 items-start">

          {/* ── COLUMNA PRINCIPAL ── */}
          <div className="min-w-0 space-y-6">

            {/* HERO con foto de fondo */}
            <div className="neon-card relative rounded-2xl overflow-hidden border border-gray-800 min-h-[340px] flex items-center">
              <div className="absolute inset-0">
                <img src="/hero-sergio.jpg" alt="Sergio reparando una placa en el taller de ElectroGamez" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/70 to-gray-950/20" />
              </div>
              <div className="relative p-8 md:p-10 max-w-xl">
                <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-700/50 rounded-full px-4 py-1.5 text-blue-300 text-sm mb-5 backdrop-blur">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                  </span>
                  Servicio técnico — Río Gallegos, Argentina
                </div>
                <h1 className="text-4xl md:text-5xl font-bold leading-[1.05] mb-4 tracking-tight">
                  Reparamos lo que{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">otros no pueden</span>.
                </h1>
                <p className="text-gray-300 mb-6 max-w-lg leading-relaxed">
                  Reparación a nivel componente de PlayStation y PC. Diagnóstico en 24h, garantía escrita y precios sin sorpresas.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <a href="https://wa.me/5491156975880" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25">
                    <MessageCircle className="w-5 h-5" /> Consultar por WhatsApp
                  </a>
                  <a href="/seguimiento" className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 hover:border-cyan-600/50 px-6 py-3 rounded-xl font-medium transition-all text-gray-200">
                    <Search className="w-4 h-4" /> Seguir reparación
                  </a>
                </div>
                <div className="inline-flex items-center gap-3 bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-2.5 backdrop-blur">
                  <span className="bg-[#e2231a] text-white font-bold text-[13px] px-2 py-0.5 rounded tracking-tight">Lenovo</span>
                  <div className="leading-tight">
                    <p className="text-[13px] font-semibold text-white">Técnico autorizado</p>
                    <p className="text-xs text-gray-400">Certificación oficial de fábrica</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATS.map((s, i) => {
                const StatIcon = [Wrench, Clock, CheckCircle, Zap][i % 4]
                return (
                  <div key={s.label} className="neon-card bg-gray-900/70 border border-gray-800 rounded-2xl p-4 hover:-translate-y-1 transition-transform">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 grid place-items-center text-cyan-400 mb-3">
                      <StatIcon className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{s.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                )
              })}
            </div>

            {/* SERVICIOS */}
            <div id="servicios" className="pt-4">
              <p className="text-blue-400 text-sm font-medium uppercase tracking-widest mb-2">Lo que hacemos</p>
              <h2 className="text-3xl font-bold mb-6">Servicios de reparación</h2>
              <div className="grid sm:grid-cols-2 gap-5">
{SERVICES.map((s) => (
              <div key={s.title} className="neon-card group relative bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 flex flex-col">
                {/* Imagen 3D del servicio */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950">
                  <img src={s.img} alt={s.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
                  <div className={`absolute top-3 left-3 p-2 ${s.iconColor} rounded-lg backdrop-blur`}>
                    {s.icon}
                  </div>
                  <h3 className="absolute bottom-3 left-4 right-4 font-bold text-lg group-hover:text-cyan-400 transition-colors">{s.title}</h3>
                </div>
                {/* Contenido */}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">{s.desc}</p>
                  <ul className="space-y-2 mt-auto">
                    {s.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
              </div>
            </div>

          </div>

          {/* ── SIDEBAR ── */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            {/* Tienda */}
            <a href="/tienda" className="neon-card group block bg-gradient-to-br from-blue-950/60 to-cyan-950/40 border border-cyan-800/40 rounded-2xl p-5 hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 grid place-items-center text-gray-950">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2.5 py-0.5 ml-auto">Nuevo</span>
              </div>
              <h3 className="font-bold text-lg group-hover:text-cyan-400 transition-colors">Tienda ElectroGamez</h3>
              <p className="text-sm text-gray-400 mt-1 mb-3">Accesorios gaming y tecnología con envío a domicilio sin cargo.</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400">Ver productos <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></span>
            </a>

            {/* Descargas */}
            <a href="#novedades" className="neon-card group block bg-gray-900/60 border border-gray-800 rounded-2xl p-5 hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-600/30 grid place-items-center text-cyan-400">
                  <Download className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 rounded-full px-2.5 py-0.5 ml-auto">Gratis</span>
              </div>
              <h3 className="font-bold text-lg group-hover:text-cyan-400 transition-colors">Herramientas y descargas</h3>
              <p className="text-sm text-gray-400 mt-1 mb-3">Software seleccionado por nuestros técnicos. Confiable y sin publicidad.</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400">Ver descargas <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></span>
            </a>

            {/* Seguimiento */}
            <a href="/seguimiento" className="neon-card group block bg-gray-900/60 border border-gray-800 rounded-2xl p-5 hover:-translate-y-1 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-600/30 grid place-items-center text-blue-400 mb-3">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">Seguí tu reparación</h3>
              <p className="text-sm text-gray-400 mt-1 mb-3">Consultá el estado de tu equipo con tu código de seguimiento.</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-400">Ver estado <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></span>
            </a>
          </aside>

        </div>
      </section>

      {/* ── AUTORIDAD ── */}
      <section className="px-4 py-16 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <p className="text-cyan-400 text-sm font-medium uppercase tracking-widest mb-3">Autoridad real</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Detrás de cada reparación, un profesional certificado.</h2>
          <p className="text-gray-400 max-w-2xl mb-10">
            No es un taller más. Es microsoldadura bajo microscopio, infraestructura de servidores y certificación oficial de fábrica.
          </p>

          <div className="grid lg:grid-cols-2 gap-5">
            <div className="neon-card relative rounded-2xl overflow-hidden border border-gray-800 min-h-[320px] group">
              <img src="/taller.jpg" alt="Sergio en el taller con microscopio de electrónica" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-xs font-semibold tracking-wider uppercase text-cyan-400">Nuestro taller</p>
                <h3 className="text-xl font-bold mt-1">Microsoldadura de precisión</h3>
                <p className="text-sm text-gray-400 mt-1">Trabajo a nivel chip bajo microscopio — lo que pocos hacen en la Patagonia.</p>
              </div>
            </div>
            <div className="neon-card relative rounded-2xl overflow-hidden border border-gray-800 min-h-[320px] group">
              <img src="/sergio-server.jpg" alt="Sergio trabajando con servidores IBM" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-xs font-semibold tracking-wider uppercase text-cyan-400">Más que consolas</p>
                <h3 className="text-xl font-bold mt-1">Infraestructura y servidores</h3>
                <p className="text-sm text-gray-400 mt-1">Redes, servidores IBM ,impresoras y sistemas críticos. Capacidad técnica de nivel empresa.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── POR QUÉ ELEGIRNOS ── */}
      <section className="py-24 px-4 bg-gray-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">¿Por qué elegirnos?</h2>
            <p className="text-gray-400 text-lg">Más de 15 años reparando equipos en Río Gallegos, Santa Cruz</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Clock className="w-6 h-6" />, title: 'Diagnóstico en 24h', desc: 'Te decimos qué tiene tu equipo y cuánto cuesta antes de empezar.' },
              { icon: <Shield className="w-6 h-6" />, title: 'Garantía escrita', desc: 'Todas las reparaciones incluyen garantía por escrito.' },
              { icon: <Zap className="w-6 h-6" />, title: 'Precios claros', desc: 'Sin sorpresas. El precio cotizado es el precio final.' },
              { icon: <Search className="w-6 h-6" />, title: 'Seguimiento online', desc: 'Controlá el estado de tu reparación desde el celular.' },
            ].map((item) => (
              <div key={item.title} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 text-center hover:border-gray-700 transition-colors">
                <div className="p-3 bg-blue-600/15 rounded-xl text-blue-400 w-fit mx-auto mb-4">{item.icon}</div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMPRESAS ── */}
      <section id="empresas" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-cyan-400 text-sm font-medium uppercase tracking-widest mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Soluciones corporativas
            </p>
            <h2 className="text-4xl font-bold mb-4">Soporte técnico para tu Empresa</h2>
            <p className="text-gray-400 text-lg max-w-2xl">
              Contamos con equipo de trabajo en toda la Provincia de Santa Cruz. Instalación,
              mantenimiento y reparación de servidores, redes, UPS e impresoras. Además desarrollamos
              páginas web a la medida de tu presupuesto.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              { icon: <Server className="w-7 h-7" />,          title: 'Servidores', desc: 'Instalación, configuración y mantenimiento para asegurar la continuidad de tu negocio.' },
              { icon: <Wifi className="w-7 h-7" />,            title: 'Redes',      desc: 'Armado y optimización de redes cableadas y WiFi para una conexión estable en la oficina.' },
              { icon: <BatteryCharging className="w-7 h-7" />, title: 'UPS',        desc: 'Instalación y service de fuentes de alimentación ininterrumpida para proteger tus equipos.' },
              { icon: <Printer className="w-7 h-7" />,         title: 'Impresoras', desc: 'Reparación, mantenimiento y recarga de impresoras de oficina de cualquier tamaño.' },
              { icon: <Globe className="w-7 h-7" />,           title: 'Páginas Web', desc: 'Desarrollo de sitios web a medida, adaptados al presupuesto de tu empresa.' },
            ].map((s) => (
              <div key={s.title} className="bg-gray-900/60 border border-gray-800 hover:border-cyan-600/40 rounded-2xl p-5 transition-all duration-300">
                <div className="p-3 bg-cyan-600/15 text-cyan-400 rounded-xl w-fit mb-4">{s.icon}</div>
                <h3 className="font-bold mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 mt-10">
            <a
              href={`https://wa.me/5491156975880?text=${encodeURIComponent('Hola ElectroGamez! Quiero consultar por soporte técnico para mi empresa.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-7 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20"
            >
              <MessageCircle className="w-5 h-5" /> Consultar para mi empresa
            </a>
            <a
              href={`https://wa.me/5491156975880?text=${encodeURIComponent('Hola ElectroGamez! Me interesa desarrollar una página web para mi negocio.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 px-7 py-3.5 rounded-xl font-medium transition-all text-gray-200"
            >
              <Globe className="w-4 h-4" /> Quiero mi web
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          ── DESCARGAS Y NOVEDADES ──
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="novedades" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header de sección */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-cyan-400 text-sm font-medium uppercase tracking-widest mb-3">
                Herramientas y software gratuito
              </p>
              <h2 className="text-4xl font-bold mb-3">Descargas y Novedades</h2>
              <p className="text-gray-400 text-lg max-w-xl">
                Software seleccionado por nuestros técnicos. Gratuito, confiable y sin publicidad engañosa.
              </p>
            </div>

            {/* Controles admin */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {adminMode ? (
                <>
                  <button
                    onClick={() => setShowAppForm(!showAppForm)}
                    className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Agregar app
                  </button>
                  <button
                    onClick={handleAdminLogout}
                    className="flex items-center gap-2 border border-gray-700 hover:border-gray-600 text-gray-400 hover:text-white px-3 py-2 rounded-xl text-sm transition-colors"
                  >
                    <X className="w-4 h-4" /> Salir
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {/* Login admin (modal simple) */}
          {showAdminLogin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm">
                <h3 className="font-bold mb-4">Acceso Admin — Novedades</h3>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white mb-4 focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <button onClick={handleAdminLogin} className="flex-1 bg-blue-600 hover:bg-blue-500 py-2.5 rounded-xl text-sm font-medium transition-colors">
                    Ingresar
                  </button>
                  <button onClick={() => { setShowAdminLogin(false); setAdminPassword('') }} className="px-4 border border-gray-700 hover:border-gray-600 rounded-xl text-sm text-gray-400 transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Formulario agregar app */}
          {adminMode && showAppForm && (
            <div className="bg-gray-900/80 border border-cyan-800/40 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-cyan-400 mb-5 flex items-center gap-2"><Plus className="w-4 h-4" /> Nueva aplicación</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Título *</label>
                  <input value={newApp.titulo} onChange={e => setNewApp({ ...newApp, titulo: e.target.value })}
                    placeholder="Ej: CCleaner" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Categoría</label>
                  <select value={newApp.categoria} onChange={e => setNewApp({ ...newApp, categoria: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                    {CATEGORIAS.filter(c => c !== 'Todos').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-500 block mb-1">Descripción</label>
                  <textarea value={newApp.descripcion} onChange={e => setNewApp({ ...newApp, descripcion: e.target.value })}
                    rows={2} placeholder="Qué hace esta app y por qué recomendarla..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">URL de imagen (logo)</label>
                  <input value={newApp.imagen} onChange={e => setNewApp({ ...newApp, imagen: e.target.value })}
                    placeholder="https://..." className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Link de descarga *</label>
                  <input value={newApp.linkDescarga} onChange={e => setNewApp({ ...newApp, linkDescarga: e.target.value })}
                    placeholder="https://..." className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Sitio fuente</label>
                  <input value={newApp.sitioFuente} onChange={e => setNewApp({ ...newApp, sitioFuente: e.target.value })}
                    placeholder="ejemplo.com" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400">
                    <input type="checkbox" checked={newApp.destacado} onChange={e => setNewApp({ ...newApp, destacado: e.target.checked })}
                      className="rounded" />
                    Destacado
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={handleAddApp} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                  <Save className="w-4 h-4" /> Guardar
                </button>
                <button onClick={() => setShowAppForm(false)} className="px-4 border border-gray-700 hover:border-gray-600 rounded-xl text-sm text-gray-400 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Modal editar app */}
          {editingApp && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h3 className="font-bold text-cyan-400 mb-5 flex items-center gap-2"><Edit3 className="w-4 h-4" /> Editar aplicación</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Título</label>
                    <input value={editingApp.titulo} onChange={e => setEditingApp({ ...editingApp, titulo: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Categoría</label>
                    <select value={editingApp.categoria} onChange={e => setEditingApp({ ...editingApp, categoria: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
                      {CATEGORIAS.filter(c => c !== 'Todos').map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 block mb-1">Descripción</label>
                    <textarea value={editingApp.descripcion} onChange={e => setEditingApp({ ...editingApp, descripcion: e.target.value })}
                      rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">URL imagen</label>
                    <input value={editingApp.imagen} onChange={e => setEditingApp({ ...editingApp, imagen: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Link descarga</label>
                    <input value={editingApp.linkDescarga} onChange={e => setEditingApp({ ...editingApp, linkDescarga: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Sitio fuente</label>
                    <input value={editingApp.sitioFuente} onChange={e => setEditingApp({ ...editingApp, sitioFuente: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400">
                      <input type="checkbox" checked={editingApp.destacado} onChange={e => setEditingApp({ ...editingApp, destacado: e.target.checked })} />
                      Destacado
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 mt-5">
                  <button onClick={handleSaveEdit} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                    <Save className="w-4 h-4" /> Guardar
                  </button>
                  <button onClick={() => setEditingApp(null)} className="px-4 border border-gray-700 hover:border-gray-600 rounded-xl text-sm text-gray-400 transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filtros de categoría */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIAS.map(cat => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filtroCategoria === cat
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid de apps */}
          {appsFiltradas.length === 0 ? (
            <div className="text-center py-20 text-gray-600">
              <Download className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No hay apps en esta categoría aún</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {appsFiltradas.map(app => (
                <div key={app.id} className={`relative bg-gray-900 border rounded-2xl overflow-hidden group transition-all duration-200 hover:border-cyan-700/60 hover:shadow-lg hover:shadow-cyan-900/20 flex flex-col ${app.destacado ? 'border-cyan-800/50' : 'border-gray-800'}`}>

                  {/* Badge destacado */}
                  {app.destacado && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-cyan-500/20 text-cyan-400 text-xs px-2 py-0.5 rounded-full border border-cyan-500/30 z-10">
                      <Sparkles className="w-3 h-3" /> Destacado
                    </div>
                  )}

                  {/* Header con imagen */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 flex items-center gap-4 border-b border-gray-800">
                    <div className="w-14 h-14 flex-shrink-0 bg-gray-700/60 rounded-xl overflow-hidden flex items-center justify-center">
                      {app.imagen ? (
                        <img src={app.imagen} alt={app.titulo} className="w-full h-full object-contain p-1" onError={e => { (e.target as HTMLImageElement).src = '' }} />
                      ) : (
                        <Package className="w-7 h-7 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors truncate">{app.titulo}</h3>
                      <span className="inline-block text-xs bg-gray-700/60 text-gray-400 px-2 py-0.5 rounded-full mt-1">
                        {app.categoria}
                      </span>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="p-5 flex-1">
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{app.descripcion}</p>
                  </div>

                  {/* Footer */}
                  <div className="px-5 pb-5 space-y-3">
                    {app.sitioFuente && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Globe className="w-3 h-3" />
                        <span>{app.sitioFuente}</span>
                        <span className="text-gray-700">·</span>
                        <span>{new Date(app.fechaAgregado).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <a
                        href={app.linkDescarga}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      >
                        <Download className="w-4 h-4" /> Descargar gratis
                      </a>

                      {adminMode && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingApp(app)}
                            className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteApp(app.id)}
                            className="p-2.5 bg-gray-800 hover:bg-red-900/50 rounded-xl text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          ── PROYECTOS EN PRODUCCIÓN ──
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="proyectos" className="py-24 px-4 bg-gray-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-violet-400 text-sm font-medium uppercase tracking-widest mb-3">Desarrollo de software</p>
            <h2 className="text-4xl font-bold mb-4">Proyectos en Producción</h2>
            <p className="text-gray-400 text-lg max-w-xl">
              Aplicaciones web desarrolladas y en uso real. Soluciones digitales para negocios y particulares.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PROYECTOS_PRODUCCION_DEFAULT.map(p => (
              <div key={p.id} className="neon-card bg-gray-900 border border-gray-800 hover:border-violet-700/50 rounded-2xl overflow-hidden transition-all duration-200 group hover:-translate-y-1 flex flex-col">

                {/* Header visual */}
                <div className="h-40 relative flex items-center justify-center border-b border-gray-800 overflow-hidden bg-gradient-to-br from-violet-900/30 via-blue-900/20 to-cyan-900/20">
                  {p.imagen ? (
                    <img src={p.imagen} alt={p.nombre} className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="text-5xl opacity-20 font-black tracking-tighter text-white select-none">
                      {p.nombre.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  {p.imagen && <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium backdrop-blur ${ESTADO_BADGE[p.estado].color}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block animate-pulse"></span>
                      {ESTADO_BADGE[p.estado].label}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-white group-hover:text-violet-400 transition-colors mb-2">
                    {p.nombre}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1">
                    {p.descripcion}
                  </p>
                  <div className="text-xs text-gray-600 mb-4 font-mono">{p.tecnologia}</div>

                  <a
                    href={p.url}
                    target={p.url !== '#' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      p.url !== '#'
                        ? 'bg-violet-600/20 hover:bg-violet-600 border border-violet-600/40 hover:border-violet-600 text-violet-300 hover:text-white'
                        : 'bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {p.url !== '#' ? (
                      <><ExternalLink className="w-4 h-4" /> Ver proyecto</>
                    ) : (
                      <><ChevronRight className="w-4 h-4" /> Próximamente</>
                    )}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* CTA desarrollo */}
          <div className="mt-10 bg-gradient-to-r from-violet-900/20 to-blue-900/20 border border-violet-800/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg mb-1">¿Necesitás un sistema a medida?</h3>
              <p className="text-gray-400 text-sm">Desarrollamos soluciones web para tu negocio. Contactanos y cotizamos sin cargo.</p>
            </div>
            <a
              href="https://wa.me/5491156975880?text=Hola!%20Quiero%20consultar%20por%20desarrollo%20de%20software"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-medium transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" /> Consultar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section id="testimonios" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-400 text-sm font-medium uppercase tracking-widest mb-3">Testimonios</p>
            <h2 className="text-4xl font-bold mb-4">Lo que dicen nuestros clientes</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-gray-800/40 border border-gray-700/60 rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-600/30 rounded-full flex items-center justify-center text-blue-400 font-semibold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.device}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <section id="contacto" className="py-24 px-4 bg-gray-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <p className="text-blue-400 text-sm font-medium uppercase tracking-widest mb-3">Contacto</p>
              <h2 className="text-4xl font-bold mb-6">Hablemos</h2>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                Escribinos por WhatsApp o completá el formulario y te respondemos a la brevedad.
              </p>

              <div className="space-y-5">
                <a href="https://wa.me/5491156975880" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="p-3 bg-green-600/20 rounded-xl text-green-400 group-hover:bg-green-600/30 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">WhatsApp</p>
                    <p className="font-semibold group-hover:text-green-400 transition-colors">11 5697-5880</p>
                  </div>
                </a>

                <a href="mailto:Sergiofazzini@gmail.com" className="flex items-center gap-4 group">
                  <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400 group-hover:bg-blue-600/30 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                    <p className="font-semibold group-hover:text-blue-400 transition-colors">Sergiofazzini@gmail.com</p>
                  </div>
                </a>

                {/* Google Maps */}
                <a
                  href="https://www.google.com/maps/search/Los+Pozos+458+Río+Gallegos+Argentina"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div className="p-3 bg-red-600/20 rounded-xl text-red-400 group-hover:bg-red-600/30 transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Dirección · Google Maps</p>
                    <p className="font-semibold group-hover:text-red-400 transition-colors">Los Pozos 458 Dpto:8, Río Gallegos, Santa Cruz</p>
                    <p className="text-xs text-gray-500 group-hover:text-red-300 transition-colors flex items-center gap-1 mt-0.5">
                      Ver en el mapa <ArrowUpRight className="w-3 h-3" />
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-600/20 rounded-xl text-cyan-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Horario</p>
                    <p className="font-semibold">Lunes a Viernes: 10:00 – 19:00</p>
                    <p className="text-gray-400 text-sm">Sábados: 10:00 – 14:00</p>
                  </div>
                </div>

                {/* ── REDES SOCIALES ── */}
                <div className="pt-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Seguinos en redes</p>
                  <div className="flex gap-3">
                    <a
                      href="https://www.instagram.com/electro_gamez/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 bg-gradient-to-r from-purple-900/40 to-pink-900/30 hover:from-purple-800/60 hover:to-pink-800/50 border border-purple-700/40 hover:border-pink-600/60 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group"
                    >
                      <Instagram className="w-4 h-4 text-pink-400 group-hover:text-pink-300" />
                      <span className="text-gray-300 group-hover:text-white">Instagram</span>
                    </a>
                    <a
                      href="https://www.facebook.com/Electrogamez.service.tecnico"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 bg-blue-950/50 hover:bg-blue-900/50 border border-blue-800/40 hover:border-blue-600/60 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group"
                    >
                      <Facebook className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                      <span className="text-gray-300 group-hover:text-white">Facebook</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {formSent ? (
                <div className="h-full flex flex-col items-center justify-center bg-green-900/10 border border-green-700/50 rounded-2xl p-10 text-center">
                  <CheckCircle className="w-14 h-14 text-green-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">¡Mensaje enviado por WhatsApp!</h3>
                  <p className="text-gray-400">Te respondemos a la brevedad.</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 space-y-5">
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Tu nombre</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Juan García"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Teléfono / WhatsApp</label>
                    <input
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+54 9 11 XXXX XXXX"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">¿Qué equipo tenés y cuál es el problema?</label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Ej: Tengo una PS5 que no da imagen por HDMI..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 py-3.5 rounded-xl font-semibold transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Enviar por WhatsApp
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-800/60 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ElectroGamez
              </span>
            </div>

            {/* Redes en footer */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.google.com/maps/search/Los+Pozos+458+Río+Gallegos+Argentina"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-red-400 transition-colors"
                title="Google Maps"
              >
                <MapPin className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/electro_gamez/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-400 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/Electrogamez.service.tecnico"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-400 transition-colors"
                title="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/5491156975880"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-green-400 transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>

            <p className="text-gray-600 text-sm text-center">
              © {new Date().getFullYear()} ElectroGamez · Los Pozos 458 Dpto:8, Río Gallegos, Santa Cruz
            </p>
          </div>
        </div>
      </footer>

      {/* Botón de WhatsApp flotante */}
      <a
        href="https://wa.me/5491156975880?text=Hola%20ElectroGamez!%20Quiero%20hacer%20una%20consulta."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chatear por WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-[#25d366] hover:bg-[#1ebe5b] text-white font-semibold pl-4 pr-5 py-3 rounded-full shadow-lg shadow-black/30 transition-all hover:scale-105"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden="true">
          <path d="M17.5 14.4c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.6-1.4-3.7-3.2-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.5c-.2 0-.5.1-.8.4-1 .9-1.2 2.1-.9 3.4.4 1.6 1.4 3 1.6 3.2.2.3 2.8 4.3 6.8 5.9 2.5 1 3.2.8 3.8.7.9-.1 1.7-.7 2-1.4.3-.7.3-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2z" />
        </svg>
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

    </div>
  )
}

