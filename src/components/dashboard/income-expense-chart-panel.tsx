"use client";

import { useState } from "react";
import { AreaChart, PieChart } from "lucide-react";
import type { IncomeExpenseMonthPoint } from "@/lib/dashboard-data";
import { formatCOP } from "@/lib/money";
import { cn } from "@/lib/cn";
import { IncomeExpenseDonut } from "@/components/dashboard/income-expense-donut";

const toggleBtnClass = cn(
  "rounded-md p-1.5 text-zinc-600 transition-colors",
  "hover:bg-zinc-800/50 hover:text-zinc-400",
  "focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600/60"
);

function IncomeExpenseAreaChart({
  series,
  totalIncome,
  totalExpense,
  className,
}: {
  series: IncomeExpenseMonthPoint[];
  totalIncome: number;
  totalExpense: number;
  className?: string;
}) {
  const W = 320;
  const H = 148;
  const pad = { l: 4, r: 4, t: 8, b: 28 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const n = series.length;
  const bottomY = pad.t + plotH;

  const maxVal = Math.max(
    1,
    ...series.flatMap((s) => [s.income, s.expense])
  );

  function xAt(i: number) {
    if (n <= 1) return pad.l + plotW / 2;
    return pad.l + (i / Math.max(1, n - 1)) * plotW;
  }

  function yAt(v: number) {
    return bottomY - (v / maxVal) * plotH;
  }

  const incLine = series.map((s, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(s.income).toFixed(1)}`).join(" ");
  const expLine = series.map((s, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(s.expense).toFixed(1)}`).join(" ");

  const firstX = xAt(0);
  const lastX = xAt(n - 1);
  const incAreaD = `${incLine} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;
  const expAreaD = `${expLine} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;

  return (
    <div className={cn("flex w-full flex-col items-center gap-5", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-[20rem] overflow-visible"
        aria-hidden
      >
        <defs>
          <linearGradient id="area-inc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(52 211 153)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(52 211 153)" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="area-exp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(251 113 133)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(251 113 133)" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        <path d={incAreaD} fill="url(#area-inc)" />
        <path d={expAreaD} fill="url(#area-exp)" />

        <path
          d={incLine}
          fill="none"
          stroke="rgb(52 211 153)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
        <path
          d={expLine}
          fill="none"
          stroke="rgb(251 113 133)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />

        {series.map((s, i) => (
          <text
            key={s.key}
            x={xAt(i)}
            y={H - 6}
            textAnchor="middle"
            className="fill-zinc-500"
            style={{ fontSize: "10px" }}
          >
            {s.label}
          </text>
        ))}
      </svg>

      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]" />
          <span className="text-zinc-500">Ingresos</span>
          <span className="tabular-nums text-zinc-300">{formatCOP(totalIncome)}</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-400 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]" />
          <span className="text-zinc-500">Gastos</span>
          <span className="tabular-nums text-zinc-300">{formatCOP(totalExpense)}</span>
        </li>
      </ul>
    </div>
  );
}

export function IncomeExpenseChartPanel({
  income,
  expense,
  series,
}: {
  income: number;
  expense: number;
  series: IncomeExpenseMonthPoint[];
}) {
  const [mode, setMode] = useState<"donut" | "area">("donut");

  return (
    <div className="relative w-full min-w-0 pt-1 pr-9 sm:pr-10">
      <button
        type="button"
        onClick={() => setMode((m) => (m === "donut" ? "area" : "donut"))}
        title={mode === "donut" ? "Ver gráfico de áreas" : "Ver gráfico de dona"}
        aria-label={mode === "donut" ? "Ver gráfico de áreas" : "Ver gráfico de dona"}
        className={cn(toggleBtnClass, "absolute right-0 top-0 z-10")}
      >
        {mode === "donut" ? (
          <AreaChart className="h-3.5 w-3.5" strokeWidth={1.75} />
        ) : (
          <PieChart className="h-3.5 w-3.5" strokeWidth={1.75} />
        )}
      </button>

      <div>
        {mode === "donut" ? (
          <IncomeExpenseDonut income={income} expense={expense} />
        ) : (
          <IncomeExpenseAreaChart
            series={series}
            totalIncome={income}
            totalExpense={expense}
          />
        )}
      </div>
    </div>
  );
}
