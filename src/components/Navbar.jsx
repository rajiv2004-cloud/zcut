import React from 'react';

export default function Navbar() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 'var(--nav-height)',
        padding: '0 0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(17,17,17,0.08)',
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.05rem',
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
            fontSize: '0.72rem',
            fontWeight: 700,
            background: 'var(--black)',
            color: 'var(--white)',
            padding: '3px 8px',
            borderRadius: '6px',
            letterSpacing: '0.08em',
          }}
        >
          ZCUT.TOOL
        </span>
      </div>

      {/* Status Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="pill active" style={{ fontSize: '0.68rem', padding: '6px 14px' }}>
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
          100% IN-BROWSER &bull; PRIVATE
        </div>
      </div>
    </header>
  );
}
