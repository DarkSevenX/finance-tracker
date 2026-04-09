import type { BudgetBucket, Category } from "@prisma/client";

export function categoryLabel(c: Category, byId: Map<string, Category>): string {
  if (!c.parentId) return c.name;
  const p = byId.get(c.parentId);
  return p ? `${p.name} › ${c.name}` : c.name;
}

/** Bloque de presupuesto resuelto (subcategorías heredan del padre). */
export function resolveExpenseCategoryBucket(
  c: Category,
  byId: Map<string, Category>
): BudgetBucket | null {
  let cur: Category | undefined = c;
  const vis = new Set<string>();
  while (cur) {
    if (vis.has(cur.id)) return null;
    vis.add(cur.id);
    if (cur.bucket) return cur.bucket;
    if (!cur.parentId) return null;
    cur = byId.get(cur.parentId);
  }
  return null;
}

export function expenseOptions(all: Category[]) {
  const list = all.filter((c) => c.kind === "EXPENSE");
  const byId = new Map(list.map((c) => [c.id, c]));
  return list
    .map((c) => ({ id: c.id, label: categoryLabel(c, byId) }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}

/** Para formularios de gasto: etiqueta + bloque para filtrar por necesidades/deseos/ahorros. */
export function expenseCategoriesForForm(all: Category[]) {
  const list = all.filter((c) => c.kind === "EXPENSE");
  const byId = new Map(list.map((c) => [c.id, c]));
  return list
    .map((c) => ({
      id: c.id,
      label: categoryLabel(c, byId),
      bucket: resolveExpenseCategoryBucket(c, byId),
    }))
    .filter((c): c is { id: string; label: string; bucket: BudgetBucket } => c.bucket !== null)
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}

export function incomeOptions(all: Category[]) {
  const list = all.filter((c) => c.kind === "INCOME");
  const byId = new Map(list.map((c) => [c.id, c]));
  return list
    .map((c) => ({ id: c.id, name: categoryLabel(c, byId) }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}
