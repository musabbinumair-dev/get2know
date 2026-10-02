// Setup script ensuring all reveal and avatar blob assets are present and properly formatted
const fs = require('fs');
const path = require('path');

console.log('Verifying app assets...');

const bgFile = path.join(__dirname, '../public/assets/welcome/avatar-blobs-background.png');
if (fs.existsSync(bgFile)) {
  try {
    const PNG = require('pngjs').PNG;
    const bg = PNG.sync.read(fs.readFileSync(bgFile));

    const blobs = [
      { id: 1, minX: 25, maxX: 209, minY: 12, maxY: 193 },
      { id: 2, minX: 217, maxX: 392, minY: 11, maxY: 193 },
      { id: 3, minX: 401, maxX: 580, minY: 11, maxY: 202 },
      { id: 4, minX: 24, maxX: 207, minY: 215, maxY: 404 },
      { id: 5, minX: 213, maxX: 393, minY: 214, maxY: 406 },
      { id: 6, minX: 401, maxX: 580, minY: 224, maxY: 406 }
    ];

    const pad = 4;
    blobs.forEach((b) => {
      const outFile = path.join(__dirname, `../public/assets/blobs/avatar-blob-${b.id}.png`);
      if (!fs.existsSync(outFile)) {
        const w = b.maxX - b.minX + 1;
        const h = b.maxY - b.minY + 1;
        const outW = w + pad * 2;
        const outH = h + pad * 2;
        const out = new PNG({ width: outW, height: outH });

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const srcIdx = ((b.minY + y) * bg.width + (b.minX + x)) * 4;
            const dstIdx = ((y + pad) * outW + (x + pad)) * 4;
            out.data[dstIdx] = bg.data[srcIdx];
            out.data[dstIdx + 1] = bg.data[srcIdx + 1];
            out.data[dstIdx + 2] = bg.data[srcIdx + 2];
            out.data[dstIdx + 3] = bg.data[srcIdx + 3];
          }
        }
        fs.writeFileSync(outFile, PNG.sync.write(out));
      }
    });
  } catch (err) {
    console.warn('Note: avatar blob verification skipped:', err.message);
  }
}

console.log('App assets ready.');
