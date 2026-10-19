"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductoCard } from "@/components/producto-card";
import { CATEGORIAS, buscar, precioDe, productos, type CategoriaId } from "@/lib/tienda";
import { cn } from "@/lib/utils";

type Orden = "destacados" | "precio-asc" | "precio-desc" | "nombre";

function leerUrl() {
  const sp = new URLSearchParams(window.location.search);
  const cat = sp.get("cat");
  return {
    cat: CATEGORIAS.some((c) => c.id === cat) ? (cat as CategoriaId) : null,
    q: sp.get("q") ?? "",
  };
}

export function Catalogo() {
  const [cat, setCat] = useState<CategoriaId | null>(null);
  const [q, setQ] = useState("");
  const [soloStock, setSoloStock] = useState(false);
  const [orden, setOrden] = useState<Orden>("destacados");

  useEffect(() => {
    const sync = () => {
      const u = leerUrl();
      setCat(u.cat);
      setQ(u.q);
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (cat) sp.set("cat", cat);
    else sp.delete("cat");
    if (q) sp.set("q", q);
    else sp.delete("q");
    const qs = sp.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
  }, [cat, q]);

  const conteo = useMemo(() => {
    const base = buscar(productos, q).filter((p) => !soloStock || p.disponibilidad === "stock");
    return Object.fromEntries(CATEGORIAS.map((c) => [c.id, base.filter((p) => p.categoria === c.id).length])) as Record<CategoriaId, number>;
  }, [q, soloStock]);

  const lista = useMemo(() => {
    const l = buscar(productos, q).filter((p) => (!cat || p.categoria === cat) && (!soloStock || p.disponibilidad === "stock"));
    const sorted = [...l];
    if (orden === "precio-asc") sorted.sort((a, b) => precioDe(a) - precioDe(b));
    else if (orden === "precio-desc") sorted.sort((a, b) => precioDe(b) - precioDe(a));
    else if (orden === "nombre") sorted.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    else sorted.sort((a, b) => Number(!!b.destacado) - Number(!!a.destacado) || Number(b.disponibilidad === "stock") - Number(a.disponibilidad === "stock"));
    return sorted;
  }, [cat, q, soloStock, orden]);

  const total = Object.values(conteo).reduce((a, b) => a + b, 0);

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar: dragón, deck box, torre, fidget…"
            className="h-11 bg-card pl-9 text-base"
            aria-label="Buscar en el catálogo"
          />
        </div>
        <label className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm font-bold">
          <input type="checkbox" checked={soloStock} onChange={(e) => setSoloStock(e.target.checked)} className="size-4 accent-[#C6FF3D]" />
          Solo en stock
        </label>
        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value as Orden)}
          className="h-11 rounded-lg border border-input bg-card px-3 text-sm font-bold"
          aria-label="Ordenar"
        >
          <option value="destacados">Destacados</option>
          <option value="precio-asc">Menor precio</option>
          <option value="precio-desc">Mayor precio</option>
          <option value="nombre">Nombre A–Z</option>
        </select>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" role="tablist" aria-label="Categorías">
        <button
          type="button"
          role="tab"
          aria-selected={cat === null}
          onClick={() => setCat(null)}
          className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition-colors", cat === null ? "border-critico bg-critico text-vacio" : "border-border bg-card hover:border-critico/60")}
        >
          Todo <span className="opacity-70">{total}</span>
        </button>
        {CATEGORIAS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={cat === c.id}
            onClick={() => setCat(cat === c.id ? null : c.id)}
            className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition-colors", cat === c.id ? "border-critico bg-critico text-vacio" : "border-border bg-card hover:border-critico/60")}
          >
            {c.nombre} <span className="opacity-70">{conteo[c.id]}</span>
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {lista.length} {lista.length === 1 ? "producto" : "productos"}
        {q ? ` para “${q}”` : ""}
      </p>

      {lista.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {lista.map((p) => (
            <ProductoCard key={p.id} p={p} />
          ))}
        </div>
      ) : (
        <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <p className="font-heading text-xl">Pifiaste la tirada</p>
          <p className="max-w-md text-sm text-muted-foreground">No encontramos nada con esos filtros. Probá otra palabra o escribinos: si existe un modelo con licencia libre, lo imprimimos.</p>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setCat(null);
              setSoloStock(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-bold hover:bg-secondary/70"
          >
            <X className="size-4" /> Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
