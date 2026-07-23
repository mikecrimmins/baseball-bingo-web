// Regenerates the PWA icon set from the designer's baseball-stitching-ring
// mark, recolored to match the app's navy/gold/cream palette. Source mark
// structure comes from the designer's logo-export/favicon.svg; only the
// fill/stroke colors are parameterized here.
// Run: node scripts/gen-icons.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const COLORS = {
  bg: '#F4F7FC', // app cream (matches --color-cream)
  ring: '#16305C', // app navy (matches --color-navy)
  ball: '#FFFFFF',
  ballStroke: 'rgba(22,48,92,0.28)',
  seam: '#E6A400', // app gold (matches --color-gold)
};

function mark(scale) {
  const inner =
    `<circle cx="50" cy="50" r="45" fill="none" stroke="${COLORS.ring}" stroke-width="3.4"></circle>` +
    `<circle cx="50" cy="50" r="39" fill="none" stroke="${COLORS.ring}" stroke-width="2" stroke-dasharray="2 4.6" stroke-linecap="round"></circle>` +
    `<g transform="translate(24,24) scale(0.52)">` +
    `<circle cx="50" cy="50" r="46" fill="${COLORS.ball}" stroke="${COLORS.ballStroke}" stroke-width="1.4"></circle>` +
    `<path d="M26,15 C13,32 13,68 26,85" fill="none" stroke="${COLORS.seam}" stroke-width="3.6" stroke-linecap="round" stroke-dasharray="3.4 5"></path>` +
    `<path d="M74,15 C87,32 87,68 74,85" fill="none" stroke="${COLORS.seam}" stroke-width="3.6" stroke-linecap="round" stroke-dasharray="3.4 5"></path>` +
    `</g>`;
  return `<g transform="translate(50,50) scale(${scale}) translate(-50,-50)">${inner}</g>`;
}

function svg(size, scale) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100"><rect width="100" height="100" fill="${COLORS.bg}"></rect>${mark(scale)}</svg>`;
}

async function render(svgStr, size, out) {
  await sharp(Buffer.from(svgStr), { density: 384 }).resize(size, size).png().toFile(out);
  console.log('wrote', out);
}

// Standard icons: mark at natural size (matches the designer's original crop).
await render(svg(1024, 1), 192, 'public/icons/icon-192.png');
await render(svg(1024, 1), 512, 'public/icons/icon-512.png');
await render(svg(1024, 1), 180, 'public/icons/apple-touch-icon.png');
// Maskable: shrink + center so the ring survives Android's circle/squircle crop.
await render(svg(1024, 0.66), 512, 'public/icons/maskable-512.png');

// Crisp vector favicon for the browser tab (natural size, small canvas).
writeFileSync('public/favicon.svg', svg(64, 1));
console.log('wrote public/favicon.svg');
console.log('done');
