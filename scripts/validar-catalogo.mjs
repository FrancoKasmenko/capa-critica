// Valida data/productos.json antes del build (las imágenes `archivo` deben estar en public/productos/).
import fs from "node:fs";
import path from "node:path";
import { validarCatalogo } from "./lib/catalogo-schema.mjs";

const archivo = process.argv[2] ?? path.join("data", "productos.json");
const data = JSON.parse(fs.readFileSync(archivo, "utf8"));
const errores = validarCatalogo(data, {
  existeArchivo: (rel) => fs.existsSync(path.join("public", "productos", path.basename(rel))),
});
if (errores.length) {
  console.error(`${archivo}: ${errores.length} error(es)\n- ${errores.join("\n- ")}`);
  process.exit(1);
}
console.log(`${archivo}: ${data.productos.length} productos válidos.`);
