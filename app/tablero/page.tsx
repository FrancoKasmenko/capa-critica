import type { Metadata } from "next";
import datos from "@/data/experimento.json";
import { DiaExperimento } from "@/components/dia-experimento";
import { Progress } from "@/components/ui/progress";
import { pesos } from "@/lib/tienda";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tablero del experimento",
  robots: { index: false, follow: false },
};

type Movimiento = { fecha: string; concepto: string; monto: number; canal?: string; medio?: string };
type Aporte = { fecha: string; concepto: string; valor: number; nota?: string };

const real = datos.real as { gastos: Movimiento[]; cobros: Movimiento[]; costosDeCobro: Movimiento[]; aportesEnEspecie: Aporte[] };
const suma = (l: { monto: number }[]) => l.reduce((a, m) => a + m.monto, 0);
const fecha = (iso: string) => iso.split("-").reverse().join("/");

function Tarjeta({ titulo, valor, nota, tono = "real", destacado = false }: { titulo: string; valor: string; nota?: string; tono?: "real" | "estimado"; destacado?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-4", tono === "estimado" ? "border-dashed border-hielo/50 bg-hielo/5" : "border-border bg-card", destacado && "border-critico/60")}>
      <p className="flex items-center justify-between gap-2 text-xs font-bold text-muted-foreground">
        {titulo}
        <span className={cn("rounded px-1.5 py-0.5 text-[10px] uppercase", tono === "estimado" ? "bg-hielo/15 text-hielo" : "bg-neon/15 text-neon")}>{tono}</span>
      </p>
      <p className={cn("mt-1 font-heading text-3xl", destacado && "text-critico")}>{valor}</p>
      {nota ? <p className="mt-1 text-xs text-muted-foreground">{nota}</p> : null}
    </div>
  );
}

