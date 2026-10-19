import Link from "next/link";
import { Clock, Palette, PenLine, ShieldCheck, Store, Truck } from "lucide-react";
import { Catalogo } from "@/components/catalogo";
import { Faq } from "@/components/faq";
import { WhatsappIcon } from "@/components/whatsapp-icon";
import { buttonVariants } from "@/components/ui/button";
import { CATEGORIAS, RECARGO_PERSONALIZACION, TRAMOS, asset, hayPlaceholders, negocio, pesos, productos, waLink } from "@/lib/tienda";
import { cn } from "@/lib/utils";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: negocio.nombre,
  description: "Impresión 3D friki: criaturas articuladas, accesorios gamer, rol, TCG y fidgets.",
  telephone: `+${negocio.whatsapp}`,
  areaServed: "Montevideo, Uruguay",
  address: { "@type": "PostalAddress", addressLocality: "Montevideo", addressRegion: "Montevideo", addressCountry: "UY" },
  priceRange: "$190–$1290+",
  currenciesAccepted: "UYU",
  paymentAccepted: "Transferencia bancaria, Mercado Pago",
};

export default function Home() {
  const enStock = productos.filter((p) => p.disponibilidad === "stock").length;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="capas relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-[1.15fr_1fr] md:py-20">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-neon/40 bg-neon/10 px-3 py-1 text-xs font-bold text-neon">
              Hecho capa por capa en Buceo, Montevideo
            </p>
            <h1 className="text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              Piezas frikis en 3D que sacan <span className="text-critico">20 natural</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Criaturas articuladas, accesorios para tu setup, torres de dados, deck boxes y fidgets. Multicolor sin recargo, desde {pesos(TRAMOS.S.precio)}.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="#catalogo" className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-xl px-6 text-base font-bold")}>
                Ver catálogo
              </Link>
              <a
                href={waLink("¡Hola Capa Crítica! Quiero hacer una consulta.")}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 rounded-xl border-border bg-transparent px-6 text-base font-bold")}
              >
                <WhatsappIcon className="size-5 text-[#25D366]" /> Escribinos
              </a>
            </div>
            <ul className="mt-8 grid max-w-xl grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <li className="flex items-center gap-2"><Store className="size-4 text-neon" /> {enStock} en stock</li>
              <li className="flex items-center gap-2"><Clock className="size-4 text-hielo" /> A pedido en 48–72 h</li>
              <li className="flex items-center gap-2"><Palette className="size-4 text-critico" /> Colores a elección</li>
            </ul>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute inset-6 rounded-full bg-critico/25 blur-3xl" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset("/icono.svg")} alt="" width={420} height={420} className="relative mx-auto w-3/4 rotate-6 drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {hayPlaceholders ? (
        <div className="border-b border-neon/30 bg-neon/10">
          <p className="mx-auto max-w-6xl px-4 py-3 text-sm text-neon">
            <strong>Catálogo en carga.</strong> Los productos marcados <strong>EJEMPLO</strong> son de muestra y usan ilustraciones, no fotos. Pronto subimos los modelos reales con fotos.
          </p>
        </div>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pt-12">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIAS.map((c, i) => (
            <Link
              key={c.id}
              href={`/?cat=${c.id}#catalogo`}
              className={cn(
                "rounded-2xl border border-border bg-card p-4 transition-colors hover:border-critico/60",
                i === CATEGORIAS.length - 1 && "col-span-2 sm:col-span-1",
              )}
            >
              <p className="font-heading text-base">{c.nombre}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.descripcion}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-3xl">Catálogo</h2>
          <p className="text-sm text-muted-foreground">Precio por tamaño de pieza · personalización +{pesos(RECARGO_PERSONALIZACION)}</p>
        </div>
        <Catalogo />
      </section>

      <section id="como-comprar" className="border-y border-border bg-noche/50">
        <div className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
          <h2 className="text-3xl">Cómo comprar</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              ["1", "Armá tu carrito", "Elegí piezas, color y, si querés, un nombre o gamertag (+$100)."],
              ["2", "Mandalo por WhatsApp", "El carrito arma el mensaje con el detalle y el total. Te confirmamos disponibilidad."],
              ["3", "Pagá", "Transferencia bancaria o link de Mercado Pago. Lo a pedido arranca con 50 % de seña."],
              ["4", "Retirá en Buceo", "Lo en stock, en el día. Lo a pedido, en 48–72 h. O coordinamos entrega en Montevideo."],
            ].map(([n, t, d]) => (
              <li key={n} className="rounded-2xl border border-border bg-card p-5">
                <span className="font-heading text-3xl text-critico">{n}</span>
                <p className="mt-2 font-bold">{t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>

          <h3 className="mt-14 text-2xl">Precios por tamaño</h3>
          <p className="mt-1 text-sm text-muted-foreground">El precio depende de cuánto material lleva la pieza. Multicolor sin recargo.</p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {(Object.keys(TRAMOS) as (keyof typeof TRAMOS)[]).map((t) => (
              <div key={t} className="rounded-2xl border border-border bg-card p-4 text-center">
                <p className="font-heading text-2xl">{t}</p>
                <p className="font-heading text-xl text-critico">{t === "XXL" ? "desde " : ""}{pesos(TRAMOS[t].precio)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{TRAMOS[t].gramos}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              [PenLine, "Personalizá", `Nombre, gamertag o el nombre de tu personaje en la pieza: +${pesos(RECARGO_PERSONALIZACION)}.`],
              [ShieldCheck, "Diseños con licencia", "Solo modelos con licencias Creative Commons que permiten vender impresiones. Citamos a cada autor."],
              [Truck, "Retiro y entrega", `Retiro en ${negocio.zona}. Entrega en Montevideo a coordinar.`],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof PenLine;
              return (
                <div key={t as string} className="flex gap-3 rounded-2xl border border-border p-4">
                  <I className="mt-0.5 size-5 shrink-0 text-neon" />
                  <div>
                    <p className="font-bold">{t as string}</p>
                    <p className="text-sm text-muted-foreground">{d as string}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="preguntas" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-14">
        <h2 className="text-3xl">Preguntas frecuentes</h2>
        <Faq />
      </section>
    </>
  );
}
