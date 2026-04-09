"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { BudgetBucket, CategoryKind } from "@prisma/client";

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
      const parent = await prisma.category.findFirst({
        where: { id: input.parentId, userId: session.user.id, kind: "EXPENSE" },
      });
      if (!parent) return { error: "Padre inválido." as const };
      const created = await prisma.category.create({
        data: {
          userId: session.user.id,
          name,
          kind: "EXPENSE",
          parentId: input.parentId,
          bucket: null,
        },
      });
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/categorias");
      revalidatePath("/dashboard/movimientos");
      return { ok: true as const, id: created.id };
    }
    if (!input.bucket) return { error: "Elige un bloque (necesidades, deseos o ahorros)." as const };
    const created = await prisma.category.create({
      data: {
        userId: session.user.id,
        name,
        kind: "EXPENSE",
        bucket: input.bucket,
      },
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/categorias");
    revalidatePath("/dashboard/movimientos");
    return { ok: true as const, id: created.id };
  }

  if (input.parentId) {
    const parent = await prisma.category.findFirst({
      where: { id: input.parentId, userId: session.user.id, kind: "INCOME" },
    });
    if (!parent) return { error: "Padre inválido." as const };
  }
  const created = await prisma.category.create({
    data: {
      userId: session.user.id,
      name,
      kind: "INCOME",
      parentId: input.parentId ?? null,
      bucket: null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/categorias");
  revalidatePath("/dashboard/movimientos");
  return { ok: true as const, id: created.id };
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" as const };
  const used = await prisma.transaction.count({
    where: { categoryId: id, userId: session.user.id },
  });
  if (used > 0) return { error: "Hay movimientos con esta categoría." as const };
  const children = await prisma.category.count({ where: { parentId: id, userId: session.user.id } });
  if (children > 0) return { error: "Elimina primero las subcategorías." as const };
  await prisma.category.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/categorias");
  revalidatePath("/dashboard/movimientos");
  return { ok: true as const };
}
