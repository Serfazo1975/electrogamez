import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

// La tabla de descargas se crea desde la app (idempotente), sin depender de
// `prisma db push` en el build — así el deploy no puede romperse por un cambio
// de esquema. Se guarda en la base para que las descargas se vean en todas las PC.

export interface Descarga {
  id: string
  titulo: string
  descripcion: string
  imagen: string
  linkDescarga: string
  sitioFuente: string
  categoria: string
  destacado: boolean
  fechaAgregado: string
}

let ensured = false
async function ensureTable() {
  if (ensured) return
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS app_downloads (
      id text PRIMARY KEY,
      titulo text NOT NULL,
      descripcion text NOT NULL DEFAULT '',
      imagen text NOT NULL DEFAULT '',
      link_descarga text NOT NULL,
      sitio_fuente text NOT NULL DEFAULT '',
      categoria text NOT NULL DEFAULT 'Utilidades',
      destacado boolean NOT NULL DEFAULT false,
      fecha_agregado timestamptz NOT NULL DEFAULT now()
    )
  `)
  ensured = true
}

export async function listDescargas(): Promise<Descarga[]> {
  await ensureTable()
  const rows = await prisma.$queryRawUnsafe<Descarga[]>(`
    SELECT id, titulo, descripcion, imagen,
           link_descarga AS "linkDescarga", sitio_fuente AS "sitioFuente",
           categoria, destacado, fecha_agregado AS "fechaAgregado"
    FROM app_downloads
    ORDER BY fecha_agregado DESC
  `)
  return rows
}

interface DescargaInput {
  titulo?: string
  descripcion?: string
  imagen?: string
  linkDescarga?: string
  sitioFuente?: string
  categoria?: string
  destacado?: boolean
}

export async function createDescarga(d: DescargaInput) {
  await ensureTable()
  const id = randomUUID()
  await prisma.$executeRawUnsafe(
    `INSERT INTO app_downloads
       (id, titulo, descripcion, imagen, link_descarga, sitio_fuente, categoria, destacado)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    id,
    d.titulo ?? '',
    d.descripcion ?? '',
    d.imagen ?? '',
    d.linkDescarga ?? '',
    d.sitioFuente ?? '',
    d.categoria ?? 'Utilidades',
    !!d.destacado,
  )
  return { id }
}

export async function updateDescarga(id: string, d: DescargaInput) {
  await ensureTable()
  await prisma.$executeRawUnsafe(
    `UPDATE app_downloads
        SET titulo=$2, descripcion=$3, imagen=$4, link_descarga=$5,
            sitio_fuente=$6, categoria=$7, destacado=$8
      WHERE id=$1`,
    id,
    d.titulo ?? '',
    d.descripcion ?? '',
    d.imagen ?? '',
    d.linkDescarga ?? '',
    d.sitioFuente ?? '',
    d.categoria ?? 'Utilidades',
    !!d.destacado,
  )
}

export async function deleteDescarga(id: string) {
  await ensureTable()
  await prisma.$executeRawUnsafe(`DELETE FROM app_downloads WHERE id=$1`, id)
}
