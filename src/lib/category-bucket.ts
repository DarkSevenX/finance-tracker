import type { BudgetBucket, Category } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function resolveExpenseBucket(categoryId: string): Promise<BudgetBucket> {
  let current = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!current || current.kind !== "EXPENSE") {
    throw new Error("La categoría debe ser de gasto.");
  }
  const visited = new Set<string>();
  while (current) {
    if (visited.has(current.id)) throw new Error("Categoría inválida (ciclo).");
    visited.add(current.id);
    if (current.bucket) return current.bucket;
    if (!current.parentId) {
      throw new Error("Toda categoría de gasto debe tener bloque (o un padre con bloque).");
    }
    current = await prisma.category.findUnique({ where: { id: current.parentId } });
  }
  throw new Error("No se pudo resolver el bloque del gasto.");
}
