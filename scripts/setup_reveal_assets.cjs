const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { PNG } = require('pngjs');

const rootDir = path.resolve(__dirname, '..');
const zipPath = path.join(rootDir, 'ResultPageDecorations-clean.zip');
const revealDir = path.join(rootDir, 'public/assets/reveal');

fs.mkdirSync(revealDir, { recursive: true });

if (fs.existsSync(zipPath)) {
  try {
    execSync(`unzip -o "${zipPath}" -d "${revealDir}"`, { stdio: 'ignore' });
  } catch (e) {
    console.warn('unzip warning:', e.message);
  }
}

const nestedDir = path.join(revealDir, 'reveal');
if (fs.existsSync(nestedDir)) {
  for (const f of fs.readdirSync(nestedDir)) {
    fs.renameSync(path.join(nestedDir, f), path.join(revealDir, f));
  }
  fs.rmdirSync(nestedDir);
}

// Alpha-trim avatar-1.png and avatar-4.png so their visible bounds match the 50x53 stage spec
for (const name of ['avatar-1.png', 'avatar-4.png']) {
  const filePath = path.join(rootDir, 'public/assets/avatars', name);
  if (!fs.existsSync(filePath)) continue;
  const src = PNG.sync.read(fs.readFileSync(filePath));
  if (src.width < 1000) continue; // already trimmed
  let minX = src.width, maxX = 0, minY = src.height, maxY = 0;
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      if (src.data[(y * src.width + x) * 4 + 3] > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX > minX && maxY > minY) {
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    const dst = new PNG({ width: w, height: h });
    PNG.bitblt(src, dst, minX, minY, w, h, 0, 0);
    fs.writeFileSync(filePath, PNG.sync.write(dst));
  }
}

// Extract and prepare WelcomePageDecoration.zip into public/assets/welcome/
const welcomeZipPath = path.join(rootDir, 'WelcomePageDecoration.zip');
const welcomeDir = path.join(rootDir, 'public/assets/welcome');
fs.mkdirSync(welcomeDir, { recursive: true });

if (fs.existsSync(welcomeZipPath) && !fs.existsSync(path.join(welcomeDir, 'hero-pair.png'))) {
  try {
    execSync(`unzip -o "${welcomeZipPath}" -d "${welcomeDir}"`, { stdio: 'ignore' });
  } catch (e) {
    console.warn('welcome unzip warning:', e.message);
  }
  const welcomeNested = path.join(welcomeDir, 'WelcomePageDecoration');
  if (fs.existsSync(welcomeNested)) {
    const welcomeMap = [
      { out: 'crescent-yellow-top.png', src: 'ce29977c-ac35-4300-806b-8c6d5008f39d_removalai_preview.png' },
      { out: 'crescent-yellow-bottom.png', src: 'ce29977c-ac35-4300-806b-8c6d5008f39d_removalai_preview.png' },
      { out: 'heart-pink-right.png', src: 'file_000000005c048211a90ef03015fc8dd6.png', removeBlackBg: true },
      { out: 'starburst-blue-right.png', src: '29041-removebg-preview.png' },
      { out: 'hero-pair.png', src: 'ed50b65e-b957-432c-946c-4c5322ccbd3a_removalai_preview.png' },
      { out: 'logo-duo.png', src: 'b9ebc70a-c891-4711-8dd0-80e67e51e638_removalai_preview.png' },
      { out: 'starburst-blue-left.png', src: '218e3142-dbce-4072-a40e-14a4c0588525_removalai_preview.png' },
      { out: 'cross-olive.png', src: 'd5e18752-dabe-42cc-a00c-076b258e0b4d_removalai_preview.png' },
      { out: 'heart-pink-left.png', src: '4114ee39-d941-4a64-bae8-12c1a7cd53bf_removalai_preview.png' },
    ];
    for (const item of welcomeMap) {
      const srcPath = path.join(welcomeNested, item.src);
      if (!fs.existsSync(srcPath)) continue;
      const png = PNG.sync.read(fs.readFileSync(srcPath));
      if (item.removeBlackBg) {
        for (let i = 0; i < png.data.length; i += 4) {
          const r = png.data[i], g = png.data[i + 1], b = png.data[i + 2];
          const alpha = Math.max(0, Math.min(1, (r - 8) / 244));
          if (alpha <= 0.02) {
            png.data[i] = 0;
            png.data[i + 1] = 0;
            png.data[i + 2] = 0;
            png.data[i + 3] = 0;
          } else {
            png.data[i] = Math.min(255, Math.round((r - (1 - alpha)) / alpha));
            png.data[i + 1] = Math.min(255, Math.round((g - (1 - alpha)) / alpha));
            png.data[i + 2] = Math.min(255, Math.round((b - (1 - alpha)) / alpha));
            png.data[i + 3] = Math.round(alpha * 255);
          }
        }
      }
      fs.writeFileSync(path.join(welcomeDir, item.out), PNG.sync.write(png));
    }
    for (const f of fs.readdirSync(welcomeNested)) {
      fs.unlinkSync(path.join(welcomeNested, f));
    }
    fs.rmdirSync(welcomeNested);
  }
}

