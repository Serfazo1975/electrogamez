'use client'

import { useState } from 'react'
import {
  Monitor, Gamepad2, Wrench, Shield, Clock, Star,
  Phone, Mail, MapPin, ChevronRight, Zap, CheckCircle,
  Menu, X, Search
} from 'lucide-react'

const NAV_LINKS = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Testimonios', href: '#testimonios' },
  { label: 'Contacto', href: '#contacto' },
]

const SERVICES = [
  {
    icon: <Monitor className="w-8 h-8" />,
    title: 'Reparación de PC',
    desc: 'Diagnóstico, limpieza, cambio de componentes, instalación de Windows y optimización de rendimiento.',
    items: ['Cambio de pasta térmica', 'Actualización de RAM/SSD', 'Reparación de placa madre', 'Instalación de software'],
  },
  {
    icon: <Gamepad2 className="w-8 h-8" />,
    title: 'Reparación PlayStation',
    desc: 'Especialistas en PS4 y PS5. Chip HDMI, ventiladores, lectores de disco y más.',
    items: ['Chip HDMI PS5', 'Limpieza de ventiladores', 'Reparación lector blu-ray', 'Problemas de encendido'],
  },
  {
    icon: <Monitor className="w-8 h-8" />,
    title: 'Laptops',
    desc: 'Reparación de pantallas, teclados, bisagras, baterías y problemas de sobrecalentamiento.',
    items: ['Cambio de pantalla', 'Reparación de bisagras', 'Cambio de batería', 'Teclados y touchpad'],
  },
  {
    icon: <Wrench className="w-8 h-8" />,
    title: 'Mantenimiento',
    desc: 'Mantenimiento preventivo para extender la vida útil de tus equipos.',
    items: ['Limpieza interna profunda', 'Cambio de pasta térmica', 'Revisión general', 'Optimización de sistema'],
  },
]

