const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dim = 256;
const cx = dim / 2;
const cy = dim / 2;
const r = dim * 0.44;

let svgPaths = '';

// Central hexagonal hub
let hubPoints = [];
const hubR = r * 0.16;
for (let i = 0; i < 6; i++) {
  const a = (i * Math.PI) / 3;
  hubPoints.push(`${(cx + Math.cos(a) * hubR).toFixed(1)},${(cy + Math.sin(a) * hubR).toFixed(1)}`);
}
svgPaths += `<polygon points="${hubPoints.join(' ')}" fill="rgba(240, 249, 255, 0.4)" stroke="#ffffff" stroke-width="2.5" />`;

// Inner star lines inside the hub
for (let i = 0; i < 6; i++) {
  const a = (i * Math.PI) / 3;
  svgPaths += `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * hubR).toFixed(1)}" y2="${(cy + Math.sin(a) * hubR).toFixed(1)}" stroke="#ffffff" stroke-width="1.8" />`;
}

// 6 Primary dendritic arms
for (let i = 0; i < 6; i++) {
  const a = (i * Math.PI) / 3;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const px = -sin;
  const py = cos;

  // Main arm
  const armStartX = cx + cos * hubR;
  const armStartY = cy + sin * hubR;
  const armEndX = cx + cos * r;
  const armEndY = cy + sin * r;
  svgPaths += `<line x1="${armStartX.toFixed(1)}" y1="${armStartY.toFixed(1)}" x2="${armEndX.toFixed(1)}" y2="${armEndY.toFixed(1)}" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />`;

  // 1. Inner spurs at 30%
  const r1 = r * 0.32;
  const spurLen = r * 0.18;
  const b1x = cx + cos * r1;
  const b1y = cy + sin * r1;
  svgPaths += `<line x1="${b1x.toFixed(1)}" y1="${b1y.toFixed(1)}" x2="${(b1x + (cos * 0.5 + px * 0.866) * spurLen).toFixed(1)}" y2="${(b1y + (sin * 0.5 + py * 0.866) * spurLen).toFixed(1)}" stroke="#e0f2fe" stroke-width="2.2" stroke-linecap="round" />`;
  svgPaths += `<line x1="${b1x.toFixed(1)}" y1="${b1y.toFixed(1)}" x2="${(b1x + (cos * 0.5 - px * 0.866) * spurLen).toFixed(1)}" y2="${(b1y + (sin * 0.5 - py * 0.866) * spurLen).toFixed(1)}" stroke="#e0f2fe" stroke-width="2.2" stroke-linecap="round" />`;

  // 2. Primary large chevron at 56%
  const r2 = r * 0.56;
  const chevLen = r * 0.38;
  const b2x = cx + cos * r2;
  const b2y = cy + sin * r2;

  const aR_x = b2x + (cos * 0.5 + px * 0.866) * chevLen;
  const aR_y = b2y + (sin * 0.5 + py * 0.866) * chevLen;
  const aL_x = b2x + (cos * 0.5 - px * 0.866) * chevLen;
  const aL_y = b2y + (sin * 0.5 - py * 0.866) * chevLen;

  svgPaths += `<line x1="${b2x.toFixed(1)}" y1="${b2y.toFixed(1)}" x2="${aR_x.toFixed(1)}" y2="${aR_y.toFixed(1)}" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" />`;
  svgPaths += `<line x1="${b2x.toFixed(1)}" y1="${b2y.toFixed(1)}" x2="${aL_x.toFixed(1)}" y2="${aL_y.toFixed(1)}" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" />`;

  // Sub-barbs on chevron
  const subBarbLen = r * 0.14;
  for (const t of [0.42, 0.78]) {
    const pRx = b2x + (aR_x - b2x) * t;
    const pRy = b2y + (aR_y - b2y) * t;
    const pLx = b2x + (aL_x - b2x) * t;
    const pLy = b2y + (aL_y - b2y) * t;
    svgPaths += `<line x1="${pRx.toFixed(1)}" y1="${pRy.toFixed(1)}" x2="${(pRx + cos * subBarbLen).toFixed(1)}" y2="${(pRy + sin * subBarbLen).toFixed(1)}" stroke="#bae6fd" stroke-width="1.8" stroke-linecap="round" />`;
    svgPaths += `<line x1="${pLx.toFixed(1)}" y1="${pLy.toFixed(1)}" x2="${(pLx + cos * subBarbLen).toFixed(1)}" y2="${(pLy + sin * subBarbLen).toFixed(1)}" stroke="#bae6fd" stroke-width="1.8" stroke-linecap="round" />`;
  }

  // 3. Outer chevron at 78%
  const r3 = r * 0.78;
  const chev3Len = r * 0.22;
  const b3x = cx + cos * r3;
  const b3y = cy + sin * r3;
  svgPaths += `<line x1="${b3x.toFixed(1)}" y1="${b3y.toFixed(1)}" x2="${(b3x + (cos * 0.5 + px * 0.866) * chev3Len).toFixed(1)}" y2="${(b3y + (sin * 0.5 + py * 0.866) * chev3Len).toFixed(1)}" stroke="#e0f2fe" stroke-width="2.2" stroke-linecap="round" />`;
  svgPaths += `<line x1="${b3x.toFixed(1)}" y1="${b3y.toFixed(1)}" x2="${(b3x + (cos * 0.5 - px * 0.866) * chev3Len).toFixed(1)}" y2="${(b3y + (sin * 0.5 - py * 0.866) * chev3Len).toFixed(1)}" stroke="#e0f2fe" stroke-width="2.2" stroke-linecap="round" />`;

  // 4. Diamond arrowhead spearhead tip
  const dTip = r * 1.0;
  const dBase = r * 0.84;
  const dMid = r * 0.92;
  const dWidth = r * 0.10;

  const tipPt = `${(cx + cos * dTip).toFixed(1)},${(cy + sin * dTip).toFixed(1)}`;
  const midPt1 = `${(cx + cos * dMid + px * dWidth).toFixed(1)},${(cy + sin * dMid + py * dWidth).toFixed(1)}`;
  const basePt = `${(cx + cos * dBase).toFixed(1)},${(cy + sin * dBase).toFixed(1)}`;
  const midPt2 = `${(cx + cos * dMid - px * dWidth).toFixed(1)},${(cy + sin * dMid - py * dWidth).toFixed(1)}`;

  svgPaths += `<polygon points="${tipPt} ${midPt1} ${basePt} ${midPt2}" fill="#ffffff" stroke="#bae6fd" stroke-width="1.2" />`;
}

// Center ice nucleus dot
svgPaths += `<circle cx="${cx}" cy="${cy}" r="3" fill="#ffffff" />`;

const fullSvg = `<svg width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <g filter="url(#glow)">${svgPaths}</g>
</svg>`;

const outPath = path.join(__dirname, '..', 'public', 'images', 'user-snowflake.webp');
sharp(Buffer.from(fullSvg))
  .webp({ quality: 95 })
  .toFile(outPath)
  .then(() => console.log('Successfully replaced public/images/user-snowflake.webp with clean vector crystal!'))
  .catch(console.error);
