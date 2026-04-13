/**
 * generate-icons.js
 * Generates proper PWA icons from favicon.png:
 *   - icon-192.png       (regular, any purpose)
 *   - icon-512.png       (regular, any purpose)
 *   - icon-192-maskable.png  (logo centered with safe-zone padding)
 *   - icon-512-maskable.png  (logo centered with safe-zone padding)
 *
 * Run: node scripts/generate-icons.js
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src     = path.join(__dirname, '../public/favicon.png');
const outDir  = path.join(__dirname, '../public');

// Brand pink background (matches theme-color in manifest)
const BG = { r: 20, g: 16, b: 34, alpha: 1 };   // dark bg so logo pops
const SIZES = [192, 512];

async function run() {
  for (const size of SIZES) {
    // ── Regular icon ──────────────────────────────────────────────────────────
    // Logo fits the full square, OS crops it in its own shape
    await sharp(src)
      .resize(size, size, { fit: 'contain', background: BG })
      .flatten({ background: BG })
      .png()
      .toFile(path.join(outDir, `icon-${size}.png`));

    console.log(`✅ icon-${size}.png`);

    // ── Maskable icon (safe zone = 80% center, 20% padding) ──────────────────
    // Logo is resized to 72% of canvas so it's always inside the safe circle
    const logoSize = Math.round(size * 0.72);
    const pad      = Math.round((size - logoSize) / 2);

    const resizedLogo = await sharp(src)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    await sharp({
      create: { width: size, height: size, channels: 4, background: BG },
    })
      .png()
      .composite([{ input: resizedLogo, top: pad, left: pad }])
      .flatten({ background: BG })
      .toFile(path.join(outDir, `icon-${size}-maskable.png`));

    console.log(`✅ icon-${size}-maskable.png`);
  }

  console.log('\n🎉 All PWA icons generated successfully!');
}

run().catch((e) => { console.error(e); process.exit(1); });
