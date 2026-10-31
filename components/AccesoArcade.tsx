'use client'

// ============================================================
// components/AccesoArcade.tsx
// Acceso al juego ELECTRO-MAN desde el menú superior:
// un joystick de arcade + una escena animada (el chip persigue a los bugs
// asustados). Es solo un botón: avisa a <JuegoArcade /> con un evento y el
// juego se abre encima de la misma página. Todo con SVG, sin imágenes.
// ============================================================

export const EVENTO_ABRIR_JUEGO = 'abrir-electroman'

const ESTILO = `
  @keyframes arcPalanca { 0%,100% { transform: rotate(-13deg); } 50% { transform: rotate(13deg); } }
  @keyframes arcCorrer  { from { transform: translateX(-72px); } to { transform: translateX(118px); } }
  @keyframes arcRebote  { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-1.5px); } }
  .arc-palanca { transform-origin: 11px 18px; animation: arcPalanca 1.6s ease-in-out infinite; }
  .arc-correr  { animation: arcCorrer 4.6s linear infinite; }
  .arc-rebote  { animation: arcRebote 0.28s ease-in-out infinite; }
  .arc-escena  { -webkit-mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent);
                 mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent); }
  .arc-boton:hover .arc-joy { filter: drop-shadow(0 0 5px #38bdf8); }
  @media (prefers-reduced-motion: reduce) {
    .arc-palanca, .arc-correr, .arc-rebote { animation: none; }
    .arc-correr { transform: translateX(30px); }
  }
`

function Bug({ x }: { x: number }) {
  // bug asustado (azul), mirando hacia adelante
  return (
    <g transform={`translate(${x} 4)`}>
      <g className="arc-rebote">
      <path d="M2 -1 L0.5 -3.5 M11 -1 L12.5 -3.5" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round" />
      <rect x="0" y="0" width="13" height="12" rx="3" fill="#2563eb" />
      <path d="M0 3 L-2.5 3.8 M0 6.5 L-2.5 7.3 M0 10 L-2.5 10.8 M13 3 L15.5 3.8 M13 6.5 L15.5 7.3 M13 10 L15.5 10.8" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="4" cy="4.5" r="1.5" fill="#fde68a" />
      <circle cx="9" cy="4.5" r="1.5" fill="#fde68a" />
      <path d="M3 9 L4.5 8 L6.5 9 L8.5 8 L10 9" stroke="#fde68a" strokeWidth="0.9" fill="none" />
      </g>
    </g>
  )
}

export default function AccesoArcade({
  movil = false,
  className = '',
}: {
  movil?: boolean
  className?: string
}) {
  const abrir = () => window.dispatchEvent(new Event(EVENTO_ABRIR_JUEGO))

  return (
    <button
      type="button"
      onClick={abrir}
      title="Jugá ELECTRO-MAN"
      aria-label="Jugar ELECTRO-MAN, juego arcade"
      className={`arc-boton items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-gray-800/50 transition-colors ${className}`}
    >
      {/* dangerouslySetInnerHTML: mismo criterio que el resto del menú, evita errores de hidratación */}
      <style dangerouslySetInnerHTML={{ __html: ESTILO }} />

      {/* Joystick tipo arcade */}
      <svg className="arc-joy flex-shrink-0 transition-[filter]" width="34" height="28" viewBox="0 0 34 28" aria-hidden="true">
        <rect x="1.5" y="16" width="31" height="10" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
        <g className="arc-palanca">
          <line x1="11" y1="18" x2="11" y2="8" stroke="#94a3b8" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="11" cy="6" r="5" fill="#ef4444" />
          <circle cx="9.3" cy="4.3" r="1.5" fill="#fecaca" opacity="0.85" />
        </g>
        <circle cx="22" cy="21" r="2.7" fill="#facc15" />
        <circle cx="28" cy="21" r="2.7" fill="#22d3ee" />
      </svg>

      {/* Escena: el chip persigue a los bugs (solo en pantallas anchas) */}
      {!movil && (
        <span className="hidden xl:flex flex-col items-start leading-tight">
          <span style={{ color: '#475569', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>
            Jugá ELECTRO-MAN
          </span>
          <svg className="arc-escena" width="110" height="22" viewBox="0 0 110 22" aria-hidden="true">
            {/* senda de tornillos */}
            {[8, 22, 36, 50, 64, 78, 92, 104].map(x => (
              <circle key={x} cx={x} cy="11" r="1" fill="#475569" />
            ))}
            <g className="arc-correr">
              {/* chip comecocos (abre y cierra la boca) */}
              <g transform="translate(0 1)">
                <path fill="#00D9FF" d="M10 10 L17.37 4.84 A9 9 0 1 0 17.37 15.16 Z">
                  <animate
                    attributeName="d"
                    dur="0.36s"
                    repeatCount="indefinite"
                    values="M10 10 L17.37 4.84 A9 9 0 1 0 17.37 15.16 Z;M10 10 L18.99 9.53 A9 9 0 1 0 18.99 10.47 Z;M10 10 L17.37 4.84 A9 9 0 1 0 17.37 15.16 Z"
                  />
                </path>
                <circle cx="11" cy="5.2" r="1.3" fill="#0066FF" />
              </g>
              <Bug x={30} />
              <Bug x={52} />
            </g>
          </svg>
        </span>
      )}
    </button>
  )
}
