import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ICONS_DIR = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Minimal logo (Sun) SVG
const logoSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#0B0C10" />
  <circle cx="256" cy="256" r="150" fill="#FFCC00" />
</svg>
`;

// Screenshot SVG (just a dark background with text)
const screenshot1Svg = `
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1920" fill="#0B0C10" />
  <text x="540" y="960" font-family="sans-serif" font-size="64" fill="#FFCC00" text-anchor="middle">Surya Center</text>
  <text x="540" y="1060" font-family="sans-serif" font-size="40" fill="#FFFFFF" text-anchor="middle">Life Operating System Pribadimu</text>
</svg>
`;

const screenshot2Svg = `
<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
  <rect width="1920" height="1080" fill="#0B0C10" />
  <text x="960" y="540" font-family="sans-serif" font-size="64" fill="#FFCC00" text-anchor="middle">Kelola Keuangan & Targetmu</text>
</svg>
`;

async function generate() {
  const logoBuffer = Buffer.from(logoSvg);
  
  // Icon 192
  await sharp(logoBuffer)
    .resize(192, 192)
    .toFile(path.join(ICONS_DIR, 'icon-192.png'));
    
  // Icon 512
  await sharp(logoBuffer)
    .resize(512, 512)
    .toFile(path.join(ICONS_DIR, 'icon-512.png'));
    
  // Maskable 512 (can be same for now, but usually has safe zone)
  await sharp(logoBuffer)
    .resize(512, 512)
    .toFile(path.join(ICONS_DIR, 'icon-maskable-512.png'));
    
  // Apple touch icon (180x180)
  await sharp(logoBuffer)
    .resize(180, 180)
    .toFile(path.join(ICONS_DIR, 'apple-touch-icon.png'));

  // Screenshots
  await sharp(Buffer.from(screenshot1Svg))
    .toFile(path.join(ICONS_DIR, 'screenshot1.png'));
    
  await sharp(Buffer.from(screenshot2Svg))
    .toFile(path.join(ICONS_DIR, 'screenshot2.png'));
    
  console.log("Icons and screenshots generated successfully!");
}

generate().catch(console.error);
