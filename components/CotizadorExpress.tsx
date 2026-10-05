'use client'

import { useState } from 'react'

// ============================================================
// components/CotizadorExpress.tsx — ARCHIVO NUEVO
// Cotizador de 3 pasos (equipo → falla → urgencia) que muestra el
// precio de referencia y arma el mensaje de WhatsApp.
// Los precios salen de /admin/precios (mismos que "¿Cuánto cuesta?"):
// se buscan por palabra clave en el nombre del servicio. Si alguno no
// se encuentra, se usa el valor de respaldo de PRECIOS_RESPALDO.
// ============================================================

type PrecioWeb = { servicio?: string; precio?: string; nota?: string }
type Clave = 'diag' | 'limpieza' | 'hdmi5' | 'pantalla' | 'windows' | 'office' | 'emp'

const WA_NUM = '5491156975880'

const PRECIOS_RESPALDO: Record<string, string> = {
  diag: '20.000',
  limpieza: '55.000',
  hdmi5: '195.000',
  pantalla: '175.000',
  windows: '65.000',
}

const NOTAS: Record<string, string> = {
  limpieza: 'Limpieza interna profunda y cambio de pasta térmica.',
  hdmi5: 'Cambio de puerto HDMI con microsoldadura y garantía escrita.',
  pantalla: 'Incluye la pantalla nueva y la instalación.',
  windows: 'Instalación de Windows con drivers. Licencia original opcional.',
}

// Palabras que identifican cada precio en la lista de /admin/precios
const BUSQUEDA: Record<string, string[]> = {
  diag: ['diagnostico'],
  limpieza: ['limpieza'],
  hdmi5: ['hdmi', '5'],
  pantalla: ['pantalla'],
  windows: ['windows'],
}

type Equipo = { id: string; ico: string; n: string; s: string; fallas: [string, Clave][] }

const EQUIPOS: Equipo[] = [
  { id: 'ps5', ico: '🎮', n: 'PlayStation 5', s: 'Fat, Slim, Digital, Pro', fallas: [
    ['No da imagen (HDMI)', 'hdmi5'], ['No enciende', 'diag'], ['Ruido o se calienta', 'limpieza'], ['No lee discos', 'diag'], ['Otra falla', 'diag']] },
  { id: 'ps4', ico: '🕹️', n: 'PlayStation 4', s: 'Fat, Slim, Pro', fallas: [
    ['Luz azul, sin imagen', 'diag'], ['No da imagen (HDMI)', 'diag'], ['Ruido o se apaga', 'limpieza'], ['No lee discos', 'diag'], ['Otra falla', 'diag']] },
  { id: 'ps3', ico: '🎮', n: 'PlayStation 3', s: 'Fat, Slim, Super Slim', fallas: [
    ['Luz amarilla, se apaga', 'diag'], ['No da imagen', 'diag'], ['Ruido o se calienta', 'limpieza'], ['No lee discos', 'diag'], ['Otra falla', 'diag']] },
  { id: 'nb', ico: '💻', n: 'Notebook', s: 'Todas las marcas', fallas: [
    ['Pantalla rota', 'pantalla'], ['Lenta o Windows dañado', 'windows'], ['Se calienta', 'limpieza'], ['Bisagras, batería o teclado', 'diag'],
    ['No enciende o no carga', 'diag'], ['Instalación de Office', 'office'], ['Otra falla', 'diag']] },
  { id: 'pc', ico: '🖥️', n: 'PC de escritorio', s: 'Hogar o gamer', fallas: [
    ['No enciende', 'diag'], ['Lenta o Windows dañado', 'windows'], ['Ruido o se calienta', 'limpieza'], ['Cambiar o mejorar piezas', 'diag'],
    ['Instalación de Office', 'office'], ['Otra falla', 'diag']] },
  { id: 'emp', ico: '🏢', n: 'Empresa', s: 'Servidores, redes, UPS', fallas: [
    ['Servidor', 'emp'], ['Red o WiFi', 'emp'], ['UPS', 'emp'], ['Impresoras', 'emp'], ['Mantenimiento mensual', 'emp']] },
]

type Urg = { id: string; n: string; s: string; extra?: boolean }
const URGENCIAS: Urg[] = [
  { id: 'normal', n: 'Normal', s: '2 a 5 días hábiles' },
  { id: 'rapida', n: 'Rápida', s: '24 a 48 horas' },
  { id: 'urgente', n: 'Urgente o fuera de horario', s: 'Hoy, noche o fin de semana · con costo adicional', extra: true },
]

function normalizar(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function precioDe(clave: string, lista: PrecioWeb[]): string {
  const palabras = BUSQUEDA[clave]
  if (palabras) {
    const fila = lista.find((p) => {
      const nombre = normalizar(p.servicio || '')
      return palabras.every((w) => nombre.includes(w))
    })
    const valor = (fila?.precio || '').replace(/^\$\s*/, '').trim()
    if (valor && /\d/.test(valor)) return valor
  }
  return PRECIOS_RESPALDO[clave] || ''
}

function Opcion({ activo, onClick, ico, titulo, sub }: { activo: boolean; onClick: () => void; ico?: string; titulo: string; sub?: string }) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={`flex flex-col gap-0.5 rounded-xl border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
        activo ? 'border-cyan-400 bg-cyan-400/10' : 'border-gray-800 bg-white/[0.02] hover:border-gray-600'
      }`}
    >
      {ico && <span className="mb-1 text-xl leading-none">{ico}</span>}
      <span className="text-sm font-semibold text-gray-100">{titulo}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </button>
  )
}

