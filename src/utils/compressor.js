/**
 * Client-Side Image Compression Engine
 * Supports PNG (Lossless & Fast Quantized), WebP, JPEG, and AVIF
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
 * High-speed LUT-based quantization for lossy PNG compression
 * Using a 256-byte precomputed table makes this run in ~3-10ms instead of hundreds of ms.
 */
function quantizeImageDataFast(imageData, quality) {
  if (quality >= 0.98) return; // Keep pure lossless if quality ~100%

  const data = imageData.data;
  const step = Math.max(2, Math.round((1 - quality) * 22));
  const halfStep = Math.floor(step / 2);

  // Precompute 256-entry lookup table (avoids Math.floor / Math.min in multi-million iteration loop)
  const lut = new Uint8Array(256);
  for (let b = 0; b < 256; b++) {
    lut[b] = Math.min(255, Math.floor((b + halfStep) / step) * step);
  }

  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    // Only quantize RGB; preserve exact Alpha channel
    if (data[i + 3] > 0) {
      data[i] = lut[data[i]];
      data[i + 1] = lut[data[i + 1]];
      data[i + 2] = lut[data[i + 2]];
    }
  }
}

/**
 * Loads an image file into an HTMLImageElement
 */
export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      resolve({ img, url });
    };
    img.onerror = () => {
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
 * @param {string} [options.targetFormat='image/png'] - Mime type
 * @param {number} [options.quality=0.85] - Float between 0.1 and 1.0
 * @param {number} [options.scale=1.0] - Float scale factor
 * @param {HTMLImageElement} [options.cachedImg] - Reusable pre-decoded image
 * @param {string} [options.initialObjectUrl] - Original object URL
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
    cachedImg,
    initialObjectUrl: passedObjectUrl,
  } = options;

  let img = cachedImg;
  let initialObjectUrl = passedObjectUrl;

  if (!img) {
    const loaded = await loadImage(file);
    img = loaded.img;
    initialObjectUrl = loaded.url;
  }

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

  // If target is PNG, apply fast LUT color quantization
  if (targetFormat === 'image/png' && quality < 0.98) {
    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      quantizeImageDataFast(imgData, quality);
      ctx.putImageData(imgData, 0, 0);
    } catch (err) {
      console.warn('Could not apply fast PNG quantization:', err);
    }
  }

  // Convert canvas to Blob
  const compressedBlob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
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
    decodedImg: img,
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
}
