"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { claveItem, productoPorId, type ItemCarrito } from "@/lib/tienda";

const KEY = "capacritica:carrito:v1";
const EVENTO = "capacritica:carrito";
const VACIO: ItemCarrito[] = [];

let cache: { raw: string | null; items: ItemCarrito[] } = { raw: null, items: VACIO };

function leer(): ItemCarrito[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return VACIO;
  }
  if (raw === cache.raw) return cache.items;
  let items: ItemCarrito[] = VACIO;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      items = parsed.filter(
        (i): i is ItemCarrito =>
          i && typeof i.id === "string" && productoPorId(i.id) !== undefined && Number.isInteger(i.cantidad) && i.cantidad > 0 && typeof i.color === "string",
      );
    }
  } catch {
    items = VACIO;
  }
  cache = { raw, items };
  return items;
}

function escribir(items: ItemCarrito[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Modo privado o almacenamiento lleno: el carrito sigue en memoria hasta recargar.
    cache = { raw: JSON.stringify(items), items };
  }
  window.dispatchEvent(new Event(EVENTO));
}

function suscribir(cb: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener(EVENTO, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENTO, cb);
    window.removeEventListener("storage", onStorage);
  };
}

type Ctx = {
  items: ItemCarrito[];
  listo: boolean;
  agregar: (i: ItemCarrito) => void;
  cambiarCantidad: (clave: string, cantidad: number) => void;
  quitar: (clave: string) => void;
  vaciar: () => void;
};

const CarritoCtx = createContext<Ctx | null>(null);

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(suscribir, leer, () => VACIO);
  const listo = useSyncExternalStore(suscribir, () => true, () => false);

  const agregar = useCallback((nuevo: ItemCarrito) => {
    const actual = leer();
    const k = claveItem(nuevo);
    const existe = actual.find((i) => claveItem(i) === k);
    escribir(existe ? actual.map((i) => (claveItem(i) === k ? { ...i, cantidad: Math.min(99, i.cantidad + nuevo.cantidad) } : i)) : [...actual, nuevo]);
  }, []);
  const cambiarCantidad = useCallback((clave: string, cantidad: number) => {
    const c = Math.max(1, Math.min(99, Math.round(cantidad)));
    escribir(leer().map((i) => (claveItem(i) === clave ? { ...i, cantidad: c } : i)));
  }, []);
  const quitar = useCallback((clave: string) => escribir(leer().filter((i) => claveItem(i) !== clave)), []);
  const vaciar = useCallback(() => escribir([]), []);

  const value = useMemo(() => ({ items, listo, agregar, cambiarCantidad, quitar, vaciar }), [items, listo, agregar, cambiarCantidad, quitar, vaciar]);
  return <CarritoCtx.Provider value={value}>{children}</CarritoCtx.Provider>;
}

export function useCarrito() {
  const ctx = useContext(CarritoCtx);
  if (!ctx) throw new Error("useCarrito fuera de CarritoProvider");
  return ctx;
}
