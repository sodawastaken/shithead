// Generates assets/icon.png from an inline SVG using sharp (already installed via @capacitor/assets)
const sharp = require('./node_modules/sharp');
const path = require('path');

const SIZE = 1024;

const svg = `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Deep felt-green radial background -->
    <radialGradient id="bg" cx="50%" cy="38%" r="68%">
      <stop offset="0%"   stop-color="#1a4a2e"/>
      <stop offset="55%"  stop-color="#0e2619"/>
      <stop offset="100%" stop-color="#060c07"/>
    </radialGradient>

    <!-- Subtle warm glow behind spade -->
    <radialGradient id="glow" cx="50%" cy="44%" r="34%">
      <stop offset="0%"   stop-color="#f0c040" stop-opacity="0.13"/>
      <stop offset="100%" stop-color="#f0c040" stop-opacity="0"/>
    </radialGradient>

    <!-- Soft blur for the glow layer -->
    <filter id="softBlur" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="28"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1024" height="1024" fill="url(#bg)"/>

  <!-- Warm glow ellipse -->
  <ellipse cx="512" cy="450" rx="310" ry="290" fill="url(#glow)"/>

  <!-- Spade glow layer: same spade, blurred, semi-transparent gold -->
  <text x="512" y="710"
    text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="680"
    fill="#f0c040"
    opacity="0.28"
    filter="url(#softBlur)"
  >&#x2660;</text>

  <!-- Spade sharp layer -->
  <text x="512" y="710"
    text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="680"
    fill="#f0c040"
  >&#x2660;</text>

  <!-- Thin gold inner border -->
  <rect x="44" y="44" width="936" height="936"
        fill="none" stroke="#f0c040" stroke-width="3" opacity="0.18"/>

  <!-- Corner micro-suits, very faint -->
  <text x="82"  y="116"  font-family="Georgia,serif" font-size="48" fill="#f0c040" opacity="0.10" text-anchor="middle">&#x2660;</text>
  <text x="942" y="116"  font-family="Georgia,serif" font-size="48" fill="#f0c040" opacity="0.10" text-anchor="middle">&#x2663;</text>
  <text x="82"  y="966"  font-family="Georgia,serif" font-size="48" fill="#f0c040" opacity="0.10" text-anchor="middle">&#x2665;</text>
  <text x="942" y="966"  font-family="Georgia,serif" font-size="48" fill="#f0c040" opacity="0.10" text-anchor="middle">&#x2666;</text>
</svg>`;

sharp(Buffer.from(svg))
  .resize(SIZE, SIZE)
  .png()
  .toFile(path.join(__dirname, 'assets', 'icon.png'))
  .then(() => console.log('icon.png written (1024×1024)'))
  .catch(err => { console.error(err); process.exit(1); });
