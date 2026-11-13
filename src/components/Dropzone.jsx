import React, { useState, useRef, useEffect } from 'react';

export default function Dropzone({ onFilesSelected }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Global paste handler (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const imageFiles = Array.from(e.clipboardData.files).filter((file) =>
          file.type.startsWith('image/')
        );
        if (imageFiles.length > 0) {
          e.preventDefault();
          onFilesSelected(imageFiles);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesSelected]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const imageFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (imageFiles.length > 0) {
        onFilesSelected(imageFiles);
      }
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const imageFiles = Array.from(e.target.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (imageFiles.length > 0) {
        onFilesSelected(imageFiles);
      }
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      style={{
        position: 'relative',
        borderRadius: '20px',
        border: `2px dashed ${isDragOver ? 'var(--black)' : 'rgba(17,17,17,0.3)'}`,
        background: 'var(--white)',
        padding: 'clamp(2rem, 6vw, 3.5rem) 1.25rem',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: isDragOver ? '6px 6px 0px var(--black)' : '4px 4px 0px rgba(17,17,17,0.08)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        userSelect: 'none',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        multiple
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      {/* Upload Icon Box */}
      <div
        style={{
          width: 'clamp(50px, 12vw, 64px)',
          height: 'clamp(50px, 12vw, 64px)',
          margin: '0 auto 1.25rem',
          borderRadius: '16px',
          background: 'var(--black)',
          color: 'var(--white)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '4px 4px 0px rgba(17,17,17,0.15)',
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>

      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.35rem, 4.5vw, 2.1rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--black)',
          marginBottom: '0.5rem',
          lineHeight: 1.2,
        }}
      >
        {isDragOver ? 'DROP FILES TO COMPRESS' : 'TAP OR DROP IMAGES HERE'}
      </h2>

      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(0.75rem, 2.8vw, 0.85rem)',
          color: 'var(--grey)',
          maxWidth: '500px',
          margin: '0 auto 1.5rem',
          lineHeight: 1.6,
        }}
      >
        Select single or multiple photos. Fast, lossless &amp; 100% private.
      </p>

      {/* Responsive Pills Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span className="pill active">
          ✦ PNG (RECOMMENDED)
        </span>
        <span className="pill">
          WEBP
        </span>
        <span className="pill">
          JPEG
        </span>
        <span className="pill">
          AVIF
        </span>
        <span className="pill green">
          100% CLIENT-SIDE
        </span>
      </div>
    </div>
  );
}
