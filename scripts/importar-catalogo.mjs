// Copia el catálogo curado (store del proyecto) a data/productos.json y sus imágenes a public/productos/.
// Uso: npm run importar-catalogo [-- <ruta a productos.json>]
import fs from "node:fs";
import path from "node:path";
import { validarCatalogo } from "./lib/catalogo-schema.mjs";

const DEFAULT = "/cursor/stores/bc-c46612c7-0c81-4932-b433-fcb3c3132f69/produccion/catalogo/productos.json";
const origen = path.resolve(process.argv[2] ?? process.env.CATALOGO_ORIGEN ?? DEFAULT);

if (!fs.existsSync(origen)) {
  console.error(`No encuentro ${origen}. Pasá la ruta: npm run importar-catalogo -- <ruta>`);
  process.exit(1);
}

const dirOrigen = path.dirname(origen);
let data;
try {
  data = JSON.parse(fs.readFileSync(origen, "utf8"));
} catch (err) {
  console.error(`JSON inválido en ${origen}: ${err.message}`);
  process.exit(1);
}

const errores = validarCatalogo(data, { existeArchivo: (rel) => fs.existsSync(path.join(dirOrigen, rel)) });
if (errores.length) {
  console.error(`El catálogo tiene ${errores.length} error(es); no se importó nada:\n- ${errores.join("\n- ")}`);
  process.exit(1);
}

const destImg = path.join("public", "productos");
fs.mkdirSync(destImg, { recursive: true });
let copiadas = 0;
const nombres = new Set();
for (const p of data.productos) {
  if (!p.imagen.archivo) continue;
  const nombre = path.basename(p.imagen.archivo);
  if (nombres.has(nombre)) {
    console.error(`Dos productos usan una imagen con el mismo nombre de archivo: ${nombre}`);
    process.exit(1);
  }
  nombres.add(nombre);
  fs.copyFileSync(path.join(dirOrigen, p.imagen.archivo), path.join(destImg, nombre));
  copiadas++;
}

fs.writeFileSync(path.join("data", "productos.json"), `${JSON.stringify(data, null, 2)}\n`);

const porCat = data.productos.reduce((a, p) => ((a[p.categoria] = (a[p.categoria] ?? 0) + 1), a), {});
const enStock = data.productos.filter((p) => p.disponibilidad === "stock").length;
console.log(`Importados ${data.productos.length} productos (${enStock} en stock) y ${copiadas} imágenes.`);
console.table(porCat);
