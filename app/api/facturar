// ============================================================
// app/api/facturar/route.ts — Endpoint NUEVO de facturación AFIP
// POST /api/facturar  → emite factura y devuelve CAE
// GET  /api/facturar  → lista las últimas facturas emitidas
// Protegido con la misma cookie eg_admin del panel admin.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { emitirFactura, listarFacturas, DatosFactura } from '@/lib/afip';

export const dynamic = 'force-dynamic';

// ⚠️ Ajustar si tu chequeo de admin es distinto al de las otras rutas admin
function esAdmin(): boolean {
  const cookie = cookies().get('eg_admin');
  return !!cookie && cookie.value === (process.env.ADMIN_PASSWORD || '');
}

export async function POST(req: NextRequest) {
  if (!esAdmin()) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  let body: DatosFactura;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ ok: false, error: 'Debe enviar al menos un item' }, { status: 400 });
  }

  for (const item of body.items) {
    if (!item.descripcion || item.cantidad <= 0 || item.precioUnitario <= 0) {
      return NextResponse.json(
        { ok: false, error: 'Cada item necesita descripción, cantidad > 0 y precio > 0' },
        { status: 400 }
      );
    }
  }

  const resultado = await emitirFactura(body);
  return NextResponse.json(resultado, { status: resultado.ok ? 200 : 422 });
}

export async function GET() {
  if (!esAdmin()) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }
  try {
    const facturas = await listarFacturas(100);
    return NextResponse.json({ ok: true, facturas });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
