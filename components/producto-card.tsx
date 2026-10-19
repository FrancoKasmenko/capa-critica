import Link from "next/link";
import { categoria, imagenDe, pesos, precioDe, type Producto } from "@/lib/tienda";
import { DisponibilidadBadge } from "@/components/disponibilidad-badge";

export function ProductoCard({ p }: { p: Producto }) {
  return (
    <Link
      href={`/producto/${p.id}/`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-critico/60 hover:shadow-[0_8px_30px_-12px_rgba(255,61,110,.45)] focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
    >
      <div className="relative aspect-square overflow-hidden bg-noche">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagenDe(p)} alt={p.imagen.alt} loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        <span className="absolute top-2 left-2 rounded-md bg-vacio/85 px-2 py-0.5 text-[11px] font-bold">{p.tramo}</span>
        {p.placeholder ? <span className="absolute top-2 right-2 rounded-md bg-neon px-2 py-0.5 text-[11px] font-bold text-vacio">EJEMPLO</span> : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <p className="text-[11px] font-bold tracking-wide text-gris uppercase">{categoria(p.categoria)?.corto}</p>
        <h3 className="text-sm leading-snug sm:text-base">{p.nombre}</h3>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="font-heading text-lg text-critico">
            {p.tramo === "XXL" && !p.precio ? "desde " : ""}
            {pesos(precioDe(p))}
          </span>
          <DisponibilidadBadge p={p} compacto />
        </div>
      </div>
    </Link>
  );
}
