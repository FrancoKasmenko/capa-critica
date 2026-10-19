import catalogo from "@/data/productos.json";

export const negocio = {
  nombre: "Capa Crítica",
  whatsapp: "59892249764",
  whatsappVisible: "092 249 764",
  instagram: "capacritica",
  zona: "Buceo, Montevideo",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://capacritica.github.io",
};

export const RECARGO_PERSONALIZACION = 100;
export const SENA = 0.5;

export const TRAMOS = {
  S: { precio: 190, gramos: "hasta 30 g" },
  M: { precio: 390, gramos: "30–80 g" },
  L: { precio: 590, gramos: "80–150 g" },
  XL: { precio: 890, gramos: "150–250 g" },
  XXL: { precio: 1290, gramos: "más de 250 g" },
} as const;
export type Tramo = keyof typeof TRAMOS;

export const CATEGORIAS = [
  { id: "anime-criaturas", nombre: "Anime y criaturas", corto: "Criaturas", descripcion: "Dragones, bichos articulados y criaturas originales." },
  { id: "gamer-setup", nombre: "Gamer y setup", corto: "Gamer", descripcion: "Soportes, organizadores y detalles para tu escritorio." },
  { id: "rol-mesa", nombre: "Rol y mesa", corto: "Rol", descripcion: "Torres y bandejas de dados, accesorios para la partida." },
  { id: "tcg-cartas", nombre: "TCG y cartas", corto: "TCG", descripcion: "Deck boxes, contadores de vida, tokens y separadores." },
  { id: "fidgets-llaveros", nombre: "Fidgets y llaveros", corto: "Fidgets", descripcion: "Para la mano, la mochila o de regalo. Desde $190." },
] as const;
export type CategoriaId = (typeof CATEGORIAS)[number]["id"];

export type Producto = {
  id: string;
  nombre: string;
  categoria: CategoriaId;
  descripcion: string;
  tramo: Tramo;
  precio?: number;
  gramos: number;
  horasImpresion: number;
  disponibilidad: "stock" | "pedido";
  stock?: number;
  colores: string[];
  multicolor?: boolean;
  personalizable?: boolean;
  medidas?: string;
  etiquetas?: string[];
  destacado?: boolean;
  imagen: { archivo?: string; url?: string; alt: string; tipo: "render-autor" | "foto-autor" | "foto-propia" | "placeholder" };
  autor: { nombre: string; url?: string };
  modelo: { plataforma: string; url: string };
  licencia: "CC0" | "CC BY" | "CC BY-SA" | "CC BY-ND";
  licenciaVersion?: string;
  licenciaVerificada: string;
  placeholder?: boolean;
};

export const productos = catalogo.productos as Producto[];
export const catalogoActualizado = catalogo.actualizado;
export const hayPlaceholders = productos.some((p) => p.placeholder);

export const productoPorId = (id: string) => productos.find((p) => p.id === id);
export const categoria = (id: string) => CATEGORIAS.find((c) => c.id === id);

export const precioDe = (p: Producto) => p.precio ?? TRAMOS[p.tramo].precio;

export const asset = (p: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${p}`;

export function imagenDe(p: Producto) {
  if (p.imagen.archivo) return asset(`/productos/${p.imagen.archivo.split("/").pop()}`);
  const url = p.imagen.url ?? "";
  return url.startsWith("/") ? asset(url) : url;
}

const LICENCIA_URL: Record<Producto["licencia"], string> = {
  CC0: "https://creativecommons.org/publicdomain/zero/1.0/deed.es",
  "CC BY": "https://creativecommons.org/licenses/by/4.0/deed.es",
  "CC BY-SA": "https://creativecommons.org/licenses/by-sa/4.0/deed.es",
  "CC BY-ND": "https://creativecommons.org/licenses/by-nd/4.0/deed.es",
};
export function licenciaUrl(p: Producto) {
  const v = p.licenciaVersion ?? "4.0";
  return p.licencia === "CC0" ? LICENCIA_URL.CC0 : LICENCIA_URL[p.licencia].replace("4.0", v);
}

export const pesos = (n: number) => `$${Math.round(n).toLocaleString("es-UY")}`;

export function waLink(texto?: string) {
  const base = `https://wa.me/${negocio.whatsapp}`;
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}

