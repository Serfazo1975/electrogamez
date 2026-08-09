'use client';

// ============================================================
// app/admin/presupuesto/page.tsx
// Presupuesto rápido (NO fiscal, sin ARCA) con ítems libres + 2 fotos JPG
// ElectroGamez — Página NUEVA. No modifica nada existente.
// ============================================================

import { useState } from 'react';

interface Item {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

const EMISOR = {
  fantasia: 'ELECTROGAMEZ SERVICIO TECNICO RG',
  razonSocial: 'FAZZINI SERGIO FEDERICO',
  domicilio: 'Los Pozos 458 Dpto:8 - Rio Gallegos, Santa Cruz',
  cuit: '20214293286',
  tel: '11 5697 5880',
  leyenda: 'Somos un Grupo de Tecnicos dedicados a la informatica. Atencion a Empresas y Usuarios.',
};

export default function PresupuestoPage() {
  const [items, setItems] = useState<Item[]>([{ descripcion: '', cantidad: 1, precioUnitario: 0 }]);
  const [cliente, setCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [validez, setValidez] = useState('7');
  const [notas, setNotas] = useState('Presupuesto válido por 7 días. No incluye repuestos no detallados.');
  const [fotos, setFotos] = useState<string[]>([]);

  const total = items.reduce((s, i) => s + (Number(i.cantidad) || 0) * (Number(i.precioUnitario) || 0), 0);

  const formatMoney = (n: number) =>
    new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

  function actualizarItem(i: number, campo: keyof Item, valor: string) {
    const copia = [...items];
    if (campo === 'descripcion') copia[i].descripcion = valor;
    else copia[i][campo] = Number(valor) as any;
    setItems(copia);
  }
  function agregarItem() { setItems([...items, { descripcion: '', cantidad: 1, precioUnitario: 0 }]); }
  function quitarItem(i: number) { if (items.length > 1) setItems(items.filter((_, idx) => idx !== i)); }

  // Carga de fotos: máximo 2, solo JPG, se guardan como base64 en memoria
  function cargarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/image\/(jpeg|jpg)/.test(file.type)) {
      alert('Solo se permiten fotos JPG.');
      return;
    }
    if (fotos.length >= 2) {
      alert('Máximo 2 fotos.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFotos([...fotos, reader.result as string]);
    reader.readAsDataURL(file);
    e.target.value = '';
  }
  function quitarFoto(i: number) { setFotos(fotos.filter((_, idx) => idx !== i)); }

  function nroPresupuesto(): string {
    const d = new Date();
    return `P-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${String(Date.now()).slice(-4)}`;
  }

  function imprimir() {
    const itemsValidos = items.filter((i) => i.descripcion.trim() && i.cantidad > 0 && i.precioUnitario > 0);
    if (itemsValidos.length === 0) { alert('Cargá al menos un ítem con descripción, cantidad y precio.'); return; }

    const w = window.open('', '_blank', 'width=850,height=1000');
    if (!w) return;
    const numero = nroPresupuesto();
    const fecha = new Date().toLocaleDateString('es-AR');

    const filas = itemsValidos.map((it) =>
      `<tr>
        <td>${it.descripcion}</td>
        <td class="cent">${formatMoney(it.cantidad)}</td>
        <td class="der">${formatMoney(it.precioUnitario)}</td>
        <td class="der">${formatMoney(it.cantidad * it.precioUnitario)}</td>
      </tr>`).join('');

    const fotosHtml = fotos.length
      ? `<div class="fotos">${fotos.map((f) => `<img src="${f}" />`).join('')}</div>`
      : '';

    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Presupuesto ${numero}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box;font-family:Arial,Helvetica,sans-serif;color:#222}
      body{padding:24px;background:#eee}
      .hoja{max-width:800px;margin:0 auto;background:#fff;border:1px solid #ccc}
      .cab{background:#0f172a;color:#fff;padding:20px 24px;display:flex;justify-content:space-between;align-items:center}
      .cab .marca{font-size:22px;font-weight:bold}
      .cab .marca small{display:block;font-size:11px;color:#f97316;letter-spacing:1px;margin-top:2px}
      .cab .tipo{text-align:right}
      .cab .tipo .t1{font-size:20px;font-weight:bold;color:#f97316}
      .cab .tipo .t2{font-size:12px;color:#cbd5e1}
      .barra{height:3px;background:#f97316}
      .datos{display:flex;justify-content:space-between;padding:12px 24px;background:#fff7ed;font-size:12px;color:#1e293b;border-bottom:1px solid #fed7aa}
      .cliente{padding:12px 24px;font-size:12px;color:#1e293b;border-bottom:1px solid #eee}
      table{width:100%;border-collapse:collapse}
      th{background:#0f172a;color:#fff;padding:10px;text-align:left;font-size:11px}
      th.cent,td.cent{text-align:center}th.der,td.der{text-align:right}
      td{padding:10px;border-bottom:1px solid #eee;font-size:12px;color:#1e293b}
      .total{text-align:right;padding:16px 24px;font-size:20px;font-weight:bold;color:#0f172a}
      .total span{color:#f97316}
      .fotos{display:flex;gap:12px;padding:12px 24px;flex-wrap:wrap}
      .fotos img{max-width:340px;max-height:260px;border:1px solid #ccc;border-radius:6px;object-fit:cover}
      .notas{padding:12px 24px;font-size:11px;color:#92400e;background:#fffbeb;border-top:1px solid #fde68a}
      .pie{background:#0f172a;color:#94a3b8;text-align:center;padding:10px;font-size:10px}
      .print-btn{position:fixed;top:14px;left:20px;background:#f97316;color:#fff;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-weight:bold}
      @media print{.print-btn{display:none}body{padding:0;background:#fff}.hoja{border:none}}
    </style></head><body>
    <button class="print-btn" onclick="window.print()">Imprimir / Guardar PDF</button>
    <div class="hoja">
      <div class="cab">
        <div class="marca">ElectroGamez<small>SERVICIO TÉCNICO · TECNOLOGÍA</small></div>
        <div class="tipo"><div class="t1">PRESUPUESTO</div><div class="t2">N° ${numero}</div></div>
      </div>
      <div class="barra"></div>
      <div class="datos">
        <span><b>Fecha:</b> ${fecha}</span>
        <span><b>CUIT:</b> ${EMISOR.cuit}</span>
        <span><b>Tel:</b> ${EMISOR.tel}</span>
      </div>
      <div class="cliente">
        <b>Cliente:</b> ${cliente || 'Consumidor Final'} ${telefono ? '&nbsp;·&nbsp; <b>Tel:</b> ' + telefono : ''}
      </div>
      <table>
        <thead><tr><th>Descripción</th><th class="cent">Cant.</th><th class="der">P. Unit.</th><th class="der">Subtotal</th></tr></thead>
        <tbody>${filas}</tbody>
      </table>
      <div class="total">TOTAL: <span>$ ${formatMoney(total)}</span></div>
      ${fotosHtml}
      <div class="notas">⚠️ ${notas}</div>
      <div class="pie">${EMISOR.fantasia} · ${EMISOR.domicilio} · Este documento no es una factura</div>
    </div>
    </body></html>`);
    w.document.close();
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#1e293b' }}><div style={{ maxWidth: 920, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: '#0f172a' }}>📄 Presupuesto rápido</h1>
      <p style={{ color: '#475569', marginBottom: 24 }}>
        Documento comercial (no es una factura, no lleva CAE). Podés adjuntar hasta 2 fotos JPG.
      </p>

      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#1e293b' }}>👤 Cliente</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Nombre</label>
            <input style={inp} value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Consumidor Final" />
          </div>
          <div>
            <label style={lbl}>Teléfono</label>
            <input style={inp} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Opcional" />
          </div>
          <div>
            <label style={lbl}>Validez (días)</label>
            <input style={inp} type="number" min="1" value={validez}
              onChange={(e) => { setValidez(e.target.value); setNotas(`Presupuesto válido por ${e.target.value} días. No incluye repuestos no detallados.`); }} />
          </div>
        </div>
      </div>

      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#1e293b' }}>📦 Detalle</h3>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
            <div>{i === 0 && <label style={lbl}>Descripción</label>}
              <input style={inp} value={item.descripcion} onChange={(e) => actualizarItem(i, 'descripcion', e.target.value)} placeholder="Ej: Cambio de pantalla / Diagnóstico" /></div>
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

      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#1e293b' }}>📷 Fotos (hasta 2, JPG)</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {fotos.map((f, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img src={f} alt={'foto ' + (i + 1)} style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8, border: '1px solid #cbd5e1' }} />
              <button onClick={() => quitarFoto(i)} style={{ position: 'absolute', top: -8, right: -8, background: '#dc2626', color: '#fff', border: 'none', width: 24, height: 24, borderRadius: '50%', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            </div>
          ))}
          {fotos.length < 2 && (
            <label style={{ ...btnSecundario, display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
              + Subir foto JPG
              <input type="file" accept="image/jpeg" onChange={cargarFoto} style={{ display: 'none' }} />
            </label>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>TOTAL: $ {formatMoney(total)}</div>
        <button onClick={imprimir} style={btnPrincipal}>📄 Generar presupuesto</button>
      </div>

      <a href="/dashboard" style={{ color: '#0369a1', fontSize: 14 }}>← Volver al panel</a>
    </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 12, color: '#334155', marginBottom: 4, fontWeight: 600 };
const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14, minHeight: 42, color: '#0f172a', background: '#fff' };
const btnPrincipal: React.CSSProperties = { background: '#f97316', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer' };
const btnSecundario: React.CSSProperties = { background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const btnQuitar: React.CSSProperties = { background: '#fee2e2', color: '#dc2626', border: 'none', width: 42, height: 42, borderRadius: 8, cursor: 'pointer', fontWeight: 700 };
