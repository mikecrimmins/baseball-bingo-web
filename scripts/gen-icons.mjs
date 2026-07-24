// Regenerates the PWA icon set from the same mark as the in-app <Logo>
// component (src/components/Logo.tsx) — a single circle with two dashed
// seam curves. Keep this in sync with Logo.tsx by hand; the two can't share
// code since one renders to React and the other to static PNG/SVG files.
// Run: node scripts/gen-icons.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const COLORS = {
  bg: '#FFFDF7', // --color-paper-bright (never pure white, per style spec)
  ball: '#FFFDF7', // --color-paper-bright
  ring: '#1B2A4A', // app navy (matches --color-navy)
  seam: '#C8102E', // app stitch-red (matches --color-stitch-red)
};

function mark(scale) {
  const inner =
    `<circle cx="50" cy="50" r="46" fill="${COLORS.ball}" stroke="${COLORS.ring}" stroke-width="3"></circle>` +
    `<path d="M26,15 C13,32 13,68 26,85" fill="none" stroke="${COLORS.seam}" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="3 4.5"></path>` +
    `<path d="M74,15 C87,32 87,68 74,85" fill="none" stroke="${COLORS.seam}" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="3 4.5"></path>`;
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
