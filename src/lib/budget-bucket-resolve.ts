import type { BudgetBucket, Category } from "@prisma/client";

/** Resuelve el bloque del presupuesto para una categoría de gasto (árbol en memoria). */
export function buildBucketResolver(categories: Category[]) {
  const byId = new Map(categories.map((c) => [c.id, c]));
  return function resolve(catId: string): BudgetBucket {
    let cur = byId.get(catId);
    const vis = new Set<string>();
    while (cur) {
      if (vis.has(cur.id)) throw new Error("Ciclo en categorías");
      vis.add(cur.id);
      if (cur.bucket) return cur.bucket;
      if (!cur.parentId) throw new Error("Categoría sin bloque");
      cur = byId.get(cur.parentId);
    }
    throw new Error("Categoría no encontrada");
  };
}
