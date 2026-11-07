import React from 'react';
import { SUPPORTED_FORMATS } from '../utils/compressor';

export default function Controls({ config, onChange, disabled }) {
  const handleFormatChange = (formatId) => {
    onChange({ ...config, targetFormat: formatId });
  };

  const handleQualityChange = (e) => {
    onChange({ ...config, quality: parseFloat(e.target.value) });
  };

  const handleScaleChange = (scaleValue) => {
    onChange({ ...config, scale: scaleValue });
  };

  return (
    <div
      className="zipsar-card"
      style={{
        marginTop: '1.5rem',
        boxShadow: '4px 4px 0px rgba(17,17,17,0.06)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start',
        }}
      >
        {/* Format Selector */}
        <div>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--grey)',
              marginBottom: '0.8rem',
            }}
          >
            [01] Export Format
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {SUPPORTED_FORMATS.map((fmt) => {
              const isSelected = config.targetFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => handleFormatChange(fmt.id)}
                  disabled={disabled}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: `1.5px solid ${isSelected ? 'var(--black)' : 'rgba(17,17,17,0.15)'}`,
                    background: isSelected ? 'var(--black)' : 'var(--bg)',
                    color: isSelected ? 'var(--white)' : 'var(--black)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.25s ease',
                    textAlign: 'left',
                    boxShadow: isSelected ? '4px 4px 0px rgba(17,17,17,0.3)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                      }}
                    >
                      .{fmt.ext.toUpperCase()}
                    </span>
                    {fmt.isRecommended && (
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: isSelected ? 'var(--white)' : 'var(--black)',
                          color: isSelected ? 'var(--black)' : 'var(--white)',
                          letterSpacing: '0.04em',
                        }}
                      >
                        REC
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--grey)',
                      marginTop: '4px',
                    }}
                  >
                    {fmt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quality Control Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <label
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--grey)',
              }}
            >
              [02] Quality Level
            </label>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--black)',
                background: 'var(--bg)',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(17,17,17,0.15)',
              }}
            >
              {Math.round(config.quality * 100)}%
            </span>
          </div>

          <div style={{ padding: '12px 0 16px' }}>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={config.quality}
              onChange={handleQualityChange}
              disabled={disabled}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: 'var(--grey)',
              letterSpacing: '0.04em',
            }}
          >
            <span>High Compression</span>
            <span>Balanced (85%)</span>
            <span>Pure Lossless</span>
          </div>
        </div>

        {/* Resolution Scale Presets */}
        <div>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--grey)',
              marginBottom: '0.8rem',
            }}
          >
            [03] Scale Resolution
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { label: '100%', val: 1.0 },
              { label: '75%', val: 0.75 },
              { label: '50%', val: 0.5 },
              { label: '25%', val: 0.25 },
            ].map((p) => {
              const isSelected = config.scale === p.val;
              return (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => handleScaleChange(p.val)}
                  disabled={disabled}
                  style={{
                    flex: 1,
                    padding: '10px 4px',
                    borderRadius: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    border: `1.5px solid ${isSelected ? 'var(--black)' : 'rgba(17,17,17,0.15)'}`,
                    background: isSelected ? 'var(--black)' : 'var(--bg)',
                    color: isSelected ? 'var(--white)' : 'var(--black)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'var(--grey)',
              marginTop: '1rem',
              lineHeight: 1.6,
            }}
          >
            Resolution resizing reduces image dimensions while maintaining aspect ratio and sharpness.
          </p>
        </div>
      </div>
    </div>
  );
}
