// ============================================================
// lib/afip-padron.ts — ARCHIVO NUEVO (no modifica lib/afip.ts)
// Consulta de datos de un CUIT / DNI en el padrón de ARCA:
//   • A5  "ws_sr_constancia_inscripcion" → nombre, domicilio fiscal y
//          condición frente al IVA (Monotributo / RI / Exento)
//   • A13 "ws_sr_padron_a13"             → DNI → CUIT/CUIL y datos de
//          personas no inscriptas (consumidores finales)
// Usa el MISMO certificado de facturación (AFIP_CERT_B64 / AFIP_KEY_B64),
// pero cada servicio debe estar habilitado en ARCA para ese certificado.
// Tickets de acceso cacheados en la tabla existente afip_ta
// (servicio distinto de 'wsfe', no pisa el de facturación).
// ============================================================

import forge from 'node-forge';
import { prisma } from '@/lib/prisma';

const ES_PROD = (process.env.AFIP_PADRON_ENV || process.env.AFIP_ENV) === 'prod';
const CUIT_EMISOR = process.env.AFIP_CUIT || '';

const URL_WSAA = ES_PROD
  ? 'https://wsaa.afip.gov.ar/ws/services/LoginCms'
  : 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms';
const BASE = ES_PROD
  ? 'https://aws.afip.gov.ar/sr-padron/webservices'
  : 'https://awshomo.afip.gov.ar/sr-padron/webservices';

const SERV_A5 = 'ws_sr_constancia_inscripcion';
const SERV_A13 = 'ws_sr_padron_a13';

export interface DatosPadron {
  cuit: string;
  nombre: string;
  condIva: '' | 'Consumidor Final' | 'Monotributista' | 'Responsable Inscripto' | 'Exento';
  direccion: string;
  tipoPersona: string; // FISICA | JURIDICA
  fuente: 'A5' | 'A13';
}

