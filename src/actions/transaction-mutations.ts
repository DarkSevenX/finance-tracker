"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { splitIncome } from "@/lib/budget-alloc";
import { bucketLabel } from "@/lib/labels";
import type { BucketKey } from "@/lib/month-budget-envelope";
import { getAccountBalance } from "@/lib/account-balance";
import { computeMonthBucketEnvelope } from "@/lib/month-budget-envelope";
import { db } from "@/lib/db";
import { Category, type CategoryModel, FinancialAccount, BudgetSettings, Transaction, type BudgetBucket, type IncomeAllocationMode } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function createIncome(input: {
  title?: string;
  description?: string | null;
  amount: number;
  accountId: string;
  categoryId?: string | null;
  date: string;
  allocationMode: IncomeAllocationMode;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" as const };
  const amount = Math.round(input.amount);
  if (amount <= 0) return { error: "El monto debe ser mayor a 0." as const };

  const cid = input.categoryId?.trim() || null;
  if (cid) {
    const catResult = await db.select().from(Category)
      .where(and(eq(Category.id, cid), eq(Category.userId, session.user.id), eq(Category.kind, "INCOME")))
      .limit(1);
    if (!catResult[0]) return { error: "Categoría de ingreso inválida." as const };
  }

  const accResult = await db.select().from(FinancialAccount)
    .where(and(eq(FinancialAccount.id, input.accountId), eq(FinancialAccount.userId, session.user.id)))
    .limit(1);
  if (!accResult[0]) return { error: "Cuenta inválida." as const };

  const settingsResult = await db.select().from(BudgetSettings)
    .where(eq(BudgetSettings.userId, session.user.id))
    .limit(1);
  const settings = settingsResult[0];
  
  const needsPct = settings?.needsPct ?? 50;
  const wantsPct = settings?.wantsPct ?? 30;
  const savingsPct = settings?.savingsPct ?? 20;



  // [NOTA AI]: Se desactiva la distribución 50/30/20.
  // const { needs, wants, savings } = splitIncome(
  //   amount,
  //   input.allocationMode,
  //   needsPct,
  //   wantsPct,
  //   savingsPct
  // );

  const title = input.title?.trim() || "Ingreso";
  const description = input.description?.trim() || null;
  const date = new Date(input.date);

  await db.insert(Transaction).values({
    userId: session.user.id,
    accountId: input.accountId,
    kind: "INCOME",
    amount,
    title,
    description,
    categoryId: cid,
    date,
    allocationMode: input.allocationMode,
    // [NOTA AI]: Se desactivan los montos distribuidos.
    allocatedNeeds: null,
    allocatedWants: null,
    allocatedSavings: null,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/movimientos");
  revalidatePath("/dashboard/cuentas");
  return { ok: true as const };
}

export async function createExpense(input: {
  title?: string;
  description?: string | null;
  amount: number;
  accountId: string;
  categoryId?: string | null;
  /** Solo si no hay categoría: bloque del presupuesto */
  expenseBucket?: BudgetBucket;
  date: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" as const };
  const amount = Math.round(input.amount);
  if (amount <= 0) return { error: "El monto debe ser mayor a 0." as const };

  const cid = input.categoryId?.trim() || null;
  if (cid) {
    const catResult = await db.select().from(Category)
      .where(and(eq(Category.id, cid), eq(Category.userId, session.user.id), eq(Category.kind, "EXPENSE")))
      .limit(1);
    if (!catResult[0]) return { error: "Categoría de gasto inválida." as const };
  }

  const accResult = await db.select().from(FinancialAccount)
    .where(and(eq(FinancialAccount.id, input.accountId), eq(FinancialAccount.userId, session.user.id)))
    .limit(1);
  if (!accResult[0]) return { error: "Cuenta inválida." as const };

  const accountBalance = await getAccountBalance(session.user.id, input.accountId);
  if (accountBalance < amount) {
    return {
      error:
        "Fondos insuficientes en esta cuenta para cubrir el gasto." as const,
    };
  }

  const date = new Date(input.date);



  // [NOTA AI]: Se desactiva la validación de fondos por bloques.
  /*
  try {
    const { remaining, resolveBucket } = await computeMonthBucketEnvelope(
      session.user.id,
      date
    );
    const targetBucket = (
      cid ? resolveBucket(cid) : (input.expenseBucket ?? "NEEDS")
    ) as BucketKey;
    if (remaining[targetBucket] < amount) {
      return {
        error: `No hay suficiente disponible en «${bucketLabel(targetBucket)}» este mes para este gasto (presupuesto por bloques).`,
      };
    }
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : "No se pudo validar el presupuesto por bloques.";
    return { error: msg };
  }
  */

  const title = input.title?.trim() || "Gasto";
  const description = input.description?.trim() || null;
  const expenseBucket = cid ? null : (input.expenseBucket ?? "NEEDS");

  await db.insert(Transaction).values({
    userId: session.user.id,
    accountId: input.accountId,
    kind: "EXPENSE",
    amount,
    title,
    description,
    categoryId: cid,
    date,
    expenseBucket,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/movimientos");
  revalidatePath("/dashboard/cuentas");
  return { ok: true as const };
}

export async function deleteTransaction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" as const };
  
  await db.delete(Transaction).where(and(eq(Transaction.id, id), eq(Transaction.userId, session.user.id)));
  
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/movimientos");
  revalidatePath("/dashboard/cuentas");
  return { ok: true as const };
}

export async function updateTransaction(id: string, input: {
  title: string;
  amount: number;
  accountId: string;
  categoryId: string | null;
  date: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" as const };

  const txResult = await db.select().from(Transaction)
    .where(and(eq(Transaction.id, id), eq(Transaction.userId, session.user.id)))
    .limit(1);
    
  if (!txResult[0]) return { error: "Movimiento no encontrado." as const };
  const tx = txResult[0];

  const amount = Math.round(input.amount);
  if (amount <= 0) return { error: "El monto debe ser mayor a 0." as const };

  const accResult = await db.select().from(FinancialAccount)
    .where(and(eq(FinancialAccount.id, input.accountId), eq(FinancialAccount.userId, session.user.id)))
    .limit(1);
  if (!accResult[0]) return { error: "Cuenta inválida." as const };

  const cid = input.categoryId?.trim() || null;
  if (cid) {
    if (tx.kind === "TRANSFER") {
      return { error: "Los traslados no usan estas categorías." as const };
    }
    const catResult = await db.select().from(Category)
      .where(and(eq(Category.id, cid), eq(Category.userId, session.user.id), eq(Category.kind, tx.kind)))
      .limit(1);
    if (!catResult[0]) return { error: "Categoría inválida." as const };
  }

  await db.update(Transaction)
    .set({
      title: input.title.trim() || (tx.kind === "INCOME" ? "Ingreso" : "Gasto"),
      amount,
      accountId: input.accountId,
      categoryId: cid,
      date: new Date(input.date),
      expenseBucket: cid ? null : tx.expenseBucket,
    })
    .where(and(eq(Transaction.id, id), eq(Transaction.userId, session.user.id)));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/movimientos");
  revalidatePath("/dashboard/cuentas");
  return { ok: true as const };
}
