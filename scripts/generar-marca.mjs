// Genera logo, ícono, paleta, tipografías, imagen OG e imágenes placeholder del catálogo.
// Uso: node scripts/generar-marca.mjs [carpetaMarca]
import fs from "node:fs";
import path from "node:path";
import { palette, fonts, text, measure, d20, layerLines, svgDoc, writeSvgPng, writePng, ilustracion } from "./lib/brand.mjs";

const outMarca = process.argv[2] ?? "brand";
const outPublic = "public";

function wordmark(x, y, size, { fg = palette.hueso, accent = palette.critico } = {}) {
  const w1 = measure("CAPA", size);
  return text("CAPA", { x, y, size, fill: fg }) + text("CRÍTICA", { x: x + w1 + size * 0.28, y, size, fill: accent });
}

function logoHorizontal({ fg = palette.hueso, accent = palette.critico, bg } = {}) {
  const size = 150;
  const ww = measure("CAPA", size) + size * 0.28 + measure("CRÍTICA", size);
  const w = 260 + 50 + ww + 30;
  const h = 260;
  const body = `${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ""}
  ${d20({ cx: 130, cy: 130, r: 120, base: accent, face: palette.hueso, ink: palette.vacio })}
  ${wordmark(310, 185, size, { fg, accent })}`;
  return svgDoc(w, h, body);
}

function logoVertical({ fg = palette.hueso, accent = palette.critico, bg = palette.vacio } = {}) {
  const w = 1000;
  const h = 900;
  return svgDoc(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="${bg}"/>${layerLines(w, h)}
    ${d20({ cx: w / 2, cy: 300, r: 220, base: accent })}
    ${text("CAPA CRÍTICA", { x: w / 2, y: 700, size: 120, fill: fg, anchor: "middle" })}
    ${text("IMPRESIÓN 3D FRIKI · MONTEVIDEO", { x: w / 2, y: 790, size: 40, font: fonts.bodyBold, fill: palette.neon, anchor: "middle", spacing: 4 })}`,
  );
}

const icono = (bg = palette.vacio, accent = palette.critico) =>
  svgDoc(512, 512, `<rect width="512" height="512" rx="112" fill="${bg}"/>${layerLines(512, 512, { gap: 22 })}${d20({ cx: 256, cy: 262, r: 200, base: accent })}`);

function fotoPerfil() {
  const s = 1080;
  return svgDoc(
    s,
    s,
    `<rect width="${s}" height="${s}" fill="${palette.vacio}"/>${layerLines(s, s, { gap: 30, opacity: 0.05 })}
    <circle cx="540" cy="540" r="430" fill="${palette.noche}"/>
    ${d20({ cx: 540, cy: 500, r: 330, base: palette.critico })}
    ${text("CAPA CRÍTICA", { x: 540, y: 935, size: 84, fill: palette.hueso, anchor: "middle" })}`,
  );
}

function paleta() {
  const items = [
    ["Vacío", palette.vacio, "Fondo principal"],
    ["Noche", palette.noche, "Tarjetas y superficies"],
    ["Crítico", palette.critico, "Marca, botones, precios"],
    ["Neón", palette.neon, "Acento: en stock, ofertas"],
    ["Plasma", palette.plasma, "Acento: categorías"],
    ["Hielo", palette.hielo, "Acento: links, datos"],
    ["Hueso", palette.hueso, "Texto sobre oscuro"],
    ["Gris", palette.gris, "Texto secundario"],
  ];
  const w = 1600;
  const h = 900;
  let body = `<rect width="${w}" height="${h}" fill="${palette.vacio}"/>${text("CAPA CRÍTICA · PALETA", { x: 80, y: 130, size: 64 })}`;
  items.forEach(([name, hex, use], i) => {
    const x = 80 + (i % 4) * 370;
    const y = 200 + Math.floor(i / 4) * 340;
    body += `<rect x="${x}" y="${y}" width="330" height="190" rx="24" fill="${hex}" stroke="#FFFFFF22" stroke-width="2"/>`;
    body += text(name, { x, y: y + 240, size: 38 });
    body += text(hex, { x, y: y + 280, size: 28, font: fonts.bodyBold, fill: palette.gris });
    body += text(use, { x, y: y + 315, size: 24, font: fonts.body, fill: palette.gris });
  });
  return svgDoc(w, h, body);
}

function tipografias() {
  const w = 1600;
  const h = 900;
  return svgDoc(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="${palette.vacio}"/>${layerLines(w, h)}
    ${text("TIPOGRAFÍAS", { x: 80, y: 130, size: 64 })}
    ${text("Russo One · títulos, precios, botones", { x: 80, y: 250, size: 36, font: fonts.bodyBold, fill: palette.neon })}
    ${text("TIRADA CRÍTICA 20", { x: 80, y: 370, size: 110, fill: palette.critico })}
    ${text("Space Grotesk · textos", { x: 80, y: 500, size: 36, font: fonts.bodyBold, fill: palette.neon })}
    ${text("Dragones flexi, torres de dados y deck boxes en 3D.", { x: 80, y: 590, size: 50, font: fonts.body })}
    ${text("Space Grotesk Bold · etiquetas: EN STOCK · A PEDIDO 48–72 H", { x: 80, y: 680, size: 38, font: fonts.bodyBold })}
    ${text("Ambas de Google Fonts con licencia SIL Open Font License 1.1 (uso comercial libre).", { x: 80, y: 820, size: 28, font: fonts.body, fill: palette.gris })}`,
  );
}

