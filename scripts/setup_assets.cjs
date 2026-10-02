const fs = require('fs');
const path = require('path');

const blobsDir = path.join(__dirname, '../public/assets/blobs');
const avatarsDir = path.join(__dirname, '../public/assets/avatars');
fs.mkdirSync(blobsDir, { recursive: true });
fs.mkdirSync(avatarsDir, { recursive: true });

const colors = {
  pink: '#F4A7D3',
  yellow: '#F8D56B',
  blue: '#A9B8F2',
  green: '#9DAA5F',
};

const baseShapes = {
  'teardrop': 'teardrop-blue-score.svg',
  'starburst': 'starburst-blue-decorative.svg',
  'starburst-small': 'starburst-yellow-small.svg',
  'heart': 'heart-pink-small.svg',
  'crescent': 'crescent-yellow-large.svg',
  'cross': 'cross-olive-decorative.svg',
  'card-blob-a': 'avatar-blob-pink-01.svg',
  'card-blob-b': 'avatar-blob-blue-01.svg',
};

for (const [shape, srcFile] of Object.entries(baseShapes)) {
  const content = fs.readFileSync(path.join(__dirname, '../svg_temp', srcFile), 'utf8');
  for (const [colorName, hexColor] of Object.entries(colors)) {
    const coloredContent = content.replace(/fill="[^"]+"/g, `fill="${hexColor}"`);
    fs.writeFileSync(path.join(blobsDir, `${shape}-${colorName}.svg`), coloredContent);
  }
}

// Also copy all original svg files directly into public/assets/blobs/
const allSvgFiles = fs.readdirSync(path.join(__dirname, '../svg_temp')).filter(f => f.endsWith('.svg'));
for (const file of allSvgFiles) {
  fs.copyFileSync(path.join(__dirname, '../svg_temp', file), path.join(blobsDir, file));
}

console.log('Generated blobs successfully! Count:', fs.readdirSync(blobsDir).length);
