"use client";

import { useMemo, useState, useTransition } from "react";
import type { BudgetBucket } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createAccountTransfer,
  createBucketReallocation,
  deleteBucketReallocation,
} from "@/actions/internal-transfers";
import { bucketLabel } from "@/lib/labels";
import { formatCOP, parseCOPInput } from "@/lib/money";
import { cn } from "@/lib/cn";

const BUCKETS: BudgetBucket[] = ["NEEDS", "WANTS", "SAVINGS"];

export function InternalTransfersPanel({
  accounts,
  monthStart,
  bucketShifts,
}: {
  accounts: { id: string; name: string }[];
  monthStart: string;
  bucketShifts: { id: string; fromBucket: BudgetBucket; toBucket: BudgetBucket; amount: number; createdAt: string }[];
}) {
  const [tab, setTab] = useState<"accounts" | "buckets">("accounts");
  const [pending, startTransition] = useTransition();

  const today = format(new Date(), "yyyy-MM-dd");
  const [fromAcc, setFromAcc] = useState(accounts[0]?.id ?? "");
  const [toAcc, setToAcc] = useState(accounts[1]?.id ?? accounts[0]?.id ?? "");
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(today);
  const [txTitle, setTxTitle] = useState("");

  const [fromBucket, setFromBucket] = useState<BudgetBucket>("NEEDS");
  const [toBucket, setToBucket] = useState<BudgetBucket>("SAVINGS");
  const [bucketAmt, setBucketAmt] = useState("");

  const accOptions = useMemo(() => accounts.filter((a) => a.id), [accounts]);

  function submitTransfer(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseCOPInput(txAmount);
    if (amount <= 0) {
      toast.error("Indica un monto válido.");
      return;
    }
    if (!fromAcc || !toAcc || fromAcc === toAcc) {
      toast.error("Elige dos cuentas distintas.");
      return;
    }
    startTransition(async () => {
      const res = await createAccountTransfer({
        fromAccountId: fromAcc,
        toAccountId: toAcc,
        amount,
        date: txDate,
        title: txTitle.trim() || undefined,
      });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success("Traspaso entre cuentas registrado.");
      setTxAmount("");
      setTxTitle("");
    });
  }

  function submitBuckets(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseCOPInput(bucketAmt);
    if (amount <= 0) {
      toast.error("Indica un monto válido.");
      return;
    }
    if (fromBucket === toBucket) {
      toast.error("Elige dos bloques distintos.");
      return;
    }
    startTransition(async () => {
      const res = await createBucketReallocation({
        monthStart,
        fromBucket,
        toBucket,
        amount,
      });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success("Disponible reasignado entre bloques.");
      setBucketAmt("");
    });
  }

  async function removeShift(id: string) {
    startTransition(async () => {
      const res = await deleteBucketReallocation(id);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success("Ajuste eliminado.");
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-1 rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-1">
        <button
          type="button"
          onClick={() => setTab("accounts")}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            tab === "accounts" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Entre cuentas
        </button>
        <button
          type="button"
          onClick={() => setTab("buckets")}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            tab === "buckets" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Entre bloques
        </button>
      </div>

      {tab === "accounts" ? (
        <form onSubmit={submitTransfer} className="space-y-4">
          <p className="text-xs leading-relaxed text-zinc-500">
            Mueve saldo real de una cuenta a otra (p. ej. efectivo al banco). No cuenta como ingreso ni gasto del
            mes.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs text-zinc-500">
              Desde
              <select
                className="mt-1 w-full rounded-md border border-zinc-800/80 bg-zinc-950/50 px-2 py-2 text-sm text-zinc-200"
                value={fromAcc}
                onChange={(e) => setFromAcc(e.target.value)}
                disabled={pending}
              >
                {accOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-zinc-500">
              Hacia
              <select
                className="mt-1 w-full rounded-md border border-zinc-800/80 bg-zinc-950/50 px-2 py-2 text-sm text-zinc-200"
                value={toAcc}
                onChange={(e) => setToAcc(e.target.value)}
                disabled={pending}
              >
                {accOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-xs text-zinc-500">
            Monto (COP)
            <input
              type="text"
              inputMode="numeric"
              className="mt-1 w-full rounded-md border border-zinc-800/80 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              placeholder="Ej. 50000"
              disabled={pending}
            />
          </label>
          <label className="block text-xs text-zinc-500">
            Fecha
            <input
              type="date"
              className="mt-1 w-full rounded-md border border-zinc-800/80 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200 [color-scheme:dark]"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
              disabled={pending}
            />
          </label>
          <label className="block text-xs text-zinc-500">
            Nota (opcional)
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-zinc-800/80 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200"
              value={txTitle}
              onChange={(e) => setTxTitle(e.target.value)}
              placeholder="Retiro ATM, depósito…"
              disabled={pending}
            />
          </label>
          <button
            type="submit"
            disabled={pending || accOptions.length < 2}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-40"
          >
            Traspasar
          </button>
          {accOptions.length < 2 ? (
            <p className="text-center text-xs text-zinc-500">Necesitas al menos dos cuentas.</p>
          ) : null}
        </form>
      ) : (
        <div className="space-y-4">
          <form onSubmit={submitBuckets} className="space-y-4">
            <p className="text-xs leading-relaxed text-zinc-500">
              Ajusta el <span className="text-zinc-400">disponible</span> del mes entre Necesidades, Deseos y Ahorros
              (no mueve dinero entre cuentas). Útil si priorizas otro bloque sin registrar un gasto ficticio.
            </p>
            <p className="text-[11px] text-zinc-600">
              Mes: {format(new Date(`${monthStart}T12:00:00`), "MMMM yyyy", { locale: es })}
            </p>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
              <label className="block text-xs text-zinc-500">
                Desde
                <select
                  className="mt-1 w-full rounded-md border border-zinc-800/80 bg-zinc-950/50 px-2 py-2 text-sm text-zinc-200"
                  value={fromBucket}
                  onChange={(e) => setFromBucket(e.target.value as BudgetBucket)}
                  disabled={pending}
                >
                  {BUCKETS.map((b) => (
                    <option key={b} value={b}>
                      {bucketLabel(b)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="hidden justify-center pb-2 sm:flex">
                <ArrowRight className="h-4 w-4 text-zinc-600" />
              </div>
              <label className="block text-xs text-zinc-500">
                Hacia
                <select
                  className="mt-1 w-full rounded-md border border-zinc-800/80 bg-zinc-950/50 px-2 py-2 text-sm text-zinc-200"
                  value={toBucket}
                  onChange={(e) => setToBucket(e.target.value as BudgetBucket)}
                  disabled={pending}
                >
                  {BUCKETS.map((b) => (
                    <option key={b} value={b}>
                      {bucketLabel(b)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-xs text-zinc-500">
              Monto (COP)
              <input
                type="text"
                inputMode="numeric"
                className="mt-1 w-full rounded-md border border-zinc-800/80 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200"
                value={bucketAmt}
                onChange={(e) => setBucketAmt(e.target.value)}
                placeholder="Ej. 20000"
                disabled={pending}
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 py-2.5 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800 disabled:opacity-40"
            >
              Reasignar disponible
            </button>
          </form>

          {bucketShifts.length > 0 ? (
            <div className="border-t border-zinc-800/80 pt-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                Ajustes de este mes
              </p>
              <ul className="space-y-2">
                {bucketShifts.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2 text-xs"
                  >
                    <span className="min-w-0 text-zinc-400">
                      {bucketLabel(s.fromBucket)} → {bucketLabel(s.toBucket)} ·{" "}
                      <span className="tabular-nums text-zinc-200">{formatCOP(s.amount)}</span>
                    </span>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => removeShift(s.id)}
                      className="shrink-0 rounded p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-rose-400"
                      aria-label="Quitar ajuste"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
