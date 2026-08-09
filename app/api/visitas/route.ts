// ============================================================
// app/api/visitas/route.ts — Contador de visitas real
// ElectroGamez — Módulo NUEVO. No modifica nada existente.
// GET  /api/visitas  → suma 1 y devuelve el total (arranca en 1000)
// La tabla se crea sola con CREATE TABLE IF NOT EXISTS (SQL crudo).
// ============================================================

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // ⚠️ Ajustar si tu import de Prisma es distinto

export const dynamic = 'force-dynamic';

const BASE_INICIAL = 1000; // el contador arranca desde acá

let tablaLista = false;
async function ensureTabla() {
  if (tablaLista) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS visitas_contador (
      id INT PRIMARY KEY DEFAULT 1,
      total BIGINT NOT NULL DEFAULT ${BASE_INICIAL}
    )
  `);
  // Insertar la fila inicial si no existe (arranca en 1000)
  await prisma.$executeRawUnsafe(`
    INSERT INTO visitas_contador (id, total)
    VALUES (1, ${BASE_INICIAL})
    ON CONFLICT (id) DO NOTHING
  `);
  tablaLista = true;
}

export async function GET() {
  try {
    await ensureTabla();
    // Suma 1 de forma atómica y devuelve el nuevo total
    const filas: any[] = await prisma.$queryRawUnsafe(
      `UPDATE visitas_contador SET total = total + 1 WHERE id = 1 RETURNING total`
    );
    const total = filas.length ? Number(filas[0].total) : BASE_INICIAL;
    return NextResponse.json({ ok: true, total });
  } catch (e: any) {
    // Si algo falla, devolvemos la base para no romper la página
    return NextResponse.json({ ok: false, total: BASE_INICIAL, error: e.message });
  }
}
