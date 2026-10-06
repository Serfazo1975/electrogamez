// ============================================================
// app/api/notas-credito/route.ts — NUEVO
// POST /api/notas-credito → emite una Nota de Crédito C ante ARCA
//   { facturaId, items?, concepto?, motivo? }
//   Sin "items" = anulación TOTAL (lo que quede por acreditar de esa factura).
// Protegido con la misma cookie de administrador que /api/facturar.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { emitirNotaCredito, DatosNotaCredito } from '@/lib/afip';
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!(await verifyAdminToken(cookies().get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  let body: DatosNotaCredito;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  if (!body || !Number.isInteger(Number(body.facturaId)) || Number(body.facturaId) <= 0) {
    return NextResponse.json({ ok: false, error: 'Falta indicar qué factura se anula' }, { status: 400 });
  }

  const resultado = await emitirNotaCredito({
    facturaId: Number(body.facturaId),
    items: Array.isArray(body.items) ? body.items : undefined,
    concepto: body.concepto,
    motivo: typeof body.motivo === 'string' ? body.motivo : undefined,
  });
  return NextResponse.json(resultado, { status: resultado.ok ? 200 : 422 });
}
