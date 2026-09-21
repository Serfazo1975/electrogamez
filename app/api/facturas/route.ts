import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

// Cliente propio (no toca lib/afip.ts ni el resto del sistema)
const g = globalThis as unknown as { __egPrismaFacturas?: PrismaClient };
const prisma = g.__egPrismaFacturas ?? new PrismaClient();
g.__egPrismaFacturas = prisma;

// SOLO LECTURA: devuelve las facturas guardadas en facturas_afip (con su detalle)
export async function GET() {
  const ok = await verifyAdminToken(cookies().get(ADMIN_COOKIE)?.value);
  if (!ok) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const filas: any[] = await prisma.$queryRawUnsafe(
      `SELECT id,
              cbte_tipo,
              pto_vta,
              cbte_nro::text AS cbte_nro,
              doc_tipo,
              doc_nro::text AS doc_nro,
              cond_iva_receptor,
              imp_total::float AS imp_total,
              imp_neto::float AS imp_neto,
              imp_iva::float AS imp_iva,
              cae, cae_vto, resultado, observaciones,
              detalle, entorno, creado
       FROM facturas_afip
       ORDER BY id DESC
       LIMIT 500`
    );
    return NextResponse.json({ facturas: filas });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'No se pudo leer el historial', detalle: String(e?.message || e) },
      { status: 500 }
    );
  }
}
