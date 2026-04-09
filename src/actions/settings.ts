"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { validateBudgetPercents } from "@/lib/budget-alloc";
import { prisma } from "@/lib/prisma";

export async function updateBudgetPercents(needsPct: number, wantsPct: number, savingsPct: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" as const };
  if (!validateBudgetPercents(needsPct, wantsPct, savingsPct)) {
    return { error: "Los porcentajes deben sumar 100." as const };
  }
  await prisma.budgetSettings.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      needsPct,
      wantsPct,
      savingsPct,
    },
    update: { needsPct, wantsPct, savingsPct },
  });
  revalidatePath("/dashboard");
  return { ok: true as const };
}
