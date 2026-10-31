'use client'

// ============================================================
// components/JuegoArcade.tsx — "ELECTRO-MAN"
// Mini juego arcade (estilo comecocos) dentro de la portada.
// Personajes y laberinto propios de ELECTROGAMEZ: un chip que
// junta tornillos y esquiva "bugs". Sin librerías ni servidor:
// todo corre en el navegador con <canvas>. Se agrega a la portada
// con una sola línea y no modifica ninguna otra sección.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react'
import { EVENTO_ABRIR_JUEGO } from '@/components/AccesoArcade'
import { Gamepad2, Pause, Play, Volume2, VolumeX, Trophy, Heart, RotateCcw, X } from 'lucide-react'

// ─── LABERINTO (19 x 21) ──────────────────────────────────────────────────────
// #=pared  .=tornillo  o=batería (poder)  ' '=vacío  -=puerta  H=casa de los bugs  P=inicio
const MAPA: string[] = [
  '###################',
  '#....#.......#....#',
  '#o##.#.##.##.#.##o#',
  '#.................#',
  '#.##.#.#####.#.##.#',
  '#....#.......#....#',
  '####.##.###.##.####',
  '####.#.......#.####',
  '####.#.##-##.#.####',
  '    .  #HHH#  .    ',
  '####.#.#####.#.####',
  '####.#.......#.####',
  '####.#.#####.#.####',
  '#....#.......#....#',
  '#.##.#.##.##.#.##.#',
  '#o.#.....P.....#.o#',
  '##.#.#.#####.#.#.##',
  '#....#.......#....#',
  '#.######.#.######.#',
  '#.................#',
  '###################',
]

const COLS = 19
const FILAS = 21
const T = 20 // tamaño de cada casilla en píxeles internos
const ANCHO = COLS * T
const ALTO = FILAS * T

type Dir = { x: number; y: number }
const ARRIBA: Dir = { x: 0, y: -1 }
const ABAJO: Dir = { x: 0, y: 1 }
const IZQ: Dir = { x: -1, y: 0 }
const DER: Dir = { x: 1, y: 0 }
const QUIETO: Dir = { x: 0, y: 0 }
const DIRS = [ARRIBA, IZQ, ABAJO, DER]

const igual = (a: Dir, b: Dir) => a.x === b.x && a.y === b.y
const opuesta = (a: Dir): Dir => ({ x: -a.x, y: -a.y })

type Modo = 'dispersion' | 'persecucion'
type Estado = 'listo' | 'jugando' | 'pausa' | 'muerto' | 'nivel' | 'fin'

interface Bug {
  nombre: string
  color: string
  // posición en casillas (puede ser fraccionaria mientras se mueve)
  x: number
  y: number
  dir: Dir
  salida: number // segundos hasta salir de la casa
  asustado: boolean
  ojos: boolean // fue comido: vuelve a casa como "ojos"
  esquina: [number, number]
}

interface Jugador {
  x: number
  y: number
  dir: Dir
  pedida: Dir
  boca: number
}

const CLAVE_RECORD = 'electroman-record'

function crearTablero() {
  const celdas = MAPA.map(f => f.split(''))
  let pellets = 0
  let inicio: [number, number] = [9, 15]
  for (let y = 0; y < FILAS; y++) {
    for (let x = 0; x < COLS; x++) {
      const c = celdas[y][x]
      if (c === '.' || c === 'o') pellets++
      if (c === 'P') {
        inicio = [x, y]
        celdas[y][x] = ' '
      }
    }
  }
  return { celdas, pellets, inicio }
}

// Botón de la cruceta táctil (fuera del componente para que no se recree en cada cuadro)
function Flecha({ d, etiqueta, onPress, children }: { d: Dir; etiqueta: string; onPress: (d: Dir) => void; children: React.ReactNode }) {
  return (
    <button
      aria-label={etiqueta}
      onPointerDown={e => {
        e.preventDefault()
        onPress(d)
      }}
      className="w-14 h-14 rounded-xl bg-gray-800/80 border border-gray-700 active:bg-cyan-500/30 active:border-cyan-400 flex items-center justify-center text-xl select-none touch-none"
    >
      {children}
    </button>
  )
}

