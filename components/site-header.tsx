"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCarrito } from "@/components/carrito-provider";
import { asset } from "@/lib/tienda";

export function SiteHeader() {
  const { items, listo } = useCarrito();
  const n = items.reduce((a, i) => a + i.cantidad, 0);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-vacio/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Capa Crítica, inicio">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/logo.svg")} alt="Capa Crítica" width={220} height={36} className="h-8 w-auto sm:h-9" />
        </Link>
        <nav className="flex items-center gap-1 text-sm font-bold">
          <Link href="/#catalogo" className="hidden rounded-lg px-3 py-2 hover:bg-secondary sm:block">Catálogo</Link>
          <Link href="/#como-comprar" className="hidden rounded-lg px-3 py-2 hover:bg-secondary md:block">Cómo comprar</Link>
          <Link href="/#preguntas" className="hidden rounded-lg px-3 py-2 hover:bg-secondary md:block">Preguntas</Link>
          <Link
            href="/carrito/"
            className="relative ml-1 flex items-center gap-2 rounded-xl bg-critico px-3.5 py-2 text-vacio transition-colors hover:bg-critico/85"
            aria-label={`Carrito${listo ? `: ${n} ${n === 1 ? "pieza" : "piezas"}` : ""}`}
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">Carrito</span>
            <span className="grid min-w-5 place-items-center rounded-full bg-vacio px-1.5 text-xs text-neon" aria-hidden>
              {listo ? n : "·"}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
