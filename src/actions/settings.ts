"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { validateBudgetPercents } from "@/lib/budget-alloc";
import { db } from "@/lib/db";
import { BudgetSettings } from "@/lib/db/schema";

export async function updateBudgetPercents(needsPct: number, wantsPct: number, savingsPct: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" as const };
  if (!validateBudgetPercents(needsPct, wantsPct, savingsPct)) {
    return { error: "Los porcentajes deben sumar 100." as const };
  }
  
  await db.insert(BudgetSettings)
    .values({
      userId: session.user.id,
      needsPct,
      wantsPct,
      savingsPct,
    })
    .onConflictDoUpdate({
      target: BudgetSettings.userId,
      set: { needsPct, wantsPct, savingsPct },
    });
    
  revalidatePath("/dashboard");
  return { ok: true as const };
}

