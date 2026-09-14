'use client';

// ============================================================
// components/ResenasGoogle.tsx — Reseñas reales de Google Maps
// ElectroGamez — Componente NUEVO. No modifica nada existente.
// Muestra reseñas copiadas directamente de la ficha de Google.
// Para actualizar: agregar/editar las reseñas en el array.
// ============================================================

import { useState } from 'react';

const RESENAS = [
  {
    nombre: 'Karina Miranda',
    texto: 'Una excelente atención inmediata... super recomendable!!!',
    estrellas: 5,
    tiempo: 'Hace 3 semanas',
    iniciales: 'KM',
    color: '#7c3aed',
  },
  {
    nombre: 'Rodrigo Diaz',
    texto: 'Excelente atención, muy responsable y rápido.',
    estrellas: 5,
    tiempo: 'Hace 3 semanas',
    iniciales: 'RD',
    color: '#2563eb',
  },
  {
    nombre: 'Madeleine Devetac',
    texto: 'Excelente atención y servicio! Muy recomendable.',
    estrellas: 5,
    tiempo: 'Hace 3 semanas',
    iniciales: 'MD',
    color: '#0891b2',
  },
  {
    nombre: 'Elisa Velazquez',
    texto: 'Excelente Servicio, siempre que tengo un problema con mi computadora él me lo soluciona.',
    estrellas: 5,
    tiempo: 'Hace 3 semanas',
    iniciales: 'EV',
    color: '#059669',
  },
  {
    nombre: 'Marcelo Daniel Menchon',
    texto: 'Me soluciona todo en mi local y siempre atento. Responsable 100%.',
    estrellas: 5,
    tiempo: 'Hace 3 semanas',
    iniciales: 'MM',
    color: '#d97706',
    badge: 'Local Guide',
  },
  {
    nombre: 'Ltr Snck',
    texto: 'Excelente servicio, super recomendado.',
    estrellas: 5,
    tiempo: 'Hace 4 semanas',
    iniciales: 'LS',
    color: '#dc2626',
  },
];

const PUNTAJE = 5.0;
const TOTAL_RESENAS = RESENAS.length;
const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/AXvJWjFLkQGkzNrVA';

function Estrellas({ n }: { n: number }) {
  return (
    <span style={{ color: '#facc15', fontSize: 14, letterSpacing: 1 }}>
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  );
}

export default function ResenasGoogle() {
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const visibles = mostrarTodas ? RESENAS : RESENAS.slice(0, 3);

  return (
    <section id="resenas" style={{
      padding: '60px 16px',
      maxWidth: 900,
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Encabezado con puntaje */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <img
            src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
            alt="Google"
            style={{ height: 20 }}
          />
          <span style={{ color: '#94a3b8', fontSize: 13 }}>Reseñas verificadas</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 48, fontWeight: 800, color: '#fff' }}>{PUNTAJE.toFixed(1)}</span>
          <div>
            <Estrellas n={5} />
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 2 }}>
              {TOTAL_RESENAS} reseñas en Google Maps
            </p>
          </div>
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
          Lo que dicen nuestros clientes
        </h2>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Reseñas reales verificadas por Google
        </p>
      </div>

      {/* Grid de reseñas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 16,
      }}>
        {visibles.map((r, i) => (
          <div key={i} style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(148, 163, 184, 0.12)',
            borderRadius: 16,
            padding: '20px',
          }}>
            {/* Cabecera: avatar + nombre + estrellas */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: r.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}>
                {r.iniciales}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 14 }}>{r.nombre}</span>
                  {r.badge && (
                    <span style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 99,
                      fontWeight: 600,
                    }}>
                      {r.badge}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <Estrellas n={r.estrellas} />
                  <span style={{ color: '#475569', fontSize: 11 }}>{r.tiempo}</span>
                </div>
              </div>
            </div>

            {/* Texto */}
            <p style={{
              color: '#cbd5e1',
              fontSize: 14,
              lineHeight: 1.6,
              margin: 0,
            }}>
              "{r.texto}"
            </p>
          </div>
        ))}
      </div>

      {/* Botones */}
      <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {!mostrarTodas && RESENAS.length > 3 && (
          <button onClick={() => setMostrarTodas(true)}
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              color: '#e2e8f0',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              padding: '10px 24px',
              borderRadius: 99,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}>
            Ver todas las reseñas ({TOTAL_RESENAS})
          </button>
        )}
        <a href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#fff',
            color: '#1e293b',
            padding: '10px 24px',
            borderRadius: 99,
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: 14,
          }}>
          <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="" style={{ height: 16 }} />
          Dejá tu reseña
        </a>
      </div>
    </section>
  );
}
