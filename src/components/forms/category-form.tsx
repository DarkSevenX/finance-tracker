"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { BudgetBucket, CategoryKind } from "@prisma/client";
import { createCategory } from "@/actions/categories";
import { bucketLabel } from "@/lib/labels";
import { cn } from "@/lib/cn";
import { btnPrimaryClass, fieldClass, labelClass } from "@/lib/ui-classes";

const buckets: BudgetBucket[] = ["NEEDS", "WANTS", "SAVINGS"];

export function CategoryForm({
  incomeParents,
  expenseParents,
}: {
  incomeParents: { id: string; name: string }[];
  expenseParents: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [kind, setKind] = useState<CategoryKind>("EXPENSE");
  const [parentId, setParentId] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "");
    const pid = String(fd.get("parentId") ?? "") || null;
    const bucketRaw = String(fd.get("bucket") ?? "") as BudgetBucket | "";
    const res = await createCategory({
      name,
      kind,
      parentId: pid,
      bucket: kind === "EXPENSE" && !pid ? bucketRaw || undefined : null,
    });
    setPending(false);
    if ("error" in res && res.error) {
      toast.error(res.error);
    } else {
      toast.success("Categoría creada.");
      e.currentTarget.reset();
      router.refresh();
    }
  }

  const parents = kind === "INCOME" ? incomeParents : expenseParents;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Tipo</label>
        <select
          value={kind}
          onChange={(e) => {
            setKind(e.target.value as CategoryKind);
            setParentId("");
          }}
          className={fieldClass}
        >
          <option value="EXPENSE">Gasto</option>
          <option value="INCOME">Ingreso</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Nombre</label>
        <input name="name" required className={fieldClass} />
      </div>
      {kind === "EXPENSE" && !parentId ? (
        <div>
          <label className={labelClass}>Bloque (necesidades, deseos o ahorros)</label>
          <select name="bucket" className={fieldClass}>
            <option value="">— Elige —</option>
            {buckets.map((b) => (
              <option key={b} value={b}>
                {bucketLabel(b)}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div>
        <label className={labelClass}>Subcategoría de (opcional)</label>
        <select
          name="parentId"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className={fieldClass}
        >
          <option value="">— Ninguna —</option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={pending} className={cn(btnPrimaryClass)}>
        {pending ? "Guardando…" : "Agregar categoría"}
      </button>
    </form>
  );
}
