"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { IncomeAllocationMode } from "@prisma/client";
import { createIncome } from "@/actions/transaction-mutations";
import { allocationLabel } from "@/lib/labels";
import { parseCOPInput } from "@/lib/money";
import { cn } from "@/lib/cn";
import { btnPrimaryClass, fieldClass, labelClass } from "@/lib/ui-classes";
import { InlineCategoryCreateIncome } from "@/components/forms/inline-category-create";

const modes: IncomeAllocationMode[] = ["SPLIT", "NEEDS_ONLY", "WANTS_ONLY", "SAVINGS_ONLY"];

export function TransactionIncomeForm({
  accounts,
  categories,
  compact,
}: {
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [catList, setCatList] = useState(categories);
  const [categoryId, setCategoryId] = useState<string>("");

  useEffect(() => {
    setCatList(categories);
  }, [categories]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const amount = parseCOPInput(String(fd.get("amount") ?? "0"));
    const cid = String(fd.get("categoryId") ?? "").trim();
    const res = await createIncome({
      amount,
      accountId: String(fd.get("accountId") ?? ""),
      categoryId: cid || null,
      date: String(fd.get("date") ?? ""),
      allocationMode: String(fd.get("allocationMode") ?? "SPLIT") as IncomeAllocationMode,
    });
    setPending(false);
    if ("error" in res && res.error) {
      toast.error(res.error);
    } else {
      toast.success("Ingreso registrado.");
      e.currentTarget.reset();
      setCategoryId("");
      router.refresh();
    }
  }

  if (accounts.length === 0) {
    return (
      <p className="rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-2 text-sm text-amber-200/90">
        Crea al menos una cuenta antes de registrar movimientos.
      </p>
    );
  }

  const amountInputClass = cn(
    "w-full max-w-[14rem] border-0 border-b border-zinc-600 bg-transparent px-1 py-2.5",
    "text-center text-2xl font-semibold tabular-nums tracking-tight text-white",
    "placeholder:text-zinc-600",
    "transition-colors focus:border-emerald-500/80 focus:outline-none focus:ring-0",
    "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
  );

  const formWrap = cn(
    "space-y-5",
    compact && "mx-auto w-full max-w-md text-center [&_.field-row]:text-left"
  );

  return (
    <form onSubmit={onSubmit} className={formWrap}>
      <div className={cn(compact && "flex flex-col items-center")}>
        <input
          name="amount"
          required
          inputMode="numeric"
          placeholder="$0.0"
          autoComplete="off"
          className={amountInputClass}
          autoFocus={compact}
        />
      </div>

      <div className="field-row text-left">
        <label className={labelClass}>Categoría (opcional)</label>
        <div className="flex items-center gap-2">
          <select
            name="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={cn(fieldClass, "min-w-0 flex-1")}
          >
            <option value="">— Sin categoría —</option>
            {catList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <InlineCategoryCreateIncome
            variant="icon"
            onCreated={(id, name) => {
              setCatList((prev) =>
                [...prev.filter((c) => c.id !== id), { id, name }].sort((a, b) =>
                  a.name.localeCompare(b.name, "es")
                )
              );
              setCategoryId(id);
              router.refresh();
            }}
          />
        </div>
      </div>

      <div className="field-row text-left">
        <label className={labelClass}>Fecha</label>
        <input
          name="date"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className={fieldClass}
        />
      </div>

      <div className="field-row text-left">
        <label className={labelClass}>Cuenta</label>
        <select name="accountId" required className={fieldClass}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field-row text-left">
        <label className={labelClass}>Cómo cuenta para tu presupuesto</label>
        <select name="allocationMode" className={fieldClass}>
          {modes.map((m) => (
            <option key={m} value={m}>
              {allocationLabel(m)}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={pending} className={cn(btnPrimaryClass, "w-full")}>
        {pending ? "Guardando…" : "Registrar ingreso"}
      </button>
    </form>
  );
}
