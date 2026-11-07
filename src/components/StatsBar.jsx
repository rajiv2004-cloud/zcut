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
        marginTop: '2rem',
        padding: '1.8rem 2.2rem',
        borderRadius: '24px',
        border: '2px solid var(--black)',
        background: 'var(--white)',
        boxShadow: '8px 8px 0px var(--black)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
      }}
    >
      {/* Metrics Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--grey)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Original Total
          </span>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--black)' }}>
            {formatBytes(totalOriginalSize)}
          </p>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', color: 'var(--grey)' }}>&rarr;</div>

        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--grey)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Compressed Total
          </span>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--black)' }}>
            {formatBytes(totalCompressedSize)}
          </p>
        </div>

        <div style={{ width: '1px', height: '36px', background: 'var(--grey-light)' }} />

        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--grey)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Total Reduced
          </span>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--black)' }}>
            {formatBytes(totalSavedBytes)} <span style={{ fontSize: '0.9rem', color: '#059669' }}>(-{totalReduction}%)</span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={onClearAll}
          className="btn-outline"
          style={{ padding: '12px 20px', fontSize: '0.78rem' }}
        >
          CLEAR ALL
        </button>

        <button
          type="button"
          onClick={onDownloadAll}
          disabled={completedItems.length === 0 || isPackagingZip}
          className="btn-primary"
          style={{ padding: '14px 28px', fontSize: '0.85rem' }}
        >
          {isPackagingZip ? (
            <span>PACKAGING ARCHIVE...</span>
          ) : isSingle ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>DOWNLOAD IMAGE</span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
