"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { BudgetBucket, CategoryKind } from "@/lib/db/schema";
import { createCategory } from "@/actions/categories";
import { bucketLabel } from "@/lib/labels";
import { cn } from "@/lib/cn";
import { btnPrimaryClass, fieldClass, labelClass } from "@/lib/ui-classes";

const buckets: BudgetBucket[] = ["NEEDS", "WANTS", "SAVINGS"];

export function CategoryForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [kind, setKind] = useState<CategoryKind>("EXPENSE");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setPending(true);
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "");
    const kind = String(fd.get("kind") ?? "EXPENSE") as CategoryKind;
    const res = await createCategory({
      name,
      kind,
      parentId: null,
      bucket: null,
    });
    setPending(false);
    if ("error" in res && res.error) {
      toast.error(res.error);
    } else {
      toast.success("Categoría creada.");
      form.reset();
      router.refresh();
      onSuccess?.();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="cat-kind">
          Tipo
        </label>
        <select
          id="cat-kind"
          name="kind"
          value={kind}
          onChange={(e) => {
            setKind(e.target.value as CategoryKind);
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
      <button type="submit" disabled={pending} className={cn(btnPrimaryClass)}>
        {pending ? "Guardando…" : "Agregar categoría"}
      </button>
    </form>
  );
}

