import sharp from "sharp";

const W = 1840;
const H = 920;

// Overlay: dark radial scrim + gold emblem + AL-RISALA wordmark + RESTAURANT subtitle.
// Transparent background so it composites over the food photo.
const overlay = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fbe7a6"/>
      <stop offset="35%" stop-color="#e7c45c"/>
      <stop offset="65%" stop-color="#caa12f"/>
      <stop offset="100%" stop-color="#a9821c"/>
    </linearGradient>
    <linearGradient id="goldText" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdf0c0"/>
      <stop offset="45%" stop-color="#e9c659"/>
      <stop offset="100%" stop-color="#b98b1f"/>
    </linearGradient>
    <radialGradient id="scrim" cx="50%" cy="46%" r="78%">
      <stop offset="0%" stop-color="#0a0704" stop-opacity="0.58"/>
      <stop offset="55%" stop-color="#0a0704" stop-opacity="0.70"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.86"/>
    </radialGradient>
  </defs>

  <!-- darkening scrim over the food -->
  <rect width="${W}" height="${H}" fill="url(#scrim)"/>

  <!-- emblem framing rings -->
  <circle cx="920" cy="300" r="158" fill="none" stroke="url(#gold)" stroke-width="2" opacity="0.55"/>
  <circle cx="920" cy="300" r="167" fill="none" stroke="url(#gold)" stroke-width="1" opacity="0.3"/>

  <!-- cloche dome -->
  <g transform="translate(920, 300) scale(0.82)">
    <circle cx="0" cy="-118" r="13" fill="url(#gold)"/>
    <rect x="-3" y="-112" width="6" height="14" fill="url(#gold)"/>
    <path d="M -125 0 C -125 -78 -60 -98 0 -98 C 60 -98 125 -78 125 0 Z" fill="url(#gold)"/>
    <rect x="-150" y="2" width="300" height="16" rx="8" fill="url(#gold)"/>
  </g>

  <!-- crossed cutlery beneath dome -->
  <g transform="translate(920, 430) scale(0.66)">
    <g transform="rotate(24)">
      <g>
        <rect x="-7" y="-30" width="14" height="118" rx="7" fill="url(#gold)"/>
        <path d="M -9 -30 L -9 -120 Q -9 -150 3 -150 Q 9 -140 9 -110 L 9 -30 Z" fill="url(#gold)"/>
      </g>
    </g>
    <g transform="rotate(-24)">
      <g>
        <rect x="-7" y="-30" width="14" height="118" rx="7" fill="url(#gold)"/>
        <path d="M -16 -84 Q -16 -60 0 -56 Q 16 -60 16 -84 Z" fill="url(#gold)"/>
        <rect x="-15" y="-150" width="6" height="70" rx="3" fill="url(#gold)"/>
        <rect x="-3" y="-150" width="6" height="70" rx="3" fill="url(#gold)"/>
        <rect x="9" y="-150" width="6" height="70" rx="3" fill="url(#gold)"/>
      </g>
    </g>
  </g>

  <!-- wordmark -->
  <text x="920" y="640" text-anchor="middle" font-family="DejaVu Serif" font-weight="bold"
        font-size="176" letter-spacing="16" fill="url(#goldText)">AL-RISALA</text>

  <!-- divider + subtitle -->
  <line x1="640" y1="712" x2="848" y2="712" stroke="url(#gold)" stroke-width="2" opacity="0.7"/>
  <line x1="992" y1="712" x2="1200" y2="712" stroke="url(#gold)" stroke-width="2" opacity="0.7"/>
  <circle cx="920" cy="712" r="5" fill="url(#gold)" opacity="0.9"/>
  <text x="920" y="766" text-anchor="middle" font-family="DejaVu Serif"
        font-size="46" letter-spacing="22" fill="url(#goldText)" opacity="0.95">RESTAURANT</text>
</svg>`;

// Use the clean food photo as the base, cover-fit into W x H.
const food = await sharp("attached_assets/food-bg.png")
  .resize(W, H, { fit: "cover", position: "center" })
  .toBuffer();

await sharp(food)
  .composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
  .webp({ quality: 80 })
  .toFile("attached_assets/al-risala-logo.webp");

console.log("banner written: 1840x920 (webp)");
