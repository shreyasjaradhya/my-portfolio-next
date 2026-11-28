const sharp = require('sharp');
const path = require('path');

async function processSnowflake() {
  const inPath = 'C:/Users/shrey/.gemini/antigravity/brain/4eb467ef-8576-4344-b0fa-8aac27d85186/.user_uploaded/media_1795832284329_1761b288.jpg';
  const outPath = path.join(__dirname, '..', 'public', 'images', 'user-snowflake.webp');

  // Crop the snowflake region from the screenshot
  const cropped = await sharp(inPath)
    .extract({ left: 65, top: 5, width: 480, height: 435 })
    .toBuffer();

  const { data, info } = await sharp(cropped)
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Output RGBA buffer
  const outData = Buffer.alloc(info.width * info.height * 4);

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const outIdx = (y * info.width + x) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Distance from lavender background color [155, 160, 240]
      // In the background: b is high (210-255), r and g are close (140-185), saturation is moderate blue/purple
      const bgDiff = Math.sqrt(
        Math.pow(r - 155, 2) * 1.0 +
        Math.pow(g - 165, 2) * 1.0 +
        Math.pow(b - 240, 2) * 0.8
      );

      // Distance from center of snowflake (x: 240, y: 218)
      const distFromCenter = Math.sqrt(Math.pow(x - 240, 2) + Math.pow(y - 218, 2));

      // If close to background color and far from center, make transparent
      let alpha = 0;
      if (distFromCenter < 210) {
        if (bgDiff > 35) {
          // It's part of the crystal!
          // Normalize brightness to crisp icy white / cyan
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          alpha = Math.min(255, Math.floor((bgDiff - 20) * 8));

          // Set crystal pixel to frosty ice-white/cyan
          outData[outIdx] = Math.min(255, Math.floor(r * 1.1 + 40));
          outData[outIdx + 1] = Math.min(255, Math.floor(g * 1.1 + 40));
          outData[outIdx + 2] = 255;
          outData[outIdx + 3] = alpha;
        }
      }
    }
  }

  await sharp(outData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .resize(256, 256, { fit: 'contain' })
    .webp({ quality: 95 })
    .toFile(outPath);

  console.log('Saved user-snowflake.webp successfully:', outPath);
}

processSnowflake().catch(console.error);
