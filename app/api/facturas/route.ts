import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-session';
import { ensureTablasAfip } from '@/lib/afip';

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
    // NUEVO: datos de la factura que anula cada Nota de Crédito. Si esas columnas
    // todavía no existen, se usa la consulta de siempre (el historial no se rompe).
    const consultar = (extra: string): Promise<any[]> =>
      prisma.$queryRawUnsafe(
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
                detalle, entorno, creado${extra}
         FROM facturas_afip
         ORDER BY id DESC
         LIMIT 500`
      );
    let filas: any[];
    try {
      await ensureTablasAfip();
      filas = await consultar(', concepto, asoc_id, asoc_tipo, asoc_pto_vta, asoc_nro::text AS asoc_nro, motivo');
    } catch {
      filas = await consultar('');
    }
    // NUEVO: datos del cliente de cada comprobante (nombre, condición de IVA, domicilio) para
    // que la reimpresión salga completa. Se leen del historial por cliente, donde se guardaron
    // al facturar. Es opcional: si falla, las facturas salen igual (como antes).
    try {
      const docs: any[] = await prisma.$queryRawUnsafe(
        `SELECT numero, nombre, cuit, extra->>'condIva' AS iva, extra->>'direccion' AS dom
           FROM cliente_documentos WHERE tipo = 'factura' ORDER BY id DESC LIMIT 2000`
      );
      const porNumero = new Map<string, any>();
      const porCuit = new Map<string, any>();
      for (const d of docs) {
        porNumero.set(String(d.numero), d);
        const c = String(d.cuit || '').replace(/\D/g, '');
        const real = d.nombre && d.nombre !== 'Consumidor Final';
        if (c && real && !porCuit.has(c)) porCuit.set(c, d); // el más reciente con nombre real
      }
      const clave = (pv: any, nro: any) => `${String(pv).padStart(5, '0')}-${String(nro).padStart(8, '0')}`;
      for (const f of filas) {
        // una Nota de Crédito va al mismo cliente que la factura que anula
        const k = Number(f.cbte_tipo) === 13 && f.asoc_nro ? clave(f.asoc_pto_vta, f.asoc_nro) : clave(f.pto_vta, f.cbte_nro);
        let d = porNumero.get(k);
        if (!d || !d.nombre || (d.nombre === 'Consumidor Final' && Number(f.doc_tipo) !== 99)) {
          d = porCuit.get(String(f.doc_nro || '').replace(/\D/g, '')) || d;
        }
        if (d) { f.cli_nombre = d.nombre || null; f.cli_iva = d.iva || null; f.cli_dom = d.dom || null; }
      }
    } catch { /* sin historial de clientes: se muestra como antes */ }
    // NUEVO: en qué entorno está el sistema (para ofrecer Notas de Crédito solo donde corresponde)
    return NextResponse.json({ facturas: filas, entornoActual: process.env.AFIP_ENV === 'prod' ? 'prod' : 'homo' });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'No se pudo leer el historial', detalle: String(e?.message || e) },
      { status: 500 }
    );
  }
}
