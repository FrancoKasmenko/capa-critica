// Genera el kit de Instagram de @capacritica: 9 posts 1080×1350 y 5 historias 1080×1920 (PNG).
// Uso: node scripts/generar-instagram.mjs <carpeta>
import path from "node:path";
import { palette as C, fonts, text, lines, wrap, measure, d20, layerLines, svgDoc, writePng, ilustracion } from "./lib/brand.mjs";

const out = process.argv[2] ?? "instagram";
const W = 1080;

function marco(h, body, { bg = C.vacio, pie = true } = {}) {
  const footer = pie
    ? `${d20({ cx: 92, cy: h - 80, r: 34, base: C.critico, stroke: 3.5, num: "" })}
       ${text("CAPA CRÍTICA", { x: 142, y: h - 66, size: 36 })}
       ${text("@capacritica", { x: W - 60, y: h - 66, size: 32, font: fonts.bodyBold, fill: C.gris, anchor: "end" })}`
    : "";
  return svgDoc(W, h, `<rect width="${W}" height="${h}" fill="${bg}"/>${layerLines(W, h, { gap: 22, opacity: 0.04 })}${body}${footer}`);
}

const etiqueta = (t, x, y, { fill = C.neon, color = C.vacio, size = 28 } = {}) => {
  const w = measure(t, size, fonts.bodyBold) + 44;
  return `<rect x="${x}" y="${y}" width="${w}" height="${size + 30}" rx="${(size + 30) / 2}" fill="${fill}"/>${text(t, { x: x + 22, y: y + size + 7, size, font: fonts.bodyBold, fill: color })}`;
};

const hexNum = (n, cx, cy, r) => {
  const pts = [0, 1, 2, 3, 4, 5].map((i) => `${cx + r * Math.sin((i * Math.PI) / 3)},${cy - r * Math.cos((i * Math.PI) / 3)}`).join(" ");
  return `<polygon points="${pts}" fill="${C.critico}" stroke="${C.vacio}" stroke-width="4"/>${text(n, { x: cx, y: cy + r * 0.36, size: r, fill: C.vacio, anchor: "middle" })}`;
};

const titulo = (arr, y, { size = 104, fill = C.hueso, x = 70, anchor = "start" } = {}) => lines(arr, { x, y, size, lineHeight: 1.02, fill, anchor });
const parrafo = (t, x, y, { size = 38, max = 940, fill = C.hueso, font = fonts.body, anchor = "start" } = {}) =>
  lines(wrap(t, size, max, font), { x, y, size, lineHeight: 1.32, fill, font, anchor });
const ilusLabel = (x, y) => text("Ilustración, no es foto del producto", { x, y, size: 22, font: fonts.bodyMedium, fill: C.gris });

