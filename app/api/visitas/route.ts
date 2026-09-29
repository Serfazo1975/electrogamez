// ============================================================
// app/api/visitas/route.ts — Contador de visitas real
// ElectroGamez — Módulo NUEVO. No modifica nada existente.
// GET  /api/visitas  → suma 1 y devuelve el total (arranca en 1000)
// La tabla se crea sola con CREATE TABLE IF NOT EXISTS (SQL crudo).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
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

// NUEVO: cada visitante (IP) suma 1 sola vez por día.
// Antes cualquiera podía recargar /api/visitas y subir el número sin límite.
let tablaIpLista = false;
async function ensureTablaIp() {
  if (tablaIpLista) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS visitas_ip (
      clave TEXT PRIMARY KEY,           -- huella de IP + día (no se guarda la IP real)
      dia   DATE NOT NULL DEFAULT CURRENT_DATE
    )
  `);
  tablaIpLista = true;
}

async function huella(ip: string, dia: string) {
  const datos = new TextEncoder().encode(`${ip}|${dia}|${process.env.ADMIN_SESSION_SECRET || 'eg'}`);
  const hash = await crypto.subtle.digest('SHA-256', datos);
  return Array.from(new Uint8Array(hash)).slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function GET(req: NextRequest) {
  try {
    await ensureTabla();
    await ensureTablaIp();

    const ip = (req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for')?.split(',')[0] || '').trim();
    const ua = req.headers.get('user-agent') || '';
    const esBot = !ua || /bot|crawl|spider|slurp|curl|wget|python|headless|lighthouse/i.test(ua);
    const dia = new Date().toISOString().slice(0, 10);

    let sumar = false;
    if (ip && !esBot) {
      const nuevo: any[] = await prisma.$queryRawUnsafe(
        `INSERT INTO visitas_ip (clave, dia) VALUES ($1, CURRENT_DATE) ON CONFLICT (clave) DO NOTHING RETURNING clave`,
        await huella(ip, dia)
      );
      sumar = nuevo.length > 0;
      if (sumar && Math.random() < 0.02) {
        await prisma.$executeRawUnsafe(`DELETE FROM visitas_ip WHERE dia < CURRENT_DATE - 2`);
      }
    }

    const filas: any[] = sumar
      ? await prisma.$queryRawUnsafe(`UPDATE visitas_contador SET total = total + 1 WHERE id = 1 RETURNING total`)
      : await prisma.$queryRawUnsafe(`SELECT total FROM visitas_contador WHERE id = 1`);
    const total = filas.length ? Number(filas[0].total) : BASE_INICIAL;
    return NextResponse.json({ ok: true, total });
  } catch (e: any) {
    // Si algo falla, devolvemos la base para no romper la página
    return NextResponse.json({ ok: false, total: BASE_INICIAL, error: e.message });
  }
}
