"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Category, type CategoryModel, Transaction, type BudgetBucket, type CategoryKind } from "@/lib/db/schema";
import { eq, and, count as drizzleCount } from "drizzle-orm";

export async function createCategory(input: {
  name: string;
  kind: CategoryKind;
  parentId?: string | null;
  bucket?: BudgetBucket | null;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" as const };
  const name = input.name.trim();
  if (!name) return { error: "Nombre requerido." as const };

  if (input.kind === "EXPENSE") {
    if (input.parentId) {
      const parentResult = await db.select().from(Category)
        .where(and(eq(Category.id, input.parentId), eq(Category.userId, session.user.id), eq(Category.kind, "EXPENSE")))
        .limit(1);
      const parent = parentResult[0];
      if (!parent) return { error: "Padre inválido." as const };
      const created = await db.insert(Category).values({
        userId: session.user.id,
        name,
        kind: "EXPENSE",
        parentId: input.parentId,
        bucket: null,
      }).returning({ id: Category.id });
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/categorias");
      revalidatePath("/dashboard/movimientos");
      return { ok: true as const, id: created[0].id };
    }
    if (!input.bucket) return { error: "Elige un bloque (necesidades, deseos o ahorros)." as const };
    const created = await db.insert(Category).values({
      userId: session.user.id,
      name,
      kind: "EXPENSE",
      bucket: input.bucket,
    }).returning({ id: Category.id });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/categorias");
    revalidatePath("/dashboard/movimientos");
    return { ok: true as const, id: created[0].id };
  }

  if (input.parentId) {
    const parentResult = await db.select().from(Category)
      .where(and(eq(Category.id, input.parentId), eq(Category.userId, session.user.id), eq(Category.kind, "INCOME")))
      .limit(1);
    const parent = parentResult[0];
    if (!parent) return { error: "Padre inválido." as const };
  }
  const created = await db.insert(Category).values({
    userId: session.user.id,
    name,
    kind: "INCOME",
    parentId: input.parentId ?? null,
    bucket: null,
  }).returning({ id: Category.id });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/categorias");
  revalidatePath("/dashboard/movimientos");
  return { ok: true as const, id: created[0].id };
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" as const };
  const usedResult = await db.select({ value: drizzleCount() }).from(Transaction)
    .where(and(eq(Transaction.categoryId, id), eq(Transaction.userId, session.user.id)));
  const used = usedResult[0]?.value ?? 0;
  if (used > 0) return { error: "Hay movimientos con esta categoría." as const };
  const childrenResult = await db.select({ value: drizzleCount() }).from(Category)
    .where(and(eq(Category.parentId, id), eq(Category.userId, session.user.id)));
  const children = childrenResult[0]?.value ?? 0;
  if (children > 0) return { error: "Elimina primero las subcategorías." as const };
  await db.delete(Category).where(and(eq(Category.id, id), eq(Category.userId, session.user.id)));
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/categorias");
  revalidatePath("/dashboard/movimientos");
  return { ok: true as const };
}


