'use client'

import { useState, useEffect } from 'react'
import {
  Monitor, Gamepad2, Wrench, Shield, Clock, Star,
  Mail, MapPin, Zap, CheckCircle,
  Menu, X, Search, Cpu,
  MessageCircle, Download, FileDown, Code2, Globe,
  ExternalLink, FolderOpen, Laptop
} from 'lucide-react'

const REVIEW_URL = 'https://maps.app.goo.gl/4H4MGMC7uVY5sKeY9'

const NAV_LINKS = [
  { label: 'Servicios',  href: '#servicios'  },
  { label: 'Proyectos',  href: '#proyectos'  },
  { label: 'Descargas',  href: '#descargas'  },
  { label: 'Testimonios', href: '#testimonios' },
  { label: 'Contacto',   href: '#contacto'   },
]

const PROJECTS = [
  {
    icon: <Monitor className="w-7 h-7" />,
    title: 'ElectroGamez System',
    desc: 'Sistema de gestión interna para talleres de reparación. Registro de reparaciones, clientes, inventario, facturación AFIP y comprobantes con código de seguimiento.',
    tags: ['Next.js', 'PostgreSQL', 'Tailwind'],
    color: 'from-blue-600/20 to-blue-600/5',
    border: 'hover:border-blue-500/50',
    iconColor: 'text-blue-400 bg-blue-600/20',
    link: null,
  },
  {
    icon: <Search className="w-7 h-7" />,
    title: 'Seguimiento público de reparaciones',
    desc: 'Página pública donde los clientes pueden consultar el estado de su reparación en tiempo real ingresando su código único.',
    tags: ['Next.js', 'API REST', 'Mobile-first'],
    color: 'from-cyan-600/20 to-cyan-600/5',
    border: 'hover:border-cyan-500/50',
    iconColor: 'text-cyan-400 bg-cyan-600/20',
    link: '/seguimiento',
  },
  {
    icon: <Gamepad2 className="w-7 h-7" />,
    title: 'Landing ElectroGamez',
    desc: 'Sitio web institucional con servicios, testimonios, formulario de contacto vía WhatsApp y sistema de reseñas Google. Diseño responsivo optimizado para móvil.',
    tags: ['Next.js', 'Netlify', 'SEO'],
    color: 'from-violet-600/20 to-violet-600/5',
    border: 'hover:border-violet-500/50',
    iconColor: 'text-violet-400 bg-violet-600/20',
    link: '/',
  },
]

const DOWNLOADS = [
  {
    icon: <Laptop className="w-6 h-6" />,
    title: 'HWiNFO64',
    desc: 'Diagnóstico completo de hardware: temperatura, voltajes, velocidades de ventiladores y estado general del equipo.',
    size: '8 MB',
    tag: 'Diagnóstico',
    tagColor: 'bg-blue-900/50 text-blue-300',
    href: 'https://www.hwinfo.com/download/',
  },
  {
    icon: <Monitor className="w-6 h-6" />,
    title: 'CrystalDiskInfo',
    desc: 'Revisá la salud de tu disco rígido o SSD. Detecta fallas antes de que pierdas tus datos.',
    size: '4 MB',
    tag: 'Diagnóstico',
    tagColor: 'bg-blue-900/50 text-blue-300',
    href: 'https://crystalmark.info/en/software/crystaldiskinfo/',
  },
  {
    icon: <Cpu className="w-6 h-6" />,
    title: 'CPU-Z',
    desc: 'Información detallada del procesador, placa base, memoria RAM y tarjeta gráfica de tu PC.',
    size: '2 MB',
    tag: 'Información',
    tagColor: 'bg-purple-900/50 text-purple-300',
    href: 'https://www.cpuid.com/softwares/cpu-z.html',
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    title: 'Malwarebytes',
    desc: 'Eliminá virus, malware y programas no deseados. Versión gratuita ideal para una limpieza rápida.',
    size: '70 MB',
    tag: 'Seguridad',
    tagColor: 'bg-red-900/50 text-red-300',
    href: 'https://www.malwarebytes.com/mwb-download',
  },
  {
    icon: <FileDown className="w-6 h-6" />,
    title: 'Ventoy',
    desc: 'Creá un pendrive booteable con múltiples sistemas operativos. Ideal para reinstalar Windows o diagnosticar.',
    size: '14 MB',
    tag: 'Utilidades',
    tagColor: 'bg-emerald-900/50 text-emerald-300',
    href: 'https://www.ventoy.net/en/download.html',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Driver Booster (IObit)',
    desc: 'Actualizá todos los drivers de tu PC automáticamente. Útil después de reinstalar Windows.',
    size: '25 MB',
    tag: 'Drivers',
    tagColor: 'bg-yellow-900/50 text-yellow-300',
    href: 'https://www.iobit.com/en/driver-booster.php',
  },
]

