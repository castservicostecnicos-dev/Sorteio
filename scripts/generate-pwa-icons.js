import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, r, g, b) {
  // A minimal valid uncompressed/deflated RGBA PNG generator
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each scanline
  const rawScanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * rawScanlineLength);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.38;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rawScanlineLength;
    rawData[rowOffset] = 0; // filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Distance from center
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // White soccer ball area with shading
        const shade = Math.max(180, Math.min(255, 255 - Math.floor((dist / radius) * 45)));
        // Center patch
        if (dist <= radius * 0.32) {
          rawData[pixelOffset] = 15;     // R
          rawData[pixelOffset + 1] = 23; // G
          rawData[pixelOffset + 2] = 42; // B
        } else {
          rawData[pixelOffset] = shade;     // R
          rawData[pixelOffset + 1] = shade; // G
          rawData[pixelOffset + 2] = shade; // B
        }
      } else {
        // Turf Emerald Green background
        rawData[pixelOffset] = r;     // R (e.g. 5)
        rawData[pixelOffset + 1] = g; // G (e.g. 150)
        rawData[pixelOffset + 2] = b; // B (e.g. 105)
      }
      rawData[pixelOffset + 3] = 255; // Alpha
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', deflated);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(Buffer.concat([Buffer.from(type, 'ascii'), data]));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Simple CRC32 implementation
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const outDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate PWA icons
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPNG(192, 192, 5, 150, 105));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPNG(512, 512, 5, 150, 105));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, 6, 78, 59));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPNG(180, 180, 5, 150, 105));

console.log('PWA PNG icons generated successfully in public/');
