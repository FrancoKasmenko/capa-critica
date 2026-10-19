import type { Metadata } from "next";
import { CarritoVista } from "@/components/carrito-vista";

export const metadata: Metadata = {
  title: "Carrito",
  description: "Revisá tu pedido y mandalo por WhatsApp a Capa Crítica.",
  robots: { index: false },
};

export default function CarritoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl">Tu carrito</h1>
      <CarritoVista />
    </div>
  );
}
