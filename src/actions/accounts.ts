"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { FinancialAccount, Transaction, type WalletKind } from "@/lib/db/schema";
import { eq, and, count as drizzleCount } from "drizzle-orm";

export async function createAccount(name: string, kind: WalletKind) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" as const };
  const n = name.trim();
  if (!n) return { error: "Nombre requerido." as const };
  
  await db.insert(FinancialAccount).values({
    userId: session.user.id,
    name: n,
    kind,
  });
  
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cuentas");
  return { ok: true as const };
}

export async function deleteAccount(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" as const };
  
  const countResult = await db.select({ value: drizzleCount() })
    .from(Transaction)
    .where(and(eq(Transaction.accountId, id), eq(Transaction.userId, session.user.id)));
    
  const count = countResult[0]?.value ?? 0;
  
  if (count > 0) {
    return { error: "No puedes eliminar una cuenta con movimientos." as const };
  }
  
  await db.delete(FinancialAccount).where(and(eq(FinancialAccount.id, id), eq(FinancialAccount.userId, session.user.id)));
  
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cuentas");
  return { ok: true as const };
}