const SERVICES = [
  {
    icon: <Gamepad2 className="w-8 h-8" />,
    title: 'PlayStation 4 & 5',
    desc: 'Reparación especializada de consolas PlayStation. Chip HDMI, ventiladores, lectores de disco, problemas de encendido y más.',
    items: ['Chip HDMI PS5', 'Limpieza de ventiladores', 'Reparación lector blu-ray', 'Problemas de encendido'],
    color: 'from-blue-600/20 to-blue-600/5',
    border: 'hover:border-blue-500/50',
    iconColor: 'text-blue-400 bg-blue-600/20',
  },
  {
    icon: <Monitor className="w-8 h-8" />,
    title: 'PC & Escritorio',
    desc: 'Diagnóstico, reparación y actualización de computadoras de escritorio. Cambio de componentes y optimización.',
    items: ['Diagnóstico completo', 'Cambio de componentes', 'Instalación de Windows', 'Optimización de rendimiento'],
    color: 'from-cyan-600/20 to-cyan-600/5',
    border: 'hover:border-cyan-500/50',
    iconColor: 'text-cyan-400 bg-cyan-600/20',
  },
  {
    icon: <Cpu className="w-8 h-8" />,
    title: 'Laptops & Notebooks',
    desc: 'Reparación de pantallas, teclados, bisagras y problemas de sobrecalentamiento en todo tipo de laptops.',
    items: ['Cambio de pantalla', 'Reparación de bisagras', 'Cambio de batería', 'Teclados y touchpad'],
    color: 'from-violet-600/20 to-violet-600/5',
    border: 'hover:border-violet-500/50',
    iconColor: 'text-violet-400 bg-violet-600/20',
  },
  {
    icon: <Wrench className="w-8 h-8" />,
    title: 'Mantenimiento Preventivo',
    desc: 'Limpieza profunda, cambio de pasta térmica y revisión general para extender la vida útil de tus equipos.',
    items: ['Limpieza interna profunda', 'Cambio de pasta térmica', 'Revisión general', 'Optimización del sistema'],
    color: 'from-emerald-600/20 to-emerald-600/5',
    border: 'hover:border-emerald-500/50',
    iconColor: 'text-emerald-400 bg-emerald-600/20',
  },
]

const STATS = [
  { value: '+500', label: 'Equipos reparados' },
  { value: '10+', label: 'Años de experiencia' },
  { value: '98%', label: 'Clientes satisfechos' },
  { value: '24h', label: 'Diagnóstico express' },
]

