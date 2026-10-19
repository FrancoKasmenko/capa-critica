# Esquema de `productos.json` — catálogo Capa Crítica (versión 1)

La web lee `data/productos.json` del repo. La versión curada vive en este store, en `produccion/catalogo/productos.json`, y se copia al repo con:

```bash
npm run importar-catalogo            # lee /cursor/stores/<id>/produccion/catalogo/productos.json
npm run importar-catalogo -- <ruta>  # o desde otra ruta
```

El script valida todo lo de este documento. Si algo no cumple, **no escribe nada** y lista los errores. También copia las imágenes locales (`imagen.archivo`) a `public/productos/`.

## Archivo

```json
{
  "version": 1,
  "actualizado": "2026-10-19",
  "productos": [ /* Producto[] */ ]
}
```

## Producto

| Campo | Tipo | Oblig. | Regla |
|---|---|---|---|
| `id` | string | sí | kebab-case, único, sin tildes (`dragon-flexi-cristal`). Es la URL de la ficha: `/producto/<id>/`. No cambiarlo una vez publicado. |
| `nombre` | string | sí | En español, ≤ 60 caracteres. Sin marcas ni personajes con licencia. |
| `categoria` | enum | sí | `anime-criaturas` · `gamer-setup` · `rol-mesa` · `tcg-cartas` · `fidgets-llaveros` |
| `descripcion` | string | sí | 1–3 frases, ≤ 300 caracteres. Qué es y para qué sirve. |
| `tramo` | enum | sí | `S` (≤30 g, $190) · `M` (30–80 g, $390) · `L` (80–150 g, $590) · `XL` (150–250 g, $890) · `XXL` (>250 g, desde $1.290) |
| `precio` | number | no | UYU entero. Si falta, se usa el del tramo. Solo para `XXL` puede ser > 1290 (p. ej. 1590). No usar para descuentos. |
| `gramos` | number | sí | Estimado del slicer o del autor, en gramos. Debe ser coherente con `tramo`. |
| `horasImpresion` | number | sí | Horas estimadas en la A1 (decimales permitidos: `2.5`). |
| `disponibilidad` | enum | sí | `stock` (entrega inmediata en Buceo) · `pedido` (48–72 h, 50 % de seña) |
| `stock` | number | no | Unidades impresas disponibles. Solo si `disponibilidad` = `stock`. |
| `colores` | string[] | sí | Colores sugeridos, en español (`["Verde", "Negro"]`). El cliente puede pedir otros sin recargo. |
| `multicolor` | boolean | no | `true` si el modelo luce con AMS (varios colores). Default `false`. |
| `personalizable` | boolean | no | `true` si admite nombre/gamertag (+$100). **Debe ser `false` si la licencia es `CC BY-ND`** (personalizar es una obra derivada). |
| `medidas` | string | no | Texto libre: `"12 × 4 × 3 cm"`, `"largo 25 cm"`. |
| `etiquetas` | string[] | no | Palabras para la búsqueda: `["dragón", "articulado", "flexi"]`. |
| `destacado` | boolean | no | Aparece primero en el catálogo. Usar con ≤ 12 productos. |
| `imagen` | objeto | sí | Ver abajo. |
| `autor` | objeto | sí | `{ "nombre": string, "url"?: string }` — nombre visible del diseñador y link a su perfil. |
| `modelo` | objeto | sí | `{ "plataforma": "MakerWorld" \| "Printables" \| "Thingiverse" \| "Propio" \| "Otro", "url": string }` — link a la página del modelo (para `Propio`, `url` puede ser `""`). |
| `licencia` | enum | sí | Solo `CC0` · `CC BY` · `CC BY-SA` · `CC BY-ND`. Cualquier otra (estándar, NC, "personal use") **se rechaza**. |
| `licenciaVersion` | string | no | `"4.0"`, `"3.0"`. |
| `licenciaVerificada` | string | sí | Fecha `AAAA-MM-DD` en que se vio la licencia en la página del modelo. |
| `placeholder` | boolean | no | `true` solo en los ejemplos de muestra. El catálogo curado **no** debe usarlo. |

### `imagen`

| Campo | Tipo | Oblig. | Regla |
|---|---|---|---|
| `archivo` | string | uno de los dos | Ruta relativa a `produccion/catalogo/` (`"imagenes/dragon-flexi-cristal.webp"`). **Preferido**: MakerWorld y otros bloquean el hotlink. jpg/png/webp, ≤ 400 KB, idealmente cuadrada ≥ 800 px. |
| `url` | string | uno de los dos | URL https absoluta a la imagen, si no se descargó. También se acepta `/productos/<archivo>` para imágenes que ya están en `public/productos/` del repo. |
| `alt` | string | sí | Descripción corta para accesibilidad. |
| `tipo` | enum | sí | `render-autor` · `foto-autor` · `foto-propia` · `placeholder`. La web muestra "Imagen del autor" en los dos primeros. |

## Ejemplo completo

```json
{
  "id": "dragon-flexi-cristal",
  "nombre": "Dragón flexi cristal",
  "categoria": "anime-criaturas",
  "descripcion": "Dragón articulado que se imprime de una pieza y se mueve como una serpiente. Ideal para el escritorio o de regalo.",
  "tramo": "M",
  "gramos": 45,
  "horasImpresion": 2.5,
  "disponibilidad": "stock",
  "stock": 2,
  "colores": ["Violeta", "Celeste"],
  "multicolor": true,
  "personalizable": false,
  "medidas": "largo 28 cm",
  "etiquetas": ["dragón", "articulado", "flexi", "fidget"],
  "destacado": true,
  "imagen": { "archivo": "imagenes/dragon-flexi-cristal.webp", "alt": "Dragón flexi violeta enroscado", "tipo": "render-autor" },
  "autor": { "nombre": "NombreDelAutor", "url": "https://makerworld.com/es/@autor" },
  "modelo": { "plataforma": "MakerWorld", "url": "https://makerworld.com/es/models/000000" },
  "licencia": "CC BY",
  "licenciaVersion": "4.0",
  "licenciaVerificada": "2026-10-20"
}
```

## Reglas de curaduría (resumen de `docs/investigacion-y-decision.md` §P.11)

- Reparto objetivo de los 200: Anime y criaturas 60 · Gamer y setup 40 · Rol y mesa 40 · TCG y cartas 30 · Fidgets y llaveros 30.
- Nada de personajes, logos ni nombres con marca (Pokémon, Nintendo, Marvel, PlayStation, anime con licencia…), tampoco en `nombre`, `etiquetas` ni `descripcion`.
- TCG = **accesorios** (deck boxes, contadores, tokens, separadores). Nunca cartas.
- ~15–20 productos en `stock`; el resto `pedido`.
- Guardar una captura de la licencia de cada modelo (sugerido: `produccion/catalogo/licencias/<id>.png`).
