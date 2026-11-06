// Genera la imagen para compartir en redes (Open Graph) y el ícono de Apple.
// Uso: node scripts/generar-og.mjs   → public/og.jpg y public/apple-touch-icon.png
import sharp from 'sharp';

const FOTO = 'src/assets/img/cata-vendada-alfajor.jpg';
const W = 1200, H = 630, ANCHO_FOTO = 520;

const foto = await sharp(FOTO).rotate().resize(ANCHO_FOTO, H, { fit: 'cover', position: 'attention' }).modulate({ brightness: 0.9 }).toBuffer();

const texto = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="fade" x1="0" x2="1">
      <stop offset="0" stop-color="#17100b"/><stop offset="1" stop-color="#17100b" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="g" cx="20%" cy="0%" r="90%">
      <stop offset="0" stop-color="#6b4a31"/><stop offset="1" stop-color="#17100b"/>
    </radialGradient>
  </defs>
  <rect x="${W - ANCHO_FOTO}" width="160" height="${H}" fill="url(#fade)"/>
  <text x="70" y="120" font-family="Helvetica, Arial" font-size="20" letter-spacing="6" fill="#deb07a">CATAS A CIEGAS · BUENOS AIRES</text>
  <text x="66" y="250" font-family="Georgia, serif" font-size="76" fill="#f4ebdd">¿Elegirías lo mismo</text>
  <text x="66" y="340" font-family="Georgia, serif" font-size="76" fill="#f4ebdd">con los ojos</text>
  <text x="66" y="430" font-family="Georgia, serif" font-style="italic" font-size="76" fill="#deb07a">cerrados?</text>
  <text x="70" y="560" font-family="Georgia, serif" font-size="32" fill="#f4ebdd">Catas <tspan font-style="italic" fill="#deb07a">no</tspan> tradicionales</text>
</svg>`;

const fondo = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><radialGradient id="g" cx="15%" cy="0%" r="100%"><stop offset="0" stop-color="#4a3122"/><stop offset="1" stop-color="#17100b"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`;

await sharp(Buffer.from(fondo))
  .composite([{ input: foto, left: W - ANCHO_FOTO, top: 0 }, { input: Buffer.from(texto), left: 0, top: 0 }])
  .jpeg({ quality: 85 })
  .toFile('public/og.jpg');

const icono = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="180" height="180"><rect width="64" height="64" fill="#17100b"/><path d="M8 28c10-5 38-5 48 0v9c-10 5-38 5-48 0Z" fill="#c8925a"/><path d="M19 32.5h7M38 32.5h7" stroke="#17100b" stroke-width="3" stroke-linecap="round"/></svg>`;
await sharp(Buffer.from(icono)).png().toFile('public/apple-touch-icon.png');
console.log('OK: public/og.jpg y public/apple-touch-icon.png');
