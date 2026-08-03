'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Zap, Search, ShoppingCart, Plus, Minus, Trash2, X, Truck,
  ImageIcon, Edit3, Lock, Check, MessageCircle, CreditCard,
  Copy, ArrowRight, ArrowLeft, Loader2
} from 'lucide-react'

// ─── DATOS DEL NEGOCIO (editá acá si cambian) ────────────────────────────────
const ALIAS = 'ELECTROGAMEZ'
const WHATSAPP = '5491156975880' // 54 9 11 5697 5880

// ─── TIPOS ────────────────────────────────────────────────────────────────────
interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  imagen: string
  mpLink: string
  stock: boolean
  orden: number
  fechaAgregado: string
}
interface CartItem { id: string; qty: number }
type Draft = Omit<Producto, 'fechaAgregado' | 'orden'> & { orden?: number }

const money = (n: number) => '$' + Number(n || 0).toLocaleString('es-AR')

function normalizarTel(tel: string): string {
  let n = String(tel || '').replace(/\D/g, '').replace(/^0+/, '')
  if (n.startsWith('54')) n = n.slice(2)
  n = n.replace(/^9/, '').replace(/15(?=\d{6,8}$)/, '')
  return '549' + n
}

const blankDraft = (): Draft => ({ id: '', nombre: '', descripcion: '', precio: 0, categoria: '', imagen: '', mpLink: '', stock: true })

