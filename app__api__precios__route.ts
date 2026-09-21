import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

let prismaModule: any = null;
async function db() {
  if (!prismaModule) prismaModule = await import('@/lib/prisma');
  return prismaModule.prisma;
}

async function esAdmin(): Promise<boolean> {
  return verifyAdminToken(cookies().get(ADMIN_COOKIE)?.value);
}

const PRECIOS_DEFAULT = [
  { id: 1, servicio: 'Diagnóstico completo', precio: '15.000', nota: 'Se descuenta si reparás con nosotros', icono: '🔍' },
  { id: 2, servicio: 'Limpieza + pasta térmica', precio: '55.000', nota: 'PC, notebook o PlayStation', icono: '🧹' },
  { id: 3, servicio: 'HDMI PlayStation 5', precio: '195.000', nota: 'Microsoldadura, garantía escrita', icono: '🎮' },
  { id: 4, servicio: 'Cambio de pantalla notebook', precio: '155.000', nota: 'Incluye pantalla e instalación', icono: '💻' },
  { id: 5, servicio: 'Instalación Windows + drivers', precio: '65.000', nota: 'Licencia original opcional', icono: '🪟' },
  { id: 6, servicio: 'Soporte técnico empresas', precio: 'A convenir', nota: 'Servidores, redes, UPS', icono: '🏢' },
];

let tablaLista = false;
async function ensureTabla(prisma: any) {
  if (tablaLista) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS precios_web (
      id INT PRIMARY KEY DEFAULT 1,
      datos JSONB NOT NULL DEFAULT '[]'::jsonb
    )
  `);
  await prisma.$executeRawUnsafe(`
    INSERT INTO precios_web (id, datos)
    VALUES (1, $1::jsonb)
    ON CONFLICT (id) DO NOTHING
  `, JSON.stringify(PRECIOS_DEFAULT));
  tablaLista = true;
}

// GET: cualquiera puede ver los precios (es público)
export async function GET() {
  try {
    const prisma = await db();
    await ensureTabla(prisma);
    const filas: any[] = await prisma.$queryRawUnsafe(`SELECT datos FROM precios_web WHERE id = 1`);
    const datos = filas.length ? filas[0].datos : PRECIOS_DEFAULT;
    return NextResponse.json({ ok: true, precios: datos });
  } catch {
    return NextResponse.json({ ok: true, precios: PRECIOS_DEFAULT });
  }
}

// PUT: solo admin puede editar precios
export async function PUT(req: NextRequest) {
  if (!(await esAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const prisma = await db();
    await ensureTabla(prisma);
    const body = await req.json();
    const precios = body.precios;
    if (!Array.isArray(precios)) return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
    await prisma.$executeRawUnsafe(
      `UPDATE precios_web SET datos = $1::jsonb WHERE id = 1`,
      JSON.stringify(precios)
    );
    return NextResponse.json({ ok: true, precios });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
