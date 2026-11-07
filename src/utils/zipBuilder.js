/**
 * Ultra-fast, zero-dependency in-browser ZIP builder (PKZIP 2.0 Store format)
 * Produces standard valid ZIP files that open seamlessly on Windows, macOS, Linux, and mobile.
 */

// CRC32 Lookup Table
const CRC32_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC32_TABLE[i] = c >>> 0;
}

function calculateCRC32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Creates a valid ZIP archive from a list of files.
 * @param {Array<{name: string, blob: Blob}>} files
 * @returns {Promise<Blob>}
 */
export async function createZipBundle(files) {
  // First attempt dynamic JSZip if available online, otherwise fall back to pure in-memory PKZIP
  try {
    if (typeof window !== 'undefined' && window.JSZip) {
      const zip = new window.JSZip();
      for (const file of files) {
        zip.file(file.name, file.blob);
      }
      return await zip.generateAsync({ type: 'blob' });
    }
  } catch (e) {
    console.warn('JSZip not present, using internal ZipBuilder', e);
  }

  return await createPureZip(files);
}

/**
 * Standalone PKZIP generator (Store mode - method 0)
 * Ideal for already-compressed formats (PNG, JPEG, WebP) with zero re-compression delay.
 */
async function createPureZip(files) {
  const fileEntries = [];
  let offset = 0;

  for (const file of files) {
    const arrayBuffer = await file.blob.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const nameBytes = new TextEncoder().encode(file.name);
    const crc = calculateCRC32(data);
    const size = data.length;

    // Local file header (30 bytes + name length)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const dv = new DataView(localHeader.buffer);

    dv.setUint32(0, 0x04034b50, true); // Local file header signature
    dv.setUint16(4, 20, true);          // Version needed (2.0)
    dv.setUint16(6, 0x0800, true);      // General purpose bit flag (UTF-8)
    dv.setUint16(8, 0, true);           // Compression method (0 = Store)
    dv.setUint16(10, 0x5421, true);     // File mod time
    dv.setUint16(12, 0x5421, true);     // File mod date
    dv.setUint32(14, crc, true);        // CRC-32
    dv.setUint32(18, size, true);       // Compressed size
    dv.setUint32(22, size, true);       // Uncompressed size
    dv.setUint16(26, nameBytes.length, true); // File name length
    dv.setUint16(28, 0, true);          // Extra field length
    localHeader.set(nameBytes, 30);

    fileEntries.push({
      nameBytes,
      crc,
      size,
      offset,
      localHeader,
      data
    });

    offset += localHeader.length + size;
  }

  // Central directory records
  const centralDirRecords = [];
  let centralDirSize = 0;

  for (const entry of fileEntries) {
    const cdHeader = new Uint8Array(46 + entry.nameBytes.length);
    const dv = new DataView(cdHeader.buffer);

    dv.setUint32(0, 0x02014b50, true); // Central directory signature
    dv.setUint16(4, 20, true);          // Version made by
    dv.setUint16(6, 20, true);          // Version needed
    dv.setUint16(8, 0x0800, true);      // UTF-8 flag
    dv.setUint16(10, 0, true);          // Compression method (Store)
    dv.setUint16(12, 0x5421, true);     // Time
    dv.setUint16(14, 0x5421, true);     // Date
    dv.setUint32(16, entry.crc, true);  // CRC-32
    dv.setUint32(20, entry.size, true); // Compressed size
    dv.setUint32(24, entry.size, true); // Uncompressed size
    dv.setUint16(28, entry.nameBytes.length, true);
    dv.setUint16(30, 0, true);          // Extra field length
    dv.setUint16(32, 0, true);          // Comment length
    dv.setUint16(34, 0, true);          // Disk number
    dv.setUint16(36, 0, true);          // Internal attributes
    dv.setUint32(38, 0, true);          // External attributes
    dv.setUint32(42, entry.offset, true); // Relative offset of local header
    cdHeader.set(entry.nameBytes, 46);

    centralDirRecords.push(cdHeader);
    centralDirSize += cdHeader.length;
  }

  // End of central directory record (22 bytes)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true); // Signature
  eocdView.setUint16(4, 0, true);          // Disk number
  eocdView.setUint16(6, 0, true);          // Disk where central directory starts
  eocdView.setUint16(8, fileEntries.length, true); // Records on this disk
  eocdView.setUint16(10, fileEntries.length, true); // Total records
  eocdView.setUint32(12, centralDirSize, true);     // Size of central directory
  eocdView.setUint32(16, offset, true);             // Offset of central directory
  eocdView.setUint16(20, 0, true);                  // Comment length

  // Combine parts into Blob
  const blobParts = [];
  for (const entry of fileEntries) {
    blobParts.push(entry.localHeader);
    blobParts.push(entry.data);
  }
  for (const cd of centralDirRecords) {
    blobParts.push(cd);
  }
  blobParts.push(eocd);

  return new Blob(blobParts, { type: 'application/zip' });
}
