"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { updateBudgetPercents } from "@/actions/settings";
import { validateBudgetPercents } from "@/lib/budget-alloc";
import { bucketLabel } from "@/lib/labels";
import { formatCOP } from "@/lib/money";
import { cn } from "@/lib/cn";
import { btnPrimaryClass, btnSecondaryClass, fieldClass, labelClass } from "@/lib/ui-classes";
import type { BucketKey } from "@/lib/dashboard-data";

const theme: Record<
  BucketKey,
  {
    hint: string;
    bar: string;
    ring: string;
    labelColor: string;
  }
> = {
  NEEDS: {
    hint: "Esencial: vivienda, servicios, etc…",
    bar: "bg-sky-400",
    ring: "ring-sky-500/20",
    labelColor: "text-sky-400/90",
  },
  WANTS: {
    hint: "Ocio, salidas, extras…",
    bar: "bg-violet-400",
    ring: "ring-violet-500/20",
    labelColor: "text-violet-400/90",
  },
  SAVINGS: {
    hint: "Ahorro, inversión, deuda extra…",
    bar: "bg-emerald-400",
    ring: "ring-emerald-500/20",
    labelColor: "text-emerald-400/90",
  },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 380, damping: 28 },
  },
};

function clampPct(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

/** Convierte lo que el usuario escribe en el modal; cadena vacía → 0 al guardar. */
function parsePctDraft(raw: string): number {
  const t = raw.trim();
  if (t === "") return 0;
  const n = parseInt(t, 10);
  return Number.isFinite(n) ? clampPct(n) : 0;
}

/** Actualiza el borrador permitiendo borrar el contenido (no forzar 0 mientras edita). */
function sanitizePctInput(raw: string): string {
  if (raw === "") return "";
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return "";
  let num = parseInt(digits, 10);
  if (!Number.isFinite(num)) return "";
  if (num > 100) num = 100;
  return String(num);
}

export function BucketCards(props: {
  needsPct: number;
  wantsPct: number;
  savingsPct: number;
  budget: Record<BucketKey, number>;
  spent: Record<BucketKey, number>;
  remaining: Record<BucketKey, number>;
}) {
  const router = useRouter();
  const [n, setN] = useState(props.needsPct);
  const [w, setW] = useState(props.wantsPct);
  const [s, setS] = useState(props.savingsPct);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState<Record<BucketKey, boolean>>({
    NEEDS: false,
    WANTS: false,
    SAVINGS: false,
  });

  const [pctModalOpen, setPctModalOpen] = useState(false);
  const [draftNeeds, setDraftNeeds] = useState(String(props.needsPct));
  const [draftWants, setDraftWants] = useState(String(props.wantsPct));
  const [draftSavings, setDraftSavings] = useState(String(props.savingsPct));
  const [modalErr, setModalErr] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setN(props.needsPct);
    setW(props.wantsPct);
    setS(props.savingsPct);
  }, [props.needsPct, props.wantsPct, props.savingsPct]);

  useEffect(() => {
    if (!pctModalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPctModalOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pctModalOpen]);

  const openPctModal = useCallback(() => {
    setDraftNeeds(String(n));
    setDraftWants(String(w));
    setDraftSavings(String(s));
    setModalErr(null);
    setPctModalOpen(true);
  }, [n, w, s]);

  const persist = useCallback(
    async (nextN: number, nextW: number, nextS: number) => {
      setErr(null);
      setSaving(true);
      const res = await updateBudgetPercents(nextN, nextW, nextS);
      setSaving(false);
      if ("error" in res && res.error) {
        setErr(res.error);
        setN(props.needsPct);
        setW(props.wantsPct);
        setS(props.savingsPct);
        return false;
      }
      setN(nextN);
      setW(nextW);
      setS(nextS);
      router.refresh();
      return true;
    },
    [props.needsPct, props.wantsPct, props.savingsPct, router]
  );

  async function handlePctModalSave(e: React.FormEvent) {
    e.preventDefault();
    setModalErr(null);
    const nn = parsePctDraft(draftNeeds);
    const nw = parsePctDraft(draftWants);
    const ns = parsePctDraft(draftSavings);
    if (!validateBudgetPercents(nn, nw, ns)) {
      setModalErr("Los tres valores deben ser ≥ 0 y sumar exactamente 100.");
      return;
    }
    const ok = await persist(nn, nw, ns);
    if (ok) setPctModalOpen(false);
  }

  const rows: { key: BucketKey; pct: number }[] = [
    { key: "NEEDS", pct: n },
    { key: "WANTS", pct: w },
    { key: "SAVINGS", pct: s },
  ];

  const toggle = useCallback((key: BucketKey) => {
    setDetailOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const draftSum = parsePctDraft(draftNeeds) + parsePctDraft(draftWants) + parsePctDraft(draftSavings);

  const modal =
    mounted && pctModalOpen
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pct-modal-title"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
              aria-label="Cerrar"
              onClick={() => setPctModalOpen(false)}
            />
            <div
              className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800/90 bg-zinc-900 p-6 shadow-2xl shadow-black/50 ring-1 ring-white/[0.06]"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="pct-modal-title" className="text-lg font-semibold text-white">
                Reparto del presupuesto (ingresos)
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Necesidades, deseos y ahorro deben sumar 100%.
              </p>
              <form onSubmit={handlePctModalSave} className="mt-6 space-y-4">
                {modalErr ? (
                  <p className="text-sm text-rose-400" role="alert">
                    {modalErr}
                  </p>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-3">
                  {(
                    [
                      { key: "NEEDS" as const, val: draftNeeds, set: setDraftNeeds, color: "text-sky-400/90" },
                      { key: "WANTS" as const, val: draftWants, set: setDraftWants, color: "text-violet-400/90" },
                      {
                        key: "SAVINGS" as const,
                        val: draftSavings,
                        set: setDraftSavings,
                        color: "text-emerald-400/90",
                      },
                    ] as const
                  ).map(({ key, val, set, color }) => (
                    <div key={key}>
                      <label className={labelClass}>
                        <span className={color}>{bucketLabel(key)}</span>
                      </label>
                      <div className="flex items-baseline gap-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          value={val}
                          onChange={(e) => set(sanitizePctInput(e.target.value))}
                          className={cn(fieldClass, "tabular-nums")}
                          aria-label={`Porcentaje ${bucketLabel(key)}`}
                        />
                        <span className="text-sm text-zinc-500">%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p
                  className={cn(
                    "text-sm tabular-nums",
                    draftSum === 100 ? "text-zinc-500" : "text-amber-400/90"
                  )}
                >
                  Total: {draftSum}% {draftSum !== 100 ? "· debe ser 100" : ""}
                </p>
                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className={btnSecondaryClass}
                    onClick={() => setPctModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className={btnPrimaryClass} disabled={saving}>
                    {saving ? "Guardando…" : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openPctModal}
          disabled={saving}
          title="Editar reparto del presupuesto"
          aria-label="Editar reparto del presupuesto"
          className={cn(
            "rounded-md p-1.5 text-zinc-600 transition-colors",
            "hover:bg-zinc-800/50 hover:text-zinc-400",
            "focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600/60",
            "disabled:pointer-events-none disabled:opacity-40"
          )}
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>

      {err ? (
        <p className="text-sm text-rose-400" role="alert">
          {err}
        </p>
      ) : null}
      <motion.ul
        variants={container}
        initial="hidden"
        animate="show"
        className={cn(
          "grid grid-cols-1 items-start gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3",
          saving && "pointer-events-none opacity-60"
        )}
      >
        {rows.map(({ key, pct }) => {
          const t = theme[key];
          const isOpen = detailOpen[key];
          const spentPct =
            props.budget[key] > 0
              ? Math.min(100, Math.round((props.spent[key] / props.budget[key]) * 100))
              : props.spent[key] > 0
                ? 100
                : 0;

          return (
            <motion.li key={key} variants={item} className="min-w-0 list-none w-full self-start">
              <div
                className={`relative flex w-full flex-col rounded-2xl border border-zinc-800/90 bg-zinc-900/35 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] ring-1 ${t.ring}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${t.labelColor}`}>
                      {bucketLabel(key)}
                    </p>
                    <div className="mt-2">
                      <span className="text-3xl font-semibold tabular-nums tracking-tight text-white">
                        {pct}
                        <span className="ml-px select-none text-[0.55em] font-semibold leading-none text-zinc-500">
                          %
                        </span>
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-500">{t.hint}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                      aria-expanded={isOpen}
                      aria-label={isOpen ? "Contraer" : "Expandir"}
                    >
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")}
                      />
                    </button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <dl className="mt-4 flex flex-col gap-3 text-sm">
                        <div className="flex items-baseline justify-between gap-3">
                          <dt className="text-zinc-500">Presupuesto</dt>
                          <dd className="font-medium tabular-nums text-zinc-100">
                            {formatCOP(props.budget[key])}
                          </dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-3">
                          <dt className="text-zinc-500">Gastado</dt>
                          <dd className="font-medium tabular-nums text-zinc-200">
                            {formatCOP(props.spent[key])}
                          </dd>
                        </div>
                      </dl>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="mt-4 space-y-3">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-zinc-500">Disponible</span>
                    <span
                      className={`font-semibold tabular-nums ${
                        props.remaining[key] >= 0 ? "text-emerald-400/95" : "text-amber-400/95"
                      }`}
                    >
                      {formatCOP(props.remaining[key])}
                    </span>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Uso del presupuesto</span>
                      <span className="tabular-nums text-zinc-400">{spentPct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <motion.div
                        className={`h-full rounded-full ${t.bar}`}
                        initial={false}
                        animate={{ width: `${spentPct}%` }}
                        transition={{ type: "spring", stiffness: 120, damping: 22, mass: 0.6 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.li>
          );
        })}
      </motion.ul>
      {modal}
      {saving ? (
        <p className="text-center text-xs text-zinc-500">Guardando…</p>
      ) : null}
    </div>
  );
}
