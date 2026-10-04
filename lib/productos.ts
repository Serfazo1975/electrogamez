import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

// La tabla de productos de la tienda se crea desde la app (idempotente), igual
// que las descargas: no depende de `prisma db push` en el build, así el deploy
// no se rompe por cambios de esquema. Se guarda en la base para que los
// productos se vean en TODAS las computadoras y para todos los clientes.

export interface Producto {
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
  destacado?: boolean
}

let ensured = false
async function ensureTable() {
  if (ensured) return
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS tienda_productos (
      id text PRIMARY KEY,
      nombre text NOT NULL,
      descripcion text NOT NULL DEFAULT '',
      precio double precision NOT NULL DEFAULT 0,
      categoria text NOT NULL DEFAULT '',
      imagen text NOT NULL DEFAULT '',
      mp_link text NOT NULL DEFAULT '',
      stock boolean NOT NULL DEFAULT true,
      orden integer NOT NULL DEFAULT 0,
      fecha_agregado timestamptz NOT NULL DEFAULT now()
    )
  `)
  // NUEVO: marca "destacado" para el carrusel de la portada (no toca lo existente)
  await prisma.$executeRawUnsafe(
    `ALTER TABLE tienda_productos ADD COLUMN IF NOT EXISTS destacado boolean NOT NULL DEFAULT false`
  )
  ensured = true
}

export async function listProductos(): Promise<Producto[]> {
  await ensureTable()
  const rows = await prisma.$queryRawUnsafe<Producto[]>(`
    SELECT id, nombre, descripcion, precio, categoria, imagen,
           mp_link AS "mpLink", stock, orden,
           fecha_agregado AS "fechaAgregado", destacado
    FROM tienda_productos
    ORDER BY orden ASC, fecha_agregado DESC
  `)
  return rows
}

interface ProductoInput {
  nombre?: string
  descripcion?: string
  precio?: number | string
  categoria?: string
  imagen?: string
  mpLink?: string
  stock?: boolean
  orden?: number
  destacado?: boolean
}

function toNum(v: unknown): number {
  if (v == null || v === '') return 0
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

export async function createProducto(d: ProductoInput) {
  await ensureTable()
  const id = randomUUID()
  await prisma.$executeRawUnsafe(
    `INSERT INTO tienda_productos
       (id, nombre, descripcion, precio, categoria, imagen, mp_link, stock, orden, destacado)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    id,
    d.nombre ?? '',
    d.descripcion ?? '',
    toNum(d.precio),
    d.categoria ?? '',
    d.imagen ?? '',
    d.mpLink ?? '',
    d.stock !== false,
    Number.isFinite(d.orden as number) ? (d.orden as number) : 0,
    d.destacado === true,
  )
  return { id }
}

export async function updateProducto(id: string, d: ProductoInput) {
  await ensureTable()
  await prisma.$executeRawUnsafe(
    `UPDATE tienda_productos
        SET nombre=$2, descripcion=$3, precio=$4, categoria=$5,
            imagen=$6, mp_link=$7, stock=$8,
            destacado=COALESCE($9::boolean, destacado)
      WHERE id=$1`,
    id,
    d.nombre ?? '',
    d.descripcion ?? '',
    toNum(d.precio),
    d.categoria ?? '',
    d.imagen ?? '',
    d.mpLink ?? '',
    d.stock !== false,
    typeof d.destacado === 'boolean' ? d.destacado : null,
  )
}

export async function deleteProducto(id: string) {
  await ensureTable()
  await prisma.$executeRawUnsafe(`DELETE FROM tienda_productos WHERE id=$1`, id)
}

// NUEVO: productos para el carrusel de la portada (máx. `limite`).
// Muestra los marcados con ⭐ "destacado" que tengan stock; si todavía no
// marcaste ninguno, muestra los primeros con stock según el orden de la tienda.
export async function listDestacados(limite = 4): Promise<Producto[]> {
  await ensureTable()
  const n = Math.min(Math.max(Math.floor(limite) || 4, 1), 8)
  const marcados = await prisma.$queryRawUnsafe<Producto[]>(`
    SELECT id, nombre, descripcion, precio, categoria, imagen,
           mp_link AS "mpLink", stock, orden,
           fecha_agregado AS "fechaAgregado", destacado
    FROM tienda_productos
    WHERE destacado = true AND stock = true
    ORDER BY orden ASC, fecha_agregado DESC
    LIMIT ${n}
  `)
  if (marcados.length > 0) return marcados
  return prisma.$queryRawUnsafe<Producto[]>(`
    SELECT id, nombre, descripcion, precio, categoria, imagen,
           mp_link AS "mpLink", stock, orden,
           fecha_agregado AS "fechaAgregado", destacado
    FROM tienda_productos
    WHERE stock = true
    ORDER BY orden ASC, fecha_agregado DESC
    LIMIT ${n}
  `)
}