export default function Tablero() {
  const gastado = suma(real.gastos);
  const restante = datos.presupuesto - gastado;
  const cobrado = suma(real.cobros);
  const costosCobro = suma(real.costosDeCobro);
  const aportes = real.aportesEnEspecie.reduce((a, m) => a + m.valor, 0);
  const costosTotales = gastado + costosCobro + aportes;
  const beneficio = cobrado - costosTotales;
  const faltante = Math.max(0, datos.meta - cobrado);
  const piezasFaltantes = Math.ceil(faltante / datos.estimado.precioMedioPieza);
  const avance = Math.min(100, Math.round((cobrado / datos.meta) * 100));
  const porEstado = datos.prospectos.reduce<Record<string, number>>((a, p) => ((a[p.estado] = (a[p.estado] ?? 0) + 1), a), {});
  const cobradoPorCanal = (canal: string) => suma(real.cobros.filter((c) => c.canal === canal));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-wide text-gris uppercase">Experimento {datos.negocio}</p>
          <h1 className="text-3xl sm:text-4xl">Tablero</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {fecha(datos.inicio)} → {fecha(datos.fin)} · Datos actualizados el {fecha(datos.actualizado)} (data/experimento.json)
          </p>
        </div>
        <DiaExperimento inicio={datos.inicio} fin={datos.fin} />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <p className="font-bold">Cobrado real hacia la meta de {pesos(datos.meta)}</p>
          <p className="font-heading text-2xl"><span className="text-critico">{pesos(cobrado)}</span> <span className="text-sm text-muted-foreground">({avance} %)</span></p>
        </div>
        <Progress value={avance} className="mt-3 [&_[data-slot=progress-indicator]]:bg-critico [&_[data-slot=progress-track]]:h-3" />
      </div>

      <h2 className="mt-10 text-xl">Real</h2>
      <p className="text-xs text-muted-foreground">Solo movimientos registrados con comprobante o confirmados por Franco.</p>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tarjeta titulo="Presupuesto" valor={pesos(datos.presupuesto)} nota="Tope de gasto en efectivo" />
        <Tarjeta titulo="Gastado" valor={pesos(gastado)} nota={`${real.gastos.length} gastos`} />
        <Tarjeta titulo="Restante" valor={pesos(restante)} nota={restante < 0 ? "¡Presupuesto excedido!" : "Del presupuesto"} />
        <Tarjeta titulo="Cobrado" valor={pesos(cobrado)} nota={`${real.cobros.length} cobros`} destacado />
        <Tarjeta titulo="Comisiones de cobro" valor={pesos(costosCobro)} nota="Mercado Pago / MercadoLibre" />
        <Tarjeta titulo="Aportes en especie" valor={pesos(aportes)} nota="Filamento, luz, etc. valuados" />
        <Tarjeta titulo="Costos totales" valor={pesos(costosTotales)} nota="Gastos + comisiones + aportes" />
        <Tarjeta titulo="Faltante para la meta" valor={pesos(faltante)} />
      </div>

      <h2 className="mt-10 text-xl">Estimado</h2>
      <p className="text-xs text-muted-foreground">Cálculos sobre supuestos del informe; no son dinero cobrado.</p>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tarjeta tono="estimado" titulo="Beneficio estimado" valor={pesos(beneficio)} nota="Cobrado − costos totales (aportes valuados a precio de mercado)" />
        <Tarjeta tono="estimado" titulo="Ventas faltantes" valor={`≈ ${piezasFaltantes} piezas`} nota={`A ${pesos(datos.estimado.precioMedioPieza)} c/u. ${datos.estimado.fuentePrecioMedio}`} />
        <div className="col-span-2 rounded-2xl border border-dashed border-hielo/50 bg-hielo/5 p-4">
          <p className="text-xs font-bold text-muted-foreground">Meta por canal (estimado) vs cobrado real</p>
          <ul className="mt-2 grid gap-1.5 text-sm">
            {datos.estimado.metaPorCanal.map((c) => (
              <li key={c.canal} className="flex justify-between gap-2">
                <span>{c.canal}</span>
                <span className="whitespace-nowrap"><span className="text-neon">{pesos(cobradoPorCanal(c.canal))}</span> / {pesos(c.monto)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-muted-foreground">Fuente: {datos.estimado.fuenteMetaPorCanal}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {datos.estimado.controles.map((c) => {
          const ok = cobrado >= c.minimoCobrado;
          return (
            <div key={c.dia} className="rounded-2xl border border-border bg-card p-4 text-sm">
              <p className="font-bold">Control día {c.dia} ({fecha(c.fecha)}): mínimo {pesos(c.minimoCobrado)}</p>
              <p className={cn("mt-1 text-xs font-bold", ok ? "text-neon" : "text-muted-foreground")}>{ok ? "Alcanzado" : `Faltan ${pesos(c.minimoCobrado - cobrado)}`}</p>
              <p className="mt-1 text-xs text-muted-foreground">Si no se alcanza: {c.siNo}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-xl">Movimientos reales</h2>
          {real.gastos.length + real.cobros.length + real.costosDeCobro.length + real.aportesEnEspecie.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Todavía no hay movimientos registrados.</p>
          ) : (
            <ul className="mt-3 grid gap-2 text-sm">
              {[
                ...real.cobros.map((m) => ({ ...m, tipo: "Cobro", signo: 1 })),
                ...real.gastos.map((m) => ({ ...m, tipo: "Gasto", signo: -1 })),
                ...real.costosDeCobro.map((m) => ({ ...m, tipo: "Comisión", signo: -1 })),
                ...real.aportesEnEspecie.map((m) => ({ fecha: m.fecha, concepto: m.concepto, monto: m.valor, tipo: "Aporte", signo: -1 })),
              ]
                .sort((a, b) => b.fecha.localeCompare(a.fecha))
                .map((m, i) => (
                  <li key={i} className="flex justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2">
                    <span><span className="text-xs text-muted-foreground">{fecha(m.fecha)} · {m.tipo}</span><br />{m.concepto}</span>
                    <span className={cn("font-bold", m.signo > 0 ? "text-neon" : "text-critico")}>{m.signo > 0 ? "+" : "−"}{pesos(m.monto)}</span>
                  </li>
                ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-xl">Prospectos ({datos.prospectos.length})</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {Object.entries(porEstado).map(([e, n]) => `${n} ${e}`).join(" · ")}
          </p>
          <ul className="mt-3 grid gap-2 text-sm">
            {datos.prospectos.map((p) => (
              <li key={p.nombre} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2">
                <span>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-bold hover:text-hielo">{p.nombre}</a>
                  <span className="block text-xs text-muted-foreground">{p.tipo}</span>
                </span>
                <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold">{p.estado}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl">Próximas acciones</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {datos.proximasAcciones.map((a) => (
              <li key={a.accion} className="rounded-xl border border-border bg-card px-3 py-2">
                {a.accion}
                <span className="block text-xs text-muted-foreground">{a.responsable} · {/^\d{4}-/.test(a.fecha) ? fecha(a.fecha) : a.fecha}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl">Requieren a Franco</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {datos.accionesUsuario.map((a) => (
              <li key={a.accion} className="flex items-start justify-between gap-3 rounded-xl border border-critico/40 bg-critico/5 px-3 py-2">
                <span>{a.accion}</span>
                <span className="shrink-0 rounded-full bg-critico/20 px-2 py-0.5 text-[11px] font-bold text-critico">{a.estado}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
