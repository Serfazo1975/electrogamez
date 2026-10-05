import type { Metadata } from 'next'
import Link from 'next/link'

// Ruta: app/reparacion-playstation-rio-gallegos/page.tsx
// Página NUEVA. No modifica nada existente del sitio.

const WA = 'https://wa.me/5491156975880?text=Hola%20ElectroGamez!%20Tengo%20una%20PlayStation%20para%20reparar.'
const PAGE_URL = 'https://electrogamez.ar/reparacion-playstation-rio-gallegos'

export const metadata: Metadata = {
  title: 'Reparación PS5 y PS4 en Río Gallegos | HDMI, luz azul, no enciende | ElectroGamez',
  description:
    'Reparación de PlayStation 5 y PlayStation 4 en Río Gallegos: cambio de HDMI, luz azul, no enciende, lectora y limpieza. Microsoldadura, diagnóstico en 24h y garantía escrita.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Reparación PS5 y PS4 en Río Gallegos | ElectroGamez',
    description: 'HDMI, luz azul, no enciende. Microsoldadura, diagnóstico en 24h y garantía escrita.',
    url: PAGE_URL,
    siteName: 'ElectroGamez',
    locale: 'es_AR',
    type: 'website',
    images: [{ url: 'https://electrogamez.ar/svc-playstation.jpg' }],
  },
}

type Falla = { nombre: string; sintoma: string; tipo: 'Microsoldadura' | 'Mantenimiento' | 'Reparación' }

const ps5: Falla[] = [
  { nombre: 'Puerto HDMI roto', sintoma: 'Prende pero no da imagen, o la imagen se corta al mover el cable.', tipo: 'Microsoldadura' },
  { nombre: 'No enciende', sintoma: 'No hace nada al tocar el botón, o titila y se apaga.', tipo: 'Microsoldadura' },
  { nombre: 'Ruido o recalentamiento', sintoma: 'Ventilador ruidoso, se apaga sola jugando. Limpieza y metal líquido.', tipo: 'Mantenimiento' },
  { nombre: 'Lectora Blu-ray', sintoma: 'No lee discos, no los toma o hace ruido al expulsar.', tipo: 'Reparación' },
]

const ps4: Falla[] = [
  { nombre: 'Luz azul de la muerte', sintoma: 'Queda la luz azul titilando y no da video.', tipo: 'Microsoldadura' },
  { nombre: 'Puerto HDMI roto', sintoma: 'Sin imagen en el televisor o imagen intermitente.', tipo: 'Microsoldadura' },
  { nombre: 'Se apaga o hace mucho ruido', sintoma: 'Polvo y pasta térmica seca. Limpieza profunda y cambio de pasta.', tipo: 'Mantenimiento' },
  { nombre: 'Fuente y lectora', sintoma: 'No enciende con un pitido, o no lee los discos.', tipo: 'Reparación' },
]

const precios = [
  { servicio: 'Diagnóstico y presupuesto escrito', consola: 'PS4 · PS5', precio: '$20.000*' },
  { servicio: 'Limpieza profunda + pasta térmica', consola: 'PS4 · PS5', precio: '$55.000' },
  { servicio: 'Cambio de puerto HDMI', consola: 'PS5', precio: '$195.000' },
  { servicio: 'Cambio de puerto HDMI', consola: 'PS4', precio: 'Consultar' },
  { servicio: 'Luz azul / no enciende', consola: 'PS4 · PS5', precio: 'Según diagnóstico' },
]

const pasos = [
  { t: 'Consulta', d: 'Escribinos por WhatsApp con el modelo y la falla. Coordinamos retiro o entrega en taller.' },
  { t: 'Diagnóstico 24 h', d: 'Revisamos la placa y te pasamos el presupuesto escrito antes de tocar nada.' },
  { t: 'Reparación', d: 'Con tu aprobación reparamos. Seguís el estado online con tu código.' },
  { t: 'Entrega con garantía', d: 'Probamos la consola jugando y te la entregamos con garantía escrita.' },
]

const resenas = [
  { n: 'Karina Miranda', t: 'Una excelente atención inmediata... super recomendable!!!' },
  { n: 'Rodrigo Diaz', t: 'Excelente atención, muy responsable y rápido.' },
  { n: 'Madeleine Devetac', t: 'Excelente atención y servicio! Muy recomendable.' },
]

