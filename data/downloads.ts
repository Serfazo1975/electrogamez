// ═══════════════════════════════════════════════════════════════════════════
//  DESCARGAS — Editá este archivo para agregar, modificar o quitar links
//
//  CÓMO AGREGAR UN NUEVO ITEM:
//    1. Copiá uno de los bloques de abajo
//    2. Pegalo al final de la lista (antes del corchete de cierre ])
//    3. Completá los campos y guardá el archivo
//    4. Para marcar como NUEVO: agregá  nuevo: true
//
//  Categorías disponibles:
//    'Diagnóstico' | 'Seguridad' | 'Utilidades' | 'Drivers' | 'Información' | 'Documento'
// ═══════════════════════════════════════════════════════════════════════════

export type Categoria =
  | 'Diagnóstico'
  | 'Seguridad'
  | 'Utilidades'
  | 'Drivers'
  | 'Información'
  | 'Documento'

export interface DescargaItem {
  title: string        // Nombre del software o documento
  desc: string         // Descripción breve para los usuarios
  categoria: Categoria // Una de las categorías listadas arriba
  href: string | null  // URL de descarga — null para "Próximamente"
  size?: string        // Tamaño del archivo, ej: "8 MB"
  version?: string     // Versión, ej: "v24.1"
  nuevo?: boolean      // true = aparece con el badge "Nuevo" y en Novedades
  propio?: boolean     // true = documento propio de ElectroGamez (no de terceros)
}

export const DESCARGAS: DescargaItem[] = [

  // ── DIAGNÓSTICO ─────────────────────────────────────────────────────────
  {
    title: 'HWiNFO64',
    desc: 'Diagnóstico completo de hardware: temperatura, voltajes, velocidad de ventiladores y estado general del equipo.',
    categoria: 'Diagnóstico',
    href: 'https://www.hwinfo.com/download/',
    size: '8 MB',
    version: 'v8.x',
  },
  {
    title: 'CrystalDiskInfo',
    desc: 'Revisá la salud de tu disco rígido o SSD. Detecta fallas antes de que pierdas tus datos.',
    categoria: 'Diagnóstico',
    href: 'https://crystalmark.info/en/software/crystaldiskinfo/',
    size: '4 MB',
    version: 'v9.x',
  },

  // ── INFORMACIÓN ─────────────────────────────────────────────────────────
  {
    title: 'CPU-Z',
    desc: 'Información detallada del procesador, placa base, memoria RAM y tarjeta gráfica de tu PC.',
    categoria: 'Información',
    href: 'https://www.cpuid.com/softwares/cpu-z.html',
    size: '2 MB',
    version: 'v2.x',
  },

  // ── SEGURIDAD ───────────────────────────────────────────────────────────
  {
    title: 'Malwarebytes',
    desc: 'Eliminá virus, malware y programas no deseados. Versión gratuita ideal para una limpieza rápida.',
    categoria: 'Seguridad',
    href: 'https://www.malwarebytes.com/mwb-download',
    size: '70 MB',
  },

  // ── UTILIDADES ──────────────────────────────────────────────────────────
  {
    title: 'Ventoy',
    desc: 'Creá un pendrive booteable con múltiples ISO. Ideal para reinstalar Windows o diagnosticar sin internet.',
    categoria: 'Utilidades',
    href: 'https://www.ventoy.net/en/download.html',
    size: '14 MB',
    version: 'v1.x',
  },

  // ── DRIVERS ─────────────────────────────────────────────────────────────
  {
    title: 'Driver Booster (IObit)',
    desc: 'Actualizá todos los drivers de tu PC automáticamente. Muy útil después de reinstalar Windows.',
    categoria: 'Drivers',
    href: 'https://www.iobit.com/en/driver-booster.php',
    size: '25 MB',
  },

  // ── DOCUMENTOS PROPIOS ──────────────────────────────────────────────────
  {
    title: 'Formulario de ingreso de equipo',
    desc: 'Completá este formulario antes de traer tu equipo al local. Agiliza el proceso de recepción y garantía.',
    categoria: 'Documento',
    href: null,  // ← Reemplazá null con el link de Google Drive o similar
    propio: true,
  },
  {
    title: 'Términos de servicio y garantía',
    desc: 'Condiciones de servicio, garantías de reparación y responsabilidades. Leelo antes de dejar tu equipo.',
    categoria: 'Documento',
    href: null,  // ← Reemplazá null con el link cuando tengas el PDF listo
    propio: true,
  },

  // ── AGREGÁ TUS PROPIOS LINKS AQUÍ ───────────────────────────────────────
  // Ejemplo de item nuevo:
  //
  // {
  //   title: 'Nombre del programa',
  //   desc: 'Descripción para los clientes.',
  //   categoria: 'Utilidades',
  //   href: 'https://sitio-oficial.com/download',
  //   size: '10 MB',
  //   version: 'v1.2',
  //   nuevo: true,   // ← esto muestra el badge "Nuevo"
  // },

]
