import { cn } from "@/lib/utils";
import type { Producto } from "@/lib/tienda";

export function DisponibilidadBadge({ p, compacto = false }: { p: Producto; compacto?: boolean }) {
  const stock = p.disponibilidad === "stock";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap",
        stock ? "bg-neon/15 text-neon" : "bg-hielo/15 text-hielo",
      )}
    >
      <span className={cn("size-1.5 rounded-full", stock ? "bg-neon" : "bg-hielo")} aria-hidden />
      {stock ? (compacto ? "En stock" : `En stock${p.stock ? ` (${p.stock})` : ""} · retiro hoy`) : compacto ? "A pedido" : "A pedido · 48–72 h"}
    </span>
  );
}
