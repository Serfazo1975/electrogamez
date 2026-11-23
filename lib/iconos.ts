// Ícono de una descarga: usa la imagen cargada a mano y, si no hay,
// el ícono oficial (favicon) del sitio del link de descarga.
export function iconoDescarga(imagen?: string, link?: string): string {
  if (imagen) return imagen
  try {
    const host = new URL(link || '').hostname
    if (host) return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`
  } catch { /* link inválido: sin ícono */ }
  return ''
}
