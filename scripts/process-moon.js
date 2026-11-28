const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processMoon() {
  const rawPath = path.join(__dirname, '..', 'public', 'images', 'nasa-moon-raw.jpg');
  const outPath = path.join(__dirname, '..', 'public', 'images', 'realistic-moon.webp');

  const meta = await sharp(rawPath).metadata();
  console.log('NASA Moon metadata:', meta.width, 'x', meta.height);

  const cx = 1290;
  const cy = 1250;
  const radius = 1070;

  const left = cx - radius;
  const top = cy - radius;
  const size = radius * 2;

  // Extract the square moon area first, resize to 400x400
  const cropped = await sharp(rawPath)
    .extract({ left, top, width: size, height: size })
    .resize(400, 400)
    .toBuffer();

  // Create clean circular SVG mask of exactly 400x400
  const mask400 = Buffer.from(`
    <svg width="400" height="400">
      <defs>
        <radialGradient id="edge" cx="50%" cy="50%" r="50%">
          <stop offset="96%" stop-color="white" stop-opacity="1" />
          <stop offset="100%" stop-color="white" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="198" fill="url(#edge)" />
    </svg>
  `);

  await sharp(cropped)
    .composite([{ input: mask400, blend: 'dest-in' }])
    .webp({ quality: 95 })
    .toFile(outPath);

  console.log('Successfully generated', outPath);

  if (fs.existsSync(rawPath)) {
    fs.unlinkSync(rawPath);
    console.log('Removed temporary raw file');
  }
}

processMoon().catch(console.error);
