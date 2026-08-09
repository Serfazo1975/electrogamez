// ============================================================
// lib/afip.ts — Facturación Electrónica AFIP/ARCA (WSAA + WSFEv1)
// ElectroGamez — Módulo NUEVO, no modifica nada existente.
// Requiere: npm install node-forge  (+ npm i -D @types/node-forge)
//
// Variables de entorno (Netlify):
//   AFIP_CUIT        = 20XXXXXXXXX  (sin guiones)
//   AFIP_PTO_VTA     = 3            (el punto de venta Web Services que crees)
//   AFIP_CBTE_TIPO   = 11           (11 = Factura C monotributo | 6 = Factura B RI)
//   AFIP_ENV         = homo         ("homo" = pruebas | "prod" = producción)
//   AFIP_CERT_B64    = base64 del certificado .crt que te da AFIP
//   AFIP_KEY_B64     = base64 de la clave privada .key
// ============================================================

import forge from 'node-forge';
import { prisma } from '@/lib/prisma'; // ⚠️ Ajustar si tu import de Prisma es distinto

// ------------------------------------------------------------
// URLs según entorno
// ------------------------------------------------------------
const ES_PROD = process.env.AFIP_ENV === 'prod';

const URL_WSAA = ES_PROD
  ? 'https://wsaa.afip.gov.ar/ws/services/LoginCms'
  : 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms';

const URL_WSFE = ES_PROD
  ? 'https://servicios1.afip.gov.ar/wsfev1/service.asmx'
  : 'https://wswhomo.afip.gov.ar/wsfev1/service.asmx';

const CUIT = process.env.AFIP_CUIT || '';
const PTO_VTA = parseInt(process.env.AFIP_PTO_VTA || '1');
const CBTE_TIPO = parseInt(process.env.AFIP_CBTE_TIPO || '11'); // 11 = Factura C

// ------------------------------------------------------------
// Tablas (patrón resguardo: CREATE TABLE IF NOT EXISTS, SQL crudo)
// ------------------------------------------------------------
let tablasListas = false;

