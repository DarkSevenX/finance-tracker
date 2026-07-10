"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatCOP } from "@/lib/money";
import { ConfirmDeleteModal } from "@/components/dashboard/modals/confirm-delete-modal";
import { EditTransactionModal, EditTransactionData } from "@/components/dashboard/modals/edit-transaction-modal";

export function RecentMovementsList({
  movements,
  accounts,
  categories,
}: {
  movements: EditTransactionData[];
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string; kind: "INCOME" | "EXPENSE" }[];
}) {
  const [deleteData, setDeleteData] = useState<{ id: string; title: string } | null>(null);
  const [editData, setEditData] = useState<EditTransactionData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <section className="space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="h-4 w-0.5 rounded-full bg-emerald-400"></span>
            <h2 className="text-[13px] font-semibold tracking-tight text-zinc-200">Movimientos del mes</h2>
          </div>
          <Link href="/dashboard/movimientos" className="text-[12.5px] font-medium text-emerald-400 transition-colors hover:text-emerald-300">
            Ver todos
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40">
          <div className="divide-y divide-zinc-800/80">
            {movements.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-zinc-500">No hay movimientos este mes.</p>
            ) : (
              movements.slice(0, 5).map((t) => {
                const isSelected = selectedId === t.id;
                return (
                <div 
                  key={t.id} 
                  onClick={() => setSelectedId(isSelected ? null : t.id)}
                  className="group flex items-center gap-3 px-4 py-3.5 sm:px-5 transition-colors hover:bg-zinc-800/30 max-lg:cursor-pointer"
                >
                  {t.kind === "INCOME" ? (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>
                    </div>
                  ) : (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-zinc-200">{t.title}</p>
                    <p className="text-[11.5px] text-zinc-600">
                      {accounts.find(a => a.id === t.accountId)?.name ?? "Cuenta"} · {format(new Date(t.date), "d MMM", { locale: es })}
                    </p>
                  </div>
                  <p className={`shrink-0 text-[13px] font-semibold tabular-nums ${t.kind === "INCOME" ? "text-emerald-400" : "text-zinc-200"}`}>
                    {t.kind === "INCOME" ? "+ " : "− "}
                    {formatCOP(t.amount)}
                  </p>
                  <div className={`flex shrink-0 items-center gap-1 overflow-hidden transition-all duration-150 max-w-0 opacity-0 group-hover:ml-1 group-hover:max-w-[4.5rem] group-hover:opacity-100 ${isSelected ? "max-lg:ml-1 max-lg:max-w-[4.5rem] max-lg:opacity-100" : ""}`}>
                    <button
                      type="button"
                      aria-label="Editar movimiento"
                      onClick={(e) => { e.stopPropagation(); setEditData(t); }}
                      className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-800/80 hover:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      aria-label="Eliminar movimiento"
                      onClick={(e) => { e.stopPropagation(); setDeleteData({ id: t.id, title: t.title }); }}
                      className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-500/50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {deleteData && (
        <ConfirmDeleteModal
          isOpen={true}
          onClose={() => setDeleteData(null)}
          transactionId={deleteData.id}
          transactionTitle={deleteData.title}
        />
      )}

      {editData && (
        <EditTransactionModal
          isOpen={true}
          onClose={() => setEditData(null)}
          transaction={editData}
          accounts={accounts}
          categories={categories}
        />
      )}
    </>
  );
}
