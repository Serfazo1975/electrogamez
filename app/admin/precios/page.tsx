'use client';

import { useState, useEffect } from 'react';

interface Precio {
  id: number;
  servicio: string;
  precio: string;
  nota: string;
  icono: string;
}

const ICONOS = ['🔍','🧹','🎮','💻','🪟','🏢','🖨️','🔧','🛡️','📱','⚡','🖥️','🎧','📡','🔌'];

export default function PreciosAdminPage() {
  const [precios, setPrecios] = useState<Precio[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch('/api/precios')
      .then(r => r.json())
      .then(d => { if (d.precios) setPrecios(d.precios); })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  function actualizar(i: number, campo: keyof Precio, valor: string) {
    setPrecios(prev => prev.map((p, idx) => idx === i ? { ...p, [campo]: valor } : p));
  }

  function agregar() {
    const nuevoId = Math.max(0, ...precios.map(p => p.id)) + 1;
    setPrecios([...precios, { id: nuevoId, servicio: '', precio: '', nota: '', icono: '🔧' }]);
  }

  function quitar(i: number) {
    if (precios.length <= 1) return;
    setPrecios(precios.filter((_, idx) => idx !== i));
  }

  async function guardar() {
    setGuardando(true);
    setMensaje('');
    try {
      const res = await fetch('/api/precios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ precios }),
      });
      if (res.ok) {
        setMensaje('✅ Precios guardados. Ya se ven en la web pública.');
      } else {
        const data = await res.json();
        setMensaje('❌ ' + (data.error || 'Error al guardar'));
      }
    } catch {
      setMensaje('❌ Sin conexión');
    }
    setGuardando(false);
  }

  if (cargando) return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Cargando precios...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#1e293b' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: '#0f172a' }}>💰 Precios de la web</h1>
        <p style={{ color: '#475569', marginBottom: 24 }}>
          Editá los precios que ven los clientes en la sección "¿Cuánto cuesta?" de la página pública. Los cambios se aplican al instante.
        </p>

        {precios.map((p, i) => (
          <div key={p.id} style={{
            background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12,
            padding: 16, marginBottom: 12,
            display: 'grid', gridTemplateColumns: '60px 1fr 140px 1fr auto', gap: 10, alignItems: 'end',
          }}>
            <div>
              {i === 0 && <label style={lbl}>Ícono</label>}
              <select style={inp} value={p.icono} onChange={e => actualizar(i, 'icono', e.target.value)}>
                {ICONOS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>
            <div>
              {i === 0 && <label style={lbl}>Servicio</label>}
              <input style={inp} value={p.servicio} onChange={e => actualizar(i, 'servicio', e.target.value)}
                placeholder="Ej: Limpieza + pasta térmica" />
            </div>
            <div>
              {i === 0 && <label style={lbl}>Precio</label>}
              <input style={inp} value={p.precio} onChange={e => actualizar(i, 'precio', e.target.value)}
                placeholder="15.000 o A convenir" />
            </div>
            <div>
              {i === 0 && <label style={lbl}>Nota</label>}
              <input style={inp} value={p.nota} onChange={e => actualizar(i, 'nota', e.target.value)}
                placeholder="Detalle corto" />
            </div>
            <button onClick={() => quitar(i)} style={{
              background: '#fee2e2', color: '#dc2626', border: 'none', width: 40, height: 40,
              borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 16,
            }}>✕</button>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          <button onClick={agregar} style={{
            background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '10px 20px',
            borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>+ Agregar servicio</button>

          <button onClick={guardar} disabled={guardando} style={{
            background: '#0ea5e9', color: '#fff', border: 'none', padding: '10px 28px',
            borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            opacity: guardando ? 0.6 : 1,
          }}>
            {guardando ? '⏳ Guardando...' : '💾 Guardar precios'}
          </button>
        </div>

        {mensaje && (
          <div style={{
            marginTop: 16, padding: 14, borderRadius: 8, fontSize: 14, fontWeight: 600,
            background: mensaje.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
            color: mensaje.startsWith('✅') ? '#166534' : '#dc2626',
            border: `1px solid ${mensaje.startsWith('✅') ? '#bbf7d0' : '#fecaca'}`,
          }}>{mensaje}</div>
        )}

        <div style={{ marginTop: 24 }}>
          <a href="/dashboard" style={{ color: '#0369a1', fontSize: 14 }}>← Volver al panel</a>
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 12, color: '#334155', marginBottom: 4, fontWeight: 600 };
const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14, minHeight: 40, color: '#0f172a', background: '#fff' };