const H = 1350;
const posts = [
  // 1. Presentación
  marco(H, `
    ${etiqueta("NUEVA CUENTA · MONTEVIDEO", 70, 90)}
    ${titulo(["ABRIMOS", "LA MESA"], 300, { size: 140 })}
    ${d20({ cx: 540, cy: 720, r: 250, base: C.critico })}
    ${parrafo("Piezas frikis impresas en 3D, capa por capa, en Buceo.", 540, 1060, { anchor: "middle", size: 40, max: 900 })}
    ${text("Criaturas · Gamer · Rol · TCG · Fidgets", { x: 540, y: 1195, size: 34, font: fonts.bodyBold, fill: C.neon, anchor: "middle" })}`),
  // 2. Categorías
  marco(H, `
    ${titulo(["¿QUÉ", "IMPRIMIMOS?"], 190, { size: 110 })}
    ${[
      ["criatura", "Criaturas", "Dragones y bichos articulados"],
      ["gamer", "Gamer y setup", "Soportes y organizadores"],
      ["rol", "Rol y mesa", "Torres y bandejas de dados"],
      ["tcg", "TCG y cartas", "Deck boxes y contadores"],
      ["fidget", "Fidgets y llaveros", "Desde $190"],
    ]
      .map(([t, n, d], i) => {
        const y = 340 + i * 160;
        return `<rect x="70" y="${y}" width="940" height="140" rx="28" fill="${C.noche}"/>
        <g><clipPath id="c${i}"><rect x="70" y="${y}" width="190" height="140" rx="28"/></clipPath><g clip-path="url(#c${i})">${ilustracion(t, { cx: 165, cy: y + 70, s: 0.3 })}</g></g>
        ${text(n, { x: 290, y: y + 64, size: 46 })}${text(d, { x: 290, y: y + 112, size: 30, font: fonts.body, fill: C.gris })}`;
      })
      .join("")}
    ${ilusLabel(70, 1170)}`),
  // 3. Precios
  marco(H, `
    ${titulo(["PRECIOS", "POR TAMAÑO"], 190, { size: 110 })}
    ${parrafo("Pagás según el material que lleva la pieza. Multicolor sin recargo.", 70, 400, { size: 36, fill: C.gris })}
    ${[
      ["S", "hasta 30 g", "$190"],
      ["M", "30–80 g", "$390"],
      ["L", "80–150 g", "$590"],
      ["XL", "150–250 g", "$890"],
      ["XXL", "más de 250 g", "desde $1.290"],
    ]
      .map(([t, g, p], i) => {
        const y = 490 + i * 120;
        return `<rect x="70" y="${y}" width="940" height="100" rx="24" fill="${i % 2 ? C.noche : "#2A2345"}"/>
        ${text(t, { x: 110, y: y + 68, size: 54, fill: C.neon })}${text(g, { x: 290, y: y + 64, size: 34, font: fonts.body })}${text(p, { x: 970, y: y + 68, size: 50, fill: C.critico, anchor: "end" })}`;
      })
      .join("")}
    ${text("Personalización con tu nombre o gamertag: +$100", { x: 70, y: 1160, size: 34, font: fonts.bodyBold })}`),
  // 4. Multicolor
  marco(H, `
    ${titulo(["MULTICOLOR", "SIN RECARGO"], 190, { size: 110 })}
    <rect x="70" y="320" width="940" height="660" rx="40" fill="${C.noche}"/>
    ${ilustracion("criatura", { cx: 520, cy: 650, s: 1.25 })}
    ${ilusLabel(100, 950)}
    ${parrafo("Elegí la combinación que quieras: la impresora cambia de color sola, capa por capa.", 70, 1060, { size: 38 })}`),
  // 5. Gamertag
  marco(H, `
    ${etiqueta("+$100", 70, 90, { fill: C.critico, color: C.vacio, size: 34 })}
    ${titulo(["TU GAMERTAG", "EN 3D"], 300, { size: 116 })}
    <rect x="70" y="420" width="940" height="560" rx="40" fill="${C.noche}"/>
    ${ilustracion("gamer", { cx: 540, cy: 660, s: 1.25 })}
    <rect x="300" y="860" width="480" height="80" rx="16" fill="${C.neon}"/>${text("xXDarkMageXx", { x: 540, y: 917, size: 46, fill: C.vacio, anchor: "middle" })}
    ${ilusLabel(100, 1010)}
    ${parrafo("Soportes, deck boxes y bandejas con tu nombre, el de tu personaje o tu equipo.", 70, 1080, { size: 38 })}`),
  // 6. Stock vs pedido
  marco(H, `
    ${titulo(["¿EN STOCK", "O A PEDIDO?"], 190, { size: 110 })}
    <rect x="70" y="360" width="455" height="760" rx="36" fill="${C.noche}" stroke="${C.neon}" stroke-width="4"/>
    ${text("EN STOCK", { x: 297, y: 460, size: 56, fill: C.neon, anchor: "middle" })}
    ${parrafo("Ya está impreso. Lo retirás en el día en Buceo.", 110, 560, { size: 36, max: 380 })}
    ${text("Pagás completo", { x: 110, y: 1020, size: 32, font: fonts.bodyBold, fill: C.gris })}
    <rect x="555" y="360" width="455" height="760" rx="36" fill="${C.noche}" stroke="${C.hielo}" stroke-width="4"/>
    ${text("A PEDIDO", { x: 782, y: 460, size: 56, fill: C.hielo, anchor: "middle" })}
    ${parrafo("Lo imprimimos para vos en 48–72 h, en tus colores.", 595, 560, { size: 36, max: 380 })}
    ${text("Seña 50 %", { x: 595, y: 1020, size: 32, font: fonts.bodyBold, fill: C.gris })}`),
  // 7. Cómo comprar
  marco(H, `
    ${titulo(["CÓMO", "COMPRAR"], 190, { size: 120 })}
    ${[
      ["1", "Elegí en el catálogo", "Link en la bio."],
      ["2", "Armá tu carrito", "Color y personalización."],
      ["3", "Mandalo por WhatsApp", "Se escribe solo, con el total."],
      ["4", "Pagá y retirá", "Transferencia o Mercado Pago. Retiro en Buceo."],
    ]
      .map(([n, t, d], i) => {
        const y = 380 + i * 190;
        return `${hexNum(n, 140, y + 60, 62)}
        ${text(t, { x: 240, y: y + 52, size: 48 })}${text(d, { x: 240, y: y + 104, size: 32, font: fonts.body, fill: C.gris })}`;
      })
      .join("")}`),
  // 8. Licencias
  marco(H, `
    ${titulo(["DISEÑOS CON", "LICENCIA LIBRE"], 190, { size: 100 })}
    ${parrafo("Imprimimos modelos que sus autores publicaron con licencias Creative Commons que permiten vender impresiones.", 70, 400, { size: 38 })}
    ${["CC0", "CC BY", "CC BY-SA", "CC BY-ND"].map((l, i) => etiqueta(l, 70 + (i % 2) * 330, 640 + Math.floor(i / 2) * 110, { fill: i % 2 ? C.plasma : C.hielo, color: C.vacio, size: 40 })).join("")}
    ${parrafo("En cada producto de la web citamos al autor, el link al modelo y la licencia.", 70, 930, { size: 38 })}
    ${parrafo("Nada de personajes ni logos con marca.", 70, 1110, { size: 38, font: fonts.bodyBold, fill: C.critico })}`),
  // 9. Pedidos de la comunidad
  marco(H, `
    ${etiqueta("COMENTÁ", 70, 90, { fill: C.critico })}
    ${titulo(["¿QUÉ QUERÉS", "QUE", "IMPRIMAMOS?"], 300, { size: 112 })}
    ${d20({ cx: 820, cy: 760, r: 170, base: C.plasma, face: C.hueso })}
    ${parrafo("Dejanos en comentarios qué criatura, accesorio o pieza para tu mesa querés ver. Las más pedidas entran al catálogo.", 70, 700, { size: 38, max: 560 })}
    ${text("WhatsApp 092 249 764", { x: 70, y: 1150, size: 40, font: fonts.bodyBold, fill: C.neon })}`),
];

