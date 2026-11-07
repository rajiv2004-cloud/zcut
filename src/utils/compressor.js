/**
 * Client-Side Image Compression Engine
 * Supports PNG (Lossless & Quantized), WebP, JPEG, and AVIF
 */

export const SUPPORTED_FORMATS = [
  { id: 'image/png', label: 'PNG', ext: 'png', isRecommended: true, desc: 'Lossless & crisp graphics' },
  { id: 'image/webp', label: 'WebP', ext: 'webp', isRecommended: false, desc: 'High compression web format' },
  { id: 'image/jpeg', label: 'JPEG', ext: 'jpg', isRecommended: false, desc: 'Universal photographic format' },
  { id: 'image/avif', label: 'AVIF', ext: 'avif', isRecommended: false, desc: 'Next-gen ultra-high efficiency' },
];

/**
 * Format bytes to human readable string (KB, MB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Quantize imageData for lossy PNG compression
 * Collapsing micro-variations allows DEFLATE to achieve massive size reduction
 */
function quantizeImageData(imageData, quality) {
  if (quality >= 0.98) return; // Keep pure lossless if quality ~100%

  const data = imageData.data;
  // Step size from 2 to 24 based on quality (0.1 to 0.95)
  const step = Math.max(2, Math.round((1 - quality) * 22));
  const halfStep = Math.floor(step / 2);

  for (let i = 0; i < data.length; i += 4) {
    // Only quantize RGB; preserve exact Alpha channel
    if (data[i + 3] > 0) {
      data[i] = Math.min(255, Math.floor((data[i] + halfStep) / step) * step);
      data[i + 1] = Math.min(255, Math.floor((data[i + 1] + halfStep) / step) * step);
      data[i + 2] = Math.min(255, Math.floor((data[i + 2] + halfStep) / step) * step);
    }
  }
}

/**
 * Loads an image file into an HTMLImageElement
 */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      resolve({ img, url });
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image file.'));
    };
    img.src = url;
  });
}

/**
 * Compresses an image based on specified configuration
 * @param {File|Blob} file
 * @param {Object} options
 * @param {string} options.targetFormat - Mime type (default: 'image/png')
 * @param {number} options.quality - Float between 0.1 and 1.0 (default: 0.85)
 * @param {number} options.scale - Float scale factor (default: 1.0)
 * @param {number} [options.maxWidth]
 * @param {number} [options.maxHeight]
 */
export async function compressImage(file, options = {}) {
  const startTime = performance.now();

  const {
    targetFormat = 'image/png',
    quality = 0.85,
    scale = 1.0,
    maxWidth,
    maxHeight,
  } = options;

  const { img, url: initialObjectUrl } = await loadImage(file);

  try {
    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;

    // Apply scale multiplier
    if (scale && scale > 0 && scale !== 1.0) {
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    // Apply max bounds while preserving aspect ratio
    if (maxWidth && width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
    if (maxHeight && height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }

    // Safeguard minimum dimensions
    width = Math.max(1, width);
    height = Math.max(1, height);

    // Create Canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // If exporting to JPEG and original might have alpha, fill background with white
    if (targetFormat === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
    }

    // Render image onto canvas
    ctx.drawImage(img, 0, 0, width, height);

    // If target is PNG, apply color quantization based on quality slider
    if (targetFormat === 'image/png' && quality < 0.98) {
      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        quantizeImageData(imgData, quality);
        ctx.putImageData(imgData, 0, 0);
      } catch (err) {
        console.warn('Could not apply PNG quantization:', err);
      }
    }

    // Convert canvas to Blob
    const compressedBlob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            // Fallback to PNG if chosen format not supported by browser (e.g. AVIF on older engines)
            canvas.toBlob((fallbackBlob) => {
              if (fallbackBlob) resolve(fallbackBlob);
              else reject(new Error('Canvas export failed.'));
            }, 'image/png');
          }
        },
        targetFormat,
        quality
      );
    });

    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);

    const originalSize = file.size;
    const compressedSize = compressedBlob.size;
    const reductionPercent = Math.max(
      0,
      parseFloat((((originalSize - compressedSize) / originalSize) * 100).toFixed(1))
    );

    const previewUrl = URL.createObjectURL(compressedBlob);
    const formatInfo = SUPPORTED_FORMATS.find((f) => f.id === targetFormat) || SUPPORTED_FORMATS[0];

    return {
      blob: compressedBlob,
      url: previewUrl,
      originalUrl: initialObjectUrl,
      width,
      height,
      originalWidth: img.naturalWidth || img.width,
      originalHeight: img.naturalHeight || img.height,
      originalSize,
      compressedSize,
      reductionPercent,
      savedBytes: Math.max(0, originalSize - compressedSize),
      format: formatInfo,
      durationMs,
    };
  } finally {
    // Keep initialObjectUrl alive for preview comparison until cleanup
  }
}