const normalizar = (s: string) => s.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function buscar(lista: Producto[], q: string) {
  const terms = normalizar(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return lista;
  return lista.filter((p) => {
    const hay = normalizar([p.nombre, p.descripcion, categoria(p.categoria)?.nombre ?? "", ...(p.etiquetas ?? []), ...p.colores].join(" "));
    return terms.every((t) => hay.includes(t));
  });
}

/* ---------- Carrito ---------- */

export type ItemCarrito = {
  id: string;
  cantidad: number;
  color: string;
  personalizacion?: string;
};

export const claveItem = (i: Pick<ItemCarrito, "id" | "color" | "personalizacion">) => `${i.id}|${i.color}|${i.personalizacion ?? ""}`;

export function precioItem(i: ItemCarrito, p: Producto) {
  return precioDe(p) + (i.personalizacion ? RECARGO_PERSONALIZACION : 0);
}

export function resumen(items: ItemCarrito[]) {
  let total = 0;
  let enStock = 0;
  let aPedido = 0;
  let unidades = 0;
  const lineas: { item: ItemCarrito; producto: Producto; unitario: number; subtotal: number }[] = [];
  for (const item of items) {
    const producto = productoPorId(item.id);
    if (!producto) continue;
    const unitario = precioItem(item, producto);
    const subtotal = unitario * item.cantidad;
    total += subtotal;
    unidades += item.cantidad;
    if (producto.disponibilidad === "stock" && !item.personalizacion) enStock += subtotal;
    else aPedido += subtotal;
    lineas.push({ item, producto, unitario, subtotal });
  }
  return { lineas, total, enStock, aPedido, sena: Math.round(aPedido * SENA), unidades };
}

export type DatosCheckout = {
  nombre: string;
  entrega: "retiro" | "coordinar";
  pago: "transferencia" | "mercadopago";
  nota: string;
};

export function mensajeWhatsapp(items: ItemCarrito[], d: DatosCheckout) {
  const r = resumen(items);
  const l = ["¡Hola Capa Crítica! Quiero hacer este pedido desde la web:", ""];
  r.lineas.forEach(({ item, producto, unitario, subtotal }, i) => {
    const disp = producto.disponibilidad === "stock" && !item.personalizacion ? "en stock" : "a pedido 48–72 h";
    l.push(`${i + 1}. ${producto.nombre}${producto.placeholder ? " [EJEMPLO]" : ""} (tamaño ${producto.tramo})`);
    l.push(`   ${item.cantidad} x ${pesos(unitario)} = ${pesos(subtotal)} · color: ${item.color} · ${disp}`);
    if (item.personalizacion) l.push(`   Personalizado (+${pesos(RECARGO_PERSONALIZACION)}): "${item.personalizacion}"`);
    l.push(`   Ref: ${producto.id}`);
  });
  l.push("", `TOTAL: ${pesos(r.total)} (${r.unidades} ${r.unidades === 1 ? "pieza" : "piezas"})`);
  if (r.aPedido > 0) l.push(`A pedido: ${pesos(r.aPedido)} → seña 50%: ${pesos(r.sena)}`);
  if (r.enStock > 0) l.push(`En stock: ${pesos(r.enStock)}`);
  l.push("");
  if (d.nombre) l.push(`Nombre: ${d.nombre}`);
  l.push(`Entrega: ${d.entrega === "retiro" ? "Retiro en Buceo" : "Coordinar entrega en Montevideo"}`);
  l.push(`Pago: ${d.pago === "transferencia" ? "Transferencia bancaria" : "Link de Mercado Pago"}`);
  if (d.nota) l.push(`Nota: ${d.nota}`);
  l.push("", "¿Me confirman disponibilidad y los datos para pagar?");
  return l.join("\n");
}
