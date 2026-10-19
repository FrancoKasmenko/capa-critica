"use client";

import { useSyncExternalStore } from "react";

const DIA = 86_400_000;
const montevideoHoy = () => {
  const s = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Montevideo" }).format(new Date());
  return Date.parse(`${s}T00:00:00Z`);
};

export function DiaExperimento({ inicio, fin }: { inicio: string; fin: string }) {
  const hoy = useSyncExternalStore(() => () => {}, montevideoHoy, () => null);
  const ini = Date.parse(`${inicio}T00:00:00Z`);
  const total = Math.round((Date.parse(`${fin}T00:00:00Z`) - ini) / DIA) + 1;
  if (hoy === null) return <span className="font-heading text-4xl">–</span>;
  const dia = Math.floor((hoy - ini) / DIA) + 1;
  const texto = dia < 1 ? "Empieza pronto" : dia > total ? "Terminado" : `Día ${dia}`;
  return (
    <span>
      <span className="font-heading text-4xl">{texto}</span>
      <span className="ml-2 text-sm text-muted-foreground">de {total}</span>
    </span>
  );
}
