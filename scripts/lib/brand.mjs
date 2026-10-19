import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import { Resvg } from "@resvg/resvg-js";

const here = path.dirname(fileURLToPath(import.meta.url));
const fontDir = path.join(here, "..", "fonts");

const load = (file) => {
  const buf = fs.readFileSync(path.join(fontDir, file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};

export const fonts = {
  display: load("RussoOne-Regular.ttf"),
  body: load("SpaceGrotesk-400.ttf"),
  bodyMedium: load("SpaceGrotesk-500.ttf"),
  bodyBold: load("SpaceGrotesk-700.ttf"),
};

export const palette = {
  vacio: "#14111F",
  noche: "#221C38",
  critico: "#FF3D6E",
  neon: "#C6FF3D",
  plasma: "#8B5CFF",
  hielo: "#3CE0FF",
  hueso: "#F4EFE7",
  gris: "#9A93B5",
};

function layout(str, x, y, size, font) {
  const scale = size / font.unitsPerEm;
  const glyphs = font.stringToGlyphs(str);
  const p = new opentype.Path();
  let cx = x;
  glyphs.forEach((g, i) => {
    p.extend(g.getPath(cx, y, size));
    cx += g.advanceWidth * scale;
    const next = glyphs[i + 1];
    if (next) {
      const k = font.getKerningValue(g, next);
      if (Number.isFinite(k)) cx += k * scale;
    }
  });
  return { path: p, width: cx - x };
}

export const measure = (str, size, font = fonts.display) => layout(str, 0, 0, size, font).width;

/** Texto convertido a trazos: el SVG no depende de fuentes instaladas. */
export function text(str, { x = 0, y = 0, size = 48, font = fonts.display, fill = palette.hueso, anchor = "start", opacity, spacing = 0 } = {}) {
  if (spacing) {
    const chars = [...str];
    const total = chars.reduce((a, c) => a + measure(c, size, font), 0) + spacing * (chars.length - 1);
    let cx = anchor === "middle" ? x - total / 2 : anchor === "end" ? x - total : x;
    return chars
      .map((c) => {
        const out = text(c, { x: cx, y, size, font, fill, opacity });
        cx += measure(c, size, font) + spacing;
        return out;
      })
      .join("");
  }
  const w = measure(str, size, font);
  const startX = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  const d = layout(str, startX, y, size, font).path.toPathData(2);
  return `<path d="${d}" fill="${fill}"${opacity != null ? ` opacity="${opacity}"` : ""}/>`;
}

export function lines(arr, { x, y, size, lineHeight = 1.2, ...rest }) {
  return arr.map((l, i) => text(l, { x, y: y + i * size * lineHeight, size, ...rest })).join("");
}

export function wrap(str, size, maxWidth, font = fonts.body) {
  const out = [];
  let cur = "";
  for (const w of str.split(" ")) {
    const next = cur ? `${cur} ${w}` : w;
    if (measure(next, size, font) > maxWidth && cur) {
      out.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
}

let gid = 0;

/**
 * Ícono: d20 visto de frente con líneas de capa (impresión 3D) en la cara central.
 * Centrado en (cx, cy) con radio r.
 */
export function d20({ cx = 0, cy = 0, r = 100, base = palette.critico, face = palette.hueso, ink = palette.vacio, num = "20", numColor, stroke, numScale } = {}) {
  const id = `d${gid++}`;
  const P = (x, y) => [cx + x * r, cy + y * r];
  const V = [P(0, -1), P(0.866, -0.5), P(0.866, 0.5), P(0, 1), P(-0.866, 0.5), P(-0.866, -0.5)];
  const A = P(0, -0.5);
  const B = P(0.5, 0.36);
  const C = P(-0.5, 0.36);
  const pts = (arr) => arr.map((p) => p.join(",")).join(" ");
  const sw = stroke ?? r * 0.07;
  const tri = pts([A, B, C]);
  const layers = Array.from({ length: 7 }, (_, i) => {
    const y = A[1] + ((C[1] - A[1]) * (i + 1)) / 8;
    return `<line x1="${cx - r}" x2="${cx + r}" y1="${y}" y2="${y}" stroke="${ink}" stroke-opacity="0.13" stroke-width="${r * 0.035}"/>`;
  }).join("");
  const facets = [
    [V[0], V[1], A], [V[1], B, A], [V[1], V[2], B], [V[2], V[3], B], [V[3], C, B], [V[3], V[4], C], [V[4], V[5], C], [V[5], A, C], [V[5], V[0], A],
  ];
  const shades = [0.0, 0.18, 0.3, 0.42, 0.5, 0.42, 0.3, 0.18, 0.08];
  const fac = facets.map((f, i) => `<polygon points="${pts(f)}" fill="${ink}" fill-opacity="${shades[i]}"/>`).join("");
  const numSize = r * (numScale ?? (String(num).length > 1 ? 0.34 : 0.46));
  return `
  <defs><clipPath id="${id}c"><polygon points="${tri}"/></clipPath></defs>
  <polygon points="${pts(V)}" fill="${base}"/>
  ${fac}
  <polygon points="${tri}" fill="${face}"/>
  <g clip-path="url(#${id}c)">${layers}</g>
  <polygon points="${pts(V)}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>
  ${facets.map((f) => `<polygon points="${pts(f)}" fill="none" stroke="${ink}" stroke-width="${sw * 0.55}" stroke-linejoin="round"/>`).join("")}
  <polygon points="${tri}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="round"/>
  ${num ? text(num, { x: cx, y: cy + r * 0.12 + numSize * 0.4, size: numSize, fill: numColor ?? base, anchor: "middle" }) : ""}`;
}

/** Fondo con líneas de capa horizontales. */
export function layerLines(w, h, { gap = 18, color = "#FFFFFF", opacity = 0.035 } = {}) {
  let out = "";
  for (let y = gap; y < h; y += gap) out += `<rect x="0" y="${y}" width="${w}" height="${gap * 0.35}" fill="${color}" opacity="${opacity}"/>`;
  return out;
}

export function svgDoc(w, h, body, bg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ""}${body}</svg>`;
}

export function writeSvgPng(outBase, svg, { width } = {}) {
  fs.mkdirSync(path.dirname(outBase), { recursive: true });
  fs.writeFileSync(`${outBase}.svg`, svg);
  fs.writeFileSync(`${outBase}.png`, new Resvg(svg, width ? { fitTo: { mode: "width", value: width } } : {}).render().asPng());
}

export function writePng(file, svg) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, new Resvg(svg).render().asPng());
}

/* ---------- Ilustraciones (no son fotos de producto) ---------- */

export function ilustracion(tipo, { cx, cy, s = 1, a = palette.critico, b = palette.neon, c = palette.plasma } = {}) {
  const T = (body) => `<g transform="translate(${cx} ${cy}) scale(${s})">${body}</g>`;
  const ink = palette.vacio;
  switch (tipo) {
    case "criatura": {
      // dragón flexi: segmentos articulados en curva
      let segs = "";
      const n = 9;
      for (let i = n - 1; i >= 0; i--) {
        const t = i / (n - 1);
        const x = -230 + t * 400;
        const y = Math.sin(t * Math.PI * 1.6) * 70;
        const rr = 48 - t * 26;
        segs += `<rect x="${x - rr}" y="${y - rr * 0.8}" width="${rr * 2}" height="${rr * 1.6}" rx="${rr * 0.5}" fill="${i % 2 ? a : c}" stroke="${ink}" stroke-width="7"/>`;
        segs += `<path d="M${x - rr * 0.4} ${y - rr * 0.8} l${rr * 0.4} ${-rr * 0.6} l${rr * 0.4} ${rr * 0.6}" fill="${b}" stroke="${ink}" stroke-width="6" stroke-linejoin="round"/>`;
      }
      const head = `<g transform="translate(-275 -10)"><path d="M-70 0 Q-60 -60 10 -55 L60 -20 Q75 0 60 25 L10 50 Q-60 55 -70 0Z" fill="${a}" stroke="${ink}" stroke-width="8"/><circle cx="-10" cy="-12" r="11" fill="${b}" stroke="${ink}" stroke-width="5"/><path d="M5 -55 l20 -45 l12 40" fill="${b}" stroke="${ink}" stroke-width="6" stroke-linejoin="round"/></g>`;
      return T(`<g transform="translate(60 0)">${segs}${head}</g>`);
    }
    case "gamer": {
      return T(`<path d="M-200 -40 Q-200 -110 -120 -110 L120 -110 Q200 -110 200 -40 L230 90 Q240 150 180 150 Q140 150 110 90 L-110 90 Q-140 150 -180 150 Q-240 150 -230 90Z" fill="${c}" stroke="${ink}" stroke-width="10" stroke-linejoin="round"/>
      <rect x="-145" y="-45" width="90" height="28" rx="8" fill="${ink}"/><rect x="-114" y="-76" width="28" height="90" rx="8" fill="${ink}"/>
      <circle cx="100" cy="-60" r="18" fill="${a}" stroke="${ink}" stroke-width="6"/><circle cx="140" cy="-25" r="18" fill="${b}" stroke="${ink}" stroke-width="6"/><circle cx="60" cy="-25" r="18" fill="${palette.hielo}" stroke="${ink}" stroke-width="6"/><circle cx="100" cy="10" r="18" fill="${palette.hueso}" stroke="${ink}" stroke-width="6"/>`);
    }
    case "rol": {
      return T(`<path d="M-120 160 L-120 -90 L-150 -90 L-150 -160 L-110 -160 L-110 -130 L-70 -130 L-70 -160 L-30 -160 L-30 -130 L10 -130 L10 -160 L50 -160 L50 -130 L90 -130 L90 -160 L130 -160 L130 -90 L100 -90 L100 160Z" fill="${c}" stroke="${ink}" stroke-width="10" stroke-linejoin="round"/>
      <path d="M-40 160 L-40 80 Q-10 40 20 80 L20 160Z" fill="${ink}"/>
      <rect x="-70" y="-60" width="34" height="50" rx="16" fill="${ink}"/><rect x="40" y="-60" width="34" height="50" rx="16" fill="${ink}"/>
      ${d20({ cx: 190, cy: 120, r: 70, base: a, face: palette.hueso, stroke: 6 })}`);
    }
    case "tcg": {
      return T(`<rect x="-150" y="-170" width="220" height="300" rx="20" fill="${palette.noche}" stroke="${ink}" stroke-width="8" transform="rotate(-10)"/>
      <rect x="-110" y="-150" width="230" height="320" rx="24" fill="${a}" stroke="${ink}" stroke-width="10"/>
      <rect x="-110" y="-150" width="230" height="90" rx="24" fill="${c}" stroke="${ink}" stroke-width="10"/>
      <circle cx="5" cy="40" r="60" fill="none" stroke="${ink}" stroke-width="10"/>${text("20", { x: 5, y: 62, size: 60, fill: ink, anchor: "middle" })}
      <g transform="translate(170 60)"><circle r="62" fill="${b}" stroke="${ink}" stroke-width="10"/>${text("+1", { x: 0, y: 20, size: 54, fill: ink, anchor: "middle" })}</g>`);
    }
    case "fidget": {
      return T(`<circle cx="0" cy="-150" r="40" fill="none" stroke="#C9CED6" stroke-width="16"/>
      ${[0, 1, 2, 3, 4].map((i) => `<rect x="${-70 + (i % 2) * 10}" y="${-110 + i * 56}" width="140" height="60" rx="26" fill="${[a, c, b, palette.hielo, a][i]}" stroke="${ink}" stroke-width="8"/>`).join("")}
      <circle cx="-30" cy="-82" r="9" fill="${ink}"/><circle cx="30" cy="-82" r="9" fill="${ink}"/>`);
    }
    default:
      return T(d20({ r: 160, base: a }));
  }
}
