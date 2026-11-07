import React from 'react';
import { formatBytes } from '../utils/compressor';

export default function BatchList({ items, activeId, onSelect, onRemove, onDownloadSingle }) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.8rem',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--grey)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}
        >
          [QUEUE] &bull; {items.length} {items.length === 1 ? 'FILE' : 'FILES'}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--grey)',
          }}
        >
          CLICK TO INSPECT &bull; DIRECT DOWNLOAD PER ITEM
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item) => {
          const isActive = item.id === activeId;
          const { file, result, status } = item;

          return (
            <div
              key={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderRadius: '16px',
                background: 'var(--white)',
                border: `1.5px solid ${isActive ? 'var(--black)' : 'rgba(17,17,17,0.15)'}`,
                boxShadow: isActive ? '5px 5px 0px var(--black)' : '2px 2px 0px rgba(17,17,17,0.05)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                gap: '16px',
              }}
            >
              {/* Thumbnail + Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: 'var(--bg)',
                    border: '1.5px solid rgba(17,17,17,0.15)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {result?.url ? (
                    <img
                      src={result.url}
                      alt={file.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--grey)' }}>...</span>
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--black)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '280px',
                    }}
                  >
                    {file.name}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      color: 'var(--grey)',
                      marginTop: '2px',
                    }}
                  >
                    {formatBytes(file.size)}
                    {result && (
                      <span>
                        {' '}&rarr;{' '}
                        <strong style={{ color: 'var(--black)' }}>{formatBytes(result.compressedSize)}</strong>
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Status & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                {status === 'processing' ? (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--grey)' }}>
                    COMPRESSING...
                  </span>
                ) : result ? (
                  <span className="pill green" style={{ fontSize: '0.68rem', padding: '4px 10px' }}>
                    -{result.reductionPercent}%
                  </span>
                ) : null}

                {/* Direct Download Button */}
                {result && (
                  <button
                    type="button"
                    title="Download this file directly"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadSingle(item);
                    }}
                    style={{
                      background: 'var(--bg)',
                      border: '1.5px solid var(--black)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--black)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--black)';
                      e.currentTarget.style.color = 'var(--white)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg)';
                      e.currentTarget.style.color = 'var(--black)';
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    DOWNLOAD
                  </button>
                )}

                {/* Remove item */}
                <button
                  type="button"
                  title="Remove from queue"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item.id);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '6px',
                    cursor: 'pointer',
                    color: 'var(--grey)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
