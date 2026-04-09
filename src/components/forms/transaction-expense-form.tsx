"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { BudgetBucket } from "@prisma/client";
import { Home, PiggyBank, Sparkles } from "lucide-react";
import { createExpense } from "@/actions/transaction-mutations";
import { bucketLabel } from "@/lib/labels";
import { parseCOPInput } from "@/lib/money";
import { cn } from "@/lib/cn";
import { btnPrimaryClass, fieldClass, labelClass } from "@/lib/ui-classes";
import { InlineCategoryCreateExpense } from "@/components/forms/inline-category-create";

const BUCKET_ROWS: {
  id: BudgetBucket;
  label: string;
  sub: string;
  Icon: typeof Home;
  active: string;
}[] = [
  {
    id: "NEEDS",
    label: "Necesidades",
    sub: "Esencial",
    Icon: Home,
    active: "border-sky-500/60 bg-sky-950/50 text-sky-200 ring-1 ring-sky-500/30",
  },
  {
    id: "WANTS",
    label: "Deseos",
    sub: "Extras",
    Icon: Sparkles,
    active: "border-violet-500/60 bg-violet-950/40 text-violet-200 ring-1 ring-violet-500/30",
  },
  {
    id: "SAVINGS",
    label: "Ahorros",
    sub: "Meta",
    Icon: PiggyBank,
    active: "border-emerald-500/60 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-500/30",
  },
];

export function TransactionExpenseForm({
  accounts,
  categories,
  compact,
}: {
  accounts: { id: string; name: string }[];
  categories: { id: string; label: string; bucket: BudgetBucket | null }[];
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [catList, setCatList] = useState(categories);
  const [bucket, setBucket] = useState<BudgetBucket>("NEEDS");
  const [categoryId, setCategoryId] = useState<string>("");

  useEffect(() => {
    setCatList(categories);
  }, [categories]);

  const filteredCats = useMemo(() => {
    return catList.filter((c) => c.bucket === bucket);
  }, [catList, bucket]);

  useEffect(() => {
    if (categoryId && !filteredCats.some((c) => c.id === categoryId)) {
      setCategoryId("");
    }
  }, [bucket, categoryId, filteredCats]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const amount = parseCOPInput(String(fd.get("amount") ?? "0"));
    const cid = String(fd.get("categoryId") ?? "").trim();
    const res = await createExpense({
      amount,
      accountId: String(fd.get("accountId") ?? ""),
      categoryId: cid || null,
      expenseBucket: cid ? undefined : bucket,
      date: String(fd.get("date") ?? ""),
    });
    setPending(false);
    if ("error" in res && res.error) {
      toast.error(res.error);
    } else {
      toast.success("Gasto registrado.");
      e.currentTarget.reset();
      setCategoryId("");
      setBucket("NEEDS");
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

      <div className="field-row space-y-2">
        <div className="flex flex-wrap justify-center gap-2 sm:flex-nowrap">
          {BUCKET_ROWS.map(({ id, label, sub, Icon, active }) => {
            const selected = bucket === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setBucket(id)}
                className={cn(
                  "flex min-w-[5.5rem] flex-1 flex-col items-center gap-1 rounded-xl border border-zinc-700/80 bg-zinc-950/40 px-2 py-3 text-xs transition",
                  "hover:border-zinc-600 hover:bg-zinc-900/60",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/50",
                  selected ? active : "border-zinc-800 text-zinc-400"
                )}
                aria-pressed={selected}
                aria-label={bucketLabel(id)}
              >
                <Icon className="h-5 w-5 opacity-90" strokeWidth={1.75} />
                <span className="font-semibold leading-tight text-zinc-100">{label}</span>
                <span className="text-[10px] font-normal text-zinc-500">{sub}</span>
              </button>
            );
          })}
        </div>
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
            {filteredCats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <InlineCategoryCreateExpense
            variant="icon"
            defaultBucket={bucket}
            onCreated={(id, label) => {
              setCatList((prev) =>
                [...prev.filter((c) => c.id !== id), { id, label, bucket }].sort((a, b) =>
                  a.label.localeCompare(b.label, "es")
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

      <button type="submit" disabled={pending} className={cn(btnPrimaryClass, "w-full")}>
        {pending ? "Guardando…" : "Registrar gasto"}
      </button>
    </form>
  );
}
