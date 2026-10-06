// ============================================================
// lib/afip.ts — Facturación Electrónica AFIP/ARCA (WSAA + WSFEv1)
// ElectroGamez — Módulo NUEVO, no modifica nada existente.
// Requiere: npm install node-forge  (+ npm i -D @types/node-forge)
//
// Variables de entorno (Netlify):
//   AFIP_CUIT        = 20214293286  (sin guiones)
//   AFIP_PTO_VTA     = 3            (el punto de venta Web Services que crees)
//   AFIP_CBTE_TIPO   = 11           (11 = Factura C monotributo | 6 = Factura B RI)
//   AFIP_ENV         = homo         ("homo" = pruebas | "prod" = producción)
//   AFIP_CERT_B64    = base64 del certificado .crt que te da AFIP
//   AFIP_KEY_B64     = base64 de la clave privada .key
// ============================================================

import forge from 'node-forge';
import { prisma } from '@/lib/prisma'; // ⚠️ Ajustar si tu import de Prisma es distinto
import { afipFetch } from '@/lib/afip-http'; // conexión compatible con ARCA (Node 22)

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
let columnasNC = false; // NUEVO: ¿están las columnas para Notas de Crédito?

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
  // NUEVO (Notas de Crédito): columnas extra, solo se agregan. Si por algún motivo
  // no se pudieran crear, la facturación de siempre sigue funcionando igual.
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE facturas_afip
        ADD COLUMN IF NOT EXISTS concepto INT,
        ADD COLUMN IF NOT EXISTS asoc_id INT,
        ADD COLUMN IF NOT EXISTS asoc_tipo INT,
        ADD COLUMN IF NOT EXISTS asoc_pto_vta INT,
        ADD COLUMN IF NOT EXISTS asoc_nro BIGINT,
        ADD COLUMN IF NOT EXISTS motivo TEXT
    `);
    columnasNC = true;
  } catch {
    columnasNC = false;
  }
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

  const res = await afipFetch(URL_WSAA, {
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
  const res = await afipFetch(URL_WSFE, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: `http://ar.gov.afip.dif.FEV1/${metodo}`,
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
  <soap:Body>${cuerpo}</soap:Body>
</soap:Envelope>`,
  }, metodo === 'FECAESolicitar' ? 1 : 3); // la emisión no se reintenta (evita duplicados)
  return res.text();
}

function bloqueAuth(token: string, sign: string): string {
  return `<ar:Auth><ar:Token>${token}</ar:Token><ar:Sign>${sign}</ar:Sign><ar:Cuit>${CUIT}</ar:Cuit></ar:Auth>`;
}

async function ultimoComprobante(token: string, sign: string, tipo: number = CBTE_TIPO): Promise<number> {
  const xml = await llamarWSFE('FECompUltimoAutorizado', `
    <ar:FECompUltimoAutorizado>
      ${bloqueAuth(token, sign)}
      <ar:PtoVta>${PTO_VTA}</ar:PtoVta>
      <ar:CbteTipo>${tipo}</ar:CbteTipo>
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
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15)`,
      CBTE_TIPO, PTO_VTA, proximo, docTipo, docNro, condIva,
      total, impNeto, impIVA, cae || null, caeVto || null,
      resultado || 'ERROR', observaciones || null,
      JSON.stringify(datos.items), ES_PROD ? 'prod' : 'homo'
    );

    // NUEVO: recordar el concepto de la factura (para que la Nota de Crédito use el mismo)
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE facturas_afip SET concepto = $1
          WHERE cbte_tipo = $2 AND pto_vta = $3 AND cbte_nro = $4 AND entorno = $5 AND concepto IS NULL`,
        concepto, CBTE_TIPO, PTO_VTA, proximo, ES_PROD ? 'prod' : 'homo'
      );
    } catch { /* opcional */ }

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
// NUEVO — NOTA DE CRÉDITO C (anula total o parcialmente una Factura C)
// Tipo 13, siempre con el comprobante asociado (la factura que corrige).
// Protecciones: solo sobre facturas aprobadas, del mismo entorno, y nunca
// por más de lo que todavía no fue acreditado.
// ------------------------------------------------------------
const TIPO_FACTURA_C = 11;
const TIPO_NOTA_CREDITO_C = 13;

export interface DatosNotaCredito {
  facturaId: number;        // id de la factura en facturas_afip
  items?: ItemFactura[];    // si se omite: anulación TOTAL (lo que quede por acreditar)
  concepto?: number;        // 1 Productos | 2 Servicios | 3 Ambos (por defecto el de la factura)
  motivo?: string;          // nota interna (no va a ARCA)
}

export interface ResultadoNotaCredito extends ResultadoFactura {
  facturaAsociada?: { tipo: number; ptoVta: number; nro: number };
}

