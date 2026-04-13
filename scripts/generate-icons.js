/**
 * generate-icons.js — Fixed: trims logo, adds equal padding all sides
 * Run: node scripts/generate-icons.js
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src    = path.join(__dirname, '../public/favicon.png');
const outDir = path.join(__dirname, '../public');

// Dark navy bg — matches app background
const BG = { r: 20, g: 16, b: 34, alpha: 1 };

const SIZES = [192, 512];

async function run() {
  for (const size of SIZES) {

    // ── Step 1: Trim transparent/white edges from source logo ────────────────
    const trimmed = await sharp(src)
      .trim({ background: '#ffffff', threshold: 10 })
      .toBuffer();

    // ── Regular icon (any) — logo fills ~88% of canvas, equal padding ────────
    const logoSize = Math.round(size * 0.88);
    const pad      = Math.round((size - logoSize) / 2);

    const resizedAny = await sharp(trimmed)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
      .composite([{ input: resizedAny, top: pad, left: pad }])
      .flatten({ background: BG })
      .png()
      .toFile(path.join(outDir, `icon-${size}.png`));

    console.log(`✅ icon-${size}.png`);

    // ── Maskable icon — logo at 72% (inside safe zone), equal padding ─────────
    const maskLogoSize = Math.round(size * 0.72);
    const maskPad      = Math.round((size - maskLogoSize) / 2);

    const resizedMask = await sharp(trimmed)
      .resize(maskLogoSize, maskLogoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
      .composite([{ input: resizedMask, top: maskPad, left: maskPad }])
      .flatten({ background: BG })
      .png()
      .toFile(path.join(outDir, `icon-${size}-maskable.png`));

    console.log(`✅ icon-${size}-maskable.png`);
  }

  // ── Also regenerate favicon-64 properly ──────────────────────────────────
  const trimmed64 = await sharp(src)
    .trim({ background: '#ffffff', threshold: 10 })
    .toBuffer();

  const logo64 = Math.round(64 * 0.85);
  const pad64  = Math.round((64 - logo64) / 2);

  const resized64 = await sharp(trimmed64)
    .resize(logo64, logo64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({ create: { width: 64, height: 64, channels: 4, background: BG } })
    .composite([{ input: resized64, top: pad64, left: pad64 }])
    .flatten({ background: BG })
    .png()
    .toFile(path.join(outDir, 'favicon-64.png'));

  console.log('✅ favicon-64.png');
  console.log('\n🎉 All PWA icons generated successfully!');
}

run().catch((e) => { console.error(e); process.exit(1); });
