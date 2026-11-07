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
        borderRadius: '24px',
        border: `2px dashed ${isDragOver ? 'var(--black)' : 'rgba(17,17,17,0.3)'}`,
        background: isDragOver ? 'var(--white)' : 'var(--white)',
        padding: '3.5rem 2rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease',
        transform: isDragOver ? 'translateY(-6px) rotate(-0.5deg)' : 'none',
        boxShadow: isDragOver ? '8px 8px 0px var(--black)' : '4px 4px 0px rgba(17,17,17,0.08)',
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

      {/* Floating Animated Icon Box */}
      <div
        style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 1.5rem',
          borderRadius: '16px',
          background: 'var(--black)',
          color: 'var(--white)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '4px 4px 0px rgba(17,17,17,0.2)',
          animation: 'float 4s ease-in-out infinite',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>

      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--black)',
          marginBottom: '0.6rem',
        }}
      >
        {isDragOver ? 'DROP FILES TO COMPRESS' : 'DROP IMAGES OR CLICK TO BROWSE'}
      </h2>

      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: 'var(--grey)',
          maxWidth: '520px',
          margin: '0 auto 1.8rem',
          lineHeight: 1.7,
        }}
      >
        Single or batch image compression. Fast, lossless &amp; 100% private. Paste anytime with{' '}
        <span
          style={{
            background: 'var(--black)',
            color: 'var(--white)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.75rem',
          }}
        >
          Ctrl+V
        </span>
      </p>

      {/* Pills Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
          ZERO SERVER UPLOAD
        </span>
      </div>
    </div>
  );
}
