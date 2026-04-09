"use client";

import { useMemo, useState } from "react";
import type { CategoryKind } from "@prisma/client";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { BudgetBucket, IncomeAllocationMode } from "@prisma/client";
import { ListFilter, X } from "lucide-react";
import { allocationLabel, bucketLabel } from "@/lib/labels";
import { formatCOP } from "@/lib/money";
import { cn } from "@/lib/cn";
import { tableHeadClass, tableRowClass } from "@/lib/ui-classes";

export type MonthMovementRow = {
  id: string;
  date: string;
  title: string;
  kind: "INCOME" | "EXPENSE";
  amount: number;
  accountId: string;
  accountName: string;
  categoryId: string | null;
  categoryName: string | null;
  allocationMode: IncomeAllocationMode | null;
  resolvedBucket: BudgetBucket | null;
};

const filterSelectClass = cn(
  "h-9 w-full min-w-0 rounded-md border border-zinc-800/80 bg-zinc-950/50 px-2 text-xs text-zinc-300 sm:h-8 sm:max-w-[11rem] sm:w-auto",
  "focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600/35"
);

const filterDateClass = cn(
  "h-9 w-full min-w-0 rounded-md border border-zinc-800/80 bg-zinc-950/50 px-2 text-xs text-zinc-300 sm:h-8 sm:min-w-[8.5rem]",
  "focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600/35",
  "[color-scheme:dark]"
);

export function MonthMovementsTable({
  movements,
  accountOptions,
  categoryOptions,
  monthMin,
  monthMax,
}: {
  movements: MonthMovementRow[];
  accountOptions: { id: string; name: string }[];
  categoryOptions: { id: string; name: string; kind: CategoryKind }[];
  /** yyyy-MM-dd inicio del mes visible */
  monthMin: string;
  /** yyyy-MM-dd fin del mes visible */
  monthMax: string;
}) {
  const sortedCategories = useMemo(
    () =>
      [...categoryOptions].sort((a, b) =>
        a.name.localeCompare(b.name, "es", { sensitivity: "base" })
      ),
    [categoryOptions]
  );

  const [panelOpen, setPanelOpen] = useState(false);
  const [kind, setKind] = useState<"" | "INCOME" | "EXPENSE">("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState<"" | "__none__" | string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const activeCount =
    (kind ? 1 : 0) +
    (accountId ? 1 : 0) +
    (categoryId ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  const filtered = useMemo(() => {
    return movements.filter((row) => {
      if (kind && row.kind !== kind) return false;
      if (accountId && row.accountId !== accountId) return false;
      if (categoryId === "__none__" && row.categoryId !== null) return false;
      if (
        categoryId &&
        categoryId !== "__none__" &&
        row.categoryId !== categoryId
      ) {
        return false;
      }
      const day = row.date.slice(0, 10);
      if (dateFrom && day < dateFrom) return false;
      if (dateTo && day > dateTo) return false;
      return true;
    });
  }, [movements, kind, accountId, categoryId, dateFrom, dateTo]);

  function clearFilters() {
    setKind("");
    setAccountId("");
    setCategoryId("");
    setDateFrom("");
    setDateTo("");
  }

  return (
    <div className="w-full min-w-0 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Movimientos del mes
        </h2>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:shrink-0">
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-zinc-500 transition-colors hover:bg-zinc-800/60 hover:text-zinc-300"
            >
              <X className="h-3 w-3" aria-hidden />
              Quitar filtros
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setPanelOpen((o) => !o)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
              panelOpen || activeCount > 0
                ? "border-zinc-600 bg-zinc-800/50 text-zinc-200"
                : "border-zinc-800/90 bg-zinc-950/40 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400"
            )}
            aria-expanded={panelOpen}
            aria-controls={panelOpen ? "month-movements-filters" : undefined}
          >
            <ListFilter className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            Filtros
            {activeCount > 0 ? (
              <span className="rounded bg-zinc-700/80 px-1.5 py-px text-[10px] font-medium tabular-nums text-zinc-200">
                {activeCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {panelOpen ? (
        <div
          id="month-movements-filters"
          className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/25 p-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end lg:gap-2"
        >
            <label className="flex min-w-0 flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-600">
                Tipo
              </span>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as typeof kind)}
                className={filterSelectClass}
              >
                <option value="">Todos</option>
                <option value="INCOME">Ingresos</option>
                <option value="EXPENSE">Gastos</option>
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-600">
                Cuenta
              </span>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className={cn(filterSelectClass, "sm:max-w-[13rem]")}
              >
                <option value="">Todas</option>
                {accountOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-600">
                Categoría
              </span>
              <select
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(e.target.value as typeof categoryId)
                }
                className={cn(filterSelectClass, "sm:max-w-[14rem]")}
              >
                <option value="">Todas</option>
                <option value="__none__">Sin categoría</option>
                {sortedCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.kind === "INCOME" ? "↑ " : "↓ "}
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-600">
                Desde
              </span>
              <input
                type="date"
                value={dateFrom}
                min={monthMin}
                max={monthMax}
                onChange={(e) => setDateFrom(e.target.value)}
                className={filterDateClass}
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-600">
                Hasta
              </span>
              <input
                type="date"
                value={dateTo}
                min={monthMin}
                max={monthMax}
                onChange={(e) => setDateTo(e.target.value)}
                className={filterDateClass}
              />
            </label>
        </div>
      ) : null}

      {activeCount > 0 ? (
        <p className="text-[11px] text-zinc-600">
          Mostrando{" "}
          <span className="tabular-nums text-zinc-400">{filtered.length}</span>{" "}
          de{" "}
          <span className="tabular-nums text-zinc-400">{movements.length}</span>{" "}
          movimientos
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-zinc-800/90 bg-zinc-900/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] [-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className={tableHeadClass}>
            <tr>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Título</th>
              <th className="px-4 py-3 font-semibold">Cuenta</th>
              <th className="px-4 py-3 font-semibold">Categoría</th>
              <th className="px-4 py-3 text-right font-semibold">Monto</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-zinc-500"
                >
                  {movements.length === 0
                    ? "No hay movimientos este mes."
                    : "Ningún movimiento coincide con los filtros."}
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className={tableRowClass}>
                  <td className="px-4 py-3 tabular-nums text-zinc-500">
                    {format(parseISO(t.date), "d MMM yyyy", { locale: es })}
                  </td>
                  <td className="px-4 py-3 text-zinc-200">{t.title}</td>
                  <td className="px-4 py-3 text-zinc-500">{t.accountName}</td>
                  <td className="max-w-[220px] px-4 py-3 text-xs text-zinc-500">
                    {t.categoryName ?? "Sin categoría"}
                    {t.kind === "INCOME" && t.allocationMode
                      ? ` · ${allocationLabel(t.allocationMode)}`
                      : null}
                    {t.kind === "EXPENSE" && t.resolvedBucket
                      ? ` · ${bucketLabel(t.resolvedBucket)}`
                      : null}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium tabular-nums ${
                      t.kind === "INCOME" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {t.kind === "INCOME" ? "+" : "−"}
                    {formatCOP(t.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
