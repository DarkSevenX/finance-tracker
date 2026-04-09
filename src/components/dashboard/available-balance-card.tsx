import { Wallet } from "lucide-react";
import { formatCOP } from "@/lib/money";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";

/** `true`: anillo alrededor del icono + halos de fondo. `false`: tarjeta más sobria (solo icono y datos). */
const SHOW_AVAILABLE_BALANCE_EXTRAS = true;

/** A partir de este % gastado (respecto al ingreso), la barra y el número pasan a tonos rojizos. */
const SPENT_RED_FROM_PCT = 90;

const RING_R = 22;
const RING_C = 2 * Math.PI * RING_R;

/** Gasto respecto al ingreso histórico: gastos / ingresos (puede superar 100%). */
function spentShare(income: number, expense: number): {
  pctRaw: number;
  barWidth: number;
  label: string;
  overBudget: boolean;
} {
  if (income > 0) {
    const pctRaw = (expense / income) * 100;
    return {
      pctRaw,
      barWidth: Math.min(100, pctRaw),
      label: `${Math.round(pctRaw)}%`,
      overBudget: pctRaw > 100,
    };
  }
  if (expense > 0) {
    return { pctRaw: 100, barWidth: 100, label: "100%", overBudget: true };
  }
  return { pctRaw: 0, barWidth: 0, label: "0%", overBudget: false };
}

export function AvailableBalanceCard({
  balance,
  accountCount,
  totalIncome,
  totalExpense,
}: {
  balance: number;
  accountCount: number;
  /** Ingresos históricos totales (para el anillo: saldo / ingreso). */
  totalIncome: number;
  /** Gastos históricos totales (porcentaje gastado = gastos / ingresos). */
  totalExpense: number;
}) {
  const positive = balance >= 0;
  const ringPct = totalIncome > 0 ? Math.max(0, Math.min(1, balance / totalIncome)) : 0;
  const ringDash = ringPct * RING_C;
  const spent = spentShare(totalIncome, totalExpense);

  return (
    <Card
      className={cn(
        "relative flex flex-col justify-center overflow-hidden p-6 sm:p-8",
        SHOW_AVAILABLE_BALANCE_EXTRAS &&
          "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-emerald-500/35 before:to-transparent"
      )}
    >
      {SHOW_AVAILABLE_BALANCE_EXTRAS ? (
        <>
          <div
            className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-emerald-500/[0.07] blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-36 w-36 rounded-full bg-violet-500/[0.05] blur-3xl"
            aria-hidden
          />
        </>
      ) : null}

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <div
          className={cn(
            "relative mx-auto flex shrink-0 items-center justify-center rounded-xl border border-zinc-800/90 sm:mx-0",
            "bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ring-1 ring-white/[0.04]",
            SHOW_AVAILABLE_BALANCE_EXTRAS ? "h-[3.75rem] w-[3.75rem]" : "h-12 w-12"
          )}
          aria-hidden
        >
          {SHOW_AVAILABLE_BALANCE_EXTRAS ? (
            <>
              <svg
                className="absolute inset-0.5 text-zinc-800"
                viewBox="0 0 56 56"
                fill="none"
                aria-hidden
              >
                <circle
                  cx="28"
                  cy="28"
                  r={RING_R}
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-zinc-800/90"
                />
                <circle
                  cx="28"
                  cy="28"
                  r={RING_R}
                  stroke="url(#avail-ring)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${ringDash} ${RING_C}`}
                  transform="rotate(-90 28 28)"
                  className="transition-[stroke-dasharray] duration-500"
                />
                <defs>
                  <linearGradient id="avail-ring" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgb(52 211 153)" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="rgb(167 139 250)" stopOpacity="0.85" />
                  </linearGradient>
                </defs>
              </svg>
              <Wallet className="relative z-10 h-6 w-6 text-emerald-400/90" strokeWidth={1.75} />
            </>
          ) : (
            <Wallet className="h-6 w-6 text-emerald-400/90" strokeWidth={1.75} />
          )}
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5 sm:justify-start">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Saldo disponible</p>
            <span className="rounded-md border border-zinc-800/80 bg-zinc-950/50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
              Global
            </span>
          </div>
          <p
            className={cn(
              "mt-3 break-words text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl lg:text-4xl",
              positive ? "text-white" : "text-rose-200"
            )}
          >
            {formatCOP(balance)}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between gap-3 text-[11px]">
          <span className="text-zinc-500">Porcentaje gastado</span>
          <span
            className={cn(
              "tabular-nums font-medium",
              spent.pctRaw < SPENT_RED_FROM_PCT && "text-zinc-300",
              spent.pctRaw >= SPENT_RED_FROM_PCT && !spent.overBudget && "text-rose-400/95",
              spent.overBudget && "text-amber-400/95"
            )}
          >
            {spent.label}
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/90 ring-1 ring-white/[0.04]"
          role="progressbar"
          aria-valuenow={Math.round(Math.min(100, spent.pctRaw))}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Porcentaje gastado respecto al ingreso: ${spent.label}`}
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-500 ease-out",
              spent.pctRaw < SPENT_RED_FROM_PCT && "bg-emerald-500/80",
              spent.pctRaw >= SPENT_RED_FROM_PCT &&
                !spent.overBudget &&
                "bg-rose-500/85",
              spent.overBudget && "bg-gradient-to-r from-rose-500 to-amber-500"
            )}
            style={{ width: `${spent.barWidth}%` }}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t border-zinc-800/70 pt-4 text-[11px] text-zinc-500 sm:justify-start">
        {accountCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-2.5 py-1 tabular-nums text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" aria-hidden />
            {accountCount === 1 ? "1 cuenta" : `${accountCount} cuentas`}
          </span>
        ) : (
          <span className="text-zinc-600">Sin cuentas aún</span>
        )}
        <span className="hidden h-3 w-px bg-zinc-800 sm:inline" aria-hidden />
        <span className="text-zinc-600">Acumulado histórico</span>
      </div>
    </Card>
  );
}
