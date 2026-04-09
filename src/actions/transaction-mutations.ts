"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { splitIncome } from "@/lib/budget-alloc";
import { bucketLabel } from "@/lib/labels";
import type { BucketKey } from "@/lib/month-budget-envelope";
import { getAccountBalance } from "@/lib/account-balance";
import { computeMonthBucketEnvelope } from "@/lib/month-budget-envelope";
import { prisma } from "@/lib/prisma";
import type { BudgetBucket, IncomeAllocationMode } from "@prisma/client";

/**
 * Inserción vía SQL parametrizado: evita PrismaClientValidationError al mezclar
 * FK escalares con categoría opcional (bug de validación en create() en algunos entornos / caché vieja).
 */
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
    const cat = await prisma.category.findFirst({
      where: { id: cid, userId: session.user.id, kind: "INCOME" },
    });
    if (!cat) return { error: "Categoría de ingreso inválida." as const };
  }

  const acc = await prisma.financialAccount.findFirst({
    where: { id: input.accountId, userId: session.user.id },
  });
  if (!acc) return { error: "Cuenta inválida." as const };

  const settings = await prisma.budgetSettings.findUnique({
    where: { userId: session.user.id },
  });
  const needsPct = settings?.needsPct ?? 50;
  const wantsPct = settings?.wantsPct ?? 30;
  const savingsPct = settings?.savingsPct ?? 20;

  const { needs, wants, savings } = splitIncome(
    amount,
    input.allocationMode,
    needsPct,
    wantsPct,
    savingsPct
  );

  const id = randomUUID();
  const title = input.title?.trim() || "Ingreso";
  const description = input.description?.trim() || null;
  const date = new Date(input.date);

  await prisma.$executeRaw`
    INSERT INTO "Transaction" (
      "id",
      "userId",
      "accountId",
      "kind",
      "amount",
      "title",
      "description",
      "categoryId",
      "date",
      "allocationMode",
      "allocatedNeeds",
      "allocatedWants",
      "allocatedSavings"
    ) VALUES (
      ${id},
      ${session.user.id},
      ${input.accountId},
      'INCOME',
      ${amount},
      ${title},
      ${description},
      ${cid},
      ${date},
      ${input.allocationMode},
      ${needs},
      ${wants},
      ${savings}
    )
  `;

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
    const cat = await prisma.category.findFirst({
      where: { id: cid, userId: session.user.id, kind: "EXPENSE" },
    });
    if (!cat) return { error: "Categoría de gasto inválida." as const };
  }

  const acc = await prisma.financialAccount.findFirst({
    where: { id: input.accountId, userId: session.user.id },
  });
  if (!acc) return { error: "Cuenta inválida." as const };

  const accountBalance = await getAccountBalance(session.user.id, input.accountId);
  if (accountBalance < amount) {
    return {
      error:
        "Fondos insuficientes en esta cuenta para cubrir el gasto." as const,
    };
  }

  const date = new Date(input.date);

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

  const id = randomUUID();
  const title = input.title?.trim() || "Gasto";
  const description = input.description?.trim() || null;
  const expenseBucket = cid ? null : (input.expenseBucket ?? "NEEDS");

  await prisma.$executeRaw`
    INSERT INTO "Transaction" (
      "id",
      "userId",
      "accountId",
      "kind",
      "amount",
      "title",
      "description",
      "categoryId",
      "date",
      "allocationMode",
      "allocatedNeeds",
      "allocatedWants",
      "allocatedSavings",
      "expenseBucket"
    ) VALUES (
      ${id},
      ${session.user.id},
      ${input.accountId},
      'EXPENSE',
      ${amount},
      ${title},
      ${description},
      ${cid},
      ${date},
      NULL,
      NULL,
      NULL,
      NULL,
      ${expenseBucket}
    )
  `;

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/movimientos");
  revalidatePath("/dashboard/cuentas");
  return { ok: true as const };
}

export async function deleteTransaction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" as const };
  await prisma.transaction.deleteMany({
    where: { id, userId: session.user.id },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/movimientos");
  revalidatePath("/dashboard/cuentas");
  return { ok: true as const };
}
