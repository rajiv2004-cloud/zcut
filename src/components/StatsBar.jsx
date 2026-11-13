import React from 'react';
import { formatBytes } from '../utils/compressor';

export default function StatsBar({
  items,
  isPackagingZip,
  onDownloadAll,
  onClearAll,
}) {
  if (!items || items.length === 0) return null;

  const completedItems = items.filter((i) => i.result);
  const totalOriginalSize = completedItems.reduce((acc, i) => acc + (i.result?.originalSize || 0), 0);
  const totalCompressedSize = completedItems.reduce((acc, i) => acc + (i.result?.compressedSize || 0), 0);
  const totalSavedBytes = Math.max(0, totalOriginalSize - totalCompressedSize);
  const totalReduction = totalOriginalSize > 0
    ? (((totalSavedBytes) / totalOriginalSize) * 100).toFixed(1)
    : '0';

  const isSingle = items.length === 1;

  return (
    <div
      style={{
        marginTop: '1.5rem',
        padding: '1.25rem 1.5rem',
        borderRadius: '20px',
        border: '2px solid var(--black)',
        background: 'var(--white)',
        boxShadow: '6px 6px 0px var(--black)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      {/* Metrics Block (Responsive Wrap) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(12px, 3vw, 2rem)',
          flexWrap: 'wrap',
          flex: '1 1 280px',
        }}
      >
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--grey)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Original
          </span>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)', fontWeight: 800, color: 'var(--black)' }}>
            {formatBytes(totalOriginalSize)}
          </p>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: 'var(--grey)' }}>&rarr;</div>

        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--grey)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Compressed
          </span>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)', fontWeight: 800, color: 'var(--black)' }}>
            {formatBytes(totalCompressedSize)}
          </p>
        </div>

        <div style={{ width: '1px', height: '32px', background: 'var(--grey-light)', display: 'inline-block' }} />

        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--grey)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Saved
          </span>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)', fontWeight: 800, color: 'var(--black)' }}>
            {formatBytes(totalSavedBytes)} <span style={{ fontSize: '0.85rem', color: '#059669' }}>(-{totalReduction}%)</span>
          </p>
        </div>
      </div>

      {/* Actions (Full width stack on small mobile screens) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          width: 'auto',
          marginLeft: 'auto',
        }}
      >
        <button
          type="button"
          onClick={onClearAll}
          className="btn-outline"
          style={{ padding: '10px 18px', fontSize: '0.75rem', flex: '1 1 auto' }}
        >
          CLEAR ALL
        </button>

        <button
          type="button"
          onClick={onDownloadAll}
          disabled={completedItems.length === 0 || isPackagingZip}
          className="btn-primary"
          style={{ padding: '12px 24px', fontSize: '0.82rem', flex: '2 1 auto' }}
        >
          {isPackagingZip ? (
            <span>PACKAGING...</span>
          ) : isSingle ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>DOWNLOAD IMAGE</span>
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>DOWNLOAD ALL (.ZIP)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