function Juego({ onCerrar }: { onCerrar: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contRef = useRef<HTMLDivElement>(null)

  // Estado visible (HUD)
  const [estado, setEstado] = useState<Estado>('listo')
  const [puntos, setPuntos] = useState(0)
  const [vidas, setVidas] = useState(3)
  const [nivel, setNivel] = useState(1)
  const [record, setRecord] = useState(0)
  const [sonido, setSonido] = useState(false)

  // Estado del juego (mutable, fuera de React para el bucle)
  const juego = useRef({
    celdas: [] as string[][],
    pellets: 0,
    inicio: [9, 15] as [number, number],
    jugador: { x: 9, y: 15, dir: QUIETO, pedida: QUIETO, boca: 0 } as Jugador,
    bugs: [] as Bug[],
    puntos: 0,
    vidas: 3,
    nivel: 1,
    estado: 'listo' as Estado,
    modo: 'dispersion' as Modo,
    tModo: 0,
    tAsustado: 0,
    comidosCadena: 0,
    tMuerte: 0,
    tNivel: 0,
    visible: true,
    sonido: false,
    raf: 0,
    ultimo: 0,
    puntosVida: 0, // para vida extra
  })

  const audioRef = useRef<AudioContext | null>(null)

  // ─── SONIDO (opcional, apagado por defecto) ─────────────────────────────────
  const beep = useCallback((freq: number, dur = 0.07, tipo: OscillatorType = 'square') => {
    if (!juego.current.sonido) return
    try {
      if (!audioRef.current) {
        const AC = window.AudioContext || (window as any).webkitAudioContext
        if (!AC) return
        audioRef.current = new AC()
      }
      const ac = audioRef.current
      if (ac.state === 'suspended') ac.resume()
      const o = ac.createOscillator()
      const g = ac.createGain()
      o.type = tipo
      o.frequency.value = freq
      g.gain.value = 0.04
      o.connect(g)
      g.connect(ac.destination)
      o.start()
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur)
      o.stop(ac.currentTime + dur)
    } catch {
      /* el sonido es opcional */
    }
  }, [])

  // ─── CREACIÓN DE BUGS ───────────────────────────────────────────────────────
  const crearBugs = useCallback((nivelActual: number): Bug[] => {
    const base = Math.max(0, 6 - nivelActual) // los bugs salen más rápido en cada nivel
    return [
      { nombre: 'Virus', color: '#ef4444', x: 9, y: 7, dir: IZQ, salida: 0, asustado: false, ojos: false, esquina: [17, 1] },
      { nombre: 'Glitch', color: '#f472b6', x: 9, y: 9, dir: ARRIBA, salida: 2 + base * 0.2, asustado: false, ojos: false, esquina: [1, 1] },
      { nombre: 'Lag', color: '#a78bfa', x: 8, y: 9, dir: ARRIBA, salida: 5 + base * 0.5, asustado: false, ojos: false, esquina: [17, 19] },
      { nombre: 'Crash', color: '#fb923c', x: 10, y: 9, dir: ARRIBA, salida: 8 + base * 0.8, asustado: false, ojos: false, esquina: [1, 19] },
    ]
  }, [])

  const reiniciarPosiciones = useCallback(() => {
    const j = juego.current
    j.jugador = { x: j.inicio[0], y: j.inicio[1], dir: QUIETO, pedida: QUIETO, boca: 0 }
    j.bugs = crearBugs(j.nivel)
    j.modo = 'dispersion'
    j.tModo = 0
    j.tAsustado = 0
    j.comidosCadena = 0
  }, [crearBugs])

  const nuevaPartida = useCallback(() => {
    const j = juego.current
    const t = crearTablero()
    j.celdas = t.celdas
    j.pellets = t.pellets
    j.inicio = t.inicio
    j.puntos = 0
    j.vidas = 3
    j.nivel = 1
    j.puntosVida = 0
    reiniciarPosiciones()
    j.estado = 'jugando'
    setPuntos(0)
    setVidas(3)
    setNivel(1)
    setEstado('jugando')
    beep(660, 0.12)
  }, [beep, reiniciarPosiciones])

  const siguienteNivel = useCallback(() => {
    const j = juego.current
    const t = crearTablero()
    j.celdas = t.celdas
    j.pellets = t.pellets
    j.nivel += 1
    reiniciarPosiciones()
    j.estado = 'jugando'
    setNivel(j.nivel)
    setEstado('jugando')
  }, [reiniciarPosiciones])

  // ─── AYUDAS DE MOVIMIENTO ───────────────────────────────────────────────────
  // ¿puede el jugador pisar esa casilla? (la casa y la puerta son solo de los bugs)
  const libre = (cx: number, cy: number) => {
    const j = juego.current
    let x = cx
    if (x < 0) x = COLS - 1
    else if (x >= COLS) x = 0
    if (cy < 0 || cy >= FILAS) return false
    const c = j.celdas[cy]?.[x]
    if (c === undefined || c === '#' || c === '-' || c === 'H') return false
    return true
  }

  // ─── LÓGICA DE CADA CUADRO ──────────────────────────────────────────────────
  const actualizar = useCallback(
    (dt: number) => {
      const j = juego.current
      if (j.estado === 'muerto') {
        j.tMuerte -= dt
        if (j.tMuerte <= 0) {
          if (j.vidas <= 0) {
            j.estado = 'fin'
            setEstado('fin')
            if (j.puntos > 0) {
              try {
                const prev = Number(localStorage.getItem(CLAVE_RECORD) || 0)
                if (j.puntos > prev) {
                  localStorage.setItem(CLAVE_RECORD, String(j.puntos))
                  setRecord(j.puntos)
                }
              } catch {
                setRecord(r => Math.max(r, j.puntos))
              }
            }
          } else {
            reiniciarPosiciones()
            j.estado = 'jugando'
            setEstado('jugando')
          }
        }
        return
      }
      if (j.estado === 'nivel') {
        j.tNivel -= dt
        if (j.tNivel <= 0) siguienteNivel()
        return
      }
      if (j.estado !== 'jugando') return

      const nivelFactor = Math.min(j.nivel - 1, 6)
      const velJugador = 5.2 + nivelFactor * 0.15 // casillas por segundo
      const velBug = 4.3 + nivelFactor * 0.35
      const velAsustado = 2.8
      const velOjos = 9

      // Modo dispersión / persecución alternado
      j.tModo += dt
      const limite = j.modo === 'dispersion' ? Math.max(3, 7 - nivelFactor) : 18 + nivelFactor * 2
      if (j.tModo >= limite && j.tAsustado <= 0) {
        j.modo = j.modo === 'dispersion' ? 'persecucion' : 'dispersion'
        j.tModo = 0
        j.bugs.forEach(b => {
          if (!b.asustado && !b.ojos && b.salida <= 0) b.dir = opuesta(b.dir)
        })
      }
      if (j.tAsustado > 0) {
        j.tAsustado -= dt
        if (j.tAsustado <= 0) {
          j.bugs.forEach(b => (b.asustado = false))
          j.comidosCadena = 0
        }
      }

      // ── Jugador ──
      const p = j.jugador
      let resto = velJugador * dt
      while (resto > 0) {
        const cx = Math.round(p.x)
        const cy = Math.round(p.y)
        const enCentro = Math.abs(p.x - cx) < 1e-6 && Math.abs(p.y - cy) < 1e-6
        if (enCentro) {
          p.x = cx
          p.y = cy
          // comer
          const celda = j.celdas[cy]?.[cx]
          if (celda === '.') {
            j.celdas[cy][cx] = ' '
            j.pellets--
            sumar(10)
            beep(p.boca > 0.5 ? 520 : 440, 0.04)
          } else if (celda === 'o') {
            j.celdas[cy][cx] = ' '
            j.pellets--
            sumar(50)
            j.tAsustado = Math.max(3, 8 - nivelFactor)
            j.comidosCadena = 0
            j.bugs.forEach(b => {
              if (!b.ojos && b.salida <= 0) {
                b.asustado = true
                b.dir = opuesta(b.dir)
              }
            })
            beep(880, 0.15, 'sawtooth')
          }
          if (j.pellets <= 0) {
            j.estado = 'nivel'
            j.tNivel = 2
            setEstado('nivel')
            beep(1040, 0.3, 'triangle')
            return
          }
          // girar si se pidió y se puede
          if (!igual(p.pedida, QUIETO) && libre(cx + p.pedida.x, cy + p.pedida.y)) {
            p.dir = p.pedida
          }
          if (!libre(cx + p.dir.x, cy + p.dir.y)) {
            p.dir = QUIETO
            break
          }
        }
        if (igual(p.dir, QUIETO)) break

        // avanzar hasta el próximo centro de casilla
        const objX = p.dir.x !== 0 ? (p.dir.x > 0 ? Math.floor(p.x + 1e-6) + 1 : Math.ceil(p.x - 1e-6) - 1) : p.x
        const objY = p.dir.y !== 0 ? (p.dir.y > 0 ? Math.floor(p.y + 1e-6) + 1 : Math.ceil(p.y - 1e-6) - 1) : p.y
        const dist = Math.abs(objX - p.x) + Math.abs(objY - p.y)
        const paso = Math.min(resto, dist)
        p.x += p.dir.x * paso
        p.y += p.dir.y * paso
        resto -= paso
        // túnel lateral
        if (p.x < -0.5) p.x += COLS
        if (p.x > COLS - 0.5) p.x -= COLS
        if (paso < dist - 1e-9) break
        // llegó a un centro: normalizar para evitar acumulación de error
        if (p.x < 0) p.x = COLS - 1
        if (p.x > COLS - 1 + 1e-6 && p.x < COLS) p.x = 0
        p.x = Math.round(p.x * 1e6) / 1e6
        p.y = Math.round(p.y * 1e6) / 1e6
      }
      p.boca += dt * 9

      // ── Bugs ──
      for (const b of j.bugs) {
        if (b.salida > 0) {
          b.salida -= dt
          // rebotan suavemente dentro de la casa
          b.y = 9 + Math.sin((b.salida + (b.esquina[0] % 5)) * 5) * 0.12
          if (b.salida <= 0) {
            b.x = 9
            b.y = 9
            b.dir = ARRIBA
          }
          continue
        }
        const vel = b.ojos ? velOjos : b.asustado ? velAsustado : velBug
        let r = vel * dt
        while (r > 0) {
          const cx = Math.round(b.x)
          const cy = Math.round(b.y)
          const enCentro = Math.abs(b.x - cx) < 1e-6 && Math.abs(b.y - cy) < 1e-6
          if (enCentro) {
            b.x = cx
            b.y = cy
            // los ojos que llegan a la casa reviven
            if (b.ojos && cx === 9 && cy === 9) {
              b.ojos = false
              b.asustado = false
              b.dir = ARRIBA
            }
            b.dir = elegirDireccion(b, cx, cy)
            if (igual(b.dir, QUIETO)) break
          }
          if (igual(b.dir, QUIETO)) break
          const objX = b.dir.x !== 0 ? (b.dir.x > 0 ? Math.floor(b.x + 1e-6) + 1 : Math.ceil(b.x - 1e-6) - 1) : b.x
          const objY = b.dir.y !== 0 ? (b.dir.y > 0 ? Math.floor(b.y + 1e-6) + 1 : Math.ceil(b.y - 1e-6) - 1) : b.y
          const dist = Math.abs(objX - b.x) + Math.abs(objY - b.y)
          const paso = Math.min(r, dist)
          b.x += b.dir.x * paso
          b.y += b.dir.y * paso
          r -= paso
          if (b.x < -0.5) b.x += COLS
          if (b.x > COLS - 0.5) b.x -= COLS
          if (paso < dist - 1e-9) break
          if (b.x < 0) b.x = COLS - 1
          if (b.x > COLS - 1 + 1e-6 && b.x < COLS) b.x = 0
          b.x = Math.round(b.x * 1e6) / 1e6
          b.y = Math.round(b.y * 1e6) / 1e6
        }

        // ── Colisión con el jugador ──
        const dx = Math.min(Math.abs(b.x - p.x), COLS - Math.abs(b.x - p.x))
        const dy = Math.abs(b.y - p.y)
        if (dx * dx + dy * dy < 0.3) {
          if (b.ojos) continue
          if (b.asustado) {
            b.asustado = false
            b.ojos = true
            j.comidosCadena++
            sumar(100 * Math.pow(2, j.comidosCadena)) // 200, 400, 800, 1600
            beep(300, 0.2, 'sawtooth')
          } else {
            j.vidas--
            setVidas(j.vidas)
            j.estado = 'muerto'
            j.tMuerte = 1.4
            setEstado('muerto')
            beep(160, 0.5, 'sawtooth')
            return
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [beep, reiniciarPosiciones, siguienteNivel]
  )

  // Suma puntos y otorga una vida extra a los 10.000
  function sumar(n: number) {
    const j = juego.current
    j.puntos += n
    j.puntosVida += n
    if (j.puntosVida >= 10000) {
      j.puntosVida -= 10000
      if (j.vidas < 5) {
        j.vidas++
        setVidas(j.vidas)
        beep(1200, 0.25, 'triangle')
      }
    }
    setPuntos(j.puntos)
  }

  // ─── INTELIGENCIA DE LOS BUGS ───────────────────────────────────────────────
  function elegirDireccion(b: Bug, cx: number, cy: number): Dir {
    const j = juego.current
    const p = j.jugador
    const opciones = DIRS.filter(d => {
      if (igual(d, opuesta(b.dir)) && !igual(b.dir, QUIETO)) return false
      const nx = cx + d.x
      const ny = cy + d.y
      const c = j.celdas[ny]?.[nx < 0 ? COLS - 1 : nx >= COLS ? 0 : nx]
      if (c === undefined || c === '#') return false
      // la puerta solo se cruza hacia arriba al salir, o hacia abajo siendo "ojos"
      if (c === '-') return b.ojos || (d.y === -1 && cy === 9)
      if (c === 'H') return b.ojos || cy === 8
      return true
    })
    if (opciones.length === 0) return opuesta(b.dir)
    if (opciones.length === 1) return opciones[0]

    // objetivo según personalidad
    let objetivo: [number, number]
    if (b.ojos) {
      objetivo = [9, 9]
    } else if (b.asustado) {
      return opciones[Math.floor(Math.random() * opciones.length)]
    } else if (j.modo === 'dispersion') {
      objetivo = b.esquina
    } else {
      const pdx = p.dir.x
      const pdy = p.dir.y
      switch (b.nombre) {
        case 'Virus': // persigue directo
          objetivo = [p.x, p.y]
          break
        case 'Glitch': // emboscada: 4 casillas por delante
          objetivo = [p.x + pdx * 4, p.y + pdy * 4]
          break
        case 'Lag': {
          // se apoya en el Virus: apunta al reflejo del Virus respecto de 2 casillas delante
          const v = j.bugs[0]
          const ax = p.x + pdx * 2
          const ay = p.y + pdy * 2
          objetivo = [ax + (ax - v.x), ay + (ay - v.y)]
          break
        }
        default: {
          // Crash: persigue de cerca, huye a su esquina si está muy cerca
          const dist = Math.hypot(p.x - b.x, p.y - b.y)
          objetivo = dist > 6 ? [p.x, p.y] : b.esquina
        }
      }
    }
    let mejor = opciones[0]
    let mejorDist = Infinity
    for (const d of opciones) {
      const dd = Math.hypot(cx + d.x - objetivo[0], cy + d.y - objetivo[1])
      if (dd < mejorDist) {
        mejorDist = dd
        mejor = d
      }
    }
    return mejor
  }

  // ─── DIBUJO ─────────────────────────────────────────────────────────────────
  const dibujar = useCallback(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const j = juego.current
    const ahora = performance.now()

    ctx.clearRect(0, 0, ANCHO, ALTO)
    ctx.fillStyle = '#030712'
    ctx.fillRect(0, 0, ANCHO, ALTO)

    if (j.celdas.length === 0) j.celdas = crearTablero().celdas

    // Paredes con brillo "neón"
    for (let y = 0; y < FILAS; y++) {
      for (let x = 0; x < COLS; x++) {
        const c = j.celdas[y][x]
        const px = x * T
        const py = y * T
        if (c === '#') {
          ctx.fillStyle = '#0b1a3a'
          ctx.fillRect(px, py, T, T)
          ctx.strokeStyle = '#0066FF'
          ctx.lineWidth = 1.5
          const arriba = j.celdas[y - 1]?.[x] === '#'
          const abajo = j.celdas[y + 1]?.[x] === '#'
          const izq = j.celdas[y]?.[x - 1] === '#'
          const der = j.celdas[y]?.[x + 1] === '#'
          ctx.beginPath()
          if (!arriba) { ctx.moveTo(px + 1, py + 1); ctx.lineTo(px + T - 1, py + 1) }
          if (!abajo) { ctx.moveTo(px + 1, py + T - 1); ctx.lineTo(px + T - 1, py + T - 1) }
          if (!izq) { ctx.moveTo(px + 1, py + 1); ctx.lineTo(px + 1, py + T - 1) }
          if (!der) { ctx.moveTo(px + T - 1, py + 1); ctx.lineTo(px + T - 1, py + T - 1) }
          ctx.stroke()
        } else if (c === '-') {
          ctx.fillStyle = '#00D9FF'
          ctx.fillRect(px, py + T / 2 - 1.5, T, 3)
        } else if (c === '.') {
          // tornillo
          ctx.fillStyle = '#cbd5e1'
          ctx.beginPath()
          ctx.arc(px + T / 2, py + T / 2, 2.2, 0, Math.PI * 2)
          ctx.fill()
        } else if (c === 'o') {
          // batería de poder (parpadea)
          const on = Math.floor(ahora / 250) % 2 === 0
          ctx.fillStyle = on ? '#facc15' : '#f59e0b'
          ctx.fillRect(px + 5, py + 4, 10, 12)
          ctx.fillRect(px + 8, py + 2, 4, 2)
          ctx.fillStyle = '#111827'
          ctx.beginPath()
          ctx.moveTo(px + 11, py + 6)
          ctx.lineTo(px + 7, py + 11)
          ctx.lineTo(px + 10, py + 11)
          ctx.lineTo(px + 9, py + 15)
          ctx.lineTo(px + 13, py + 9)
          ctx.lineTo(px + 10, py + 9)
          ctx.closePath()
          ctx.fill()
        }
      }
    }

    // Bugs
    const parpadeo = j.tAsustado > 0 && j.tAsustado < 2 && Math.floor(ahora / 180) % 2 === 0
    for (const b of j.bugs) dibujarBug(ctx, b, parpadeo, ahora)

    // Jugador (chip comecocos)
    const p = j.jugador
    const px = p.x * T + T / 2
    const py = p.y * T + T / 2
    if (j.estado === 'muerto') {
      const prog = Math.min(1, 1 - j.tMuerte / 1.4)
      const abre = prog * Math.PI
      ctx.fillStyle = '#00D9FF'
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.arc(px, py, T * 0.44, -Math.PI / 2 + abre, -Math.PI / 2 - abre + Math.PI * 2)
      ctx.closePath()
      ctx.fill()
    } else {
      const abre = (Math.abs(Math.sin(p.boca)) * 0.9 + 0.05) * (igual(p.dir, QUIETO) ? 0.3 : 1)
      const ang = igual(p.dir, QUIETO) ? 0 : Math.atan2(p.dir.y, p.dir.x)
      ctx.fillStyle = '#00D9FF'
      ctx.shadowColor = '#00D9FF'
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.arc(px, py, T * 0.44, ang + abre * 0.6, ang - abre * 0.6 + Math.PI * 2)
      ctx.closePath()
      ctx.fill()
      ctx.shadowBlur = 0
      // patitas del chip (detalle ELECTROGAMEZ)
      ctx.fillStyle = '#0066FF'
      const ox = Math.cos(ang - Math.PI / 2) * T * 0.2
      const oy = Math.sin(ang - Math.PI / 2) * T * 0.2
      ctx.beginPath()
      ctx.arc(px + ox, py + oy, 1.8, 0, Math.PI * 2)
      ctx.fill()
    }

    // Carteles sobre el tablero
    const cartel = (t1: string, t2?: string, color = '#00D9FF') => {
      ctx.fillStyle = 'rgba(3,7,18,0.72)'
      ctx.fillRect(0, ALTO / 2 - 44, ANCHO, 88)
      ctx.textAlign = 'center'
      ctx.fillStyle = color
      ctx.font = 'bold 26px ui-monospace, Menlo, Consolas, monospace'
      ctx.fillText(t1, ANCHO / 2, ALTO / 2 - (t2 ? 4 : -9))
      if (t2) {
        ctx.fillStyle = '#9ca3af'
        ctx.font = '13px ui-monospace, Menlo, Consolas, monospace'
        ctx.fillText(t2, ANCHO / 2, ALTO / 2 + 24)
      }
    }
    if (j.estado === 'listo') cartel('ELECTRO-MAN', 'Tocá JUGAR para empezar')
    else if (j.estado === 'pausa') cartel('PAUSA', 'Tocá continuar o presioná P', '#facc15')
    else if (j.estado === 'nivel') cartel('¡NIVEL SUPERADO!', `Siguiente: nivel ${j.nivel + 1}`, '#4ade80')
    else if (j.estado === 'fin') cartel('GAME OVER', `Puntaje: ${j.puntos}`, '#f87171')
  }, [])

  function dibujarBug(ctx: CanvasRenderingContext2D, b: Bug, parpadeo: boolean, ahora: number) {
    const cx = b.x * T + T / 2
    const cy = b.y * T + T / 2
    const r = T * 0.42
    const pata = Math.floor(ahora / 140) % 2 === 0
    if (!b.ojos) {
      const color = b.asustado ? (parpadeo ? '#f9fafb' : '#2563eb') : b.color
      ctx.fillStyle = color
      ctx.strokeStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = 6
      // cuerpo: microchip cuadrado con esquinas redondeadas
      const w = r * 1.55
      const h = r * 1.5
      const x0 = cx - w / 2
      const y0 = cy - h / 2 + 1
      const rad = 3
      ctx.beginPath()
      ctx.moveTo(x0 + rad, y0)
      ctx.lineTo(x0 + w - rad, y0)
      ctx.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + rad)
      ctx.lineTo(x0 + w, y0 + h - rad)
      ctx.quadraticCurveTo(x0 + w, y0 + h, x0 + w - rad, y0 + h)
      ctx.lineTo(x0 + rad, y0 + h)
      ctx.quadraticCurveTo(x0, y0 + h, x0, y0 + h - rad)
      ctx.lineTo(x0, y0 + rad)
      ctx.quadraticCurveTo(x0, y0, x0 + rad, y0)
      ctx.closePath()
      ctx.fill()
      ctx.shadowBlur = 0
      // patitas (pines) a los costados, se mueven como un bicho
      ctx.lineWidth = 1.6
      ctx.beginPath()
      for (let i = 0; i < 3; i++) {
        const py = y0 + 3 + i * (h - 6) / 2
        const mov = (i + (pata ? 0 : 1)) % 2 === 0 ? 1.2 : -1.2
        ctx.moveTo(x0, py)
        ctx.lineTo(x0 - 3, py + mov)
        ctx.moveTo(x0 + w, py)
        ctx.lineTo(x0 + w + 3, py + mov)
      }
      // antenas
      ctx.moveTo(cx - 3, y0)
      ctx.lineTo(cx - 5, y0 - 3)
      ctx.moveTo(cx + 3, y0)
      ctx.lineTo(cx + 5, y0 - 3)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx - 5, y0 - 3.5, 1.1, 0, Math.PI * 2)
      ctx.arc(cx + 5, y0 - 3.5, 1.1, 0, Math.PI * 2)
      ctx.fill()
    }
    // ojos
    const ojo = (ox: number) => {
      ctx.fillStyle = b.asustado && !b.ojos ? '#fde68a' : '#ffffff'
      ctx.beginPath()
      ctx.arc(cx + ox, cy - r * 0.2, 3, 0, Math.PI * 2)
      ctx.fill()
      if (!(b.asustado && !b.ojos)) {
        ctx.fillStyle = '#111827'
        ctx.beginPath()
        ctx.arc(cx + ox + b.dir.x * 1.3, cy - r * 0.2 + b.dir.y * 1.3, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ojo(-4)
    ojo(4)
    if (b.asustado && !b.ojos) {
      ctx.strokeStyle = '#fde68a'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(cx - 5, cy + 4)
      ctx.lineTo(cx - 2.5, cy + 2)
      ctx.lineTo(cx, cy + 4)
      ctx.lineTo(cx + 2.5, cy + 2)
      ctx.lineTo(cx + 5, cy + 4)
      ctx.stroke()
    }
  }

  // ─── BUCLE PRINCIPAL ────────────────────────────────────────────────────────
  useEffect(() => {
    const j = juego.current
    const t = crearTablero()
    j.celdas = t.celdas
    j.pellets = t.pellets
    j.inicio = t.inicio
    reiniciarPosiciones()

    try {
      setRecord(Number(localStorage.getItem(CLAVE_RECORD) || 0))
    } catch {
      /* sin almacenamiento: el récord vale solo en esta visita */
    }

    const bucle = (ahora: number) => {
      const dt = Math.min(0.05, (ahora - (j.ultimo || ahora)) / 1000)
      j.ultimo = ahora
      if (j.visible) {
        actualizar(dt)
        dibujar()
      }
      j.raf = requestAnimationFrame(bucle)
    }
    j.raf = requestAnimationFrame(bucle)

    // Pausa automática si el juego sale de pantalla o se cambia de pestaña
    const obs =
      typeof IntersectionObserver !== 'undefined' && contRef.current
        ? new IntersectionObserver(
            entradas => {
              j.visible = entradas[0].isIntersecting
              if (!j.visible && j.estado === 'jugando') {
                j.estado = 'pausa'
                setEstado('pausa')
              }
            },
            { threshold: 0.15 }
          )
        : null
    if (obs && contRef.current) obs.observe(contRef.current)

    const alOcultar = () => {
      if (document.hidden && j.estado === 'jugando') {
        j.estado = 'pausa'
        setEstado('pausa')
      }
    }
    document.addEventListener('visibilitychange', alOcultar)

    return () => {
      cancelAnimationFrame(j.raf)
      obs?.disconnect()
      document.removeEventListener('visibilitychange', alOcultar)
      try {
        audioRef.current?.close()
      } catch {
        /* nada */
      }
      audioRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── CONTROLES ──────────────────────────────────────────────────────────────
  const pedir = useCallback((d: Dir) => {
    const j = juego.current
    j.jugador.pedida = d
    // si está quieto, arranca de inmediato
    if (igual(j.jugador.dir, QUIETO)) {
      const cx = Math.round(j.jugador.x)
      const cy = Math.round(j.jugador.y)
      if (libre(cx + d.x, cy + d.y)) j.jugador.dir = d
    } else if (igual(d, opuesta(j.jugador.dir))) {
      // marcha atrás inmediata
      j.jugador.dir = d
    }
  }, [])

  const alternarPausa = useCallback(() => {
    const j = juego.current
    if (j.estado === 'jugando') {
      j.estado = 'pausa'
      setEstado('pausa')
    } else if (j.estado === 'pausa') {
      j.estado = 'jugando'
      setEstado('jugando')
    }
  }, [])

  useEffect(() => {
    const teclas: Record<string, Dir> = {
      ArrowUp: ARRIBA, ArrowDown: ABAJO, ArrowLeft: IZQ, ArrowRight: DER,
      w: ARRIBA, s: ABAJO, a: IZQ, d: DER,
      W: ARRIBA, S: ABAJO, A: IZQ, D: DER,
    }
    const alTecla = (e: KeyboardEvent) => {
      const j = juego.current
      const activo = j.estado === 'jugando' || j.estado === 'pausa'
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'p' || e.key === 'P') {
        if (activo) { e.preventDefault(); alternarPausa() }
        return
      }
      const d = teclas[e.key]
      if (d && j.estado === 'jugando' && j.visible) {
        e.preventDefault() // evita que las flechas muevan la página mientras se juega
        pedir(d)
      }
    }
    window.addEventListener('keydown', alTecla)
    return () => window.removeEventListener('keydown', alTecla)
  }, [pedir, alternarPausa])

  // Deslizar el dedo sobre el tablero
  const toque = useRef<{ x: number; y: number } | null>(null)
  const alTocar = (e: React.TouchEvent) => {
    const t = e.touches[0]
    toque.current = { x: t.clientX, y: t.clientY }
  }
  const alDeslizar = (e: React.TouchEvent) => {
    if (!toque.current) return
    const t = e.touches[0]
    const dx = t.clientX - toque.current.x
    const dy = t.clientY - toque.current.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return
    pedir(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? DER : IZQ) : dy > 0 ? ABAJO : ARRIBA)
    toque.current = { x: t.clientX, y: t.clientY }
  }

  const alternarSonido = () => {
    const nuevo = !juego.current.sonido
    juego.current.sonido = nuevo
    setSonido(nuevo)
    if (nuevo) beep(660, 0.08)
  }

  const jugando = estado === 'jugando' || estado === 'muerto' || estado === 'nivel'
  const botonPrincipal =
    estado === 'listo' || estado === 'fin' ? (
      <button
        onClick={nuevaPartida}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-600/20"
      >
        {estado === 'fin' ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        {estado === 'fin' ? 'Jugar de nuevo' : 'JUGAR'}
      </button>
    ) : (
      <button
        onClick={alternarPausa}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 px-5 py-3 rounded-xl font-medium text-sm transition-colors"
      >
        {estado === 'pausa' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        {estado === 'pausa' ? 'Continuar' : 'Pausa'}
      </button>
    )

  return (
    <div id="arcade" className="w-full">
      <div className="max-w-6xl mx-auto">
        <div
          ref={contRef}
          className="mx-auto max-w-[440px] bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold flex items-center gap-2 text-cyan-400">
              <Gamepad2 className="w-4 h-4" /> ELECTRO-MAN
            </p>
            <button
              onClick={onCerrar}
              aria-label="Cerrar juego"
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Marcador */}
          <div className="flex items-center justify-between text-sm mb-3 font-mono">
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider">Puntos</p>
              <p className="text-white font-bold text-lg leading-none">{puntos}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-[10px] uppercase tracking-wider">Nivel</p>
              <p className="text-cyan-400 font-bold text-lg leading-none">{nivel}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-[10px] uppercase tracking-wider">Vidas</p>
              <p className="flex gap-0.5 justify-center h-[18px]">
                {Array.from({ length: Math.max(0, vidas) }).map((_, i) => (
                  <Heart key={i} className="w-4 h-4 text-red-500 fill-red-500" />
                ))}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-[10px] uppercase tracking-wider flex items-center gap-1 justify-end">
                <Trophy className="w-3 h-3" /> Récord
              </p>
              <p className="text-yellow-400 font-bold text-lg leading-none">{Math.max(record, puntos)}</p>
            </div>
          </div>

          {/* Tablero */}
          <canvas
            ref={canvasRef}
            width={ANCHO}
            height={ALTO}
            onTouchStart={alTocar}
            onTouchMove={alDeslizar}
            className="w-full h-auto rounded-xl border border-blue-900/60 bg-gray-950"
            style={{ touchAction: jugando ? 'none' : 'auto' }} /* solo bloquea el scroll mientras se juega */
            role="img"
            aria-label="Juego arcade Electro-Man"
          />

          {/* Botones */}
          <div className="flex items-center justify-center gap-3 mt-4">
            {botonPrincipal}
            <button
              onClick={alternarSonido}
              aria-label={sonido ? 'Silenciar' : 'Activar sonido'}
              className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
            >
              {sonido ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            </button>
          </div>

          {/* Cruceta táctil para celulares */}
          <div className="grid grid-cols-3 gap-2 justify-items-center mt-4 w-[184px] mx-auto md:hidden">
            <span />
            <Flecha d={ARRIBA} etiqueta="Arriba" onPress={pedir}>▲</Flecha>
            <span />
            <Flecha d={IZQ} etiqueta="Izquierda" onPress={pedir}>◀</Flecha>
            <span />
            <Flecha d={DER} etiqueta="Derecha" onPress={pedir}>▶</Flecha>
            <span />
            <Flecha d={ABAJO} etiqueta="Abajo" onPress={pedir}>▼</Flecha>
            <span />
          </div>

          <p className="text-center text-gray-500 text-xs mt-4">
            <span className="hidden md:inline">Flechas o W A S D para moverte · P para pausar</span>
            <span className="md:hidden">Deslizá el dedo sobre el tablero o usá la cruceta</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── ENTRADA SUTIL EN LA PORTADA + VENTANA FLOTANTE ───────────────────────────
// En la página solo se ve un renglón discreto. El juego se abre encima de la
// misma página (sin cambiar de URL) y se cierra con la X, Esc o tocando afuera.
export default function JuegoArcade() {
  const [abierto, setAbierto] = useState(false)

  // El joystick del menú superior (AccesoArcade) abre el juego con este evento
  useEffect(() => {
    const abrir = () => setAbierto(true)
    window.addEventListener(EVENTO_ABRIR_JUEGO, abrir)
    return () => window.removeEventListener(EVENTO_ABRIR_JUEGO, abrir)
  }, [])

  useEffect(() => {
    if (!abierto) return
    const alEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    window.addEventListener('keydown', alEsc)
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden' // la página de fondo no se desplaza mientras se juega
    return () => {
      window.removeEventListener('keydown', alEsc)
      document.body.style.overflow = previo
    }
  }, [abierto])

  return (
    <>
      <div className="px-4 py-6 flex justify-center">
        <button
          onClick={() => setAbierto(true)}
          className="group inline-flex items-center gap-2 text-xs text-gray-600 hover:text-cyan-400 transition-colors"
          aria-label="Abrir juego arcade"
        >
          <Gamepad2 className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
          <span>Mientras te decidís, jugá a nuestro Electro-Man</span>
        </button>
      </div>

      {abierto && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={() => setAbierto(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Juego arcade"
        >
          <div className="min-h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
            <Juego onCerrar={() => setAbierto(false)} />
          </div>
        </div>
      )}
    </>
  )
}
