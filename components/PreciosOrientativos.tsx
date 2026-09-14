'use client';

import { useState, useEffect } from 'react';

interface Precio {
  id: number;
  servicio: string;
  precio: string;
  nota: string;
  icono: string;
}

const FALLBACK: Precio[] = [
  { id: 1, servicio: 'Diagnóstico completo', precio: '15.000', nota: 'Se descuenta si reparás con nosotros', icono: '🔍' },
  { id: 2, servicio: 'Limpieza + pasta térmica', precio: '55.000', nota: 'PC, notebook o PlayStation', icono: '🧹' },
  { id: 3, servicio: 'HDMI PlayStation 5', precio: '195.000', nota: 'Microsoldadura, garantía escrita', icono: '🎮' },
  { id: 4, servicio: 'Cambio de pantalla notebook', precio: '155.000', nota: 'Incluye pantalla e instalación', icono: '💻' },
  { id: 5, servicio: 'Instalación Windows + drivers', precio: '65.000', nota: 'Licencia original opcional', icono: '🪟' },
  { id: 6, servicio: 'Soporte técnico empresas', precio: 'A convenir', nota: 'Servidores, redes, UPS', icono: '🏢' },
];

export default function PreciosOrientativos() {
  const [precios, setPrecios] = useState<Precio[]>(FALLBACK);

  useEffect(() => {
    fetch('/api/precios')
      .then(r => r.json())
      .then(d => { if (d.precios && Array.isArray(d.precios) && d.precios.length > 0) setPrecios(d.precios); })
      .catch(() => {});
  }, []);

  return (
    <section id="precios" style={{ padding: '60px 16px', maxWidth: 900, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <p style={{ color: '#38bdf8', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
          Precios de referencia
        </p>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
          ¿Cuánto cuesta?
        </h2>
        <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>
          Precios orientativos para que tengas una idea. El presupuesto final depende de cada equipo.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        {precios.map((p) => (
          <div key={p.id} style={{
            background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)',
            borderRadius: 16, padding: '20px', display: 'flex', alignItems: 'flex-start', gap: 14,
          }}>
            <span style={{ fontSize: 28, lineHeight: 1 }}>{p.icono}</span>
            <div style={{ flex: 1 }}>
              <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 14 }}>{p.servicio}</span>
              <div style={{ marginTop: 4, marginBottom: 4 }}>
                {p.precio === 'A convenir' ? (
                  <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: 16 }}>{p.precio}</span>
                ) : (
                  <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 18 }}>desde ${p.precio}</span>
                )}
              </div>
              <span style={{ color: '#64748b', fontSize: 12 }}>{p.nota}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="https://wa.me/5491156975880?text=Hola%20ElectroGamez!%20Quiero%20consultar%20por%20un%20presupuesto."
          target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#22c55e', color: '#fff',
            padding: '12px 28px', borderRadius: 99, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
          💬 Pedir presupuesto exacto
        </a>
        <a href="/tienda"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa',
            padding: '12px 28px', borderRadius: 99, textDecoration: 'none', fontWeight: 700, fontSize: 15,
            border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          🛒 Ir a la Tienda
        </a>
      </div>
      <p style={{ textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 10 }}>
        * Los precios pueden variar según el modelo y estado del equipo. 
      </p>
    </section>
  );
}
