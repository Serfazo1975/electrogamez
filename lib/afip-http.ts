// ============================================================
// lib/afip-http.ts — Conexión HTTPS tolerante para ARCA/AFIP
// ElectroGamez — Módulo NUEVO, no reemplaza nada existente.
//
// Por qué existe:
//   Los servidores de ARCA (wsaa / servicios1 / aws) negocian TLS con
//   parámetros viejos (claves DH cortas). Desde Node 22 el `fetch` nativo
//   los rechaza y solo muestra "fetch failed", sin el motivo real.
//   Este helper usa https con un nivel de seguridad compatible SOLO para
//   los dominios de ARCA, reintenta ante cortes y devuelve errores claros.
// ============================================================

import https from 'node:https';

const agenteArca = new https.Agent({
  keepAlive: true,
  // Acepta las claves DH cortas que todavía usa ARCA
  ciphers: 'DEFAULT@SECLEVEL=0',
  minVersion: 'TLSv1.2',
});

const DOMINIOS_ARCA = /(^|\.)afip\.gov\.ar$/i;

type Opciones = { method?: string; headers?: Record<string, string>; body?: string };
type Respuesta = { ok: boolean; status: number; text: () => Promise<string> };

function pedido(url: string, op: Opciones, timeoutMs: number): Promise<Respuesta> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = op.body ?? '';
    const req = https.request(
      {
        hostname: u.hostname,
        port: u.port || 443,
        path: u.pathname + u.search,
        method: op.method || 'GET',
        headers: { ...(op.headers || {}), 'Content-Length': Buffer.byteLength(body) },
        agent: DOMINIOS_ARCA.test(u.hostname) ? agenteArca : undefined,
        timeout: timeoutMs,
      },
      (res) => {
        const partes: Buffer[] = [];
        res.on('data', (c) => partes.push(c));
        res.on('end', () => {
          const texto = Buffer.concat(partes).toString('utf8');
          const status = res.statusCode || 0;
          resolve({ ok: status >= 200 && status < 300, status, text: async () => texto });
        });
        res.on('error', reject);
      }
    );
    req.on('timeout', () => req.destroy(Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' })));
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function mensajeClaro(e: any, url: string): string {
  const host = (() => { try { return new URL(url).hostname; } catch { return url; } })();
  const code = e?.code || e?.cause?.code || '';
  const det = e?.message || '';
  if (code === 'ETIMEDOUT') return `ARCA no respondió a tiempo (${host}). Puede estar caído; probá en unos minutos.`;
  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') return `No se pudo resolver ${host} (DNS). Reintentá en unos minutos.`;
  if (code === 'ECONNRESET' || code === 'ECONNREFUSED') return `ARCA cortó la conexión (${host}). Suele ser caída temporal de ARCA.`;
  if (/dh key|ssl|tls|handshake|certificate/i.test(det)) return `Error de seguridad TLS con ${host}: ${det}`;
  return `No se pudo conectar con ARCA (${host})${code ? ' [' + code + ']' : ''}: ${det}`;
}

/** Igual que fetch(url, {method, headers, body}) pero compatible con ARCA. */
export async function afipFetch(url: string, op: Opciones = {}, intentos = 3, timeoutMs = 30000): Promise<Respuesta> {
  let ultimo: any;
  for (let i = 1; i <= intentos; i++) {
    try {
      const r = await pedido(url, op, timeoutMs);
      // 502/503/504 = ARCA saturado: reintentar
      if ([502, 503, 504].includes(r.status) && i < intentos) {
        await new Promise((s) => setTimeout(s, 1500 * i));
        continue;
      }
      return r;
    } catch (e) {
      ultimo = e;
      if (i < intentos) await new Promise((s) => setTimeout(s, 1500 * i));
    }
  }
  throw new Error(mensajeClaro(ultimo, url));
}
