'use client';
export default function BarraSuperior() {
  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
      borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '8px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 13, fontFamily: 'system-ui, sans-serif', flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', flexShrink: 0, display: 'inline-block' }} />
          <span>
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>Atención a domicilio y en taller</span>
            {' · '}
            <span style={{ color: '#38bdf8' }}>Coordiná tu turno</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <a href="tel:+542966383251" style={{ color: '#e2e8f0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            📞 <span style={{ fontWeight: 600 }}>2966-383251</span>
          </a>
          <a href="tel:+5491156975880" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            📱 <span>11 5697-5880</span>
          </a>
          <a href="https://wa.me/5491156975880" target="_blank" rel="noopener noreferrer"
            style={{ background: '#22c55e', color: '#fff', padding: '4px 12px', borderRadius: 99, textDecoration: 'none', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            💬 WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
