import React, { useState, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import Dropzone from './components/Dropzone';
import Controls from './components/Controls';
import ComparisonSlider from './components/ComparisonSlider';
import BatchList from './components/BatchList';
import StatsBar from './components/StatsBar';
import { compressImage } from './utils/compressor';
import { createZipBundle } from './utils/zipBuilder';

export default function App() {
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [config, setConfig] = useState({
    targetFormat: 'image/png', // PNG recommended default
    quality: 0.85,
    scale: 1.0,
  });
  const [isPackagingZip, setIsPackagingZip] = useState(false);

  // Request version tracking to discard obsolete in-flight compressions during fast sliding
  const configVersionRef = useRef(0);

  // Compress a single item with image caching and cancellation check
  const processItem = useCallback(async (item, currentConfig, expectedVersion) => {
    try {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'processing', error: null } : i))
      );

      const result = await compressImage(item.file, {
        ...currentConfig,
        cachedImg: item.decodedImg,
        initialObjectUrl: item.result?.originalUrl,
      });

      // If a newer quality/format change happened while this was computing, ignore outdated result
      if (expectedVersion !== undefined && configVersionRef.current !== expectedVersion) {
        if (result.url) URL.revokeObjectURL(result.url);
        return;
      }

      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== item.id) return i;
          // Revoke old compressed object URL to prevent memory leaks
          if (i.result?.url && i.result.url !== result.url) {
            URL.revokeObjectURL(i.result.url);
          }
          return {
            ...i,
            status: 'done',
            decodedImg: result.decodedImg || i.decodedImg,
            result,
            error: null,
          };
        })
      );
    } catch (err) {
      console.error('Compression error:', err);
      if (expectedVersion !== undefined && configVersionRef.current !== expectedVersion) return;
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: 'error', error: err.message } : i
        )
      );
    }
  }, []);

  // Handle new files dropped / pasted / selected
  const handleFilesSelected = (files) => {
    const newItems = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      status: 'pending',
      decodedImg: null,
      result: null,
      error: null,
    }));

    setItems((prev) => [...prev, ...newItems]);

    if (!activeId && newItems.length > 0) {
      setActiveId(newItems[0].id);
    }

    const currentVersion = configVersionRef.current;
    newItems.forEach((item) => {
      processItem(item, config, currentVersion);
    });
  };

  // Recompress items when settings change (debounced from Controls)
  const handleConfigChange = (newConfig) => {
    configVersionRef.current += 1;
    const currentVersion = configVersionRef.current;
    setConfig(newConfig);

    // Prioritize active image first for immediate user visual feedback
    const activeOne = items.find((i) => i.id === activeId);
    if (activeOne) {
      processItem(activeOne, newConfig, currentVersion);
    }

    // Process remaining images in background
    items.forEach((item) => {
      if (item.id !== activeId) {
        processItem(item, newConfig, currentVersion);
      }
    });
  };

  // Download a single compressed image
  const handleDownloadSingle = (item) => {
    if (!item?.result) return;
    const { blob, format } = item.result;
    const originalName = item.file.name.replace(/\.[^/.]+$/, '');
    const filename = `${originalName}-zcut.${format.ext}`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  // Download all: direct single file if 1 item; zip archive if multiple
  const handleDownloadAll = async () => {
    const completed = items.filter((i) => i.result);
    if (completed.length === 0) return;

    if (completed.length === 1) {
      handleDownloadSingle(completed[0]);
      return;
    }

    try {
      setIsPackagingZip(true);
      const zipFiles = completed.map((item) => {
        const originalName = item.file.name.replace(/\.[^/.]+$/, '');
        const filename = `${originalName}-zcut.${item.result.format.ext}`;
        return {
          name: filename,
          blob: item.result.blob,
        };
      });

      const zipBlob = await createZipBundle(zipFiles);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `zcut-compressed-images-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Failed to create ZIP bundle:', err);
      alert('Failed to package ZIP archive.');
    } finally {
      setIsPackagingZip(false);
    }
  };

  const handleRemove = (id) => {
    setItems((prev) => {
      const remaining = prev.filter((i) => i.id !== id);
      if (activeId === id) {
        setActiveId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  };

  const handleClearAll = () => {
    items.forEach((i) => {
      if (i.result?.url) URL.revokeObjectURL(i.result.url);
      if (i.result?.originalUrl) URL.revokeObjectURL(i.result.originalUrl);
    });
    setItems([]);
    setActiveId(null);
  };

  const activeItem = items.find((i) => i.id === activeId) || items[0];

  return (
    <div className="app-container">
      {/* Sticky Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '1rem 0 1.5rem' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            letterSpacing: '0.18em',
            color: 'var(--grey)',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
          }}
        >
          // Zipsar Studio &nbsp;&bull;&nbsp; In-Browser Media Suite
        </p>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(1.9rem, 7.5vw, 4.8rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            color: 'var(--black)',
            maxWidth: '920px',
            margin: '0 auto 1rem',
          }}
        >
          Compress what matters.
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(0.78rem, 2.8vw, 0.95rem)',
            color: 'var(--grey)',
            maxWidth: '560px',
            margin: '0 auto 1.5rem',
            lineHeight: 1.7,
          }}
        >
          Shrink image sizes up to 85% with zero quality loss. 100% in-browser processing, private by design, and instant bulk ZIP exports.
        </p>

        {/* Marquee Ticker */}
        <div className="marquee-container">
          <div className="marquee-track">
            <span>✦ CLIENT-SIDE CANVAS ENGINE</span>
            <span>✦ LOSSLESS PNG COMPRESSION</span>
            <span>✦ ZERO SERVER UPLOADS</span>
            <span>✦ INSTANT BULK ZIP PACKAGING</span>
            <span>✦ WEBP &bull; JPEG &bull; AVIF &bull; PNG</span>
            <span>✦ ZIPSAR STUDIO</span>
            {/* Repeat for seamless loop */}
            <span>✦ CLIENT-SIDE CANVAS ENGINE</span>
            <span>✦ LOSSLESS PNG COMPRESSION</span>
            <span>✦ ZERO SERVER UPLOADS</span>
            <span>✦ INSTANT BULK ZIP PACKAGING</span>
            <span>✦ WEBP &bull; JPEG &bull; AVIF &bull; PNG</span>
            <span>✦ ZIPSAR STUDIO</span>
          </div>
        </div>
      </section>

      {/* Upload Dropzone */}
      <Dropzone onFilesSelected={handleFilesSelected} />

      {/* Compression Configuration Bar - Butter smooth controls */}
      <Controls
        config={config}
        onChange={handleConfigChange}
      />

      {/* Interactive Before/After Split Comparison Slider */}
      {activeItem && activeItem.result && (
        <ComparisonSlider item={activeItem} />
      )}

      {/* Batch Queue List */}
      <BatchList
        items={items}
        activeId={activeId}
        onSelect={setActiveId}
        onRemove={handleRemove}
        onDownloadSingle={handleDownloadSingle}
      />

      {/* Aggregate Stats Bar & Download Trigger */}
      <StatsBar
        items={items}
        isPackagingZip={isPackagingZip}
        onDownloadAll={handleDownloadAll}
        onClearAll={handleClearAll}
      />

      {/* Footer */}
      <footer
        style={{
          marginTop: '4.5rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(17,17,17,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          color: 'var(--grey)',
        }}
      >
        <div>
          <strong>ZIPSAR /&gt;</strong> &bull; ZCUT COMPRESSION ENGINE
        </div>
        <div>
          EST. 2026 &bull; ALL RIGHTS RESERVED
        </div>
      </footer>
    </div>
  );
}