const STATS = [
  { value: '+500', label: 'Equipos reparados' },
  { value: '5+', label: 'Años de experiencia' },
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
  const [trackCode, setTrackCode] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [formSent, setFormSent] = useState(false)

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormSent(true)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            ElectroGamez
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                {l.label}
              </a>
            ))}
            <a href="/seguimiento" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Search className="w-4 h-4" /> Seguir reparación
            </a>
            <a href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">
              Admin
            </a>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-gray-400" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-800 px-4 py-4 space-y-3 bg-gray-900">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="block text-gray-300 hover:text-white py-1" onClick={() => setMenuOpen(false)}>
                {l.label}
              </a>
            ))}
            <a href="/seguimiento" className="block text-blue-400 hover:text-blue-300 py-1" onClick={() => setMenuOpen(false)}>
              Seguir mi reparación
            </a>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-1.5 text-blue-400 text-sm mb-6">
              <Zap className="w-4 h-4" />
              Servicio técnico especializado en Santiago
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Tu PC o PlayStation{' '}
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                en manos expertas
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-8 max-w-2xl">
              Diagnóstico en 24 horas, reparaciones con garantía y precios transparentes.
              Especialistas en computadoras y consolas PlayStation.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <a href="#contacto" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
                Solicitar diagnóstico <ChevronRight className="w-5 h-5" />
              </a>
              <a href="/seguimiento" className="border border-gray-700 hover:border-gray-500 px-8 py-3 rounded-xl font-medium transition-all text-gray-300 hover:text-white flex items-center gap-2">
                <Search className="w-4 h-4" /> Seguir mi reparación
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{s.value}</div>
                  <div className="text-sm text-gray-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRACKING RÁPIDO ── */}
      <section className="py-8 px-4 bg-gray-800/40 border-y border-gray-700">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-400 text-sm mb-3">¿Dejaste un equipo? Revisa su estado ahora</p>
          <form
            className="flex gap-2"
            onSubmit={(e) => { e.preventDefault(); if (trackCode) window.location.href = `/seguimiento` }}
          >
            <input
              type="text"
              value={trackCode}
              onChange={(e) => setTrackCode(e.target.value.toUpperCase())}
              placeholder="Código de seguimiento — Ej: EG-2025-0042"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
            />
            <a
              href="/seguimiento"
              className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl font-medium transition-colors text-sm whitespace-nowrap"
            >
              Buscar
            </a>
          </form>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section id="servicios" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Nuestros servicios</h2>
            <p className="text-gray-400">Reparamos todo tipo de equipos con garantía escrita</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((s) => (
              <div key={s.title} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-colors group">
                <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400 w-fit mb-4 group-hover:bg-blue-600/30 transition-colors">
                  {s.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{s.desc}</p>
                <ul className="space-y-1.5">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
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
      <section id="nosotros" className="py-20 px-4 bg-gray-800/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">¿Por qué elegir ElectroGamez?</h2>
              <div className="space-y-5">
                {[
                  { icon: <Clock className="w-5 h-5 text-blue-400" />, title: 'Diagnóstico en 24 horas', desc: 'Te contamos qué tiene tu equipo y cuánto cuesta repararlo antes de empezar.' },
                  { icon: <Shield className="w-5 h-5 text-cyan-400" />, title: 'Garantía en todas las reparaciones', desc: 'Cada reparación tiene garantía escrita. Si falla, lo volvemos a reparar sin costo.' },
                  { icon: <Zap className="w-5 h-5 text-yellow-400" />, title: 'Precios transparentes', desc: 'Sin sorpresas. El precio que te cotizamos es el que pagas.' },
                  { icon: <Search className="w-5 h-5 text-green-400" />, title: 'Seguimiento en línea', desc: 'Revisa el estado de tu reparación en cualquier momento con tu código de seguimiento.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="p-2 bg-gray-800 rounded-lg h-fit">{item.icon}</div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-8 text-center">
              <Zap className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Servicio express disponible</h3>
              <p className="text-gray-400 mb-6">¿Urgente? Tenemos servicio prioritario con entrega en el día para equipos de trabajo.</p>
              <a href="#contacto" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 rounded-xl font-semibold">
                Consultar disponibilidad
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section id="testimonios" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Lo que dicen nuestros clientes</h2>
            <p className="text-gray-400">Más de 500 equipos reparados con satisfacción garantizada</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.device}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <section id="contacto" className="py-20 px-4 bg-gray-800/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Contáctanos</h2>
            <p className="text-gray-400">Escríbenos y te respondemos en menos de 1 hora</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400"><Phone className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm text-gray-400">Teléfono / WhatsApp</p>
                  <p className="font-semibold">+56 9 XXXX XXXX</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400"><Mail className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-semibold">contacto@electrogamez.cl</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400"><MapPin className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm text-gray-400">Ubicación</p>
                  <p className="font-semibold">Santiago, Chile</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400"><Clock className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm text-gray-400">Horario de atención</p>
                  <p className="font-semibold">Lun–Vie: 10:00 – 19:00</p>
                  <p className="font-semibold">Sáb: 10:00 – 14:00</p>
                </div>
              </div>
            </div>

            {/* Form */}
            {formSent ? (
              <div className="flex flex-col items-center justify-center bg-green-900/20 border border-green-700 rounded-2xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mb-3" />
                <h3 className="font-semibold text-lg mb-1">¡Mensaje enviado!</h3>
                <p className="text-gray-400 text-sm">Te responderemos a la brevedad.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Nombre</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Teléfono</label>
                    <input
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">¿Qué equipo tienes y cuál es el problema?</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Ej: Tengo una PS5 que no da imagen por HDMI..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 py-3 rounded-xl font-semibold transition-all"
                >
                  Enviar mensaje
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span className="font-bold text-white text-base bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            ElectroGamez
          </span>
          <p>© {new Date().getFullYear()} ElectroGamez. Santiago, Chile.</p>
          <div className="flex gap-6">
            <a href="/seguimiento" className="hover:text-white transition-colors">Seguir reparación</a>
            <a href="/dashboard" className="hover:text-white transition-colors">Admin</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
