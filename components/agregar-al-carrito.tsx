"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCarrito } from "@/components/carrito-provider";
import { RECARGO_PERSONALIZACION, pesos, precioDe, type Producto } from "@/lib/tienda";
import { cn } from "@/lib/utils";

const OTRO = "__otro__";

export function AgregarAlCarrito({ producto: p }: { producto: Producto }) {
  const { agregar } = useCarrito();
  const [color, setColor] = useState(p.colores[0]);
  const [otroColor, setOtroColor] = useState("");
  const [personalizar, setPersonalizar] = useState(false);
  const [texto, setTexto] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const [error, setError] = useState("");

  const unit = precioDe(p) + (personalizar ? RECARGO_PERSONALIZACION : 0);

  const onAgregar = () => {
    const colorFinal = color === OTRO ? otroColor.trim() : color;
    if (!colorFinal) return setError("Escribí el color que querés.");
    if (personalizar && !texto.trim()) return setError("Escribí el texto para personalizar o destildá la opción.");
    setError("");
    agregar({ id: p.id, cantidad, color: colorFinal, personalizacion: personalizar ? texto.trim() : undefined });
    setAgregado(true);
  };

  return (
    <div className="mt-6 grid gap-5">
      <fieldset>
        <legend className="mb-2 text-sm font-bold">Color</legend>
        <div className="flex flex-wrap gap-2">
          {[...p.colores, OTRO].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={color === c}
              onClick={() => {
                setColor(c);
                setAgregado(false);
              }}
              className={cn(
                "rounded-xl border-2 px-3 py-2 text-sm font-bold transition-colors",
                color === c ? "border-critico bg-critico/15" : "border-border bg-card hover:border-critico/50",
              )}
            >
              {c === OTRO ? "Otro color" : c}
            </button>
          ))}
        </div>
        {color === OTRO ? (
          <Input value={otroColor} onChange={(e) => setOtroColor(e.target.value.slice(0, 40))} placeholder="Ej.: dorado y negro" className="mt-2 h-11 bg-card" aria-label="Color a elección" />
        ) : null}
        <p className="mt-1.5 text-xs text-muted-foreground">Cualquier color o combinación, sin recargo.</p>
      </fieldset>

      {p.personalizable ? (
        <div className="rounded-2xl border border-border p-4">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-bold">
            <input
              type="checkbox"
              checked={personalizar}
              onChange={(e) => {
                setPersonalizar(e.target.checked);
                setAgregado(false);
              }}
              className="size-4 accent-[#FF3D6E]"
            />
            Personalizar con nombre o gamertag (+{pesos(RECARGO_PERSONALIZACION)})
          </label>
          {personalizar ? (
            <div className="mt-3 grid gap-1.5">
              <Label htmlFor="pers">Texto (hasta 16 caracteres)</Label>
              <Input id="pers" value={texto} onChange={(e) => setTexto(e.target.value.slice(0, 16))} placeholder="Ej.: xXDarkMageXx" className="h-11 bg-card" />
              <p className="text-xs text-muted-foreground">Las piezas personalizadas se hacen a pedido (48–72 h, seña 50 %).</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-12 items-center rounded-xl border border-border bg-card">
          <button type="button" onClick={() => setCantidad((c) => Math.max(1, c - 1))} className="grid size-12 place-items-center hover:text-critico" aria-label="Restar uno">
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center font-bold" aria-live="polite" aria-label={`Cantidad ${cantidad}`}>{cantidad}</span>
          <button type="button" onClick={() => setCantidad((c) => Math.min(20, c + 1))} className="grid size-12 place-items-center hover:text-critico" aria-label="Sumar uno">
            <Plus className="size-4" />
          </button>
        </div>
        <Button onClick={onAgregar} className="h-12 flex-1 rounded-xl text-base font-bold sm:flex-none sm:px-8">
          {agregado ? <Check className="size-5" /> : <ShoppingBag className="size-5" />}
          {agregado ? "Agregado" : `Agregar · ${pesos(unit * cantidad)}`}
        </Button>
      </div>
      {error ? <p className="text-sm font-bold text-destructive" role="alert">{error}</p> : null}
      {agregado ? (
        <p className="text-sm" role="status">
          Listo, está en tu carrito.{" "}
          <Link href="/carrito/" className="font-bold text-neon underline-offset-4 hover:underline">Ir al carrito y enviar el pedido →</Link>
        </p>
      ) : null}
    </div>
  );
}