const faqs = [
  { q: '¿Cuánto tarda la reparación de una PS5?', a: 'El diagnóstico está en 24 horas. Un cambio de HDMI suele quedar en 2 a 4 días hábiles, según la disponibilidad del repuesto.' },
  { q: '¿Se pierden mis partidas o juegos?', a: 'No. En reparaciones de HDMI, encendido o limpieza no tocamos el disco. Si hay que cambiar el almacenamiento te avisamos antes.' },
  { q: '¿Reparan joysticks DualSense y DualShock?', a: 'Sí. Consultanos por WhatsApp con el modelo y la falla (drift, botones, batería o puerto de carga).' },
  { q: '¿Tiene garantía?', a: 'Todas las reparaciones incluyen garantía por escrito sobre el trabajo realizado y el repuesto colocado.' },
  { q: '¿Retiran la consola a domicilio?', a: 'Sí, en Río Gallegos coordinamos retiro y entrega. Escribinos y acordamos día y horario.' },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Reparación de PlayStation 5 y PlayStation 4',
      serviceType: 'Reparación de consolas',
      areaServed: { '@type': 'City', name: 'Río Gallegos' },
      url: PAGE_URL,
      provider: {
        '@type': 'LocalBusiness',
        name: 'ElectroGamez',
        telephone: '+542966383251',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Los Pozos 458',
          addressLocality: 'Río Gallegos',
          addressRegion: 'Santa Cruz',
          addressCountry: 'AR',
        },
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
}

function Badge({ tipo }: { tipo: Falla['tipo'] }) {
  const cls = tipo === 'Microsoldadura' ? 'bg-amber-400/15 text-amber-300' : 'bg-blue-500/15 text-blue-300'
  return <span className={`whitespace-nowrap rounded-md px-2 py-0.5 font-mono text-[11px] ${cls}`}>{tipo}</span>
}

function Consola({ titulo, modelos, fallas }: { titulo: string; modelos: string; fallas: Falla[] }) {
  return (
    <article className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="text-2xl font-bold">
        {titulo} <span className="ml-2 font-mono text-xs font-normal text-gray-400">{modelos}</span>
      </h3>
      <ul className="mt-4">
        {fallas.map((f) => (
          <li key={f.nombre} className="border-t border-white/10 py-3">
            <div className="flex items-start justify-between gap-3">
              <span className="font-semibold">{f.nombre}</span>
              <Badge tipo={f.tipo} />
            </div>
            <p className="mt-1 text-sm text-gray-400">{f.sintoma}</p>
          </li>
        ))}
      </ul>
    </article>
  )
}