const TESTIMONIALS = [
  {
    name: 'Carlos M.',
    device: 'PlayStation 5',
    text: 'Me arreglaron el chip HDMI de la PS5 en 48 horas. Excelente trabajo, precio justo y con garantía.',
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

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [formSent, setFormSent] = useState(false)
  const [reviewQr, setReviewQr] = useState('')

  useEffect(() => {
    import('qrcode').then(QRCode =>
      QRCode.toDataURL(REVIEW_URL, { margin: 1, width: 220, errorCorrectionLevel: 'M' })
        .then(setReviewQr).catch(() => {})
    )
  }, [])

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    const msg = encodeURIComponent(`Hola ElectroGamez! Mi nombre es ${form.name}.\n\n${form.message}`)
    window.open(`https://wa.me/5491156975880?text=${msg}`, '_blank')
    setFormSent(true)
  }

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

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                {l.label}
              </a>
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
          <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-4 space-y-3">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="block text-gray-300 hover:text-white py-1.5 text-sm" onClick={() => setMenuOpen(false)}>
                {l.label}
              </a>
            ))}
            <a href="/seguimiento" className="block text-blue-400 py-1.5 text-sm" onClick={() => setMenuOpen(false)}>
              Seguir mi reparación
            </a>
            <a href="https://wa.me/5491156975880" target="_blank" rel="noopener noreferrer" className="block text-green-400 py-1.5 text-sm">
              WhatsApp
            </a>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="pt-28 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-950 border border-blue-700/50 rounded-full px-4 py-1.5 text-blue-400 text-sm mb-8">
              <MapPin className="w-3.5 h-3.5" />
              Servicio técnico — Rio Gallegos, Argentina
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
              Reparamos tu{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                PlayStation
              </span>
              {' '}y tu PC
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
              Diagnóstico express, reparaciones con garantía escrita y precios transparentes.
              Más de 10 años de experiencia en Rio Gallegos.
            </p>

            <div className="flex flex-wrap gap-4 mb-16">
              <a
                href="https://wa.me/5491156975880"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20"
              >
                <MessageCircle className="w-5 h-5" /> Consultar por WhatsApp
              </a>
              <a
                href="/seguimiento"
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 px-8 py-3.5 rounded-xl font-medium transition-all text-gray-200"
              >
                <Search className="w-4 h-4" /> Seguir mi reparación
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{s.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BARRA DE SEGUIMIENTO ── */}
      <section className="py-6 px-4 bg-gray-900/60 border-y border-gray-800">
        <div className="max-w-xl mx-auto">
          <p className="text-center text-gray-500 text-xs mb-2 uppercase tracking-wider">Seguimiento de reparación</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ej: EG-2025-0042"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono text-sm"
            />
            <a
              href="/seguimiento"
              className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl font-medium transition-colors text-sm flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Buscar</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section id="servicios" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-blue-400 text-sm font-medium uppercase tracking-widest mb-3">Lo que hacemos</p>
            <h2 className="text-4xl font-bold mb-4">Servicios de reparación</h2>
            <p className="text-gray-400 text-lg max-w-xl">Reparamos todo tipo de equipos electrónicos con garantía escrita en cada trabajo.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((s) => (
              <div key={s.title} className={`relative bg-gradient-to-b ${s.color} border border-gray-800 ${s.border} rounded-2xl p-6 transition-all duration-300`}>
                <div className={`p-3 ${s.iconColor} rounded-xl w-fit mb-5`}>
                  {s.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm mb-5 leading-relaxed">{s.desc}</p>
                <ul className="space-y-2">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POR QUÉ ELEGIRNOS ── */}
      <section className="py-24 px-4 bg-gray-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">¿Por qué elegirnos?</h2>
            <p className="text-gray-400 text-lg">Más de 10 años reparando equipos en Rio Gallegos</p>
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

      {/* ── PROYECTOS ── */}
      <section id="proyectos" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-blue-400 text-sm font-medium uppercase tracking-widest mb-3">Lo que construimos</p>
            <h2 className="text-4xl font-bold mb-4">Proyectos</h2>
            <p className="text-gray-400 text-lg max-w-xl">Además de reparar equipos, desarrollamos herramientas digitales para mejorar la experiencia del servicio técnico.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PROJECTS.map((p) => (
              <div key={p.title} className={`relative bg-gradient-to-b ${p.color} border border-gray-800 ${p.border} rounded-2xl p-6 transition-all duration-300 flex flex-col`}>
                <div className={`p-3 ${p.iconColor} rounded-xl w-fit mb-5`}>
                  {p.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-5 flex-1">{p.desc}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {p.tags.map(t => (
                    <span key={t} className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
                {p.link && (
                  <a href={p.link} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
                    <ExternalLink className="w-4 h-4" /> Ver proyecto
                  </a>
                )}
                {!p.link && (
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <FolderOpen className="w-4 h-4" /> Uso interno
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESCARGAS ── */}
      <section id="descargas" className="py-24 px-4 bg-gray-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-blue-400 text-sm font-medium uppercase tracking-widest mb-3">Recursos gratuitos</p>
            <h2 className="text-4xl font-bold mb-4">Descargas</h2>
            <p className="text-gray-400 text-lg max-w-xl">Herramientas que usamos y recomendamos para diagnosticar, optimizar y mantener tu equipo en buen estado.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DOWNLOADS.map((d) => (
              <a
                key={d.title}
                href={d.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-2xl p-5 transition-all duration-200 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2.5 bg-blue-600/15 rounded-xl text-blue-400 flex-shrink-0">
                    {d.icon}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${d.tagColor}`}>{d.tag}</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1 group-hover:text-blue-400 transition-colors">{d.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{d.desc}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-800">
                  <span className="text-xs text-gray-600">{d.size}</span>
                  <span className="flex items-center gap-1.5 text-xs text-blue-400 group-hover:text-blue-300 transition-colors font-medium">
                    <Download className="w-3.5 h-3.5" /> Descargar gratis
                  </span>
                </div>
              </a>
            ))}
          </div>

          <p className="text-center text-gray-600 text-xs mt-8">
            Todos los programas son gratuitos y de terceros. ElectroGamez no se responsabiliza por su uso.
          </p>
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

      {/* ── RESEÑA GOOGLE ── */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <a
            href={REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row items-center gap-6 bg-amber-950/30 border border-amber-700/40 hover:border-amber-500/60 rounded-2xl px-8 py-7 transition-all group"
          >
            <div className="flex-shrink-0">
              {reviewQr
                ? <img src={reviewQr} alt="QR reseña Google" className="w-24 h-24 rounded-lg" />
                : <div className="w-24 h-24 rounded-lg bg-gray-800 animate-pulse" />}
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1 mb-2">
                {[0,1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                ¿Te gustó nuestro servicio?
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Escaneá el QR o tocá acá para dejarnos tu reseña en Google. ¡Nos ayuda un montón!
              </p>
            </div>
          </a>
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
                    <p className="font-semibold group-hover:text-green-400 transition-colors">11-5697-5880</p>
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

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-600/20 rounded-xl text-purple-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Dirección</p>
                    <p className="font-semibold">Los Pozos 458, Rio Gallegos</p>
                  </div>
                </div>

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

            <p className="text-gray-600 text-sm text-center">
              © {new Date().getFullYear()} ElectroGamez · Los Pozos 458, Rio Gallegos · Alias: <span className="text-gray-500">Electrogamez</span>
            </p>

            {/* Enlace admin discreto — solo visible si sabés que existe */}
            <a href="/login" className="text-gray-800 hover:text-gray-600 text-xs transition-colors">
              ·
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
