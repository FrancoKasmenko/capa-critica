"use client";

import { useState } from "react";
import Link from "next/link";
import { Banknote, Copy, Check, Minus, Plus, Trash2, Wallet } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCarrito } from "@/components/carrito-provider";
import { WhatsappIcon } from "@/components/whatsapp-icon";
import { claveItem, imagenDe, mensajeWhatsapp, negocio, pesos, resumen, waLink, type DatosCheckout } from "@/lib/tienda";
import { cn } from "@/lib/utils";

function Opcion<T extends string>({ value, actual, onChange, children }: { value: T; actual: T; onChange: (v: T) => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={actual === value}
      onClick={() => onChange(value)}
      className={cn(
        "flex items-start gap-2 rounded-xl border-2 p-3 text-left text-sm transition-colors",
        actual === value ? "border-critico bg-critico/10" : "border-border bg-card hover:border-critico/50",
      )}
    >
      {children}
    </button>
  );
}

export function CarritoVista() {
  const { items, listo, cambiarCantidad, quitar, vaciar } = useCarrito();
  const [datos, setDatos] = useState<DatosCheckout>({ nombre: "", entrega: "retiro", pago: "transferencia", nota: "" });
  const [copiado, setCopiado] = useState(false);
  const r = resumen(items);
  const mensaje = mensajeWhatsapp(items, datos);
  const link = waLink(mensaje);

  if (!listo) {
    return <div className="mt-8 h-64 animate-pulse rounded-3xl bg-card" aria-label="Cargando carrito" />;
  }

  if (!r.lineas.length) {
    return (
      <div className="mt-8 grid place-items-center gap-4 rounded-3xl border border-dashed border-border px-6 py-16 text-center">
        <p className="font-heading text-2xl">Tu carrito está vacío</p>
        <p className="max-w-sm text-muted-foreground">Elegí criaturas, dados, deck boxes o fidgets y armamos tu pedido.</p>
        <Link href="/#catalogo" className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-xl px-6 font-bold")}>Ver catálogo</Link>
      </div>
    );
  }

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(mensaje);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
      <div className="grid gap-3">
        <ul className="grid gap-3">
          {r.lineas.map(({ item, producto, unitario, subtotal }) => {
            const k = claveItem(item);
            const aPedido = producto.disponibilidad === "pedido" || !!item.personalizacion;
            return (
              <li key={k} className="flex gap-3 rounded-2xl border border-border bg-card p-3 sm:gap-4 sm:p-4">
                <Link href={`/producto/${producto.id}/`} className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagenDe(producto)} alt={producto.imagen.alt} className="size-20 rounded-xl object-cover sm:size-24" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/producto/${producto.id}/`} className="font-bold leading-snug hover:text-critico">
                      {producto.nombre}
                      {producto.placeholder ? <span className="ml-1.5 rounded bg-neon px-1.5 py-0.5 align-middle text-[10px] text-vacio">EJEMPLO</span> : null}
                    </Link>
                    <button type="button" onClick={() => quitar(k)} className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive" aria-label={`Quitar ${producto.nombre}`}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tamaño {producto.tramo} · Color: {item.color}
                    {item.personalizacion ? ` · “${item.personalizacion}” (+$100)` : ""}
                  </p>
                  <p className={cn("text-xs font-bold", aPedido ? "text-hielo" : "text-neon")}>{aPedido ? "A pedido · 48–72 h" : "En stock"}</p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                    <div className="flex h-9 items-center rounded-lg border border-border">
                      <button type="button" onClick={() => (item.cantidad > 1 ? cambiarCantidad(k, item.cantidad - 1) : quitar(k))} className="grid size-9 place-items-center hover:text-critico" aria-label="Restar uno">
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm font-bold">{item.cantidad}</span>
                      <button type="button" onClick={() => cambiarCantidad(k, item.cantidad + 1)} className="grid size-9 place-items-center hover:text-critico" aria-label="Sumar uno">
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <p className="text-right">
                      <span className="block text-xs text-muted-foreground">{item.cantidad} × {pesos(unitario)}</span>
                      <span className="font-heading text-lg">{pesos(subtotal)}</span>
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex justify-between">
          <Link href="/#catalogo" className="text-sm font-bold text-neon underline-offset-4 hover:underline">← Seguir comprando</Link>
          <button type="button" onClick={vaciar} className="text-sm text-muted-foreground underline-offset-4 hover:text-destructive hover:underline">Vaciar carrito</button>
        </div>
      </div>

      <aside className="grid gap-4 lg:sticky lg:top-24">
        <div className="grid gap-4 rounded-3xl border border-border bg-card p-5">
          <div className="grid gap-1.5">
            <Label htmlFor="nombre">Tu nombre</Label>
            <Input id="nombre" value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value.slice(0, 60) })} placeholder="Para saber con quién hablamos" className="h-11 bg-background" autoComplete="name" />
          </div>
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-bold">Entrega</legend>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Entrega">
              <Opcion value="retiro" actual={datos.entrega} onChange={(v) => setDatos({ ...datos, entrega: v })}>
                <span><span className="block font-bold">Retiro en Buceo</span><span className="text-xs text-muted-foreground">Sin costo</span></span>
              </Opcion>
              <Opcion value="coordinar" actual={datos.entrega} onChange={(v) => setDatos({ ...datos, entrega: v })}>
                <span><span className="block font-bold">Coordinar entrega</span><span className="text-xs text-muted-foreground">Montevideo, envío a tu cargo</span></span>
              </Opcion>
            </div>
          </fieldset>
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-bold">Pago</legend>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Pago">
              <Opcion value="transferencia" actual={datos.pago} onChange={(v) => setDatos({ ...datos, pago: v })}>
                <Banknote className="mt-0.5 size-4 shrink-0 text-neon" />
                <span className="font-bold">Transferencia</span>
              </Opcion>
              <Opcion value="mercadopago" actual={datos.pago} onChange={(v) => setDatos({ ...datos, pago: v })}>
                <Wallet className="mt-0.5 size-4 shrink-0 text-hielo" />
                <span className="font-bold">Link de Mercado Pago</span>
              </Opcion>
            </div>
            <p className="text-xs text-muted-foreground">
              {datos.pago === "transferencia"
                ? "Al confirmar el pedido te pasamos por WhatsApp los datos de la cuenta bancaria. Nos mandás el comprobante y listo."
                : "Al confirmar el pedido te mandamos por WhatsApp un link de Mercado Pago para pagar con tarjeta, débito o dinero en cuenta."}
            </p>
          </fieldset>
          <div className="grid gap-1.5">
            <Label htmlFor="nota">Nota (opcional)</Label>
            <Textarea id="nota" value={datos.nota} onChange={(e) => setDatos({ ...datos, nota: e.target.value.slice(0, 300) })} placeholder="Ej.: es para regalo, lo necesito para el sábado" rows={2} className="bg-background" />
          </div>
        </div>

        <div className="rounded-3xl border border-critico/40 bg-noche p-5">
          <dl className="grid gap-1.5 text-sm">
            {r.enStock > 0 ? <div className="flex justify-between"><dt className="text-muted-foreground">En stock</dt><dd>{pesos(r.enStock)}</dd></div> : null}
            {r.aPedido > 0 ? <div className="flex justify-between"><dt className="text-muted-foreground">A pedido (48–72 h)</dt><dd>{pesos(r.aPedido)}</dd></div> : null}
            <div className="mt-2 flex items-end justify-between border-t border-border pt-3">
              <dt className="font-bold">Total</dt>
              <dd className="font-heading text-3xl text-critico" aria-live="polite">{pesos(r.total)}</dd>
            </div>
          </dl>
          {r.aPedido > 0 ? (
            <p className="mt-3 rounded-xl bg-hielo/10 p-3 text-xs text-hielo">
              Para arrancar lo que es a pedido pedimos una seña del 50 %: <strong>{pesos(r.sena)}</strong>. El resto lo pagás al retirar.
            </p>
          ) : null}
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-base font-bold text-vacio transition-colors hover:bg-[#1fbe5b]"
          >
            <WhatsappIcon className="size-5" /> Enviar pedido por WhatsApp
          </a>
          <Button type="button" variant="ghost" onClick={copiar} className="mt-2 w-full text-xs text-muted-foreground">
            {copiado ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {copiado ? "Mensaje copiado" : `Copiar mensaje (para mandarlo a ${negocio.whatsappVisible})`}
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">Se abre WhatsApp con el pedido escrito. Nada se cobra hasta que lo confirmemos.</p>
        </div>

        <details className="rounded-2xl border border-border bg-card p-4 text-sm">
          <summary className="cursor-pointer font-bold">Ver el mensaje que se envía</summary>
          <pre className="mt-3 max-h-72 overflow-auto font-sans text-xs whitespace-pre-wrap text-muted-foreground">{mensaje}</pre>
        </details>
      </aside>
    </div>
  );
}
