"use client";

import { formatCOP } from "@/lib/money";
import { cn } from "@/lib/cn";

/** Dona: proporción ingresos vs gastos sobre el total de movimientos (misma base que el resumen global). */
export function IncomeExpenseDonut({
  income,
  expense,
  className,
}: {
  income: number;
  expense: number;
  className?: string;
}) {
  const total = income + expense;
  const incomeDeg = total > 0 ? (income / total) * 360 : 0;

  const donutBg =
    total <= 0
      ? "conic-gradient(from -90deg, rgb(63 63 70) 0deg 360deg)"
      : `conic-gradient(from -90deg, rgb(52 211 153) 0deg ${incomeDeg}deg, rgb(251 113 133) ${incomeDeg}deg 360deg)`;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-5", className)}>
      <div className="relative mx-auto aspect-square w-[min(100%,11rem)] max-w-[176px]">
        <div
          className="h-full w-full rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
          style={{ background: donutBg }}
          aria-hidden
        />
        <div
          className="absolute left-1/2 top-1/2 flex h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-800/60 bg-zinc-950/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
          aria-hidden
        />
      </div>

      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]" />
          <span className="text-zinc-500">Ingresos</span>
          <span className="tabular-nums text-zinc-300">{formatCOP(income)}</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-400 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]" />
          <span className="text-zinc-500">Gastos</span>
          <span className="tabular-nums text-zinc-300">{formatCOP(expense)}</span>
        </li>
      </ul>
    </div>
  );
}
