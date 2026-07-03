import type { BudgetBucket } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { Category } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function resolveExpenseBucket(categoryId: string): Promise<BudgetBucket> {
  let current = await db.select().from(Category).where(eq(Category.id, categoryId)).limit(1).then(r => r[0]);
  if (!current || current.kind !== "EXPENSE") {
    throw new Error("La categoría debe ser de gasto.");
  }
  const visited = new Set<string>();
  while (current) {
    if (visited.has(current.id)) throw new Error("Categoría inválida (ciclo).");
    visited.add(current.id);
    if (current.bucket) return current.bucket as BudgetBucket;
    if (!current.parentId) {
      throw new Error("Toda categoría de gasto debe tener bloque (o un padre con bloque).");
    }
    const nextCurrent = await db.select().from(Category).where(eq(Category.id, current.parentId)).limit(1).then(r => r[0]);
    if (!nextCurrent) break;
    current = nextCurrent;
  }
  throw new Error("No se pudo resolver el bloque del gasto.");
}