// ─── COMPONENTE ───────────────────────────────────────────────────────────────
export default function TiendaPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('Todos')
  const [cartOpen, setCartOpen] = useState(false)
  const [checkout, setCheckout] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const [adminMode, setAdminMode] = useState(false)
  const [adminAuth, setAdminAuth] = useState(false)
  const [pwdInput, setPwdInput] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [editing, setEditing] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)

  const [co, setCo] = useState({ nombre: '', tel: '', dir: '', ref: '' })

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2600) }

  const loadProductos = useCallback(async () => {
    try {
      const r = await fetch('/api/productos', { cache: 'no-store' })
      const data = await r.json()
      setProductos(Array.isArray(data) ? data : [])
    } catch { setProductos([]) }
    setLoading(false)
  }, [])

  useEffect(() => { loadProductos() }, [loadProductos])

  const cats = useMemo(() => ['Todos', ...Array.from(new Set(productos.map(p => p.categoria).filter(Boolean)))], [productos])
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return productos.filter(p => {
      const okCat = activeCat === 'Todos' || p.categoria === activeCat
      const okQ = !q || (p.nombre + ' ' + p.descripcion + ' ' + p.categoria).toLowerCase().includes(q)
      return okCat && okQ
    })
  }, [productos, search, activeCat])

  const cartTotal = useMemo(() => cart.reduce((s, i) => { const p = productos.find(x => x.id === i.id); return s + (p ? p.precio * i.qty : 0) }, 0), [cart, productos])
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  const addToCart = (id: string) => {
    const p = productos.find(x => x.id === id); if (!p || !p.stock) return
    setCart(prev => { const it = prev.find(x => x.id === id); return it ? prev.map(x => x.id === id ? { ...x, qty: x.qty + 1 } : x) : [...prev, { id, qty: 1 }] })
    showToast('Agregado al carrito'); setCartOpen(true)
  }
  const chgQty = (id: string, d: number) => setCart(prev => prev.map(x => x.id === id ? { ...x, qty: x.qty + d } : x).filter(x => x.qty > 0))
  const removeItem = (id: string) => setCart(prev => prev.filter(x => x.id !== id))

  const singleMp = cart.length === 1 && cart[0].qty === 1 ? productos.find(p => p.id === cart[0].id) : null
  const mpAvailable = singleMp?.mpLink
  const copyAlias = () => { navigator.clipboard?.writeText(ALIAS).then(() => showToast('Alias copiado')).catch(() => showToast('Alias: ' + ALIAS)) }
  const payMp = () => { if (mpAvailable) window.open(singleMp!.mpLink, '_blank', 'noopener'); showToast('Después de pagar, confirmá por WhatsApp') }
  const confirmOrder = () => {
    if (!co.nombre || !co.tel || !co.dir) { showToast('Completá nombre, teléfono y dirección', false); return }
    const lines = cart.map(i => { const p = productos.find(x => x.id === i.id)!; return `• ${i.qty}x ${p.nombre} — ${money(p.precio * i.qty)}` })
    let msg = `¡Hola ElectroGamez! 👾 Quiero hacer un pedido:\n\n${lines.join('\n')}\n\n`
    msg += `*Total: ${money(cartTotal)}*\n_Envío a domicilio sin cargo_\n\n📦 *Datos de envío*\nNombre: ${co.nombre}\nTel: ${co.tel}\nDirección: ${co.dir}\n`
    if (co.ref) msg += `Referencias: ${co.ref}\n`
    msg += `\n💳 Pago: transferencia al alias *${ALIAS}*`
    window.open(`https://wa.me/${normalizarTel(WHATSAPP)}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
    showToast('Abriendo WhatsApp con tu pedido...')
  }

  const tryLogin = async () => {
    setLoggingIn(true)
    try {
      const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwdInput }) })
      if (r.ok) { setAdminAuth(true); setPwdInput('') }
      else showToast('Contraseña incorrecta', false)
    } catch { showToast('Error de conexión', false) }
    setLoggingIn(false)
  }

  const saveProduct = async () => {
    if (!editing) return
    if (!editing.nombre.trim()) { showToast('Poné un nombre', false); return }
    if (!editing.precio || editing.precio <= 0) { showToast('Poné un precio válido', false); return }
    setSaving(true)
    const body = JSON.stringify({
      nombre: editing.nombre, descripcion: editing.descripcion, precio: editing.precio,
      categoria: editing.categoria, imagen: editing.imagen, mpLink: editing.mpLink, stock: editing.stock,
    })
    try {
      const r = editing.id
        ? await fetch(`/api/productos/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body })
        : await fetch('/api/productos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
      if (r.ok) { setEditing(null); await loadProductos(); showToast('Producto guardado') }
      else { const e = await r.json().catch(() => ({})); showToast(e.error || 'No se pudo guardar', false) }
    } catch { showToast('Error de conexión', false) }
    setSaving(false)
  }

  const deleteProduct = async (id: string) => {
    const p = productos.find(x => x.id === id)
    if (!confirm(`¿Borrar "${p?.nombre}"?`)) return
    try {
      const r = await fetch(`/api/productos/${id}`, { method: 'DELETE' })
      if (r.ok) { await loadProductos(); showToast('Producto borrado') }
      else showToast('No se pudo borrar', false)
    } catch { showToast('Error de conexión', false) }
  }

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !editing) return
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        const max = 800; let { width: w, height: h } = img
        if (w > max || h > max) { if (w > h) { h = Math.round(h * max / w); w = max } else { w = Math.round(w * max / h); h = max } }
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h
        cv.getContext('2d')!.drawImage(img, 0, 0, w, h)
        setEditing(prev => prev ? { ...prev, imagen: cv.toDataURL('image/jpeg', 0.82) } : prev)
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file); e.target.value = ''
  }

  // ═══════════════════ ADMIN VIEW ═══════════════════
  if (adminMode) {
    if (!adminAuth) {
      return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
          <div className="w-full max-w-sm text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-gray-800 grid place-items-center mx-auto mb-5">
              <Lock className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Admin de la Tienda</h1>
            <p className="text-gray-400 text-sm mb-6">Ingresá con la misma contraseña del panel de reparaciones</p>
            <input type="password" value={pwdInput} onChange={e => setPwdInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loggingIn && tryLogin()} placeholder="Contraseña"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white outline-none focus:border-cyan-500 mb-3" />
            <button onClick={tryLogin} disabled={loggingIn || !pwdInput} className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-gray-950 font-semibold rounded-xl hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loggingIn && <Loader2 className="w-4 h-4 animate-spin" />} Ingresar
            </button>
            <button onClick={() => { setAdminMode(false); setPwdInput('') }} className="mt-4 text-gray-500 text-sm hover:text-gray-300">← Volver a la tienda</button>
          </div>
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <nav className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800/60">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">ElectroGamez</span>
            <span className="text-gray-500 text-sm">· Admin Tienda</span>
            <button onClick={() => { setAdminMode(false); setAdminAuth(false) }} className="ml-auto text-sm border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg transition">Salir</button>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setEditing(blankDraft())} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-gray-950 font-semibold px-4 py-2.5 rounded-xl hover:brightness-110 transition"><Plus className="w-4 h-4" /> Agregar producto</button>
            <button onClick={loadProductos} className="flex items-center gap-2 bg-gray-900 border border-gray-800 px-4 py-2.5 rounded-xl hover:border-gray-600 transition">Actualizar lista</button>
          </div>
          <div className="space-y-3">
            {loading && <div className="text-center py-12 text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}
            {!loading && productos.length === 0 && <div className="text-center py-16 text-gray-500"><p className="text-lg text-white mb-1">Todavía no hay productos</p><p>Tocá &quot;Agregar producto&quot; para empezar.</p></div>}
            {productos.map(p => (
              <div key={p.id} className="flex gap-3 items-center bg-gray-900 border border-gray-800 rounded-xl p-3">
                <div className="w-14 h-14 rounded-lg bg-gray-950 border border-gray-800 overflow-hidden shrink-0 grid place-items-center">
                  {p.imagen ? <img src={p.imagen} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-gray-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{p.nombre}</h4>
                  <p className="text-xs text-gray-400 font-mono">{money(p.precio)} · {p.categoria || '—'} · {p.stock ? 'En stock' : 'Sin stock'}{p.mpLink ? ' · MP ✓' : ''}</p>
                </div>
                <button onClick={() => setEditing({ id: p.id, nombre: p.nombre, descripcion: p.descripcion, precio: p.precio, categoria: p.categoria, imagen: p.imagen, mpLink: p.mpLink, stock: p.stock })} className="w-9 h-9 rounded-lg border border-gray-800 bg-gray-950 grid place-items-center text-gray-400 hover:text-white hover:border-gray-600 transition"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => deleteProduct(p.id)} className="w-9 h-9 rounded-lg border border-gray-800 bg-gray-950 grid place-items-center text-gray-400 hover:text-red-400 hover:border-red-500 transition"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>

        {editing && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto" onClick={() => !saving && setEditing(null)}>
            <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-lg my-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-800 sticky top-0 bg-gray-950 rounded-t-2xl">
                <h2 className="text-lg font-semibold">{editing.id ? 'Editar producto' : 'Nuevo producto'}</h2>
                <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-2">Foto del producto</label>
                  <label className={`block rounded-xl border cursor-pointer overflow-hidden ${editing.imagen ? 'border-gray-700' : 'border-dashed border-gray-700 hover:border-cyan-500 p-6 text-center'}`}>
                    {editing.imagen
                      ? <div className="relative"><img src={editing.imagen} alt="" className="w-full aspect-[4/3] object-cover" /><span className="absolute bottom-2 right-2 bg-gray-950/85 border border-gray-700 rounded-lg px-3 py-1.5 text-xs font-semibold">Cambiar</span></div>
                      : <div className="text-gray-400"><ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" /><p className="text-sm">Tocá para subir una foto</p><p className="text-xs text-gray-600 mt-1">Se ajusta automáticamente</p></div>}
                    <input type="file" accept="image/*" onChange={handleImg} className="hidden" />
                  </label>
                </div>
                <Field label="Nombre"><input value={editing.nombre} onChange={e => setEditing({ ...editing, nombre: e.target.value })} placeholder="Ej: Auriculares gamer RGB" className={inputCls} /></Field>
                <Field label="Descripción"><textarea value={editing.descripcion} onChange={e => setEditing({ ...editing, descripcion: e.target.value })} placeholder="Detalles, compatibilidad..." className={inputCls + ' min-h-[64px] resize-y'} /></Field>
                <Field label="Precio (ARS)"><input type="number" value={editing.precio || ''} onChange={e => setEditing({ ...editing, precio: Number(e.target.value) })} placeholder="0" className={inputCls} /></Field>
                <Field label="Categoría"><input value={editing.categoria} onChange={e => setEditing({ ...editing, categoria: e.target.value })} placeholder="Ej: Audio, Periféricos, Consolas" className={inputCls} /></Field>
                <Field label="Link de pago de MercadoPago (opcional)">
                  <input type="url" value={editing.mpLink} onChange={e => setEditing({ ...editing, mpLink: e.target.value })} placeholder="https://mpago.la/..." className={inputCls} />
                  <p className="text-xs text-gray-600 mt-1.5">Generalo en MercadoPago → &quot;Link de pago&quot;. Habilita el botón de pago online.</p>
                </Field>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={editing.stock} onChange={e => setEditing({ ...editing, stock: e.target.checked })} className="w-5 h-5 accent-cyan-500" />
                  <span className="text-sm">Disponible / en stock</span>
                </label>
              </div>
              <div className="flex gap-3 p-5 border-t border-gray-800 sticky bottom-0 bg-gray-950 rounded-b-2xl">
                <button onClick={() => setEditing(null)} disabled={saving} className="flex-1 py-3 border border-gray-700 rounded-xl hover:border-gray-500 transition disabled:opacity-50">Cancelar</button>
                <button onClick={saveProduct} disabled={saving} className="flex-[2] py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-gray-950 font-semibold rounded-xl hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar producto
                </button>
              </div>
            </div>
          </div>
        )}
        {toast && <Toast toast={toast} />}
      </div>
    )
  }

  // ═══════════════════ STORE VIEW ═══════════════════
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800/60">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center"><Zap className="w-4 h-4 text-white" /></div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">ElectroGamez</span>
            <span className="text-gray-500 text-sm hidden sm:inline">· Tienda</span>
          </a>
          <a href="/" className="ml-auto hidden sm:flex items-center gap-2 text-gray-400 hover:text-white text-sm transition"><ArrowLeft className="w-4 h-4" /> Volver al inicio</a>
          <button onClick={() => setCartOpen(true)} className="relative w-11 h-11 rounded-xl border border-gray-800 bg-gray-900 grid place-items-center hover:border-gray-600 transition sm:ml-3 ml-auto">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-gradient-to-r from-blue-500 to-cyan-400 text-gray-950 text-xs font-bold rounded-full grid place-items-center font-mono">{cartCount}</span>}
          </button>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 pt-10 pb-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-cyan-400 mb-4"><span className="w-6 h-px bg-cyan-400" />Servicio técnico · Río Gallegos</div>
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight max-w-2xl">Accesorios gaming y tecnología, <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">con envío sin cargo</span>.</h1>
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 rounded-full text-sm font-semibold"><Truck className="w-4 h-4" /> Envío a domicilio sin cargo en Río Gallegos</div>
      </section>

      <div className="max-w-6xl mx-auto px-4 mt-6 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar productos..." className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl outline-none focus:border-cyan-500 transition" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {cats.map(c => <button key={c} onClick={() => setActiveCat(c)} className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap border transition ${c === activeCat ? 'bg-gray-800 border-cyan-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'}`}>{c}</button>)}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6 pb-16 grid gap-4 grid-cols-2 lg:grid-cols-4">
        {loading && <div className="col-span-full text-center py-20 text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" /><p>Cargando productos...</p></div>}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500">
            <ShoppingCart className="w-14 h-14 mx-auto mb-4 text-gray-700" />
            <h3 className="text-lg text-white mb-1">{productos.length === 0 ? 'La tienda está por abrir' : 'No encontramos productos'}</h3>
            <p>{productos.length === 0 ? 'Muy pronto vas a ver nuestros productos acá.' : 'Probá con otra búsqueda o categoría.'}</p>
          </div>
        )}
        {!loading && filtered.map(p => (
          <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col hover:border-gray-600 hover:-translate-y-1 transition-all">
            <div className="aspect-[4/3] bg-gray-950 relative grid place-items-center overflow-hidden">
              {p.imagen ? <img src={p.imagen} alt={p.nombre} loading="lazy" className="w-full h-full object-cover" /> : <ImageIcon className="w-12 h-12 text-gray-700" />}
              <span className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 bg-gray-950/80 backdrop-blur border border-emerald-800/50 text-emerald-400 rounded-full text-[11px] font-semibold"><Truck className="w-3 h-3" /> Envío gratis</span>
              {!p.stock && <div className="absolute inset-0 bg-gray-950/70 grid place-items-center text-gray-300 font-semibold tracking-wide">Sin stock</div>}
            </div>
            <div className="p-3.5 sm:p-4 flex flex-col gap-1.5 flex-1">
              {p.categoria && <span className="text-[11px] font-semibold tracking-wide uppercase text-cyan-400">{p.categoria}</span>}
              <h3 className="font-semibold leading-tight">{p.nombre}</h3>
              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{p.descripcion}</p>
              <div className="font-mono font-bold text-xl mt-0.5">{money(p.precio)}</div>
              <button onClick={() => addToCart(p.id)} disabled={!p.stock} className="mt-auto pt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-gray-950 font-semibold text-sm hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed">
                <ShoppingCart className="w-4 h-4" /> Agregar
              </button>
            </div>
          </div>
        ))}
      </div>

      <footer className="border-t border-gray-800/60 py-8 text-center text-gray-500 text-sm">
        <p className="font-semibold text-gray-400">ElectroGamez Servicio Técnico RG</p>
        <p className="mt-1">Los Pozos 458 Dpto:8, Río Gallegos, Santa Cruz</p>
        <button onClick={() => setAdminMode(true)} className="mt-3 text-xs text-gray-600 hover:text-cyan-400 transition">· Panel de administración ·</button>
      </footer>

      {cartOpen && <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setCartOpen(false)} />}
      <aside className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-950 border-l border-gray-800 z-[60] flex flex-col transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold">{checkout ? 'Datos de envío y pago' : 'Tu pedido'}</h2>
          <button onClick={() => { setCartOpen(false); setCheckout(false) }} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
        </div>

        {!checkout ? (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-gray-500"><ShoppingCart className="w-14 h-14 mx-auto mb-3 text-gray-700" /><p>Tu carrito está vacío</p></div>
              ) : cart.map(i => {
                const p = productos.find(x => x.id === i.id); if (!p) return null
                return (
                  <div key={i.id} className="flex gap-3 py-3 border-b border-gray-800 last:border-0">
                    <div className="w-16 h-16 rounded-lg bg-gray-900 border border-gray-800 overflow-hidden shrink-0 grid place-items-center">{p.imagen ? <img src={p.imagen} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-gray-600" />}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold">{p.nombre}</h4>
                      <div className="font-mono font-bold text-sm text-cyan-400">{money(p.precio)}</div>
                      <div className="flex items-center mt-2 border border-gray-800 rounded-lg w-fit overflow-hidden">
                        <button onClick={() => chgQty(i.id, -1)} className="w-8 h-8 grid place-items-center bg-gray-900 hover:bg-gray-800"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="w-9 text-center font-mono font-bold text-sm">{i.qty}</span>
                        <button onClick={() => chgQty(i.id, 1)} className="w-8 h-8 grid place-items-center bg-gray-900 hover:bg-gray-800"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <button onClick={() => removeItem(i.id)} className="text-gray-600 hover:text-red-400 self-start p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )
              })}
            </div>
            {cart.length > 0 && (
              <div className="p-5 border-t border-gray-800 bg-gray-900">
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Subtotal</span><span className="font-mono">{money(cartTotal)}</span></div>
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Envío a domicilio</span><span className="text-emerald-400 font-semibold">Sin cargo</span></div>
                <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-800"><span>Total</span><span className="font-mono">{money(cartTotal)}</span></div>
                <button onClick={() => setCheckout(true)} className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-400 text-gray-950 font-semibold rounded-xl hover:brightness-110 transition">Continuar con el envío <ArrowRight className="w-4 h-4" /></button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <Field label="Nombre y apellido"><input value={co.nombre} onChange={e => setCo({ ...co, nombre: e.target.value })} placeholder="Tu nombre" className={inputCls} /></Field>
              <Field label="Teléfono / WhatsApp"><input type="tel" value={co.tel} onChange={e => setCo({ ...co, tel: e.target.value })} placeholder="2966 12-3456" className={inputCls} /></Field>
              <Field label="Dirección de entrega"><input value={co.dir} onChange={e => setCo({ ...co, dir: e.target.value })} placeholder="Calle, número, dpto" className={inputCls} /></Field>
              <Field label="Referencias (opcional)"><input value={co.ref} onChange={e => setCo({ ...co, ref: e.target.value })} placeholder="Entre calles, horario..." className={inputCls} /></Field>

              <div className="pt-2 font-semibold">Cómo querés pagar</div>
              <div className="border border-gray-800 rounded-xl p-4 bg-gray-900">
                <div className="flex items-center gap-2 font-semibold text-sm mb-1.5"><CreditCard className="w-4 h-4 text-cyan-400" /> Transferencia por alias</div>
                <p className="text-xs text-gray-400 leading-relaxed">Transferís el total al alias y confirmás el pedido por WhatsApp con el comprobante.</p>
                <div className="flex items-center gap-2 mt-3 px-3 py-2.5 bg-gray-950 border border-dashed border-gray-700 rounded-lg">
                  <span className="font-mono font-bold text-cyan-400 flex-1">{ALIAS}</span>
                  <button onClick={copyAlias} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs font-semibold hover:border-cyan-500 transition"><Copy className="w-3.5 h-3.5" /> Copiar</button>
                </div>
              </div>
              {mpAvailable && (
                <div className="border border-gray-800 rounded-xl p-4 bg-gray-900">
                  <div className="flex items-center gap-2 font-semibold text-sm mb-1.5"><CreditCard className="w-4 h-4 text-sky-400" /> Pagar con MercadoPago</div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-3">Pago online con tarjeta o dinero en cuenta.</p>
                  <button onClick={payMp} className="w-full py-3 bg-sky-500 text-sky-950 font-bold rounded-xl hover:brightness-110 transition">Ir a pagar con MercadoPago</button>
                </div>
              )}
              <p className="text-xs text-gray-600">Al confirmar, se abre WhatsApp con el detalle del pedido y tu dirección para coordinar la entrega.</p>
            </div>
            <div className="p-5 border-t border-gray-800 flex gap-3">
              <button onClick={() => setCheckout(false)} className="px-4 py-3.5 border border-gray-700 rounded-xl hover:border-gray-500 transition"><ArrowLeft className="w-5 h-5" /></button>
              <button onClick={confirmOrder} className="flex-1 flex items-center justify-center gap-2.5 py-3.5 bg-[#25d366] text-[#04231a] font-bold rounded-xl hover:brightness-105 transition"><MessageCircle className="w-5 h-5" /> Confirmar por WhatsApp</button>
            </div>
          </>
        )}
      </aside>

      {toast && <Toast toast={toast} />}
    </div>
  )
}

const inputCls = 'w-full px-3.5 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white outline-none focus:border-cyan-500 transition'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs font-semibold text-gray-400 block mb-1.5">{label}</label>{children}</div>
}

function Toast({ toast }: { toast: { msg: string; ok: boolean } }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2.5 bg-gray-900 border border-gray-700 rounded-xl px-5 py-3.5 shadow-2xl max-w-[90vw]">
      {toast.ok ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <X className="w-4 h-4 text-red-400 shrink-0" />}
      <span className="text-sm font-medium">{toast.msg}</span>
    </div>
  )
}
