// Generates the PWA icon set from the navy/white/gold Baseball Bingo mark
// (same mark as the companion native app's scripts/gen-icons.mjs, kept in
// sync by hand since the two projects don't share a package).
// Run: node scripts/gen-icons.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const NAVY = '#16305C';
const GOLD = '#F2B807';
const GRID = '#C9D6E8';
const WHITE = '#FFFFFF';

function mark(cx, cy, S) {
  const gi = 0.12 * S;
  const span = S - 2 * gi;
  const cell = span / 5;
  const ox = cx - S / 2 + gi;
  const oy = cy - S / 2 + gi;
  const gw = Math.max(2, S * 0.012);

  let lines = '';
  for (let i = 0; i <= 5; i++) {
    const x = ox + i * cell;
    const y = oy + i * cell;
    lines += `<line x1="${x}" y1="${oy}" x2="${x}" y2="${oy + span}"/>`;
    lines += `<line x1="${ox}" y1="${y}" x2="${ox + span}" y2="${y}"/>`;
  }
  const grid = `<g stroke="${GRID}" stroke-width="${gw}" stroke-linecap="round">${lines}</g>`;
  const m1 = `<rect x="${ox}" y="${oy}" width="${cell}" height="${cell}" fill="${GOLD}"/>`;
  const m2 = `<rect x="${ox + 4 * cell}" y="${oy + 4 * cell}" width="${cell}" height="${cell}" fill="${GOLD}"/>`;

  const r = cell * 1.5;
  const ball = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${NAVY}"/>`;
  const sw = Math.max(2, r * 0.06);
  const dash = `${(r * 0.05).toFixed(1)} ${(r * 0.13).toFixed(1)}`;
  const seamL = `<path d="M${cx - 0.55 * r},${cy - 0.75 * r} Q${cx - 0.95 * r},${cy} ${cx - 0.55 * r},${cy + 0.75 * r}" stroke="${WHITE}" stroke-width="${sw}" fill="none" stroke-dasharray="${dash}" stroke-linecap="round"/>`;
  const seamR = `<path d="M${cx + 0.55 * r},${cy - 0.75 * r} Q${cx + 0.95 * r},${cy} ${cx + 0.55 * r},${cy + 0.75 * r}" stroke="${WHITE}" stroke-width="${sw}" fill="none" stroke-dasharray="${dash}" stroke-linecap="round"/>`;

  return grid + m1 + m2 + ball + seamL + seamR;
}

function svg(size, bg, markSize) {
  const bgRect = bg ? `<rect width="${size}" height="${size}" fill="${bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bgRect}${mark(size / 2, size / 2, markSize)}</svg>`;
}

async function render(svgStr, size, out) {
  await sharp(Buffer.from(svgStr), { density: 384 }).resize(size, size).png().toFile(out);
  console.log('wrote', out);
}

const S = 1024;
// Standard app icons: white background, generous padding.
await render(svg(S, WHITE, S * 0.84), 192, 'public/icons/icon-192.png');
await render(svg(S, WHITE, S * 0.84), 512, 'public/icons/icon-512.png');
// Maskable icon: mark kept within the ~80% "safe zone" some platforms crop to.
await render(svg(S, WHITE, S * 0.6), 512, 'public/icons/maskable-512.png');
// iOS home-screen icon (no transparency; iOS applies its own corner rounding).
await render(svg(S, WHITE, S * 0.84), 180, 'public/icons/apple-touch-icon.png');

// Crisp vector favicon for the browser tab.
writeFileSync('public/favicon.svg', svg(64, WHITE, 64 * 0.92));
console.log('wrote public/favicon.svg');
console.log('done');
