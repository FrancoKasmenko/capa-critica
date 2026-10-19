# Capa Crítica — catálogo web

Catálogo de piezas frikis impresas en 3D (criaturas, gamer, rol, TCG, fidgets) con carrito y checkout por WhatsApp. Sitio 100 % estático (Next.js `output: "export"`), listo para GitHub Pages gratis.

- `/` — catálogo con búsqueda, filtros por categoría y "solo en stock", cómo comprar, precios por tamaño y preguntas frecuentes.
- `/producto/<id>/` — ficha: precio por tramo, en stock / a pedido, colores, personalización (+$100), autor, link al modelo y licencia.
- `/carrito/` — carrito guardado en `localStorage`; arma el mensaje con el detalle, total y seña del 50 % de lo que es a pedido, y abre `wa.me/59892249764`.
- `/tablero/` — tablero del experimento leído de `data/experimento.json` (no indexado).

## Correr en local

```bash
npm install
npm run dev        # http://localhost:4317
npm run build      # valida el catálogo y genera ./out
npm start          # sirve ./out en http://localhost:4317
```

Requiere Node 20 o superior.

## Publicar en GitHub Pages (gratis)

1. Subir este repo a GitHub (rama `main`).
2. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada push a `main` corre `.github/workflows/deploy.yml` y publica en `https://<usuario>.github.io/<repo>/`. El `basePath` y la URL del sitio se toman solos de la configuración de Pages.

Analítica opcional sin cookies: crear un sitio en Cloudflare Web Analytics (gratis) y guardar el token como variable del repo `CF_ANALYTICS_TOKEN` (**Settings → Secrets and variables → Actions → Variables**). Sin esa variable no se carga ningún script de analítica.

## Catálogo (`data/productos.json`)

El esquema está documentado en [`docs/ESQUEMA-CATALOGO.md`](docs/ESQUEMA-CATALOGO.md) y lo valida `scripts/lib/catalogo-schema.mjs` antes de cada build: categorías, tramos de precio (S $190 · M $390 · L $590 · XL $890 · XXL desde $1.290), licencias permitidas (CC0, CC BY, CC BY-SA, CC BY-ND) y ausencia de marcas registradas.

Hoy tiene **8 productos de ejemplo** (`placeholder: true`, con ilustraciones, marcados "EJEMPLO" en la web y excluidos del sitemap). Para cargar el catálogo curado:

```bash
npm run importar-catalogo                     # desde el store del proyecto (produccion/catalogo/productos.json)
npm run importar-catalogo -- ruta/productos.json
```

El importador valida, copia las imágenes de `imagen.archivo` a `public/productos/` y reescribe `data/productos.json`. Si hay errores no toca nada.

## Tablero (`data/experimento.json`)

Todo lo "real" sale de las listas `real.gastos`, `real.cobros`, `real.costosDeCobro` y `real.aportesEnEspecie`; lo "estimado" se calcula con los supuestos de `estimado` (con su fuente). Para registrar un movimiento, agregar una entrada y hacer push:

```json
{ "fecha": "2026-10-22", "concepto": "Dragón flexi x2", "canal": "Instagram / WhatsApp", "medio": "transferencia", "monto": 780 }
```

Los aportes en especie usan `valor` en vez de `monto`: `{ "fecha": "...", "concepto": "Filamento PLA 200 g (padres)", "valor": 184 }`.

## Marca e imágenes

- `npm run generar-marca` — regenera logo, íconos, imagen OG e ilustraciones placeholder (`scripts/generar-marca.mjs`).
- `npm run generar-instagram` — regenera el kit de Instagram (`scripts/generar-instagram.mjs <carpeta>`).
- Tipografías: Russo One y Space Grotesk (SIL Open Font License, en `app/fonts/` y `scripts/fonts/`).
