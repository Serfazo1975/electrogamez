
'use client';

// ============================================================
// app/admin/facturacion/page.tsx
// Panel de Facturación Electrónica AFIP/ARCA (Factura C - Monotributo)
// ElectroGamez — Formato legal ARCA + QR oficial + concepto Prod/Serv/Ambos
// ============================================================

import { useState, useEffect } from 'react';

interface Item {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

interface FacturaHist {
  id: number;
  cbte_nro: number;
  doc_nro: number;
  imp_total: number;
  cae: string | null;
  cae_vto: string | null;
  resultado: string;
  entorno: string;
  creado: string;
}

// Datos fijos del emisor (ElectroGamez)
const EMISOR = {
  razonSocial: 'FAZZINI SERGIO FEDERICO',
  fantasia: 'ELECTROGAMEZ SERVICIO TECNICO RG',
  domicilio: 'Los Pozos 458 Dpto:8 - Rio Gallegos, Santa Cruz',
  cuit: '20214293286',
  iibb: '1-28775',
  inicio: '01/04/2017',
  condIva: 'Responsable Monotributo',
  leyenda: 'Somos un Grupo de Tecnicos dedicados a la informatica. Atencion a Empresas y Usuarios.',
};

const TIPO_DOC = [
  { value: 99, label: 'Consumidor Final (sin datos)' },
  { value: 96, label: 'DNI' },
  { value: 80, label: 'CUIT' },
];

const CONCEPTOS = [
  { value: 1, label: 'Productos' },
  { value: 2, label: 'Servicios' },
  { value: 3, label: 'Productos y Servicios' },
];

export default function FacturacionPage() {
  const [items, setItems] = useState<Item[]>([
    { descripcion: '', cantidad: 1, precioUnitario: 0 },
  ]);
  const [docTipo, setDocTipo] = useState(99);
  const [docNro, setDocNro] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [condIvaCliente, setCondIvaCliente] = useState('');
  const [direccionCliente, setDireccionCliente] = useState('');
  const [buscandoCuit, setBuscandoCuit] = useState(false);
  const [clientesDb, setClientesDb] = useState<any[]>([]);
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [showSugerencias, setShowSugerencias] = useState(false);

  // Cargar clientes de la base al abrir la pantalla
  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setClientesDb(data);
    }).catch(() => {});
  }, []);

  // Seleccionar un cliente de las sugerencias
  function seleccionarCliente(cl: any) {
    setNombreCliente(cl.name || '');
    setCondIvaCliente(cl.condIva || '');
    setDireccionCliente(cl.address || '');
    if (cl.cuit) { setDocTipo(80); setDocNro(cl.cuit); }
    setSugerencias([]);
    setShowSugerencias(false);
  }

  // Buscar sugerencias mientras se escribe el nombre
  function buscarPorNombre(texto: string) {
    setNombreCliente(texto);
    if (texto.length < 2) { setSugerencias([]); setShowSugerencias(false); return; }
    const filtrado = clientesDb.filter((c: any) =>
      c.name?.toLowerCase().includes(texto.toLowerCase())
    ).slice(0, 5);
    setSugerencias(filtrado);
    setShowSugerencias(filtrado.length > 0);
  }

  // Buscar cliente por CUIT en la base de datos
  async function buscarPorCuit(cuit: string) {
    const limpio = cuit.replace(/[^0-9]/g, '');
    if (limpio.length < 7) return;
    setBuscandoCuit(true);
    const encontrado = clientesDb.find((c: any) => c.cuit === limpio);
    if (encontrado) {
      seleccionarCliente(encontrado);
    }
    setBuscandoCuit(false);
  }
  const [concepto, setConcepto] = useState(1);
  const [servDesde, setServDesde] = useState('');
  const [servHasta, setServHasta] = useState('');
  const [vtoPago, setVtoPago] = useState('');

  const [emitiendo, setEmitiendo] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState('');

  const [facturas, setFacturas] = useState<FacturaHist[]>([]);
  const [cargandoLista, setCargandoLista] = useState(false);

  const requiereFechas = concepto === 2 || concepto === 3;

  const total = items.reduce(
    (s, i) => s + (Number(i.cantidad) || 0) * (Number(i.precioUnitario) || 0),
    0
  );

  const formatMoney = (n: number) =>
    new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

  function actualizarItem(i: number, campo: keyof Item, valor: string) {
    const copia = [...items];
    if (campo === 'descripcion') copia[i].descripcion = valor;
    else copia[i][campo] = Number(valor) as any;
    setItems(copia);
  }
  function agregarItem() {
    setItems([...items, { descripcion: '', cantidad: 1, precioUnitario: 0 }]);
  }
  function quitarItem(i: number) {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== i));
  }

  async function cargarFacturas() {
    setCargandoLista(true);
    try {
      const res = await fetch('/api/facturar', { credentials: 'include' });
      const data = await res.json();
      if (data.ok) setFacturas(data.facturas);
    } catch { /* silencioso */ }
    setCargandoLista(false);
  }
  useEffect(() => { cargarFacturas(); }, []);

  // Convierte 'YYYY-MM-DD' (input date) a 'YYYYMMDD' (formato AFIP)
  function aFechaAfip(iso: string): string {
    return iso ? iso.replace(/-/g, '') : '';
  }

  async function emitir() {
    setError('');
    setResultado(null);

    const itemsValidos = items.filter(
      (i) => i.descripcion.trim() && i.cantidad > 0 && i.precioUnitario > 0
    );
    if (itemsValidos.length === 0) {
      setError('Cargá al menos un ítem con descripción, cantidad y precio.');
      return;
    }
    if (docTipo !== 99 && !docNro.trim()) {
      setError('Ingresá el número de documento del cliente.');
      return;
    }
    if (requiereFechas && (!servDesde || !servHasta || !vtoPago)) {
      setError('Para Servicios o Ambos, completá las fechas de período y vencimiento de pago.');
      return;
    }

    setEmitiendo(true);
    try {
      const res = await fetch('/api/facturar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          docTipo,
          docNro: docTipo === 99 ? 0 : Number(docNro),
          condIvaReceptor: 5,
          concepto,
          fechaServDesde: requiereFechas ? aFechaAfip(servDesde) : undefined,
          fechaServHasta: requiereFechas ? aFechaAfip(servHasta) : undefined,
          fechaVtoPago: requiereFechas ? aFechaAfip(vtoPago) : undefined,
          items: itemsValidos,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setResultado({ ...data, itemsEmitidos: itemsValidos, clienteNombre: nombreCliente || 'Consumidor Final', condIvaCliente: condIvaCliente || 'Consumidor Final', direccionCliente });
        setItems([{ descripcion: '', cantidad: 1, precioUnitario: 0 }]);
        setDocNro(''); setNombreCliente(''); setCondIvaCliente(''); setDireccionCliente('');
        cargarFacturas();
      } else {
        setError((data.error || 'ARCA rechazó el comprobante') + (data.observaciones ? ' — ' + data.observaciones : ''));
      }
    } catch (e: any) {
      setError('Error de conexión: ' + (e.message || 'desconocido'));
    }
    setEmitiendo(false);
  }

  // Fecha AFIP 'YYYYMMDD' -> 'DD/MM/YYYY'
  function fFecha(f?: string): string {
    if (!f || f.length !== 8) return '';
    return `${f.slice(6, 8)}/${f.slice(4, 6)}/${f.slice(0, 4)}`;
  }

  // Genera la cadena del QR oficial de ARCA (JSON en base64)
  function qrArca(f: any): string {
    const datos = {
      ver: 1,
      fecha: `${f.fechaCbte.slice(0, 4)}-${f.fechaCbte.slice(4, 6)}-${f.fechaCbte.slice(6, 8)}`,
      cuit: Number(EMISOR.cuit),
      ptoVta: f.ptoVta,
      tipoCmp: f.cbteTipo,
      nroCmp: f.cbteNro,
      importe: f.total,
      moneda: 'PES',
      ctz: 1,
      tipoDocRec: f.docTipo,
      nroDocRec: f.docNro,
      tipoCodAut: 'E',
      codAut: Number(f.cae),
    };
    const b64 = btoa(JSON.stringify(datos));
    return 'https://www.afip.gob.ar/fe/qr/?p=' + b64;
  }

  // Abre el comprobante en formato legal ARCA, con QR real
  function imprimir(f: any) {
    const w = window.open('', '_blank', 'width=850,height=1000');
    if (!w) return;

    const urlQR = qrArca(f);
    const filas = (f.itemsEmitidos || [])
      .map((it: Item) =>
        `<tr>
          <td class="c">&nbsp;</td>
          <td>${it.descripcion}</td>
          <td class="cent">${formatMoney(it.cantidad)}</td>
          <td class="cent">unidades</td>
          <td class="der">${formatMoney(it.precioUnitario)}</td>
          <td class="der">0,00</td>
          <td class="der">0,00</td>
          <td class="der">${formatMoney(it.cantidad * it.precioUnitario)}</td>
        </tr>`
      ).join('');

    const conceptoLabel = f.concepto === 2 ? 'Servicios' : f.concepto === 3 ? 'Productos y Servicios' : 'Productos';
    const bloquePeriodo = (f.concepto === 2 || f.concepto === 3)
      ? `<div class="fila-periodo">
           <span><b>Período Facturado Desde:</b> ${fFecha(f.fechaServDesde)}</span>
           <span><b>Hasta:</b> ${fFecha(f.fechaServHasta)}</span>
           <span><b>Fecha de Vto. para el pago:</b> ${fFecha(f.fechaVtoPago)}</span>
         </div>`
      : '';

    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Factura C ${String(f.ptoVta).padStart(5,'0')}-${String(f.cbteNro).padStart(8,'0')}</title>
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"><\/script>
    <style>
      *{margin:0;padding:0;box-sizing:border-box;font-family:Arial,Helvetica,sans-serif;color:#000}
      body{padding:24px;background:#eee}
      .hoja{max-width:800px;margin:0 auto 20px;background:#fff;border:1px solid #000}
      .tit{text-align:center;font-size:15px;font-weight:bold;padding:4px;border-bottom:1px solid #000}
      .cab{display:grid;grid-template-columns:1fr 62px 1fr;border-bottom:1px solid #000}
      .cab-izq{padding:10px 12px}
      .fant{text-align:center;font-size:13px;font-weight:bold;margin-bottom:10px}
      .cab-izq p,.cab-der p{font-size:10.5px;margin-bottom:5px}
      .cab-c{border-left:1px solid #000;border-right:1px solid #000;text-align:center;padding-top:8px}
      .cab-c .letra{font-size:34px;font-weight:bold;line-height:1}
      .cab-c .cod{font-size:9px;font-weight:bold}
      .cab-der{padding:10px 12px}
      .cab-der .factura{font-size:20px;font-weight:bold;margin-bottom:8px}
      .fila-periodo{display:flex;justify-content:space-between;padding:5px 12px;border-bottom:1px solid #000;font-size:10.5px}
      .cliente{padding:6px 12px;border-bottom:1px solid #000;font-size:10.5px}
      .cliente p{margin-bottom:3px}
      table{width:100%;border-collapse:collapse}
      th{padding:4px 6px;font-size:10px;border-right:1px solid #000;border-bottom:1px solid #000;text-align:left}
      th.cent,td.cent{text-align:center}th.der,td.der{text-align:right}
      td{padding:6px;font-size:10.5px;border-right:1px solid #ddd}
      td.c{width:40px}
      .tot-wrap{border-top:1px solid #000;padding:10px 12px;display:flex;justify-content:flex-end}
      .tot{border:1px solid #000;padding:8px 14px;min-width:260px}
      .tot .r{display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;font-weight:bold}
      .tot .r.big{font-size:13px}
      .leyenda{border-top:1px solid #000;text-align:center;padding:8px;font-size:10.5px;font-style:italic}
      .pie{display:grid;grid-template-columns:100px 1fr auto;align-items:center;padding:10px 12px;gap:12px;border-top:1px solid #000}
      .pie .qr{width:90px;height:90px}
      .pie .arca{font-size:15px;font-weight:bold;letter-spacing:1px}
      .pie .arca-sub{font-size:7px;color:#444}
      .pie .aut{font-size:11px;font-weight:bold;font-style:italic;margin-top:6px}
      .pie .disc{font-size:7.5px;font-weight:bold;font-style:italic;color:#333;margin-top:2px}
      .pie .cae{text-align:right}
      .pie .cae p{font-size:11px}
      .print-btn{position:fixed;top:14px;left:20px;background:#333;color:#fff;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-weight:bold}
      @media print{.print-btn{display:none}body{padding:0;background:#fff}.hoja{border:1px solid #000;margin:0}}
    </style></head><body>
    <button class="print-btn" onclick="window.print()">Imprimir / Guardar PDF</button>
    <div class="hoja">
      <div class="tit">ORIGINAL</div>
      <div class="cab">
        <div class="cab-izq">
          <div class="fant">${EMISOR.fantasia}</div>
          <p><b>Razón Social:</b> ${EMISOR.razonSocial}</p>
          <p><b>Domicilio Comercial:</b> ${EMISOR.domicilio}</p>
          <p><b>Condición frente al IVA:</b> ${EMISOR.condIva}</p>
        </div>
        <div class="cab-c">
          <div class="letra">C</div>
          <div class="cod">COD. 011</div>
        </div>
        <div class="cab-der">
          <div class="factura">FACTURA</div>
          <p><b>Punto de Venta: ${String(f.ptoVta).padStart(5,'0')}</b> &nbsp; <b>Comp. Nro: ${String(f.cbteNro).padStart(8,'0')}</b></p>
          <p><b>Fecha de Emisión:</b> ${fFecha(f.fechaCbte)}</p>
          <p><b>CUIT:</b> ${EMISOR.cuit}</p>
          <p><b>Ingresos Brutos:</b> ${EMISOR.iibb}</p>
          <p><b>Fecha de Inicio de Actividades:</b> ${EMISOR.inicio}</p>
        </div>
      </div>
      ${bloquePeriodo}
      <div class="cliente">
        <p><b>CUIT:</b> ${f.docTipo === 99 ? '0' : f.docNro} &nbsp;&nbsp; <b>Apellido y Nombre / Razón Social:</b> ${f.clienteNombre}</p>
        <p><b>Condición de IVA:</b> ${f.condIvaCliente || 'Consumidor Final'} &nbsp;&nbsp; <b>Domicilio:</b> ${f.direccionCliente || '—'}</p>
        <p><b>Condición frente al IVA:</b> Consumidor Final</p>
        <p><b>Condición de venta:</b> Contado</p>
      </div>
      <table>
        <thead><tr>
          <th>Código</th><th>Producto / Servicio</th><th class="cent">Cantidad</th>
          <th class="cent">U. Medida</th><th class="der">Precio Unit.</th>
          <th class="der">% Bonif</th><th class="der">Imp. Bonif.</th><th class="der">Subtotal</th>
        </tr></thead>
        <tbody>${filas}</tbody>
      </table>
      <div class="tot-wrap">
        <div class="tot">
          <div class="r"><span>Subtotal: $</span><span>${formatMoney(f.total)}</span></div>
          <div class="r"><span>Importe Otros Tributos: $</span><span>0,00</span></div>
          <div class="r big"><span>Importe Total: $</span><span>${formatMoney(f.total)}</span></div>
        </div>
      </div>
      <div class="leyenda">"${EMISOR.leyenda}"</div>
      <div class="pie">
        <div class="qr" id="qrbox"></div>
        <div>
          <div class="arca">ARCA</div>
          <div class="arca-sub">AGENCIA DE RECAUDACIÓN Y CONTROL ADUANERO</div>
          <div class="aut">Comprobante Autorizado</div>
          <div class="disc">Esta Agencia no se responsabiliza por los datos ingresados en el detalle de la operación</div>
        </div>
        <div class="cae">
          <p>Pág. 1/1</p>
          <p style="margin-top:8px"><b>CAE N°:</b> ${f.cae}</p>
          <p><b>Fecha de Vto. de CAE:</b> ${fFecha(f.caeVto)}</p>
        </div>
      </div>
    </div>
    <script>
      new QRCode(document.getElementById("qrbox"), { text: ${JSON.stringify(urlQR)}, width: 90, height: 90, correctLevel: QRCode.CorrectLevel.M });
    <\/script>
    </body></html>`);
    w.document.close();
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#1e293b' }}><div style={{ maxWidth: 920, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: '#0f172a' }}>🧾 Facturación Electrónica ARCA</h1>
      <p style={{ color: '#475569', marginBottom: 24 }}>
        Factura C · Monotributo · {EMISOR.fantasia}{' '}
        <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
          Verificá en Netlify si AFIP_ENV está en homo (pruebas) o prod
        </span>
      </p>

      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#1e293b' }}>🧾 Tipo de comprobante</h3>
        <div style={{ display: 'grid', gridTemplateColumns: requiereFechas ? '1.2fr 1fr 1fr 1fr' : '1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Concepto</label>
            <select style={inp} value={concepto} onChange={(e) => setConcepto(Number(e.target.value))}>
              {CONCEPTOS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          {requiereFechas && (
            <>
              <div>
                <label style={lbl}>Período desde</label>
                <input style={inp} type="date" value={servDesde} onChange={(e) => setServDesde(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Período hasta</label>
                <input style={inp} type="date" value={servHasta} onChange={(e) => setServHasta(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Vto. de pago</label>
                <input style={inp} type="date" value={vtoPago} onChange={(e) => setVtoPago(e.target.value)} />
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#1e293b' }}>👤 Cliente</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={lbl}>Tipo de documento</label>
            <select style={inp} value={docTipo} onChange={(e) => setDocTipo(Number(e.target.value))}>
              {TIPO_DOC.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>N° de documento</label>
            <input style={{ ...inp, background: docTipo === 99 ? '#f1f5f9' : '#fff' }} value={docNro}
              onChange={(e) => setDocNro(e.target.value)} disabled={docTipo === 99}
              onBlur={() => { if (docTipo === 80 && docNro.trim()) buscarPorCuit(docNro) }}
              placeholder={docTipo === 99 ? 'No requerido' : 'Ej: 20214293286'} />
          </div>
          <div style={{ position: 'relative' }}>
            <label style={lbl}>Nombre / Razón Social</label>
            <input style={inp} value={nombreCliente}
              onChange={(e) => buscarPorNombre(e.target.value)}
              onFocus={() => { if (sugerencias.length > 0) setShowSugerencias(true) }}
              onBlur={() => setTimeout(() => setShowSugerencias(false), 200)}
              placeholder={buscandoCuit ? 'Buscando...' : 'Escribí para buscar o dejá vacío'} />
            {showSugerencias && sugerencias.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: 200, overflowY: 'auto' }}>
                {sugerencias.map((s: any, i: number) => (
                  <button key={s.id ?? i} type="button"
                    onMouseDown={() => seleccionarCliente(s)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: 13, color: '#1e293b' }}>
                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                    {s.cuit && <span style={{ color: '#0ea5e9', marginLeft: 8, fontSize: 12 }}>CUIT: {s.cuit}</span>}
                    {s.phone && <span style={{ color: '#94a3b8', marginLeft: 8, fontSize: 11 }}>{s.phone}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Condición de IVA del receptor</label>
            <select style={inp} value={condIvaCliente} onChange={(e) => setCondIvaCliente(e.target.value)}>
              <option value="">— No especificada —</option>
              <option value="Consumidor Final">Consumidor Final</option>
              <option value="Monotributista">Monotributista</option>
              <option value="Responsable Inscripto">Responsable Inscripto</option>
              <option value="Exento">Exento</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Dirección</label>
            <input style={inp} value={direccionCliente} onChange={(e) => setDireccionCliente(e.target.value)} placeholder="Calle 123, Ciudad" />
          </div>
        </div>
        {docTipo === 80 && docNro.length >= 7 && (
          <button type="button" onClick={() => buscarPorCuit(docNro)}
            style={{ marginTop: 10, background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            🔍 Buscar cliente por CUIT
          </button>
        )}
      </div>

      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#1e293b' }}>📦 Detalle</h3>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
            <div>{i === 0 && <label style={lbl}>Descripción</label>}
              <input style={inp} value={item.descripcion} onChange={(e) => actualizarItem(i, 'descripcion', e.target.value)} placeholder="Ej: Soporte técnico / Repuesto" /></div>
            <div>{i === 0 && <label style={lbl}>Cant.</label>}
              <input style={inp} type="number" min="1" value={item.cantidad} onChange={(e) => actualizarItem(i, 'cantidad', e.target.value)} /></div>
            <div>{i === 0 && <label style={lbl}>P. Unitario</label>}
              <input style={inp} type="number" min="0" step="0.01" value={item.precioUnitario} onChange={(e) => actualizarItem(i, 'precioUnitario', e.target.value)} /></div>
            <div>{i === 0 && <label style={lbl}>Subtotal</label>}
              <div style={{ ...inp, background: '#f1f5f9', display: 'flex', alignItems: 'center' }}>$ {formatMoney(item.cantidad * item.precioUnitario)}</div></div>
            <button onClick={() => quitarItem(i)} style={btnQuitar} title="Quitar">✕</button>
          </div>
        ))}
        <button onClick={agregarItem} style={btnSecundario}>+ Agregar ítem</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>TOTAL: $ {formatMoney(total)}</div>
        <button onClick={emitir} disabled={emitiendo} style={btnPrincipal}>
          {emitiendo ? '⏳ Emitiendo...' : '🧾 Emitir Factura'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: 16, borderRadius: 10, marginBottom: 16 }}>⚠️ {error}</div>
      )}

      {resultado && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: 20, borderRadius: 12, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 800, color: '#166534', marginBottom: 8 }}>✅ Factura emitida</h3>
          <p><strong>Comprobante N°:</strong> {String(resultado.ptoVta).padStart(5, '0')}-{String(resultado.cbteNro).padStart(8, '0')}</p>
          <p><strong>CAE:</strong> {resultado.cae}</p>
          <p><strong>Vencimiento CAE:</strong> {fFecha(resultado.caeVto)}</p>
          <button onClick={() => imprimir(resultado)} style={{ ...btnSecundario, marginTop: 10 }}>🖨️ Imprimir comprobante (formato ARCA)</button>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontWeight: 700 }}>📋 Facturas emitidas</h3>
          <button onClick={cargarFacturas} style={btnSecundario}>{cargandoLista ? '...' : '🔄 Actualizar'}</button>
        </div>
        {facturas.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: 14 }}>Todavía no hay facturas emitidas.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={th}>N°</th><th style={th}>Total</th><th style={th}>CAE</th>
                  <th style={th}>Vto</th><th style={th}>Estado</th><th style={th}>Entorno</th><th style={th}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map((f) => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={td}>{String(f.cbte_nro).padStart(8, '0')}</td>
                    <td style={td}>$ {formatMoney(f.imp_total)}</td>
                    <td style={td}>{f.cae || '—'}</td>
                    <td style={td}>{f.cae_vto ? fFecha(f.cae_vto) : '—'}</td>
                    <td style={td}><span style={{ color: f.resultado === 'A' ? '#166534' : '#991b1b', fontWeight: 600 }}>{f.resultado === 'A' ? '✅ Aprobada' : '❌ ' + f.resultado}</span></td>
                    <td style={td}><span style={{ fontSize: 11, background: f.entorno === 'prod' ? '#dcfce7' : '#fef3c7', padding: '2px 6px', borderRadius: 4 }}>{f.entorno === 'prod' ? 'PROD' : 'HOMO'}</span></td>
                    <td style={td}>{new Date(f.creado).toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 12, color: '#334155', marginBottom: 4, fontWeight: 600 };
const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14, minHeight: 42, color: '#0f172a', background: '#fff' };
const th: React.CSSProperties = { padding: '8px 6px', fontWeight: 700, color: '#475569' };
const td: React.CSSProperties = { padding: '8px 6px' };
const btnPrincipal: React.CSSProperties = { background: '#f97316', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer' };
const btnSecundario: React.CSSProperties = { background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const btnQuitar: React.CSSProperties = { background: '#fee2e2', color: '#dc2626', border: 'none', width: 42, height: 42, borderRadius: 8, cursor: 'pointer', fontWeight: 700 };
