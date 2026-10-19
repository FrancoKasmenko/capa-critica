// Validación de productos.json. La documentación del esquema está en docs/ESQUEMA-CATALOGO.md.

export const CATEGORIAS = ["anime-criaturas", "gamer-setup", "rol-mesa", "tcg-cartas", "fidgets-llaveros"];
export const TRAMOS = {
  S: { precio: 190, min: 0, max: 30 },
  M: { precio: 390, min: 30, max: 80 },
  L: { precio: 590, min: 80, max: 150 },
  XL: { precio: 890, min: 150, max: 250 },
  XXL: { precio: 1290, min: 250, max: Infinity },
};
export const LICENCIAS = ["CC0", "CC BY", "CC BY-SA", "CC BY-ND"];
export const PLATAFORMAS = ["MakerWorld", "Printables", "Thingiverse", "Propio", "Otro"];
export const TIPOS_IMAGEN = ["render-autor", "foto-autor", "foto-propia", "placeholder"];

// Términos de marcas/personajes que no pueden aparecer en textos del catálogo.
const MARCAS = [
  "pokemon", "pokémon", "pikachu", "nintendo", "mario", "zelda", "disney", "marvel", "dc comics", "batman", "spiderman", "spider-man",
  "star wars", "playstation", "xbox", "sega", "sonic", "naruto", "one piece", "dragon ball", "goku", "demon slayer", "jujutsu",
  "studio ghibli", "totoro", "hello kitty", "minecraft", "fortnite", "warhammer", "magic: the gathering", "yu-gi-oh", "yugioh",
  "dungeons & dragons", "d&d", "harry potter", "lego", "bluey", "stitch", "genshin", "league of legends", "valorant", "among us",
];

const esFecha = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const esUrl = (s) => typeof s === "string" && /^https?:\/\/\S+$/.test(s);
const esTexto = (s, max) => typeof s === "string" && s.trim().length > 0 && s.length <= max;

/**
 * @param {unknown} data contenido parseado de productos.json
 * @param {{ existeArchivo?: (rel: string) => boolean }} opts
 * @returns {string[]} errores (vacío si es válido)
 */
