'use client';

// ============================================================
// components/MapaContacto.tsx — Google Maps embebido real
// ElectroGamez — Componente NUEVO. No modifica nada existente.
// Muestra el mapa real de la ubicación del taller en Río Gallegos.
// Coordenadas: -51.6349395, -69.2000368
// ============================================================

export default function MapaContacto() {
  return (
    <div style={{
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid rgba(148, 163, 184, 0.15)',
      marginTop: 20,
    }}>
      <iframe
        title="Ubicación ElectroGamez - Los Pozos 458, Río Gallegos"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2468.5!2d-69.2026117!3d-51.6349395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xbdb6f977fc813287%3A0x4ab5789f9dfe0a!2sElectrogamez%20R%C3%ADo%20Gallegos!5e0!3m2!1ses!2sar"
        width="100%"
        height="300"
        style={{ border: 0, display: 'block' }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <div>
          <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 14, margin: 0 }}>
            📍 ElectroGamez - Servicio Técnico
          </p>
          <p style={{ color: '#94a3b8', fontSize: 12, margin: '4px 0 0' }}>
            Los Pozos 458, Río Gallegos, Santa Cruz
          </p>
        </div>
        <a href="https://maps.app.goo.gl/AXvJWjFLkQGkzNrVA"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#3b82f6',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 99,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 13,
          }}>
          Abrir en Google Maps
        </a>
      </div>
    </div>
  );
}