// --- Marca ---
const piezas = [
  ["logo-horizontal", logoHorizontal(), 1600],
  ["logo-horizontal-fondo-oscuro", logoHorizontal({ bg: palette.vacio }), 1600],
  ["logo-horizontal-claro", logoHorizontal({ fg: palette.vacio, bg: palette.hueso }), 1600],
  ["logo-vertical", logoVertical(), 1200],
  ["icono", icono(), 1024],
  ["icono-neon", icono(palette.vacio, palette.neon), 1024],
  ["foto-perfil-instagram", fotoPerfil(), 1080],
  ["paleta", paleta(), 1600],
  ["tipografias", tipografias(), 1600],
];
for (const [name, svg, width] of piezas) writeSvgPng(path.join(outMarca, name), svg, { width });
for (const f of ["OFL-RussoOne.txt", "OFL-SpaceGrotesk.txt"]) fs.copyFileSync(path.join("scripts/fonts", f), path.join(outMarca, f));

// --- Web ---
fs.mkdirSync(path.join(outPublic, "productos"), { recursive: true });
fs.writeFileSync(path.join(outPublic, "logo.svg"), logoHorizontal());
fs.writeFileSync(path.join(outPublic, "icono.svg"), icono());
writePng(path.join(outPublic, "apple-touch-icon.png"), icono().replace('width="512" height="512"', 'width="180" height="180"'));

const og = svgDoc(
  1200,
  630,
  `<rect width="1200" height="630" fill="${palette.vacio}"/>${layerLines(1200, 630)}
  ${d20({ cx: 960, cy: 315, r: 210, base: palette.critico })}
  ${text("CAPA", { x: 70, y: 200, size: 120 })}${text("CRÍTICA", { x: 70, y: 330, size: 120, fill: palette.critico })}
  ${text("Impresión 3D friki en Montevideo", { x: 70, y: 420, size: 40, font: fonts.bodyBold })}
  ${text("Criaturas · Gamer · Rol · TCG · Fidgets", { x: 70, y: 480, size: 32, font: fonts.body, fill: palette.gris })}
  ${text("Desde $190 · Retiro en Buceo", { x: 70, y: 560, size: 34, font: fonts.bodyBold, fill: palette.neon })}`,
);
writePng(path.join(outPublic, "og.png"), og);

const placeholderColors = {
  criatura: [palette.critico, palette.neon, palette.plasma],
  gamer: [palette.critico, palette.neon, palette.plasma],
  rol: [palette.critico, palette.neon, palette.plasma],
  tcg: [palette.critico, palette.neon, palette.plasma],
  fidget: [palette.critico, palette.neon, palette.plasma],
};
for (const [tipo, [a, b, c]] of Object.entries(placeholderColors)) {
  const svg = svgDoc(
    800,
    800,
    `<rect width="800" height="800" fill="${palette.noche}"/>${layerLines(800, 800, { gap: 16, opacity: 0.05 })}
    ${ilustracion(tipo, { cx: 400, cy: 380, s: 1.05, a, b, c })}
    <rect x="40" y="700" width="420" height="56" rx="28" fill="${palette.vacio}" opacity="0.85"/>
    ${text("ILUSTRACIÓN · PLACEHOLDER", { x: 250, y: 737, size: 24, font: fonts.bodyBold, fill: palette.neon, anchor: "middle" })}`,
  );
  writePng(path.join(outPublic, "productos", `placeholder-${tipo}.png`), svg);
}

console.log("Marca generada en", outMarca, "y", outPublic);
