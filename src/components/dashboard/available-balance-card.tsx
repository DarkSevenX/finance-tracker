import { Wallet } from "lucide-react";
import { formatCOP } from "@/lib/money";
import { cn } from "@/lib/cn";
import { BorderGlow } from "@/components/reactbits/BorderGlow";

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
    <BorderGlow
      animated={true}
      backgroundColor="#09090b"
      glowColor="160 84 39"
      colors={["#ffffff", "#10b981", "#047857"]}
      className={cn(
        "rounded-2xl border border-zinc-800/90 bg-zinc-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
        "relative overflow-hidden"
      )}
    >
      {SHOW_AVAILABLE_BALANCE_EXTRAS && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent" />
      )}
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

      <div className="relative z-10 flex h-full flex-col justify-center p-6 sm:p-8">
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
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-zinc-800/80 pt-5">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>
            Ingresos
          </div>
          <p className="mt-1 text-base font-semibold tabular-nums text-zinc-100">{formatCOP(totalIncome)}</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
            Gastos
          </div>
          <p className="mt-1 text-base font-semibold tabular-nums text-zinc-100">{formatCOP(totalExpense)}</p>
        </div>
      </div>
      </div>
    </BorderGlow>
  );
}

