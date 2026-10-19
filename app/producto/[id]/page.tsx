import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { AgregarAlCarrito } from "@/components/agregar-al-carrito";
import { DisponibilidadBadge } from "@/components/disponibilidad-badge";
import { ProductoCard } from "@/components/producto-card";
import { TRAMOS, categoria, imagenDe, licenciaUrl, pesos, precioDe, productoPorId, productos } from "@/lib/tienda";

export const dynamicParams = false;

export function generateStaticParams() {
  return productos.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = productoPorId(id);
  if (!p) return {};
  const desc = `${p.descripcion} ${pesos(precioDe(p))} · ${p.disponibilidad === "stock" ? "En stock" : "A pedido en 48–72 h"} · Retiro en Buceo.`;
  return {
    title: p.nombre,
    description: desc,
    alternates: { canonical: `/producto/${p.id}/` },
    openGraph: { title: `${p.nombre} · Capa Crítica`, description: desc, images: [{ url: imagenDe(p), alt: p.imagen.alt }] },
    robots: p.placeholder ? { index: false } : undefined,
  };
}

const textoImagen: Record<string, string> = {
  "render-autor": "Imagen: render del autor del modelo",
  "foto-autor": "Imagen: foto del autor del modelo",
  "foto-propia": "Foto de nuestra impresión",
  placeholder: "Ilustración de ejemplo, no es foto del producto",
};

export default async function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = productoPorId(id);
  if (!p) notFound();
  const cat = categoria(p.categoria);
  const relacionados = productos.filter((o) => o.categoria === p.categoria && o.id !== p.id).slice(0, 4);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.nombre,
    description: p.descripcion,
    category: cat?.nombre,
    image: imagenDe(p),
    brand: { "@type": "Brand", name: "Capa Crítica" },
    offers: {
      "@type": "Offer",
      priceCurrency: "UYU",
      price: precioDe(p),
      availability: p.disponibilidad === "stock" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      {!p.placeholder ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
      <Link href={`/?cat=${p.categoria}#catalogo`} className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> {cat?.nombre}
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2 md:gap-12">
        <figure>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-noche">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagenDe(p)} alt={p.imagen.alt} className="aspect-square w-full object-cover" />
            {p.placeholder ? <span className="absolute top-3 right-3 rounded-md bg-neon px-2 py-1 text-xs font-bold text-vacio">EJEMPLO</span> : null}
          </div>
          <figcaption className="mt-2 text-xs text-muted-foreground">{textoImagen[p.imagen.tipo]}</figcaption>
        </figure>

        <div>
          <p className="text-xs font-bold tracking-wide text-gris uppercase">{cat?.nombre}</p>
          <h1 className="mt-1 text-3xl leading-tight sm:text-4xl">{p.nombre}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="font-heading text-3xl text-critico">
              {p.tramo === "XXL" && !p.precio ? "desde " : ""}
              {pesos(precioDe(p))}
            </span>
            <span className="rounded-md border border-border px-2 py-0.5 text-xs font-bold">Tamaño {p.tramo} · {TRAMOS[p.tramo].gramos}</span>
            <DisponibilidadBadge p={p} />
          </div>
          <p className="mt-5 text-muted-foreground">{p.descripcion}</p>

          <AgregarAlCarrito producto={p} />

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 rounded-2xl border border-border p-5 text-sm">
            {p.medidas ? (<><dt className="text-muted-foreground">Medidas</dt><dd className="font-bold">{p.medidas}</dd></>) : null}
            <dt className="text-muted-foreground">Material</dt><dd className="font-bold">PLA{p.multicolor ? " multicolor" : ""}</dd>
            <dt className="text-muted-foreground">Peso aprox.</dt><dd className="font-bold">{p.gramos} g</dd>
            <dt className="text-muted-foreground">Impresión</dt><dd className="font-bold">≈ {p.horasImpresion.toLocaleString("es-UY")} h</dd>
            <dt className="text-muted-foreground">Entrega</dt>
            <dd className="font-bold">{p.disponibilidad === "stock" ? "En el día (retiro en Buceo)" : "48–72 h · seña 50 %"}</dd>
          </dl>

          <div className="mt-4 rounded-2xl border border-border bg-card p-5 text-sm">
            <p className="font-bold">Diseño y licencia</p>
            <p className="mt-2 text-muted-foreground">
              Diseño de{" "}
              {p.autor.url ? (
                <a href={p.autor.url} target="_blank" rel="noopener noreferrer" className="font-bold text-hielo underline-offset-4 hover:underline">{p.autor.nombre}</a>
              ) : (
                <span className="font-bold text-foreground">{p.autor.nombre}</span>
              )}
              {p.modelo.url ? (
                <>
                  {" "}·{" "}
                  <a href={p.modelo.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-hielo underline-offset-4 hover:underline">
                    modelo original en {p.modelo.plataforma} <ExternalLink className="size-3" />
                  </a>
                </>
              ) : null}
            </p>
            <p className="mt-1 text-muted-foreground">
              Licencia{" "}
              <a href={licenciaUrl(p)} target="_blank" rel="noopener noreferrer" className="font-bold text-hielo underline-offset-4 hover:underline">
                {p.licencia}{p.licencia !== "CC0" ? ` ${p.licenciaVersion ?? "4.0"}` : ""}
              </a>{" "}
              (verificada el {p.licenciaVerificada.split("-").reverse().join("/")}). Vendemos la impresión; el diseño sigue siendo de su autor.
            </p>
          </div>
        </div>
      </div>

      {relacionados.length ? (
        <section className="mt-16">
          <h2 className="text-2xl">Más de {cat?.nombre}</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {relacionados.map((o) => (
              <ProductoCard key={o.id} p={o} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
