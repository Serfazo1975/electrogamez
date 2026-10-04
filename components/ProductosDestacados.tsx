'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Truck, ImageIcon, ShoppingCart } from 'lucide-react'

// ============================================================
// components/ProductosDestacados.tsx — NUEVO
// Carrusel con 3-4 productos de la tienda en la portada, así la gente ve
// qué vendés sin tener que entrar. Lee /api/productos/destacados.
// Los elegís vos con ⭐ "Mostrar en la portada" en /tienda?admin=1.
// Si todavía no hay productos, la sección no se muestra (no queda vacía).
// ============================================================

interface Item {
  id: string
  nombre: string
  categoria: string
  precio: number
  imagen: string
}

const money = (n: number) => '$' + Number(n || 0).toLocaleString('es-AR')
const AUTOPLAY_MS = 4500

export default function ProductosDestacados() {
  const [items, setItems] = useState<Item[]>([])
  const [activo, setActivo] = useState(0)
  const [desborda, setDesborda] = useState(false)
  const pista = useRef<HTMLDivElement>(null)
  const pausado = useRef(false)

  useEffect(() => {
    let vivo = true
    fetch('/api/productos/destacados')
      .then(r => r.json())
      .then(d => { if (vivo && Array.isArray(d)) setItems(d) })
      .catch(() => {})
    return () => { vivo = false }
  }, [])

  // ancho de un paso = distancia entre el inicio de dos tarjetas seguidas
  const paso = useCallback(() => {
    const el = pista.current
    if (!el || el.children.length < 2) return 0
    return (el.children[1] as HTMLElement).offsetLeft - (el.children[0] as HTMLElement).offsetLeft
  }, [])

  const medir = useCallback(() => {
    const el = pista.current
    if (!el) return
    setDesborda(el.scrollWidth > el.clientWidth + 4)
  }, [])

  useEffect(() => {
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [items, medir])

  const ir = useCallback((i: number) => {
    const el = pista.current
    const p = paso()
    if (!el || !p) return
    const n = el.children.length
    const destino = ((i % n) + n) % n
    el.scrollTo({ left: destino * p, behavior: 'smooth' })
  }, [paso])

  const onScroll = () => {
    const el = pista.current
    const p = paso()
    if (!el || !p) return
    setActivo(Math.min(Math.round(el.scrollLeft / p), el.children.length - 1))
  }

  // Avance automático: solo si hay algo para deslizar, y respeta
  // "reducir movimiento" del sistema. Se frena al tocar / pasar el mouse.
  useEffect(() => {
    if (!desborda || items.length < 2) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => {
      if (pausado.current || document.hidden) return
      const el = pista.current
      if (!el) return
      const llegoAlFinal = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
      if (llegoAlFinal) el.scrollTo({ left: 0, behavior: 'smooth' })
      else el.scrollBy({ left: paso(), behavior: 'smooth' })
    }, AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [desborda, items, paso])

  if (items.length === 0) return null

  const pausar = () => { pausado.current = true }
  const seguir = () => { pausado.current = false }

  return (
    <section
      aria-label="Productos destacados de la tienda"
      className="px-4 py-14 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-cyan-400 text-sm font-medium uppercase tracking-widest mb-2">Tienda ElectroGamez</p>
            <h2 className="text-3xl font-bold">Productos destacados</h2>
            <p className="text-gray-400 mt-1.5 text-sm sm:text-base">
              Accesorios gaming y tecnología con envío a domicilio sin cargo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {desborda && (
              <>
                <button
                  type="button"
                  onClick={() => ir(activo - 1)}
                  aria-label="Producto anterior"
                  className="hidden sm:grid w-10 h-10 place-items-center rounded-full border border-gray-700 bg-gray-900/60 text-gray-300 hover:text-white hover:border-cyan-500 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => ir(activo + 1)}
                  aria-label="Producto siguiente"
                  className="hidden sm:grid w-10 h-10 place-items-center rounded-full border border-gray-700 bg-gray-900/60 text-gray-300 hover:text-white hover:border-cyan-500 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <a
              href="/tienda"
              className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-gray-950 text-sm font-semibold hover:brightness-110 transition"
            >
              <ShoppingCart className="w-4 h-4" /> Ver toda la tienda
            </a>
          </div>
        </div>

        <div
          ref={pista}
          onScroll={onScroll}
          onMouseEnter={pausar}
          onMouseLeave={seguir}
          onTouchStart={pausar}
          onTouchEnd={seguir}
          onFocus={pausar}
          onBlur={seguir}
          role="region"
          aria-roledescription="carrusel"
          aria-label="Productos"
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map(p => (
            <a
              key={p.id}
              href="/tienda"
              aria-label={`${p.nombre}, ${money(p.precio)}. Ver en la tienda`}
              className="neon-card group snap-start shrink-0 w-[78%] sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 hover:border-gray-600 transition-all"
            >
              <div className="aspect-[4/3] bg-gray-950 relative grid place-items-center overflow-hidden">
                {p.imagen
                  ? <img src={p.imagen} alt={p.nombre} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <ImageIcon className="w-12 h-12 text-gray-700" />}
                <span className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 bg-gray-950/80 backdrop-blur border border-emerald-800/50 text-emerald-400 rounded-full text-[11px] font-semibold">
                  <Truck className="w-3 h-3" /> Envío gratis
                </span>
              </div>
              <div className="p-4 flex flex-col gap-1.5">
                {p.categoria && <span className="text-[11px] font-semibold tracking-wide uppercase text-cyan-400">{p.categoria}</span>}
                <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-cyan-400 transition-colors">{p.nombre}</h3>
                <div className="font-mono font-bold text-xl mt-0.5">{money(p.precio)}</div>
              </div>
            </a>
          ))}
        </div>

        {desborda && items.length > 1 && (
          <div className="flex justify-center gap-2 mt-4" aria-hidden="true">
            {items.map((p, i) => (
              <button
                key={p.id}
                type="button"
                tabIndex={-1}
                onClick={() => ir(i)}
                className={`h-2 rounded-full transition-all ${i === activo ? 'w-6 bg-cyan-400' : 'w-2 bg-gray-700 hover:bg-gray-500'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
