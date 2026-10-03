import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const assetsDir = path.resolve(process.cwd(), 'public/assets');

async function convertPngsToWebp(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await convertPngsToWebp(fullPath);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      const webpPath = fullPath.replace(/\.png$/i, '.webp');
      try {
        await sharp(fullPath)
          .webp({ quality: 85, effort: 4 })
          .toFile(webpPath);
        console.log(`Converted: ${path.relative(process.cwd(), fullPath)} -> ${path.relative(process.cwd(), webpPath)}`);
      } catch (err) {
        console.error(`Failed to convert ${fullPath}:`, err);
      }
    }
  }
}

async function main() {
  console.log('Starting PNG to WebP conversion for instant loading...');
  if (fs.existsSync(assetsDir)) {
    await convertPngsToWebp(assetsDir);
    console.log('Conversion completed successfully!');
  } else {
    console.error('Assets directory not found:', assetsDir);
  }
}

main();