// ── utilidades ──────────────────────────────────────────────
function pem(envVar: string | undefined, nombre: string) {
  if (!envVar) throw new Error(`Falta la variable de entorno ${nombre}`);
  return Buffer.from(envVar, 'base64').toString('utf8');
}
function tag(xml: string, t: string): string {
  const m = xml.match(new RegExp(`<(?:\\w+:)?${t}[^>]*>([\\s\\S]*?)</(?:\\w+:)?${t}>`, 'i'));
  return m ? m[1].trim() : '';
}
function tags(xml: string, t: string): string[] {
  const re = new RegExp(`<(?:\\w+:)?${t}[^>]*>([\\s\\S]*?)</(?:\\w+:)?${t}>`, 'gi');
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) out.push(m[1].trim());
  return out;
}
function desesc(s: string) {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
}
const titulo = (s: string) => s.toLowerCase().replace(/(^|[\s.,'-])(\S)/g, (_, a, b) => a + b.toUpperCase());

// Dígito verificador de CUIT/CUIL
export function cuitValido(c: string) {
  if (!/^\d{11}$/.test(c)) return false;
  const m = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let s = 0;
  for (let i = 0; i < 10; i++) s += Number(c[i]) * m[i];
  let dv = 11 - (s % 11);
  if (dv === 11) dv = 0;
  if (dv === 10) dv = 9;
  return dv === Number(c[10]);
}
// Posibles CUIT/CUIL a partir de un DNI (20 = masc., 27 = fem., 23/24 = casos especiales)
export function cuitsDesdeDni(dni: string): string[] {
  const d = dni.replace(/\D/g, '').padStart(8, '0');
  const out: string[] = [];
  for (const p of ['20', '27', '23', '24']) {
    const base = p + d;
    const m = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let s = 0;
    for (let i = 0; i < 10; i++) s += Number(base[i]) * m[i];
    const r = 11 - (s % 11);
    if (r === 10) continue; // ese prefijo no aplica
    out.push(base + (r === 11 ? 0 : r));
  }
  return out;
}

// ── WSAA (ticket por servicio) ──────────────────────────────
async function ticket(servicio: string): Promise<{ token: string; sign: string }> {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS afip_ta (
      servicio TEXT PRIMARY KEY, token TEXT NOT NULL, sign TEXT NOT NULL, expira TIMESTAMPTZ NOT NULL
    )`);
  const clave = `${servicio}:${ES_PROD ? 'prod' : 'homo'}`;
  const filas: any[] = await prisma.$queryRawUnsafe(
    `SELECT token, sign FROM afip_ta WHERE servicio = $1 AND expira > NOW() + INTERVAL '5 minutes'`, clave
  );
  if (filas.length) return { token: filas[0].token, sign: filas[0].sign };

  const ahora = new Date();
  const tra = `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0"><header>
<uniqueId>${Math.floor(ahora.getTime() / 1000)}</uniqueId>
<generationTime>${new Date(ahora.getTime() - 600000).toISOString()}</generationTime>
<expirationTime>${new Date(ahora.getTime() + 43200000).toISOString()}</expirationTime>
</header><service>${servicio}</service></loginTicketRequest>`;

  const cert = forge.pki.certificateFromPem(pem(process.env.AFIP_CERT_B64, 'AFIP_CERT_B64'));
  const key = forge.pki.privateKeyFromPem(pem(process.env.AFIP_KEY_B64, 'AFIP_KEY_B64'));
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(tra, 'utf8');
  p7.addCertificate(cert);
  p7.addSigner({
    key, certificate: cert, digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
      { type: forge.pki.oids.signingTime, value: new Date() as any },
    ],
  });
  p7.sign();
  const cms = forge.util.encode64(forge.asn1.toDer(p7.toAsn1()).getBytes());

  const res = await fetch(URL_WSAA, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: '' },
    body: `<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsaa="http://wsaa.view.sua.dvadac.desein.afip.gov"><soapenv:Header/><soapenv:Body><wsaa:loginCms><wsaa:in0>${cms}</wsaa:in0></wsaa:loginCms></soapenv:Body></soapenv:Envelope>`,
  });
  const txt = await res.text();
  if (txt.includes('faultstring')) {
    const f = tag(txt, 'faultstring');
    if (/no autorizado|notAuthorized|cms.cert.untrusted|no tiene/i.test(f) || /coe\.notAuthorized/i.test(txt)) {
      throw new Error(`SERVICIO_NO_HABILITADO:${servicio}`);
    }
    throw new Error('WSAA: ' + f);
  }
  const x = desesc(tag(txt, 'loginCmsReturn'));
  const token = tag(x, 'token'), sign = tag(x, 'sign'), exp = tag(x, 'expirationTime');
  if (!token || !sign) throw new Error('WSAA: sin token');
  await prisma.$executeRawUnsafe(
    `INSERT INTO afip_ta (servicio, token, sign, expira) VALUES ($1,$2,$3,$4)
     ON CONFLICT (servicio) DO UPDATE SET token=$2, sign=$3, expira=$4`,
    clave, token, sign, new Date(exp)
  );
  return { token, sign };
}

async function soap(url: string, ns: string, metodo: string, params: Record<string, string>) {
  const cuerpo = Object.entries(params).map(([k, v]) => `<${k}>${v}</${k}>`).join('');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: '' },
    body: `<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:a="${ns}"><soapenv:Header/><soapenv:Body><a:${metodo}>${cuerpo}</a:${metodo}></soapenv:Body></soapenv:Envelope>`,
  });
  return res.text();
}

// ── A5: constancia de inscripción ───────────────────────────
async function consultarA5(cuit: string): Promise<DatosPadron | null> {
  const { token, sign } = await ticket(SERV_A5);
  const xml = await soap(`${BASE}/personaServiceA5`, 'http://a5.soap.ws.server.puc.sr/', 'getPersona_v2',
    { token, sign, cuitRepresentada: CUIT_EMISOR, idPersona: cuit });
  if (xml.includes('faultstring')) {
    const f = tag(xml, 'faultstring');
    if (/no existe|inexistente|no se encuentra/i.test(f)) return null;
    throw new Error('A5: ' + f);
  }
  const gen = tag(xml, 'datosGenerales');
  if (!gen) return null; // sin constancia (ej. CUIL de consumidor final)
  const razon = tag(gen, 'razonSocial');
  const nombre = razon || [tag(gen, 'apellido'), tag(gen, 'nombre')].filter(Boolean).join(' ');
  const dom = tag(gen, 'domicilioFiscal');
  const direccion = [tag(dom, 'direccion'), tag(dom, 'localidad'), tag(dom, 'descripcionProvincia')]
    .filter(Boolean).map(titulo).join(', ');

  let condIva: DatosPadron['condIva'] = 'Consumidor Final';
  const impuestos = tags(tag(xml, 'datosRegimenGeneral'), 'idImpuesto');
  if (tag(xml, 'datosMonotributo')) condIva = 'Monotributista';
  else if (impuestos.includes('30')) condIva = 'Responsable Inscripto';
  else if (impuestos.includes('32')) condIva = 'Exento';

  return { cuit, nombre: titulo(desesc(nombre)), condIva, direccion: desesc(direccion), tipoPersona: tag(gen, 'tipoPersona'), fuente: 'A5' };
}

// ── A13: padrón general (incluye CUIL) ──────────────────────
async function a13Persona(cuit: string): Promise<DatosPadron | null> {
  const { token, sign } = await ticket(SERV_A13);
  const xml = await soap(`${BASE}/personaServiceA13`, 'http://a13.soap.ws.server.puc.sr/', 'getPersona',
    { token, sign, cuitRepresentada: CUIT_EMISOR, idPersona: cuit });
  if (xml.includes('faultstring')) return null;
  const p = tag(xml, 'persona');
  if (!p) return null;
  const nombre = tag(p, 'razonSocial') || [tag(p, 'apellido'), tag(p, 'nombre')].filter(Boolean).join(' ');
  const doms = tags(p, 'domicilio');
  const dom = doms.find(d => /FISCAL/i.test(tag(d, 'tipoDomicilio'))) || doms[0] || '';
  const direccion = [tag(dom, 'direccion'), tag(dom, 'localidad'), tag(dom, 'descripcionProvincia')]
    .filter(Boolean).map(titulo).join(', ');
  return { cuit, nombre: titulo(desesc(nombre)), condIva: 'Consumidor Final', direccion: desesc(direccion), tipoPersona: tag(p, 'tipoPersona'), fuente: 'A13' };
}

async function a13Dni(dni: string): Promise<string[]> {
  const { token, sign } = await ticket(SERV_A13);
  const xml = await soap(`${BASE}/personaServiceA13`, 'http://a13.soap.ws.server.puc.sr/', 'getIdPersonaListByDocumento',
    { token, sign, cuitRepresentada: CUIT_EMISOR, documento: dni });
  if (xml.includes('faultstring')) return [];
  return tags(xml, 'idPersona').filter(cuitValido);
}

// ── Punto de entrada: CUIT (11 dígitos) o DNI (7-8 dígitos) ──
export async function buscarEnPadron(doc: string): Promise<{ datos: DatosPadron | null; avisos: string[] }> {
  const n = doc.replace(/\D/g, '');
  const avisos: string[] = [];
  let a13Ok = true, a5Ok = true;

  let candidatos: string[] = [];
  if (n.length === 11) {
    if (!cuitValido(n)) throw new Error('El CUIT no es válido (dígito verificador incorrecto)');
    candidatos = [n];
  } else if (n.length >= 7 && n.length <= 8) {
    try { candidatos = await a13Dni(n); }
    catch (e: any) { if (String(e.message).startsWith('SERVICIO_NO_HABILITADO')) { a13Ok = false; } else avisos.push(String(e.message)); }
    if (!candidatos.length) candidatos = cuitsDesdeDni(n); // si A13 no está, probamos los CUIT posibles
  } else {
    throw new Error('Ingresá un CUIT de 11 dígitos o un DNI de 7-8 dígitos');
  }

  for (const c of candidatos) {
    if (a5Ok) {
      try { const r = await consultarA5(c); if (r) return { datos: r, avisos }; }
      catch (e: any) { if (String(e.message).startsWith('SERVICIO_NO_HABILITADO')) a5Ok = false; else avisos.push(String(e.message)); }
    }
    if (a13Ok) {
      try { const r = await a13Persona(c); if (r) return { datos: r, avisos }; }
      catch (e: any) { if (String(e.message).startsWith('SERVICIO_NO_HABILITADO')) a13Ok = false; }
    }
    if (!a5Ok && !a13Ok) break;
  }

  if (!a5Ok) avisos.push(`El servicio "${SERV_A5}" no está habilitado para tu certificado en ARCA.`);
  if (!a13Ok) avisos.push(`El servicio "${SERV_A13}" no está habilitado (necesario para buscar por DNI a consumidores finales).`);
  return { datos: null, avisos };
}
