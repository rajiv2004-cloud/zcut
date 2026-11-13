import React, { useState, useEffect, useRef } from 'react';
import { SUPPORTED_FORMATS } from '../utils/compressor';

export default function Controls({ config, onChange }) {
  const [localQuality, setLocalQuality] = useState(config.quality);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    setLocalQuality(config.quality);
  }, [config.quality]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleFormatChange = (formatId) => {
    onChange({ ...config, targetFormat: formatId });
  };

  const handleQualityChange = (e) => {
    const val = parseFloat(e.target.value);
    setLocalQuality(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onChange({ ...config, quality: val });
    }, 120);
  };

  const handleQualityCommit = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onChange({ ...config, quality: localQuality });
  };

  const handleScaleChange = (scaleValue) => {
    onChange({ ...config, scale: scaleValue });
  };

  return (
    <div
      className="zipsar-card"
      style={{
        marginTop: '1.25rem',
      }}
    >
      <div className="controls-grid">
        {/* Format Selector */}
        <div>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--grey)',
              marginBottom: '0.75rem',
            }}
          >
            [01] Export Format
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {SUPPORTED_FORMATS.map((fmt) => {
              const isSelected = config.targetFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => handleFormatChange(fmt.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: `1.5px solid ${isSelected ? 'var(--black)' : 'rgba(17,17,17,0.15)'}`,
                    background: isSelected ? 'var(--black)' : 'var(--bg)',
                    color: isSelected ? 'var(--white)' : 'var(--black)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease, color 0.2s ease',
                    textAlign: 'left',
                    minHeight: '52px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                      }}
                    >
                      .{fmt.ext.toUpperCase()}
                    </span>
                    {fmt.isRecommended && (
                      <span
                        style={{
                          fontSize: '0.58rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '1px 5px',
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
                      fontSize: '0.65rem',
                      color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--grey)',
                      marginTop: '2px',
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <label
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
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
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--black)',
                background: 'var(--bg)',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(17,17,17,0.15)',
              }}
            >
              {Math.round(localQuality * 100)}%
            </span>
          </div>

          <div style={{ padding: '10px 0 14px' }}>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.01"
              value={localQuality}
              onChange={handleQualityChange}
              onPointerUp={handleQualityCommit}
              onKeyUp={handleQualityCommit}
              style={{
                touchAction: 'none',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--grey)',
              letterSpacing: '0.02em',
            }}
          >
            <span>High Comp (10%)</span>
            <span>Balanced (85%)</span>
            <span>Lossless (100%)</span>
          </div>
        </div>

        {/* Resolution Scale Presets */}
        <div>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--grey)',
              marginBottom: '0.75rem',
            }}
          >
            [03] Scale Resolution
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
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
                  style={{
                    flex: 1,
                    padding: '10px 2px',
                    borderRadius: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'clamp(0.7rem, 2.5vw, 0.78rem)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: `1.5px solid ${isSelected ? 'var(--black)' : 'rgba(17,17,17,0.15)'}`,
                    background: isSelected ? 'var(--black)' : 'var(--bg)',
                    color: isSelected ? 'var(--white)' : 'var(--black)',
                    transition: 'background-color 0.2s ease, color 0.2s ease',
                    minHeight: '40px',
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
              fontSize: '0.68rem',
              color: 'var(--grey)',
              marginTop: '0.85rem',
              lineHeight: 1.5,
            }}
          >
            Downscale dimensions to dramatically cut file sizes while keeping crisp clarity.
          </p>
        </div>
      </div>
    </div>
  );
}
