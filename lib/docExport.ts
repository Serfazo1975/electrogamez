// Exportación de documentos a PDF / JPG y compartir (WhatsApp, email, etc.)
// Reutilizado por el comprobante de recepción y por presupuesto / factura.

import type { jsPDF } from 'jspdf'

// Captura un elemento del DOM a un canvas, aplanando los inputs a texto
// para que el documento se vea limpio en el PDF/imagen.
export async function captureCanvas(elementId: string): Promise<HTMLCanvasElement> {
  const { default: html2canvas } = await import('html2canvas')
  const el = document.getElementById(elementId)
  if (!el) throw new Error('elemento no encontrado')

  return html2canvas(el, {
    scale: 2,
    backgroundColor: '#ffffff',
    windowWidth: el.scrollWidth,
    onclone: (cloned) => {
      const root = cloned.getElementById(elementId) as HTMLElement
      root.querySelectorAll('.no-print').forEach(n => ((n as HTMLElement).style.display = 'none'))

      const flatten = (
        node: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
        txt: string,
      ) => {
        const cs = cloned.defaultView!.getComputedStyle(node)
        const span = cloned.createElement('span')
        span.textContent = txt
        span.style.fontSize = cs.fontSize
        span.style.fontWeight = cs.fontWeight
        span.style.textAlign = cs.textAlign
        span.style.color = '#000'
        span.style.fontFamily = cs.fontFamily
        span.style.display = 'inline-block'
        span.style.minWidth = cs.width
        span.style.whiteSpace = 'pre-wrap'
        span.style.verticalAlign = 'bottom'
        node.parentNode?.replaceChild(span, node)
      }

      root.querySelectorAll('input').forEach(n =>
        flatten(n as HTMLInputElement, (n as HTMLInputElement).value || ''))
      root.querySelectorAll('textarea').forEach(n =>
        flatten(n as HTMLTextAreaElement, (n as HTMLTextAreaElement).value || ''))
      root.querySelectorAll('select').forEach(n => {
        const sel = n as HTMLSelectElement
        flatten(sel, sel.options[sel.selectedIndex]?.text || '')
      })
    },
  })
}

// Convierte un canvas a un PDF A4, paginando si el contenido es muy alto.
export async function canvasToPdf(canvas: HTMLCanvasElement): Promise<jsPDF> {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = 8
  const imgW = pageW - margin * 2
  const imgH = (canvas.height * imgW) / canvas.width
  const img = canvas.toDataURL('image/jpeg', 0.95)

  let heightLeft = imgH
  let position = margin
  pdf.addImage(img, 'JPEG', margin, position, imgW, imgH)
  heightLeft -= (pageH - margin * 2)
  while (heightLeft > 0) {
    position = margin - (imgH - heightLeft)
    pdf.addPage()
    pdf.addImage(img, 'JPEG', margin, position, imgW, imgH)
    heightLeft -= (pageH - margin * 2)
  }
  return pdf
}

// Descarga el canvas como imagen JPG.
export function downloadCanvasJpg(canvas: HTMLCanvasElement, fileName: string) {
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/jpeg', 0.95)
  a.download = fileName
  a.click()
}

// Intenta compartir un archivo con el menú nativo (celular). Devuelve true si lo logró.
export async function tryShareFile(file: File, text: string, title: string): Promise<boolean> {
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file], text, title } as ShareData)
      return true
    } catch {
      return false
    }
  }
  return false
}
