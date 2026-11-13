import React from 'react';

export default function Navbar() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 'var(--nav-height)',
        padding: '0.75rem 0.25rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid rgba(17,17,17,0.08)',
        flexWrap: 'wrap',
        gap: '10px',
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(0.95rem, 3.5vw, 1.05rem)',
            fontWeight: 800,
            letterSpacing: '0.06em',
            color: 'var(--black)',
          }}
        >
          ZIPSAR /&gt;
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 700,
            background: 'var(--black)',
            color: 'var(--white)',
            padding: '2px 6px',
            borderRadius: '4px',
            letterSpacing: '0.08em',
          }}
        >
          ZCUT
        </span>
      </div>

      {/* Status Pill */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="pill active" style={{ fontSize: '0.65rem', padding: '5px 12px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#22c55e',
              display: 'inline-block',
              animation: 'blink 2s infinite',
            }}
          />
          100% PRIVATE
        </div>
      </div>
    </header>
  );
}