export default function ReparacionPlayStationPage() {
  return (
    <main className="min-h-screen bg-[#0b0d14] text-gray-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-5xl px-5">
        <nav className="py-4 text-sm text-gray-400" aria-label="Ruta">
          <Link href="/" className="text-sky-400 hover:underline">Inicio</Link> › Servicios › Reparación PlayStation
        </nav>

        {/* Hero */}
        <div className="grid items-center gap-10 pb-14 pt-4 md:grid-cols-[1.2fr_.8fr]">
          <div className="flex flex-col gap-4">
            <span className="font-mono text-xs uppercase tracking-widest text-sky-400">Servicio técnico · Río Gallegos, Santa Cruz</span>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Reparación de <span className="text-sky-400">PS5 y PS4</span> en Río Gallegos
            </h1>
            <p className="max-w-xl text-lg text-gray-400">
              HDMI, luz azul, consola que no enciende, lectora o ruido de ventilador. Reparamos a nivel componente con
              microsoldadura bajo microscopio. Diagnóstico en 24 horas y garantía escrita.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={WA} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-green-500 px-5 py-3 font-semibold text-black hover:bg-green-400">
                Consultar por WhatsApp
              </a>
              <Link href="/seguimiento" className="rounded-xl border border-white/15 px-5 py-3 font-semibold hover:bg-white/5">
                Seguir mi reparación
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-gray-400">
              <span className="rounded-full border border-white/10 px-3 py-1"><b className="text-white">5.0 ★</b> en Google</span>
              <span className="rounded-full border border-white/10 px-3 py-1"><b className="text-white">15+</b> años en Río Gallegos</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Garantía <b className="text-white">escrita</b></span>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/svc-playstation.jpg" alt="Reparación de PlayStation en el taller de ElectroGamez, Río Gallegos" className="w-full rounded-2xl border border-white/10 object-cover" />
        </div>

        {/* Fallas */}
        <section className="border-t border-white/10 py-14">
          <span className="font-mono text-xs uppercase tracking-widest text-sky-400">Fallas que reparamos</span>
          <h2 className="mt-1 text-3xl font-bold">¿Qué le pasa a tu consola?</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <Consola titulo="PlayStation 5" modelos="Fat · Slim · Digital · Pro" fallas={ps5} />
            <Consola titulo="PlayStation 4" modelos="Fat · Slim · Pro" fallas={ps4} />
          </div>
        </section>

        {/* Precios */}
        <section className="border-t border-white/10 py-14">
          <span className="font-mono text-xs uppercase tracking-widest text-sky-400">Precios de referencia</span>
          <h2 className="mt-1 text-3xl font-bold">¿Cuánto cuesta?</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left tabular-nums">
              <thead>
                <tr className="font-mono text-xs uppercase tracking-wider text-gray-400">
                  <th className="border-b border-white/10 p-3 font-normal">Servicio</th>
                  <th className="border-b border-white/10 p-3 font-normal">Consola</th>
                  <th className="border-b border-white/10 p-3 font-normal">Desde</th>
                </tr>
              </thead>
              <tbody>
                {precios.map((p, i) => (
                  <tr key={i}>
                    <td className="border-b border-white/10 p-3">{p.servicio}</td>
                    <td className="border-b border-white/10 p-3">{p.consola}</td>
                    <td className="whitespace-nowrap border-b border-white/10 p-3 font-mono">{p.precio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-gray-400">
            * El diagnóstico se descuenta si reparás con nosotros. Los precios varían según el modelo y el estado del equipo.
          </p>
        </section>

        {/* Proceso */}
        <section className="border-t border-white/10 py-14">
          <span className="font-mono text-xs uppercase tracking-widest text-sky-400">Cómo trabajamos</span>
          <h2 className="mt-1 text-3xl font-bold">De la consulta a la entrega</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pasos.map((p, i) => (
              <div key={p.t} className="border-t-2 border-blue-500 pt-3">
                <span className="font-mono text-xs uppercase tracking-wider text-sky-400">Paso {i + 1}</span>
                <h3 className="my-1 text-lg font-bold">{p.t}</h3>
                <p className="text-sm text-gray-400">{p.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reseñas */}
        <section className="border-t border-white/10 py-14">
          <span className="font-mono text-xs uppercase tracking-widest text-sky-400">Reseñas verificadas en Google</span>
          <h2 className="mt-1 text-3xl font-bold">Lo que dicen nuestros clientes</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {resenas.map((r) => (
              <div key={r.n} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="tracking-widest text-amber-400">★★★★★</div>
                <p className="my-2">{`"${r.t}"`}</p>
                <span className="text-sm text-gray-400">{r.n}</span>
              </div>
            ))}
          </div>
          <a href="https://maps.app.goo.gl/AXvJWjFLkQGkzNrVA" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-sky-400 hover:underline">
            Ver todas las reseñas en Google Maps
          </a>
        </section>

        {/* FAQ */}
        <section className="border-t border-white/10 py-14">
          <span className="font-mono text-xs uppercase tracking-widest text-sky-400">Preguntas frecuentes</span>
          <h2 className="mt-1 text-3xl font-bold">Antes de traer tu PlayStation</h2>
          <div className="mt-4">
            {faqs.map((f) => (
              <details key={f.q} className="border-b border-white/10 py-4">
                <summary className="cursor-pointer font-semibold">{f.q}</summary>
                <p className="mt-2 max-w-3xl text-gray-400">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Cierre */}
        <section className="py-14">
          <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/20 to-sky-500/5 p-8">
            <div>
              <h2 className="text-3xl font-bold">¿Tu PlayStation no anda?</h2>
              <p className="mt-2 font-mono text-sm text-gray-400">
                Los Pozos 458, Río Gallegos · Tel. <b className="text-white">2966-383251</b> · WhatsApp <b className="text-white">11 5697-5880</b>
              </p>
            </div>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-green-500 px-5 py-3 font-semibold text-black hover:bg-green-400">
              Pedir presupuesto
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}
