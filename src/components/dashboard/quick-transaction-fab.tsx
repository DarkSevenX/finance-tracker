"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftRight, Plus, TrendingDown, TrendingUp, X } from "lucide-react";
import { InternalTransfersPanel } from "@/components/dashboard/internal-transfers-panel";
import { TransactionExpenseForm } from "@/components/forms/transaction-expense-form";
import { TransactionIncomeForm } from "@/components/forms/transaction-income-form";
import { cn } from "@/lib/cn";
import type { BudgetBucket } from "@prisma/client";

export function QuickTransactionFab({
  accounts,
  incomeCategories,
  expenseCategories,
  internalTransfers,
}: {
  accounts: { id: string; name: string }[];
  incomeCategories: { id: string; name: string }[];
  expenseCategories: { id: string; label: string; bucket: BudgetBucket }[];
  /** Traspasos entre cuentas / bloques (solo resumen). */
  internalTransfers?: {
    plainAccounts: { id: string; name: string }[];
    monthStart: string;
    bucketShifts: {
      id: string;
      fromBucket: BudgetBucket;
      toBucket: BudgetBucket;
      amount: number;
      createdAt: string;
    }[];
  };
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [tab, setTab] = useState<"income" | "expense" | "internal">("expense");
  const [fabHovered, setFabHovered] = useState(false);
  const [fabMenuPinned, setFabMenuPinned] = useState(false);
  const dialRef = useRef<HTMLDivElement | null>(null);

  const showDial = fabHovered || fabMenuPinned;

  useEffect(() => {
    if (!fabMenuPinned) return;
    function onDocMouseDown(e: MouseEvent) {
      if (dialRef.current && !dialRef.current.contains(e.target as Node)) {
        setFabMenuPinned(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [fabMenuPinned]);

  function openPanel(kind: "income" | "expense" | "internal") {
    setTab(kind);
    setPanelOpen(true);
    setFabMenuPinned(false);
  }

  return (
    <>
      {panelOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-black/45 backdrop-blur-[2px]"
            aria-label="Cerrar panel"
            onClick={() => setPanelOpen(false)}
          />
          <div
            className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-10 sm:items-center sm:p-6 sm:pb-6 sm:pt-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-tx-title"
          >
            <div
              className={cn(
                "pointer-events-auto w-full max-h-[min(85vh,44rem)] overflow-y-auto rounded-2xl border border-zinc-800/90 bg-zinc-900/95 p-5 shadow-2xl shadow-black/50 ring-1 ring-white/[0.06]",
                tab === "internal" ? "max-w-lg" : "max-w-md"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                <h2 id="quick-tx-title" className="text-lg font-semibold tracking-tight text-white">
                  {tab === "expense"
                    ? "Registrar gasto"
                    : tab === "income"
                      ? "Registrar ingreso"
                      : "Traspasos"}
                </h2>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
              {tab === "internal" && internalTransfers ? (
                <InternalTransfersPanel
                  accounts={internalTransfers.plainAccounts}
                  monthStart={internalTransfers.monthStart}
                  bucketShifts={internalTransfers.bucketShifts}
                />
              ) : tab === "expense" ? (
                <TransactionExpenseForm
                  accounts={accounts}
                  categories={expenseCategories}
                  compact
                />
              ) : (
                <TransactionIncomeForm
                  accounts={accounts}
                  categories={incomeCategories}
                  compact
                />
              )}
            </div>
          </div>
        </>
      ) : null}

      {!panelOpen ? (
        <div
          ref={dialRef}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 flex max-w-[100vw] flex-col items-end gap-2 pl-4 sm:bottom-6 sm:right-6 sm:pl-0"
          onMouseEnter={() => setFabHovered(true)}
          onMouseLeave={() => setFabHovered(false)}
        >
          <AnimatePresence>
            {showDial ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
                className="mb-1 flex flex-col items-end gap-2"
              >
                <button
                  type="button"
                  onClick={() => openPanel("income")}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/35 bg-zinc-900/95 text-emerald-400 shadow-lg shadow-black/30",
                    "transition hover:border-emerald-400/50 hover:bg-emerald-950/50 hover:text-emerald-300",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                  )}
                  title="Agregar ingreso"
                  aria-label="Agregar ingreso"
                >
                  <TrendingUp className="h-5 w-5" strokeWidth={2.25} />
                </button>
                <button
                  type="button"
                  onClick={() => openPanel("expense")}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border border-rose-500/35 bg-zinc-900/95 text-rose-400 shadow-lg shadow-black/30",
                    "transition hover:border-rose-400/50 hover:bg-rose-950/40 hover:text-rose-300",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
                  )}
                  title="Agregar gasto"
                  aria-label="Agregar gasto"
                >
                  <TrendingDown className="h-5 w-5" strokeWidth={2.25} />
                </button>
                {internalTransfers ? (
                  <button
                    type="button"
                    onClick={() => openPanel("internal")}
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full border border-sky-500/35 bg-zinc-900/95 text-sky-400 shadow-lg shadow-black/30",
                      "transition hover:border-sky-400/50 hover:bg-sky-950/40 hover:text-sky-300",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
                    )}
                    title="Traspasos entre cuentas o bloques"
                    aria-label="Traspasos entre cuentas o bloques"
                  >
                    <ArrowLeftRight className="h-5 w-5" strokeWidth={2.25} />
                  </button>
                ) : null}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setFabMenuPinned((p) => !p)}
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-900/30 transition",
              "hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80",
              showDial && "ring-2 ring-emerald-400/40"
            )}
            aria-expanded={showDial}
            aria-haspopup="true"
            aria-label={
              showDial
                ? "Cerrar menú de movimientos"
                : internalTransfers
                  ? "Abrir menú: ingreso, gasto o traspasos"
                  : "Abrir menú: ingreso o gasto"
            }
          >
            <Plus
              className={cn("h-7 w-7 transition-transform duration-200", showDial && "rotate-45")}
              strokeWidth={2.5}
            />
          </button>
        </div>
      ) : null}
    </>
  );
}
