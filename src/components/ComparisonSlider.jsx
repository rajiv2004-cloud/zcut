import React, { useState, useRef, useEffect, useCallback } from 'react';
import { formatBytes } from '../utils/compressor';

export default function ComparisonSlider({ item }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  }, []);

  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };
    const handleTouchMove = (e) => {
      if (isDragging && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMove]);

  if (!item || !item.result) return null;

  const { result } = item;

  return (
    <div
      className="zipsar-card"
      style={{
        marginTop: '1.5rem',
        boxShadow: '6px 6px 0px var(--black)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--black)',
            }}
          >
            INTERACTIVE COMPARISON
          </h3>
          <span className="pill" style={{ fontSize: '0.65rem' }}>
            SLIDE TO COMPARE
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
          <span style={{ color: 'var(--grey)' }}>
            DIMENSIONS: <strong style={{ color: 'var(--black)' }}>{result.width} &times; {result.height}px</strong>
          </span>
          <span style={{ color: 'var(--grey)' }}>
            SPEED: <strong style={{ color: 'var(--black)' }}>{result.durationMs}ms</strong>
          </span>
        </div>
      </div>

      {/* Slider Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        style={{
          position: 'relative',
          width: '100%',
          height: '420px',
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'ew-resize',
          userSelect: 'none',
          backgroundColor: '#E5E5E3',
          backgroundImage: `
            linear-gradient(45deg, #D4D4D1 25%, transparent 25%), 
            linear-gradient(-45deg, #D4D4D1 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #D4D4D1 75%), 
            linear-gradient(-45deg, transparent 75%, #D4D4D1 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          border: '2px solid var(--black)',
        }}
      >
        {/* Layer 1: Compressed Image (Bottom Layer) */}
        <img
          src={result.url}
          alt="Compressed preview"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
          }}
        />

        {/* Layer 2: Original Image (Clipped) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
            pointerEvents: 'none',
          }}
        >
          <img
            src={result.originalUrl}
            alt="Original preview"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* High-Contrast Divider Handle */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${sliderPos}%`,
            width: '2px',
            background: 'var(--black)',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--white)',
              border: '2px solid var(--black)',
              boxShadow: '3px 3px 0px var(--black)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--black)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="8 7 3 12 8 17" />
              <polyline points="16 7 21 12 16 17" />
            </svg>
          </div>
        </div>

        {/* Floating Badges */}
        <div
          style={{
            position: 'absolute',
            top: '14px',
            left: '14px',
            background: 'var(--black)',
            color: 'var(--white)',
            padding: '6px 12px',
            borderRadius: '100px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            pointerEvents: 'none',
          }}
        >
          ORIGINAL: {formatBytes(result.originalSize)}
        </div>

        <div
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'var(--white)',
            color: 'var(--black)',
            border: '1.5px solid var(--black)',
            padding: '6px 12px',
            borderRadius: '100px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            boxShadow: '2px 2px 0px var(--black)',
            pointerEvents: 'none',
          }}
        >
          COMPRESSED: {formatBytes(result.compressedSize)} (-{result.reductionPercent}%)
        </div>
      </div>
    </div>
  );
}
