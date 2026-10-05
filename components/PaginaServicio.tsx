import Link from 'next/link'

// Plantilla compartida para las páginas de servicio (PC, notebook, mantenimiento).
// Mismo diseño que /reparacion-playstation-rio-gallegos. ARCHIVO NUEVO.

export type Falla = { nombre: string; sintoma: string; tipo: string }
export type Precio = { servicio: string; precio: string }
export type Faq = { q: string; a: string }

export type ServicioData = {
  slug: string
  eyebrow: string
  tituloAntes: string
  tituloDestacado: string
  lead: string
  img: string
  imgAlt: string
  fallasTitulo: string
  fallas: Falla[]
  precios: Precio[]
  faqs: Faq[]
  waTexto: string
  cierre: string
}

const WA_NUM = '5491156975880'

const pasos = [
  { t: 'Consulta', d: 'Escribinos por WhatsApp con el equipo y la falla. Coordinamos retiro o entrega en taller.' },
  { t: 'Diagnóstico 24 h', d: 'Revisamos el equipo y te pasamos el presupuesto escrito antes de tocar nada.' },
  { t: 'Reparación', d: 'Con tu aprobación reparamos. Seguís el estado online con tu código.' },
  { t: 'Entrega con garantía', d: 'Probamos el equipo y te lo entregamos con garantía escrita.' },
]

const resenas = [
  { n: 'Karina Miranda', t: 'Una excelente atención inmediata... super recomendable!!!' },
  { n: 'Rodrigo Diaz', t: 'Excelente atención, muy responsable y rápido.' },
  { n: 'Madeleine Devetac', t: 'Excelente atención y servicio! Muy recomendable.' },
]

export function servicioJsonLd(d: ServicioData, nombreServicio: string) {
  const url = `https://electrogamez.ar/${d.slug}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: nombreServicio,
        serviceType: nombreServicio,
        areaServed: { '@type': 'City', name: 'Río Gallegos' },
        url,
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
        mainEntity: d.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  }
}

function Badge({ tipo }: { tipo: string }) {
  const cls = tipo === 'Microsoldadura' ? 'bg-amber-400/15 text-amber-300' : 'bg-blue-500/15 text-blue-300'
  return <span className={`whitespace-nowrap rounded-md px-2 py-0.5 font-mono text-[11px] ${cls}`}>{tipo}</span>
}

export default function PaginaServicio({ d, jsonLd }: { d: ServicioData; jsonLd: object }) {
  const wa = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(d.waTexto)}`
  return (
    <main className="min-h-screen bg-[#0b0d14] text-gray-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-5xl px-5">
        <nav className="py-4 text-sm text-gray-400" aria-label="Ruta">
          <Link href="/" className="text-sky-400 hover:underline">Inicio</Link> › Servicios › {d.tituloDestacado}
        </nav>

        {/* Hero */}
        <div className="grid items-center gap-10 pb-14 pt-4 md:grid-cols-[1.2fr_.8fr]">
          <div className="flex flex-col gap-4">
            <span className="font-mono text-xs uppercase tracking-widest text-sky-400">{d.eyebrow}</span>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              {d.tituloAntes} <span className="text-sky-400">{d.tituloDestacado}</span> en Río Gallegos
            </h1>
            <p className="max-w-xl text-lg text-gray-400">{d.lead}</p>
            <div className="flex flex-wrap gap-3">
              <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-green-500 px-5 py-3 font-semibold text-black hover:bg-green-400">
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
          <img src={d.img} alt={d.imgAlt} className="w-full rounded-2xl border border-white/10 object-cover" />
        </div>

        {/* Fallas */}
        <section className="border-t border-white/10 py-14">
          <span className="font-mono text-xs uppercase tracking-widest text-sky-400">Qué hacemos</span>
          <h2 className="mt-1 text-3xl font-bold">{d.fallasTitulo}</h2>
          <ul className="mt-7 grid gap-x-8 md:grid-cols-2">
            {d.fallas.map((f) => (
              <li key={f.nombre} className="border-t border-white/10 py-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold">{f.nombre}</span>
                  <Badge tipo={f.tipo} />
                </div>
                <p className="mt-1 text-sm text-gray-400">{f.sintoma}</p>
              </li>
            ))}
          </ul>
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
                  <th className="border-b border-white/10 p-3 font-normal">Desde</th>
                </tr>
              </thead>
              <tbody>
                {d.precios.map((p) => (
                  <tr key={p.servicio}>
                    <td className="border-b border-white/10 p-3">{p.servicio}</td>
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
          <h2 className="mt-1 text-3xl font-bold">Antes de traer tu equipo</h2>
          <div className="mt-4">
            {d.faqs.map((f) => (
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
              <h2 className="text-3xl font-bold">{d.cierre}</h2>
              <p className="mt-2 font-mono text-sm text-gray-400">
                Los Pozos 458, Río Gallegos · Tel. <b className="text-white">2966-383251</b> · WhatsApp <b className="text-white">11 5697-5880</b>
              </p>
            </div>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-green-500 px-5 py-3 font-semibold text-black hover:bg-green-400">
              Pedir presupuesto
            </a>
          </div>
        </section>

        <nav className="border-t border-white/10 py-8 text-sm text-gray-400">
          Otros servicios:{' '}
          <Link href="/reparacion-playstation-rio-gallegos" className="text-sky-400 hover:underline">PlayStation</Link> ·{' '}
          <Link href="/reparacion-pc-rio-gallegos" className="text-sky-400 hover:underline">PC</Link> ·{' '}
          <Link href="/reparacion-notebook-rio-gallegos" className="text-sky-400 hover:underline">Notebooks</Link> ·{' '}
          <Link href="/mantenimiento-pc-rio-gallegos" className="text-sky-400 hover:underline">Mantenimiento</Link>
        </nav>
      </div>
    </main>
  )
}