export async function ensureTablasAfip() {
  if (tablasListas) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS afip_ta (
      servicio TEXT PRIMARY KEY,
      token TEXT NOT NULL,
      sign TEXT NOT NULL,
      expira TIMESTAMPTZ NOT NULL
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS facturas_afip (
      id SERIAL PRIMARY KEY,
      cbte_tipo INT NOT NULL,
      pto_vta INT NOT NULL,
      cbte_nro BIGINT NOT NULL,
      doc_tipo INT NOT NULL,
      doc_nro BIGINT NOT NULL,
      cond_iva_receptor INT NOT NULL DEFAULT 5,
      imp_total NUMERIC(14,2) NOT NULL,
      imp_neto NUMERIC(14,2) NOT NULL,
      imp_iva NUMERIC(14,2) NOT NULL,
      cae TEXT,
      cae_vto TEXT,
      resultado TEXT,
      observaciones TEXT,
      detalle JSONB,
      entorno TEXT NOT NULL DEFAULT 'homo',
      creado TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  tablasListas = true;
}

// ------------------------------------------------------------
// WSAA: obtener Ticket de Acceso (token + sign), cacheado en DB
// ------------------------------------------------------------
function leerPem(envVar: string | undefined, nombre: string): string {
  if (!envVar) throw new Error(`Falta la variable de entorno ${nombre}`);
  return Buffer.from(envVar, 'base64').toString('utf8');
}

function crearTRA(): string {
  const ahora = new Date();
  const gen = new Date(ahora.getTime() - 10 * 60 * 1000); // -10 min por desfase de reloj
  const exp = new Date(ahora.getTime() + 12 * 60 * 60 * 1000); // +12 hs
  return `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
  <header>
    <uniqueId>${Math.floor(ahora.getTime() / 1000)}</uniqueId>
    <generationTime>${gen.toISOString()}</generationTime>
    <expirationTime>${exp.toISOString()}</expirationTime>
  </header>
  <service>wsfe</service>
</loginTicketRequest>`;
}

function firmarTRA(tra: string): string {
  const certPem = leerPem(process.env.AFIP_CERT_B64, 'AFIP_CERT_B64');
  const keyPem = leerPem(process.env.AFIP_KEY_B64, 'AFIP_KEY_B64');

  const cert = forge.pki.certificateFromPem(certPem);
  const key = forge.pki.privateKeyFromPem(keyPem);

  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(tra, 'utf8');
  p7.addCertificate(cert);
  p7.addSigner({
    key,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
      { type: forge.pki.oids.signingTime, value: new Date() as any },
    ],
  });
  p7.sign();

  const der = forge.asn1.toDer(p7.toAsn1()).getBytes();
  return forge.util.encode64(der);
}

function extraer(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? m[1].trim() : '';
}

function desescapar(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

async function obtenerTA(): Promise<{ token: string; sign: string }> {
  await ensureTablasAfip();

  // 1) ¿Hay TA vigente en la DB? (margen de 5 minutos)
  const filas: any[] = await prisma.$queryRawUnsafe(
    `SELECT token, sign FROM afip_ta WHERE servicio = 'wsfe' AND expira > NOW() + INTERVAL '5 minutes'`
  );
  if (filas.length > 0) {
    return { token: filas[0].token, sign: filas[0].sign };
  }

  // 2) No hay: generar TRA, firmarlo y pedir uno nuevo al WSAA
  const cms = firmarTRA(crearTRA());
  const soap = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsaa="http://wsaa.view.sua.dvadac.desein.afip.gov">
  <soapenv:Header/>
  <soapenv:Body>
    <wsaa:loginCms><wsaa:in0>${cms}</wsaa:in0></wsaa:loginCms>
  </soapenv:Body>
</soapenv:Envelope>`;

  const res = await fetch(URL_WSAA, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: '' },
    body: soap,
  });
  const texto = await res.text();

  if (texto.includes('faultstring')) {
    throw new Error('WSAA error: ' + extraer(texto, 'faultstring'));
  }

  const respuestaXml = desescapar(extraer(texto, 'loginCmsReturn'));
  const token = extraer(respuestaXml, 'token');
  const sign = extraer(respuestaXml, 'sign');
  const expira = extraer(respuestaXml, 'expirationTime');

  if (!token || !sign) throw new Error('WSAA: no se pudo obtener token/sign');

  // 3) Guardar en DB para próximas invocaciones (dura 12 hs)
  await prisma.$executeRawUnsafe(
    `INSERT INTO afip_ta (servicio, token, sign, expira)
     VALUES ('wsfe', $1, $2, $3)
     ON CONFLICT (servicio) DO UPDATE SET token = $1, sign = $2, expira = $3`,
    token, sign, new Date(expira)
  );

  return { token, sign };
}

// ------------------------------------------------------------
// WSFE: helpers SOAP
// ------------------------------------------------------------
async function llamarWSFE(metodo: string, cuerpo: string): Promise<string> {
  const res = await fetch(URL_WSFE, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: `http://ar.gov.afip.dif.FEV1/${metodo}`,
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
  <soap:Body>${cuerpo}</soap:Body>
</soap:Envelope>`,
  });
  return res.text();
}

function bloqueAuth(token: string, sign: string): string {
  return `<ar:Auth><ar:Token>${token}</ar:Token><ar:Sign>${sign}</ar:Sign><ar:Cuit>${CUIT}</ar:Cuit></ar:Auth>`;
}

async function ultimoComprobante(token: string, sign: string): Promise<number> {
  const xml = await llamarWSFE('FECompUltimoAutorizado', `
    <ar:FECompUltimoAutorizado>
      ${bloqueAuth(token, sign)}
      <ar:PtoVta>${PTO_VTA}</ar:PtoVta>
      <ar:CbteTipo>${CBTE_TIPO}</ar:CbteTipo>
    </ar:FECompUltimoAutorizado>`);
  const nro = extraer(xml, 'CbteNro');
  if (nro === '') throw new Error('WSFE: no se pudo obtener el último comprobante. Respuesta: ' + xml.slice(0, 500));
  return parseInt(nro);
}

// ------------------------------------------------------------
// API PRINCIPAL: emitir factura y obtener CAE
// ------------------------------------------------------------
export interface ItemFactura {
  descripcion: string;
  cantidad: number;
  precioUnitario: number; // precio final con IVA incluido
}

export interface DatosFactura {
  docTipo?: number;   // 99 = Consumidor Final | 96 = DNI | 80 = CUIT
  docNro?: number;    // 0 si es consumidor final
  condIvaReceptor?: number; // 5 = Consumidor Final | 1 = RI | 6 = Monotributo (RG 5616)
  concepto?: number;  // 1 = Productos | 2 = Servicios | 3 = Productos y Servicios
  fechaServDesde?: string; // 'YYYYMMDD' (obligatorio si concepto 2 o 3)
  fechaServHasta?: string; // 'YYYYMMDD'
  fechaVtoPago?: string;   // 'YYYYMMDD'
  items: ItemFactura[];
}

export interface ResultadoFactura {
  ok: boolean;
  cae?: string;
  caeVto?: string;       // 'YYYYMMDD'
  cbteNro?: number;
  cbteTipo?: number;
  ptoVta?: number;
  total?: number;
  fechaCbte?: string;    // 'YYYYMMDD'
  docTipo?: number;
  docNro?: number;
  concepto?: number;
  fechaServDesde?: string;
  fechaServHasta?: string;
  fechaVtoPago?: string;
  error?: string;
  observaciones?: string;
}

export async function emitirFactura(datos: DatosFactura): Promise<ResultadoFactura> {
  try {
    if (!CUIT) throw new Error('Falta configurar AFIP_CUIT');
    if (!datos.items || datos.items.length === 0) throw new Error('No hay items para facturar');

    const { token, sign } = await obtenerTA();

    const total = redondear(datos.items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0));

    // Factura C (monotributo): sin discriminar IVA. Factura B: IVA 21% incluido.
    const esFacturaC = CBTE_TIPO === 11;
    const impNeto = esFacturaC ? total : redondear(total / 1.21);
    const impIVA = esFacturaC ? 0 : redondear(total - impNeto);

    const docTipo = datos.docTipo ?? 99;
    const docNro = datos.docNro ?? 0;
    const condIva = datos.condIvaReceptor ?? 5; // Consumidor Final

    const proximo = (await ultimoComprobante(token, sign)) + 1;

    const hoy = new Date();
    const fechaCbte = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}${String(hoy.getDate()).padStart(2, '0')}`;

    // Concepto: 1 = Productos | 2 = Servicios | 3 = Productos y Servicios
    const concepto = datos.concepto ?? 1;

    // Para Servicios (2) y Ambos (3), ARCA exige fechas de servicio y vto de pago.
    // Si no se envían, se usan por defecto la fecha de hoy y el vto a +10 días.
    let bloqueFechasServ = '';
    let fSvcDesde = datos.fechaServDesde || fechaCbte;
    let fSvcHasta = datos.fechaServHasta || fechaCbte;
    let fVtoPago = datos.fechaVtoPago || sumarDias(hoy, 10);
    if (concepto === 2 || concepto === 3) {
      bloqueFechasServ =
        `<ar:FchServDesde>${fSvcDesde}</ar:FchServDesde>` +
        `<ar:FchServHasta>${fSvcHasta}</ar:FchServHasta>` +
        `<ar:FchVtoPago>${fVtoPago}</ar:FchVtoPago>`;
    } else {
      fSvcDesde = ''; fSvcHasta = ''; fVtoPago = '';
    }

    const bloqueIva = esFacturaC
      ? ''
      : `<ar:Iva><ar:AlicIva><ar:Id>5</ar:Id><ar:BaseImp>${impNeto.toFixed(2)}</ar:BaseImp><ar:Importe>${impIVA.toFixed(2)}</ar:Importe></ar:AlicIva></ar:Iva>`;

    const xml = await llamarWSFE('FECAESolicitar', `
      <ar:FECAESolicitar>
        ${bloqueAuth(token, sign)}
        <ar:FeCAEReq>
          <ar:FeCabReq>
            <ar:CantReg>1</ar:CantReg>
            <ar:PtoVta>${PTO_VTA}</ar:PtoVta>
            <ar:CbteTipo>${CBTE_TIPO}</ar:CbteTipo>
          </ar:FeCabReq>
          <ar:FeDetReq>
            <ar:FECAEDetRequest>
              <ar:Concepto>${concepto}</ar:Concepto>
              <ar:DocTipo>${docTipo}</ar:DocTipo>
              <ar:DocNro>${docNro}</ar:DocNro>
              <ar:CbteDesde>${proximo}</ar:CbteDesde>
              <ar:CbteHasta>${proximo}</ar:CbteHasta>
              <ar:CbteFch>${fechaCbte}</ar:CbteFch>
              <ar:ImpTotal>${total.toFixed(2)}</ar:ImpTotal>
              <ar:ImpTotConc>0</ar:ImpTotConc>
              <ar:ImpNeto>${impNeto.toFixed(2)}</ar:ImpNeto>
              <ar:ImpOpEx>0</ar:ImpOpEx>
              <ar:ImpTrib>0</ar:ImpTrib>
              <ar:ImpIVA>${impIVA.toFixed(2)}</ar:ImpIVA>
              ${bloqueFechasServ}
              <ar:MonId>PES</ar:MonId>
              <ar:MonCotiz>1</ar:MonCotiz>
              <ar:CondicionIVAReceptorId>${condIva}</ar:CondicionIVAReceptorId>
              ${bloqueIva}
            </ar:FECAEDetRequest>
          </ar:FeDetReq>
        </ar:FeCAEReq>
      </ar:FECAESolicitar>`);

    const resultado = extraer(xml, 'Resultado'); // A = Aprobado, R = Rechazado
    const cae = extraer(xml, 'CAE');
    const caeVto = extraer(xml, 'CAEFchVto');
    const obs = extraer(xml, 'Obs') || extraer(xml, 'Errors');
    const observaciones = obs ? obs.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';

    // Guardar SIEMPRE en la DB (aprobada o rechazada, para auditoría)
    await prisma.$executeRawUnsafe(
      `INSERT INTO facturas_afip
        (cbte_tipo, pto_vta, cbte_nro, doc_tipo, doc_nro, cond_iva_receptor,
         imp_total, imp_neto, imp_iva, cae, cae_vto, resultado, observaciones, detalle, entorno)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      CBTE_TIPO, PTO_VTA, proximo, docTipo, docNro, condIva,
      total, impNeto, impIVA, cae || null, caeVto || null,
      resultado || 'ERROR', observaciones || null,
      JSON.stringify(datos.items), ES_PROD ? 'prod' : 'homo'
    );

    if (resultado !== 'A' || !cae) {
      return { ok: false, error: 'AFIP rechazó el comprobante', observaciones, cbteNro: proximo };
    }

    return {
      ok: true,
      cae,
      caeVto,
      cbteNro: proximo,
      cbteTipo: CBTE_TIPO,
      ptoVta: PTO_VTA,
      total,
      fechaCbte,
      docTipo,
      docNro,
      concepto,
      fechaServDesde: fSvcDesde,
      fechaServHasta: fSvcHasta,
      fechaVtoPago: fVtoPago,
      observaciones,
    };
  } catch (e: any) {
    return { ok: false, error: e.message || 'Error desconocido' };
  }
}

// ------------------------------------------------------------
// Listar facturas emitidas (para el panel admin)
// ------------------------------------------------------------
export async function listarFacturas(limite = 50) {
  await ensureTablasAfip();
  const filas: any[] = await prisma.$queryRawUnsafe(
    `SELECT id, cbte_tipo, pto_vta, cbte_nro, doc_tipo, doc_nro,
            imp_total::float AS imp_total, imp_neto::float AS imp_neto, imp_iva::float AS imp_iva,
            cae, cae_vto, resultado, observaciones, entorno, creado
     FROM facturas_afip ORDER BY id DESC LIMIT ${Math.min(limite, 200)}`
  );
  return filas;
}

function redondear(n: number): number {
  return Math.round(n * 100) / 100;
}

function sumarDias(fecha: Date, dias: number): string {
  const d = new Date(fecha.getTime() + dias * 24 * 60 * 60 * 1000);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}