const HS = 1920;
const historias = [
  marco(HS, `
    ${etiqueta("¡HOLA!", 80, 260, { size: 40 })}
    ${titulo(["NUEVA", "CUENTA,", "NUEVA", "PARTIDA"], 520, { size: 150, x: 80 })}
    ${d20({ cx: 540, cy: 1330, r: 260, base: C.critico })}
    ${parrafo("Seguinos para ver lo que sale de la impresora.", 540, 1720, { size: 44, anchor: "middle", max: 900 })}`, { pie: false }),
  marco(HS, `
    ${titulo(["¿ROL", "O GAMER?"], 400, { size: 160, x: 80 })}
    <rect x="140" y="780" width="800" height="380" rx="40" fill="none" stroke="${C.gris}" stroke-width="4" stroke-dasharray="20 16"/>
    ${text("[ sticker de encuesta acá ]", { x: 540, y: 990, size: 40, font: fonts.bodyMedium, fill: C.gris, anchor: "middle" })}
    ${ilustracion("rol", { cx: 300, cy: 1480, s: 0.75 })}${ilustracion("gamer", { cx: 790, cy: 1480, s: 0.75 })}
    ${ilusLabel(80, 1780)}`, { pie: false }),
  marco(HS, `
    ${titulo(["DESDE", "$190"], 420, { size: 190, x: 80 })}
    ${[["S", "$190"], ["M", "$390"], ["L", "$590"], ["XL", "$890"], ["XXL", "$1.290+"]]
      .map(([t, p], i) => `<rect x="80" y="${700 + i * 150}" width="920" height="120" rx="30" fill="${C.noche}"/>${text(t, { x: 130, y: 783 + i * 150, size: 64, fill: C.neon })}${text(p, { x: 950, y: 783 + i * 150, size: 64, fill: C.critico, anchor: "end" })}`)
      .join("")}
    ${parrafo("Multicolor sin recargo · Personalización +$100", 540, 1560, { size: 40, anchor: "middle", font: fonts.bodyBold })}`, { pie: false }),
  marco(HS, `
    ${titulo(["PEDÍ EN", "3 PASOS"], 400, { size: 160, x: 80 })}
    ${[["1", "Catálogo", "link en la bio"], ["2", "Carrito", "color y nombre"], ["3", "WhatsApp", "se escribe solo"]]
      .map(([n, t, d], i) => `${hexNum(n, 210, 780 + i * 300, 110)}${text(t, { x: 370, y: 790 + i * 300, size: 76 })}${text(d, { x: 370, y: 850 + i * 300, size: 40, font: fonts.body, fill: C.gris })}`)
      .join("")}
    ${parrafo("Pagás por transferencia o Mercado Pago. Retiro en Buceo.", 540, 1700, { size: 40, anchor: "middle" })}`, { pie: false }),
  marco(HS, `
    ${d20({ cx: 540, cy: 560, r: 300, base: C.critico })}
    ${titulo(["ESCRIBINOS"], 1060, { size: 130, x: 540, anchor: "middle" })}
    ${text("WhatsApp 092 249 764", { x: 540, y: 1170, size: 56, font: fonts.bodyBold, fill: C.neon, anchor: "middle" })}
    <rect x="190" y="1300" width="700" height="200" rx="40" fill="none" stroke="${C.gris}" stroke-width="4" stroke-dasharray="20 16"/>
    ${text("[ sticker de link al catálogo ]", { x: 540, y: 1415, size: 38, font: fonts.bodyMedium, fill: C.gris, anchor: "middle" })}
    ${text("CAPA CRÍTICA · @capacritica", { x: 540, y: 1700, size: 44, anchor: "middle" })}`, { pie: false }),
];

posts.forEach((svg, i) => writePng(path.join(out, "posts", `post-${String(i + 1).padStart(2, "0")}.png`), svg));
historias.forEach((svg, i) => writePng(path.join(out, "historias", `historia-${i + 1}.png`), svg));
console.log(`Kit generado en ${out}: ${posts.length} posts y ${historias.length} historias.`);
