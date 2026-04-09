"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import type { BudgetBucket } from "@prisma/client";
import { createCategory } from "@/actions/categories";
import { bucketLabel } from "@/lib/labels";
import { btnPrimaryClass, fieldClass, labelClass } from "@/lib/ui-classes";
import { cn } from "@/lib/cn";

const buckets: BudgetBucket[] = ["NEEDS", "WANTS", "SAVINGS"];

function CategoryOverlay({
  open,
  onClose,
  title,
  children,
  accentClass,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  accentClass: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cat-overlay-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border border-zinc-800/90 bg-zinc-900 p-5 shadow-2xl shadow-black/60 ring-1 ring-white/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="cat-overlay-title" className={cn("text-sm font-semibold text-white", accentClass)}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

export function InlineCategoryCreateExpense({
  onCreated,
  defaultBucket,
  variant = "block",
}: {
  onCreated: (id: string, label: string) => void;
  /** Sincroniza el bloque al elegir “necesidades / deseos / ahorros” en el formulario de gasto */
  defaultBucket?: BudgetBucket;
  /** `icon`: botón + compacto junto al selector; `block`: ancho completo como antes */
  variant?: "block" | "icon";
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [bucket, setBucket] = useState<BudgetBucket>(defaultBucket ?? "NEEDS");

  useEffect(() => {
    if (defaultBucket) setBucket(defaultBucket);
  }, [defaultBucket]);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const res = await createCategory({ name, kind: "EXPENSE", bucket });
    setPending(false);
    if ("error" in res && res.error) {
      toast.error(res.error);
    } else if ("id" in res && res.ok) {
      const label = name.trim();
      toast.success("Categoría creada.");
      onCreated(res.id, label);
      setName("");
      setOpen(false);
    }
  }

  const openBtn =
    variant === "icon" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Nueva categoría"
        aria-label="Nueva categoría de gasto"
        className={cn(
          "inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-zinc-700/80 bg-zinc-950/40",
          "text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-900/60 hover:text-zinc-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/50"
        )}
      >
        <Plus className="h-5 w-5" strokeWidth={2} aria-hidden />
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-zinc-800/90 bg-zinc-950/40 px-3 py-2.5 text-left text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
      >
        + Nueva categoría de gasto
      </button>
    );

  return (
    <>
      {openBtn}

      <CategoryOverlay
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva categoría de gasto"
        accentClass="text-sky-400/95"
      >
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className={labelClass}>Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ej. Mercado"
              className={fieldClass}
              autoFocus
            />
          </div>
          <div>
            <label className={labelClass}>Bloque del presupuesto</label>
            <select
              value={bucket}
              onChange={(e) => setBucket(e.target.value as BudgetBucket)}
              className={fieldClass}
            >
              {buckets.map((b) => (
                <option key={b} value={b}>
                  {bucketLabel(b)}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={pending} className={cn(btnPrimaryClass, "w-full")}>
            {pending ? "Creando…" : "Crear y usar"}
          </button>
        </form>
      </CategoryOverlay>
    </>
  );
}

export function InlineCategoryCreateIncome({
  onCreated,
  variant = "block",
}: {
  onCreated: (id: string, label: string) => void;
  variant?: "block" | "icon";
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const res = await createCategory({ name, kind: "INCOME" });
    setPending(false);
    if ("error" in res && res.error) {
      toast.error(res.error);
    } else if ("id" in res && res.ok) {
      const label = name.trim();
      toast.success("Categoría creada.");
      onCreated(res.id, label);
      setName("");
      setOpen(false);
    }
  }

  const openBtn =
    variant === "icon" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Nueva categoría"
        aria-label="Nueva categoría de ingreso"
        className={cn(
          "inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-zinc-700/80 bg-zinc-950/40",
          "text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-900/60 hover:text-zinc-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/50"
        )}
      >
        <Plus className="h-5 w-5" strokeWidth={2} aria-hidden />
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-zinc-800/90 bg-zinc-950/40 px-3 py-2.5 text-left text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
      >
        + Nueva categoría de ingreso
      </button>
    );

  return (
    <>
      {openBtn}

      <CategoryOverlay
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva categoría de ingreso"
        accentClass="text-emerald-400/95"
      >
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className={labelClass}>Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ej. Freelance"
              className={fieldClass}
              autoFocus
            />
          </div>
          <button type="submit" disabled={pending} className={cn(btnPrimaryClass, "w-full")}>
            {pending ? "Creando…" : "Crear y usar"}
          </button>
        </form>
      </CategoryOverlay>
    </>
  );
}
