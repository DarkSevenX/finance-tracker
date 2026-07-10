"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { updateTransaction } from "@/actions/transaction-mutations";
import { parseCOPInput } from "@/lib/money";
import { cn } from "@/lib/cn";
import { btnPrimaryClass, btnSecondaryClass, fieldClass, labelClass } from "@/lib/ui-classes";

export type EditTransactionData = {
  id: string;
  title: string;
  amount: number;
  kind: "INCOME" | "EXPENSE";
  accountId: string;
  categoryId: string | null;
  date: string; // ISO string format usually
};

export function EditTransactionModal({
  isOpen,
  onClose,
  transaction,
  accounts,
  categories,
}: {
  isOpen: boolean;
  onClose: () => void;
  transaction: EditTransactionData | null;
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string; kind: "INCOME" | "EXPENSE" }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [amountStr, setAmountStr] = useState("");

  useEffect(() => {
    if (isOpen && transaction) {
      setAmountStr(transaction.amount.toString());
    }
  }, [isOpen, transaction]);

  if (!transaction) return null;

  const relevantCategories = categories.filter(c => c.kind === transaction.kind);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!transaction) return;
    const form = e.currentTarget;
    setPending(true);
    const fd = new FormData(form);
    const amount = parseCOPInput(String(fd.get("amount") ?? "0"));
    const cid = String(fd.get("categoryId") ?? "").trim();
    
    const res = await updateTransaction(transaction.id, {
      title: String(fd.get("title") ?? "").trim(),
      amount,
      accountId: String(fd.get("accountId") ?? ""),
      categoryId: cid || null,
      date: String(fd.get("date") ?? ""),
    });
    setPending(false);
    
    if ("error" in res && res.error) {
      toast.error(res.error);
    } else {
      toast.success("Movimiento actualizado.");
      onClose();
      router.refresh();
    }
  }

  const amountInputClass = cn(
    "w-full max-w-[14rem] border-0 border-b border-zinc-600 bg-transparent px-1 py-2.5",
    "text-center text-2xl font-semibold tabular-nums tracking-tight",
    transaction.kind === "INCOME" ? "text-emerald-400 focus:border-emerald-500/80" : "text-rose-400 focus:border-rose-500/80",
    "placeholder:text-zinc-600",
    "transition-colors focus:outline-none focus:ring-0",
    "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar movimiento"
    >
      <form onSubmit={onSubmit} className="space-y-5 mt-4">
        <div className="flex flex-col items-center">
          <input
            name="amount"
            required
            inputMode="numeric"
            placeholder="$0.0"
            autoComplete="off"
            className={amountInputClass}
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
          />
        </div>

        <div className="field-row text-left">
          <label className={labelClass}>Título</label>
          <input
            name="title"
            required
            defaultValue={transaction.title}
            className={fieldClass}
          />
        </div>

        <div className="field-row text-left">
          <label className={labelClass}>Categoría (opcional)</label>
          <select
            name="categoryId"
            defaultValue={transaction.categoryId ?? ""}
            className={fieldClass}
          >
            <option value="">— Sin categoría —</option>
            {relevantCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field-row text-left">
          <label className={labelClass}>Fecha</label>
          <input
            name="date"
            type="date"
            required
            defaultValue={transaction.date.slice(0, 10)}
            className={fieldClass}
          />
        </div>

        <div className="field-row text-left">
          <label className={labelClass}>Cuenta</label>
          <select name="accountId" required defaultValue={transaction.accountId} className={fieldClass}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-800/80 pt-5">
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            className={btnSecondaryClass}
          >
            Cancelar
          </button>
          <button type="submit" disabled={pending} className={cn(btnPrimaryClass, transaction.kind === "INCOME" ? "bg-emerald-500 hover:bg-emerald-600 focus-visible:ring-emerald-500/50 border-0" : "bg-rose-500 hover:bg-rose-600 focus-visible:ring-rose-500/50 border-0")}>
            {pending ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