export default function CotizadorExpress({ precios = [] }: { precios?: PrecioWeb[] }) {
  const [equipo, setEquipo] = useState<Equipo | null>(null)
  const [falla, setFalla] = useState<[string, Clave] | null>(null)
  const [urg, setUrg] = useState<Urg | null>(null)

  const lista = Array.isArray(precios) ? precios : []
  const listo = equipo && falla && urg

  let titulo = 'Completá los 3 pasos'
  let detalle = 'El presupuesto final te lo damos por escrito después del diagnóstico.'
  let destacado = false
  let precioTxt = ''

  if (listo) {
    const k = falla[1]
    const diag = precioDe('diag', lista)
    if (k === 'emp') {
      titulo = 'A convenir'
      detalle = 'Visitamos tu empresa en toda la provincia de Santa Cruz y te pasamos una propuesta.'
      precioTxt = 'a convenir'
    } else if (k === 'diag') {
      titulo = 'Según diagnóstico'
      detalle = `Primero revisamos el equipo: diagnóstico desde $${diag}, que se descuenta si reparás con nosotros. Te pasamos el presupuesto escrito en 24 h.`
      precioTxt = `según diagnóstico (desde $${diag})`
    } else if (k === 'office') {
      titulo = 'Consultar precio'
      detalle = 'Instalación y activación de Microsoft Office. Te pasamos el precio según la versión que necesites.'
      precioTxt = 'a consultar'
    } else {
      const v = precioDe(k, lista)
      titulo = `desde $${v}`
      detalle = NOTAS[k] || ''
      destacado = true
      precioTxt = `desde $${v}`
    }
    if (urg.extra) precioTxt += ' + costo adicional por urgencia'
  }

  const mensaje = listo
    ? `Hola ElectroGamez! Usé el cotizador de la web.\nEquipo: ${equipo.n}\nFalla: ${falla[0]}\nUrgencia: ${urg.n} (${urg.s})\nPrecio de referencia: ${precioTxt}`
    : ''

  const reiniciar = () => { setEquipo(null); setFalla(null); setUrg(null) }

  return (
    <section id="cotizador" className="mx-auto max-w-4xl px-4 py-14">
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-400">Cotizador express</p>
      <h2 className="mb-2 text-3xl font-bold text-white">¿Cuánto me sale arreglarlo?</h2>
      <p className="mb-6 max-w-2xl text-gray-400">
        Elegí tu equipo, la falla y la urgencia. Te mostramos el precio de referencia y nos escribís por WhatsApp con todo ya cargado.
      </p>

      <div className="flex flex-col gap-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <div className="flex gap-2" aria-hidden="true">
          {[true, !!equipo, !!falla].map((on, i) => (
            <span key={i} className={`h-1 flex-1 rounded ${on ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-gray-800'}`} />
          ))}
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-white"><span className="mr-2 font-mono text-xs text-cyan-400">PASO 1</span>¿Qué equipo es?</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {EQUIPOS.map((e) => (
              <Opcion key={e.id} activo={equipo?.id === e.id} ico={e.ico} titulo={e.n} sub={e.s}
                onClick={() => { setEquipo(e); setFalla(null) }} />
            ))}
          </div>
        </div>

        <div className={equipo ? '' : 'pointer-events-none opacity-40'}>
          <h3 className="mb-3 font-semibold text-white"><span className="mr-2 font-mono text-xs text-cyan-400">PASO 2</span>¿Qué le pasa?</h3>
          {equipo ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {equipo.fallas.map((f) => (
                <Opcion key={f[0]} activo={falla?.[0] === f[0]} titulo={f[0]} onClick={() => setFalla(f)} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Primero elegí el equipo.</p>
          )}
        </div>

        <div className={falla ? '' : 'pointer-events-none opacity-40'}>
          <h3 className="mb-3 font-semibold text-white"><span className="mr-2 font-mono text-xs text-cyan-400">PASO 3</span>¿Para cuándo lo necesitás?</h3>
          <div className="grid gap-2 sm:grid-cols-3">
            {URGENCIAS.map((u) => (
              <Opcion key={u.id} activo={urg?.id === u.id} titulo={u.n} sub={u.s} onClick={() => setUrg(u)} />
            ))}
          </div>
        </div>

        <div className="grid gap-4 border-t border-dashed border-gray-800 pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-gray-400">Precio de referencia</div>
            <div className={`font-bold tabular-nums ${destacado ? 'text-4xl text-green-400' : 'text-2xl text-cyan-400'}`}>{titulo}</div>
            <p className="mt-1 max-w-xl text-sm text-gray-400">{detalle}</p>
            {listo && urg.extra && (
              <p className="mt-1 text-sm font-semibold text-amber-400">
                + Costo adicional por urgencia o fuera de horario. <span className="font-normal text-gray-400">Te lo confirmamos por WhatsApp.</span>
              </p>
            )}
          </div>
          {listo ? (
            <a
              href={`https://wa.me/${WA_NUM}?text=${encodeURIComponent(mensaje)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-green-500 px-5 py-3 text-center font-bold text-black hover:bg-green-400"
            >
              Enviar por WhatsApp
            </a>
          ) : (
            <span className="rounded-xl bg-gray-800 px-5 py-3 text-center font-bold text-gray-500">Enviar por WhatsApp</span>
          )}
          <p className="text-xs text-gray-500 sm:col-span-2">
            Precios orientativos. El presupuesto final depende del modelo, el estado del equipo y la disponibilidad de repuestos.
            La atención urgente o fuera de horario tiene un costo adicional que se confirma por WhatsApp.
          </p>
        </div>

        {equipo && (
          <button type="button" onClick={reiniciar} className="self-start text-sm text-cyan-400 hover:underline">
            Empezar de nuevo
          </button>
        )}
      </div>
    </section>
  )
}
