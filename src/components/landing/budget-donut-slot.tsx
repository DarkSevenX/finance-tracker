"use client";

import dynamic from "next/dynamic";

function BudgetDonutPlaceholder() {
  return (
    <div
      className="min-h-[min(320px,55vh)] w-full rounded-2xl border border-emerald-950/30 bg-zinc-900/40 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
      aria-hidden
    >
      <div className="h-2.5 w-28 animate-pulse rounded bg-zinc-800/80" />
      <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
        <div className="h-44 w-44 shrink-0 animate-pulse rounded-full bg-zinc-800/50 sm:h-48 sm:w-48" />
        <div className="w-full max-w-[220px] space-y-3 sm:max-w-none">
          <div className="h-4 w-full animate-pulse rounded bg-zinc-800/40" />
          <div className="h-4 w-full animate-pulse rounded bg-zinc-800/40" />
          <div className="h-4 w-full animate-pulse rounded bg-zinc-800/40" />
        </div>
      </div>
      <div className="mt-5 h-3 w-full max-w-[280px] animate-pulse rounded bg-zinc-800/30" />
    </div>
  );
}

const BudgetDonutLazy = dynamic(
  () => import("./budget-donut").then((m) => m.BudgetDonut),
  {
    ssr: false,
    loading: BudgetDonutPlaceholder,
  }
);

/** Envuelve la dona animada: `ssr: false` solo es válido en un Client Component. */
export function BudgetDonutSlot() {
  return <BudgetDonutLazy />;
}
