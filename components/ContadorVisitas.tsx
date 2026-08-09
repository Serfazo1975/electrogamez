'use client';

// ============================================================
// components/ContadorVisitas.tsx — Contador visual de visitas
// ElectroGamez — Componente NUEVO. No modifica nada existente.
// Llama a /api/visitas (suma 1 y trae el total), y lo muestra
// con una animación de conteo ascendente.
// ============================================================

import { useEffect, useState, useRef } from 'react';

export default function ContadorVisitas() {
  const [total, setTotal] = useState<number | null>(null);
  const [mostrado, setMostrado] = useState(0);
  const yaConto = useRef(false);

  useEffect(() => {
    // Evita contar dos veces en desarrollo (React StrictMode)
    if (yaConto.current) return;
    yaConto.current = true;

    fetch('/api/visitas')
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.total === 'number') setTotal(d.total);
      })
      .catch(() => setTotal(1000));
  }, []);

  // Animación: cuenta desde (total - 40) hasta el total real
  useEffect(() => {
    if (total === null) return;
    const desde = Math.max(1000, total - 40);
    let actual = desde;
    setMostrado(desde);
    const paso = Math.max(1, Math.round((total - desde) / 30));
    const timer = setInterval(() => {
      actual += paso;
      if (actual >= total) {
        actual = total;
        clearInterval(timer);
      }
      setMostrado(actual);
    }, 30);
    return () => clearInterval(timer);
  }, [total]);

  if (total === null) return null; // no mostrar nada hasta tener el dato

  const formateado = new Intl.NumberFormat('es-AR').format(mostrado);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 18px',
        borderRadius: 999,
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(148, 163, 184, 0.25)',
        backdropFilter: 'blur(8px)',
        color: '#e2e8f0',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 14,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#22c55e',
          boxShadow: '0 0 8px #22c55e',
        }}
      />
      <span style={{ color: '#94a3b8' }}>Visitas</span>
      <span
        style={{
          fontWeight: 800,
          fontSize: 16,
          color: '#f97316',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: 0.5,
        }}
      >
        {formateado}
      </span>
    </div>
  );
}