export async function emitirNotaCredito(datos: DatosNotaCredito): Promise<ResultadoNotaCredito> {
  try {
    if (!CUIT) throw new Error('Falta configurar AFIP_CUIT');
    const facturaId = Number(datos.facturaId);
    if (!Number.isInteger(facturaId) || facturaId <= 0) throw new Error('Falta indicar qué factura se anula');

    await ensureTablasAfip();
    if (!columnasNC) throw new Error('No se pudo preparar la base de datos para Notas de Crédito. Probá de nuevo en un minuto.');

    const entorno = ES_PROD ? 'prod' : 'homo';

    // 1) La factura original
    const filas: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, cbte_tipo, pto_vta, cbte_nro::text AS cbte_nro, doc_tipo, doc_nro::text AS doc_nro,
              cond_iva_receptor, imp_total::float AS imp_total, cae, resultado, entorno, concepto, detalle
         FROM facturas_afip WHERE id = $1`,
      facturaId
    );
    const orig = filas[0];
    if (!orig) throw new Error('No se encontró la factura a anular');
    if (orig.resultado !== 'A' || !orig.cae) throw new Error('Solo se puede anular una factura aprobada (con CAE)');
    if (Number(orig.cbte_tipo) !== TIPO_FACTURA_C) throw new Error('Por ahora solo se emiten Notas de Crédito C sobre Facturas C');
    if (orig.entorno !== entorno) {
      throw new Error(`Esa factura es de ${orig.entorno === 'prod' ? 'producción' : 'prueba'} y el sistema está en ${entorno === 'prod' ? 'producción' : 'prueba'}`);
    }

    // 2) ¿Cuánto queda por acreditar?
    const prev: any[] = await prisma.$queryRawUnsafe(
      `SELECT COALESCE(SUM(imp_total), 0)::float AS acreditado
         FROM facturas_afip
        WHERE asoc_id = $1 AND cbte_tipo = ${TIPO_NOTA_CREDITO_C} AND resultado = 'A' AND cae IS NOT NULL`,
      facturaId
    );
    const yaAcreditado = redondear(Number(prev[0]?.acreditado || 0));
    const disponible = redondear(Number(orig.imp_total) - yaAcreditado);
    if (disponible < 0.01) throw new Error('Esta factura ya fue anulada por completo con Notas de Crédito');

    const nroOrigTxt = `${String(orig.pto_vta).padStart(4, '0')}-${String(orig.cbte_nro).padStart(8, '0')}`;

    // 3) Ítems e importe de la nota de crédito
    let items: ItemFactura[];
    let total: number;
    if (Array.isArray(datos.items) && datos.items.length > 0) {
      for (const it of datos.items) {
        if (!it || !String(it.descripcion || '').trim() || !(Number(it.cantidad) > 0) || !(Number(it.precioUnitario) > 0)) {
          throw new Error('Cada ítem necesita descripción, cantidad > 0 y precio > 0');
        }
      }
      items = datos.items.map((it) => ({
        descripcion: String(it.descripcion).trim(),
        cantidad: Number(it.cantidad),
        precioUnitario: Number(it.precioUnitario),
      }));
      total = redondear(items.reduce((sum, i) => sum + i.cantidad * i.precioUnitario, 0));
    } else {
      // Anulación total: lo que quede por acreditar
      total = disponible;
      let det: any = orig.detalle;
      if (typeof det === 'string') { try { det = JSON.parse(det); } catch { det = null; } }
      const detalleOk = yaAcreditado === 0 && Array.isArray(det) && det.length > 0 && det.every(
        (i: any) => i && i.descripcion && Number(i.cantidad) > 0 && Number(i.precioUnitario) > 0
      );
      items = detalleOk
        ? det.map((i: any) => ({ descripcion: String(i.descripcion), cantidad: Number(i.cantidad), precioUnitario: Number(i.precioUnitario) }))
        : [{ descripcion: `Anulación de Factura C ${nroOrigTxt}`, cantidad: 1, precioUnitario: total }];
    }

    if (!(total > 0)) throw new Error('El importe de la Nota de Crédito debe ser mayor a cero');
    if (total > disponible + 0.005) {
      throw new Error(`El importe ($ ${total.toFixed(2)}) supera lo que queda por acreditar de esa factura ($ ${disponible.toFixed(2)})`);
    }

    // 4) Datos del comprobante (mismo receptor que la factura original)
    const concepto = [1, 2, 3].includes(Number(datos.concepto)) ? Number(datos.concepto)
                   : [1, 2, 3].includes(Number(orig.concepto)) ? Number(orig.concepto) : 1;
    const docTipo = Number(orig.doc_tipo);
    const docNro = Number(String(orig.doc_nro).replace(/\D/g, '') || '0');
    const condIva = Number(orig.cond_iva_receptor) || 5;

    const { token, sign } = await obtenerTA();
    const proximo = (await ultimoComprobante(token, sign, TIPO_NOTA_CREDITO_C)) + 1;

    const hoy = new Date();
    const fechaCbte = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}${String(hoy.getDate()).padStart(2, '0')}`;

    let bloqueFechasServ = '';
    let fSvcDesde = '', fSvcHasta = '', fVtoPago = '';
    if (concepto === 2 || concepto === 3) {
      fSvcDesde = fechaCbte; fSvcHasta = fechaCbte; fVtoPago = sumarDias(hoy, 10);
      bloqueFechasServ =
        `<ar:FchServDesde>${fSvcDesde}</ar:FchServDesde>` +
        `<ar:FchServHasta>${fSvcHasta}</ar:FchServHasta>` +
        `<ar:FchVtoPago>${fVtoPago}</ar:FchVtoPago>`;
    }

    // Nota de Crédito C: sin discriminar IVA (igual que la Factura C)
    const xml = await llamarWSFE('FECAESolicitar', `
      <ar:FECAESolicitar>
        ${bloqueAuth(token, sign)}
        <ar:FeCAEReq>
          <ar:FeCabReq>
            <ar:CantReg>1</ar:CantReg>
            <ar:PtoVta>${PTO_VTA}</ar:PtoVta>
            <ar:CbteTipo>${TIPO_NOTA_CREDITO_C}</ar:CbteTipo>
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
              <ar:ImpNeto>${total.toFixed(2)}</ar:ImpNeto>
              <ar:ImpOpEx>0</ar:ImpOpEx>
              <ar:ImpTrib>0</ar:ImpTrib>
              <ar:ImpIVA>0.00</ar:ImpIVA>
              ${bloqueFechasServ}
              <ar:MonId>PES</ar:MonId>
              <ar:MonCotiz>1</ar:MonCotiz>
              <ar:CondicionIVAReceptorId>${condIva}</ar:CondicionIVAReceptorId>
              <ar:CbtesAsoc>
                <ar:CbteAsoc>
                  <ar:Tipo>${TIPO_FACTURA_C}</ar:Tipo>
                  <ar:PtoVta>${Number(orig.pto_vta)}</ar:PtoVta>
                  <ar:Nro>${Number(orig.cbte_nro)}</ar:Nro>
                  <ar:Cuit>${CUIT}</ar:Cuit>
                </ar:CbteAsoc>
              </ar:CbtesAsoc>
            </ar:FECAEDetRequest>
          </ar:FeDetReq>
        </ar:FeCAEReq>
      </ar:FECAESolicitar>`);

    const resultado = extraer(xml, 'Resultado');
    const cae = extraer(xml, 'CAE');
    const caeVto = extraer(xml, 'CAEFchVto');
    const obs = extraer(xml, 'Obs') || extraer(xml, 'Errors');
    const observaciones = obs ? obs.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
    const motivo = String(datos.motivo || '').trim().slice(0, 200) || null;

    // Guardar SIEMPRE (aprobada o rechazada, para auditoría)
    await prisma.$executeRawUnsafe(
      `INSERT INTO facturas_afip
        (cbte_tipo, pto_vta, cbte_nro, doc_tipo, doc_nro, cond_iva_receptor,
         imp_total, imp_neto, imp_iva, cae, cae_vto, resultado, observaciones, detalle, entorno,
         concepto, asoc_id, asoc_tipo, asoc_pto_vta, asoc_nro, motivo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15,$16,$17,$18,$19,$20,$21)`,
      TIPO_NOTA_CREDITO_C, PTO_VTA, proximo, docTipo, docNro, condIva,
      total, total, 0, cae || null, caeVto || null,
      resultado || 'ERROR', observaciones || null,
      JSON.stringify(items), entorno,
      concepto, facturaId, TIPO_FACTURA_C, Number(orig.pto_vta), Number(orig.cbte_nro), motivo
    );

    if (resultado !== 'A' || !cae) {
      return { ok: false, error: 'ARCA rechazó la Nota de Crédito', observaciones, cbteNro: proximo };
    }

    return {
      ok: true,
      cae,
      caeVto,
      cbteNro: proximo,
      cbteTipo: TIPO_NOTA_CREDITO_C,
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
      facturaAsociada: { tipo: TIPO_FACTURA_C, ptoVta: Number(orig.pto_vta), nro: Number(orig.cbte_nro) },
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
    `SELECT id,
            cbte_tipo,
            pto_vta,
            cbte_nro::text AS cbte_nro,
            doc_tipo,
            doc_nro::text AS doc_nro,
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