// Ensure the 6 new character PNGs from root (if present) are alpha-trimmed into public/assets/avatars/avatar-1..6.png
const rootAvatarMap = [
  { id: 1, src: 'file_0000000025d08211a85ca6ef43945fa4.png' },
  { id: 2, src: 'file_000000008b7c8208a338f17db71d10fd.png' },
  { id: 3, src: 'file_000000004ccc821189c09d16035283f4.png' },
  { id: 4, src: 'file_0000000036f88207986c4646f483a7a8.png' },
  { id: 5, src: 'file_000000002034820794833993fb9ececf.png' },
  { id: 6, src: 'file_00000000bbe882079f1e77f139cc6fc8.png' },
];

for (const item of rootAvatarMap) {
  const srcPath = path.join(rootDir, item.src);
  if (!fs.existsSync(srcPath)) continue;
  const srcPng = PNG.sync.read(fs.readFileSync(srcPath));
  let minX = srcPng.width, maxX = 0, minY = srcPng.height, maxY = 0;
  for (let y = 0; y < srcPng.height; y++) {
    for (let x = 0; x < srcPng.width; x++) {
      if (srcPng.data[(y * srcPng.width + x) * 4 + 3] > 15) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX > minX && maxY > minY) {
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    const dst = new PNG({ width: w, height: h });
    PNG.bitblt(srcPng, dst, minX, minY, w, h, 0, 0);
    fs.writeFileSync(path.join(rootDir, 'public/assets/avatars', `avatar-${item.id}.png`), PNG.sync.write(dst));
  }
}

// If 5bf2fc2d-7db3-45f9-a251-a689b6c4e72d_removalai_preview.png is present in root, slice its 3x2 grid into avatar-blob-1..6.png
const blobSheetPath = path.join(rootDir, '5bf2fc2d-7db3-45f9-a251-a689b6c4e72d_removalai_preview.png');
if (fs.existsSync(blobSheetPath) && fs.statSync(blobSheetPath).size > 0) {
  const sheet = PNG.sync.read(fs.readFileSync(blobSheetPath));
  const colBounds = [
    [0, Math.floor(sheet.width / 3)],
    [Math.floor(sheet.width / 3), Math.floor((sheet.width * 2) / 3)],
    [Math.floor((sheet.width * 2) / 3), sheet.width],
  ];
  const rowBounds = [
    [0, Math.floor(sheet.height / 2)],
    [Math.floor(sheet.height / 2), sheet.height],
  ];
  let blobId = 1;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const [x0, x1] = colBounds[c];
      const [y0, y1] = rowBounds[r];
      let minX = x1, maxX = x0, minY = y1, maxY = y0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          if (sheet.data[(y * sheet.width + x) * 4 + 3] > 20) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX > minX && maxY > minY) {
        const w = maxX - minX + 1;
        const h = maxY - minY + 1;
        const dst = new PNG({ width: w, height: h });
        PNG.bitblt(sheet, dst, minX, minY, w, h, 0, 0);
        fs.writeFileSync(path.join(rootDir, 'public/assets/blobs', `avatar-blob-${blobId}.png`), PNG.sync.write(dst));
      }
      blobId++;
    }
  }
} else {
  function evalLobes(theta, lobes) {
    let r = 1.0;
    for (const [deg, amp, widthDeg] of lobes) {
      const center = (deg * Math.PI) / 180;
      const sigma = (widthDeg * Math.PI) / 180;
      let d = theta - center;
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI) d += 2 * Math.PI;
      r += amp * Math.exp(-(d * d) / (2 * sigma * sigma));
    }
    return r;
  }

  const blobSpecs = [
    {
      id: 1,
      color: [255, 132, 124],
      lobes: [
        [-80, 0.16, 34], [-142, 0.07, 28], [166, 0.15, 34], [88, 0.13, 38],
        [16, 0.15, 30], [-28, -0.06, 22], [50, -0.05, 22], [-115, -0.05, 20],
      ],
    },
    {
      id: 2,
      color: [0, 198, 194],
      lobes: [
        [-85, 0.15, 36], [-150, 0.12, 32], [146, 0.12, 34], [88, 0.13, 42],
        [22, 0.13, 28], [-38, 0.08, 26], [180, -0.05, 22], [-8, -0.05, 20],
      ],
    },
    {
      id: 3,
      color: [53, 20, 125],
      lobes: [
        [-65, 0.19, 34], [-150, 0.14, 34], [108, 0.16, 36], [14, 0.16, 32],
        [165, -0.06, 24], [56, -0.07, 24], [-22, -0.06, 22], [-112, -0.05, 22],
      ],
    },
    {
      id: 4,
      color: [39, 92, 115],
      lobes: [
        [-105, 0.16, 32], [-48, 0.11, 28], [24, 0.15, 32], [86, 0.14, 36],
        [172, 0.15, 32], [-76, -0.05, 18], [-12, -0.06, 20], [138, -0.06, 22],
      ],
    },
    {
      id: 5,
      color: [163, 198, 36],
      lobes: [
        [-92, 0.18, 32], [175, 0.15, 32], [110, 0.17, 34], [28, 0.13, 28],
        [-32, 0.13, 28], [-136, -0.07, 22], [62, -0.07, 24], [-2, -0.04, 18],
      ],
    },
    {
      id: 6,
      color: [255, 184, 0],
      lobes: [
        [-112, 0.13, 30], [-52, 0.16, 30], [24, 0.16, 34], [94, 0.14, 38],
        [160, 0.16, 36], [-82, -0.05, 18], [-14, -0.06, 20],
      ],
    },
  ];

  const blobsOutDir = path.join(rootDir, 'public/assets/blobs');
  fs.mkdirSync(blobsOutDir, { recursive: true });
  const SIZE = 440;
  const BASE_R = 176;
  const N = 3600;

  for (const spec of blobSpecs) {
    const png = new PNG({ width: SIZE, height: SIZE });
    const cx = SIZE / 2, cy = SIZE / 2;
    const rTable = new Float32Array(N);
    for (let k = 0; k < N; k++) {
      const theta = -Math.PI + (2 * Math.PI * k) / N;
      rTable[k] = BASE_R * evalLobes(theta, spec.lobes);
    }
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const theta = Math.atan2(dy, dx);
        const idx = Math.min(N - 1, Math.max(0, Math.floor(((theta + Math.PI) / (2 * Math.PI)) * N)));
        const edgeDist = rTable[idx] - dist;
        const i = (y * SIZE + x) * 4;
        if (edgeDist > -1.0) {
          const alpha = edgeDist >= 1.0 ? 1.0 : (edgeDist + 1.0) / 2.0;
          png.data[i] = spec.color[0];
          png.data[i + 1] = spec.color[1];
          png.data[i + 2] = spec.color[2];
          png.data[i + 3] = Math.round(alpha * 255);
        }
      }
    }
    let minX = SIZE, maxX = 0, minY = SIZE, maxY = 0;
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        if (png.data[(y * SIZE + x) * 4 + 3] > 5) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    const w = maxX - minX + 1, h = maxY - minY + 1;
    const trimmed = new PNG({ width: w, height: h });
    PNG.bitblt(png, trimmed, minX, minY, w, h, 0, 0);
    fs.writeFileSync(path.join(blobsOutDir, `avatar-blob-${spec.id}.png`), PNG.sync.write(trimmed));
  }
}