export function validarCatalogo(data, { existeArchivo } = {}) {
  const e = [];
  if (!data || typeof data !== "object") return ["El archivo no es un objeto JSON."];
  if (data.version !== 1) e.push("`version` debe ser 1.");
  if (!esFecha(data.actualizado)) e.push("`actualizado` debe ser una fecha AAAA-MM-DD.");
  if (!Array.isArray(data.productos)) return [...e, "`productos` debe ser un array."];

  const ids = new Set();
  data.productos.forEach((p, i) => {
    const at = `productos[${i}]${p && p.id ? ` (${p.id})` : ""}`;
    const err = (m) => e.push(`${at}: ${m}`);
    if (!p || typeof p !== "object") return err("no es un objeto.");

    if (typeof p.id !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id)) err("`id` debe ser kebab-case sin tildes.");
    else if (ids.has(p.id)) err("`id` repetido.");
    else ids.add(p.id);

    if (!esTexto(p.nombre, 60)) err("`nombre` obligatorio, ≤ 60 caracteres.");
    if (!CATEGORIAS.includes(p.categoria)) err(`\`categoria\` debe ser una de: ${CATEGORIAS.join(", ")}.`);
    if (!esTexto(p.descripcion, 300)) err("`descripcion` obligatoria, ≤ 300 caracteres.");

    const tramo = TRAMOS[p.tramo];
    if (!tramo) err("`tramo` debe ser S, M, L, XL o XXL.");
    if (p.precio != null) {
      if (!Number.isInteger(p.precio) || p.precio <= 0) err("`precio` debe ser un entero positivo.");
      else if (p.tramo !== "XXL" && p.precio !== tramo?.precio) err("`precio` solo puede diferir del tramo en XXL.");
      else if (p.tramo === "XXL" && p.precio < TRAMOS.XXL.precio) err("`precio` XXL no puede ser menor a 1290.");
    }
    if (typeof p.gramos !== "number" || p.gramos <= 0) err("`gramos` debe ser un número > 0.");
    else if (tramo && (p.gramos <= tramo.min && p.tramo !== "S" || p.gramos > tramo.max)) err(`\`gramos\` (${p.gramos}) no corresponde al tramo ${p.tramo}.`);
    if (typeof p.horasImpresion !== "number" || p.horasImpresion <= 0) err("`horasImpresion` debe ser un número > 0.");

    if (!["stock", "pedido"].includes(p.disponibilidad)) err("`disponibilidad` debe ser stock o pedido.");
    if (p.stock != null && (!Number.isInteger(p.stock) || p.stock < 0)) err("`stock` debe ser un entero ≥ 0.");
    if (p.stock != null && p.disponibilidad !== "stock") err("`stock` solo aplica con disponibilidad = stock.");

    if (!Array.isArray(p.colores) || p.colores.length === 0 || !p.colores.every((c) => esTexto(c, 30))) err("`colores` debe ser un array de textos no vacío.");
    for (const k of ["multicolor", "personalizable", "destacado", "placeholder"]) {
      if (p[k] != null && typeof p[k] !== "boolean") err(`\`${k}\` debe ser booleano.`);
    }
    if (p.medidas != null && !esTexto(p.medidas, 60)) err("`medidas` debe ser texto ≤ 60.");
    if (p.etiquetas != null && (!Array.isArray(p.etiquetas) || !p.etiquetas.every((t) => esTexto(t, 30)))) err("`etiquetas` debe ser un array de textos.");

    const img = p.imagen;
    if (!img || typeof img !== "object") err("`imagen` obligatoria.");
    else {
      if (!img.archivo && !img.url) err("`imagen` necesita `archivo` o `url`.");
      if (img.archivo != null) {
        if (typeof img.archivo !== "string" || !/\.(jpe?g|png|webp)$/i.test(img.archivo) || img.archivo.includes("..")) err("`imagen.archivo` debe ser una ruta relativa .jpg/.png/.webp.");
        else if (existeArchivo && !existeArchivo(img.archivo)) err(`no existe el archivo de imagen ${img.archivo}.`);
      }
      if (img.url != null && !esUrl(img.url) && !(typeof img.url === "string" && img.url.startsWith("/productos/"))) err("`imagen.url` debe ser https://… (o /productos/… para imágenes del repo).");
      if (!esTexto(img.alt, 160)) err("`imagen.alt` obligatorio.");
      if (!TIPOS_IMAGEN.includes(img.tipo)) err(`\`imagen.tipo\` debe ser: ${TIPOS_IMAGEN.join(", ")}.`);
    }

    if (!p.autor || !esTexto(p.autor.nombre, 80)) err("`autor.nombre` obligatorio.");
    else if (p.autor.url != null && p.autor.url !== "" && !esUrl(p.autor.url)) err("`autor.url` debe ser una URL.");
    if (!p.modelo || !PLATAFORMAS.includes(p.modelo.plataforma)) err(`\`modelo.plataforma\` debe ser: ${PLATAFORMAS.join(", ")}.`);
    else if (p.modelo.plataforma !== "Propio" && !p.placeholder && !esUrl(p.modelo.url)) err("`modelo.url` obligatorio (URL del modelo).");

    if (!LICENCIAS.includes(p.licencia)) err(`\`licencia\` no permitida (${p.licencia}). Solo: ${LICENCIAS.join(", ")}.`);
    if (p.licencia === "CC BY-ND" && p.personalizable) err("con CC BY-ND no se puede personalizar (obra derivada).");
    if (!esFecha(p.licenciaVerificada)) err("`licenciaVerificada` debe ser AAAA-MM-DD.");

    const textos = [p.nombre, p.descripcion, ...(p.etiquetas ?? [])].join(" ").toLowerCase();
    const marca = MARCAS.find((m) => new RegExp(`(^|[^a-záéíóúñ])${m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-záéíóúñ]|$)`).test(textos));
    if (marca) err(`menciona una marca o personaje con licencia ("${marca}").`);
  });
  return e;
}
