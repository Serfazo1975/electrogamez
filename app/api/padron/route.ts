// ============================================================
// app/api/padron/route.ts — ARCHIVO NUEVO
// GET /api/padron?doc=20214293286   (CUIT)   o   ?doc=21429328 (DNI)
// Busca los datos en el padrón de ARCA. Solo administrador.
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-session';
import { buscarEnPadron } from '@/lib/afip-padron';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!(await verifyAdminToken(cookies().get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }
  const doc = new URL(req.url).searchParams.get('doc') || '';
  try {
    const { datos, avisos } = await buscarEnPadron(doc);
    if (!datos) return NextResponse.json({ ok: false, error: 'No se encontraron datos en ARCA', avisos });
    return NextResponse.json({ ok: true, datos, avisos });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 400 });
  }
}
