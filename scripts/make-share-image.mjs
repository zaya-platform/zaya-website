// Produces public/images/zaya-share-1200x630.png — the Open Graph / Twitter share image.
// Composition: the official horizontal logo (public/brand-horizontal.svg) centred on the
// cloud page background (#F4F7F8). No other artwork, no text rendering, no generative edits.
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const logoPath = fileURLToPath(new URL('../public/brand-horizontal.svg', import.meta.url));
const outPath = fileURLToPath(new URL('../public/images/zaya-share-1200x630.png', import.meta.url));

const logoSvg = await readFile(logoPath);
const logo = await sharp(logoSvg, { density: 300 })
  .resize({ width: 660 })
  .png()
  .toBuffer();

await sharp({
  create: { width: 1200, height: 630, channels: 4, background: '#f4f7f8' },
})
  .composite([{ input: logo, gravity: 'centre' }])
  .png({ compressionLevel: 9 })
  .toFile(outPath);

const meta = await sharp(outPath).metadata();
console.log(`written: ${meta.width}x${meta.height}`);
