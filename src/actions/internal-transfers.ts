"use server";

import { revalidatePath } from "next/cache";
import { startOfMonth } from "date-fns";
import { auth } from "@/auth";
import { getAccountBalance } from "@/lib/account-balance";
import { bucketLabel } from "@/lib/labels";
import type { BucketKey } from "@/lib/month-budget-envelope";
import { computeMonthBucketEnvelope } from "@/lib/month-budget-envelope";
import { prisma } from "@/lib/prisma";
import type { BudgetBucket } from "@prisma/client";

export async function createAccountTransfer(input: {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  title?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" as const };

  const amount = Math.round(input.amount);
  if (amount <= 0) return { error: "El monto debe ser mayor a 0." as const };
  if (input.fromAccountId === input.toAccountId) {
    return { error: "Elige dos cuentas distintas." as const };
  }

  const [from, to] = await Promise.all([
    prisma.financialAccount.findFirst({
      where: { id: input.fromAccountId, userId: session.user.id },
    }),
    prisma.financialAccount.findFirst({
      where: { id: input.toAccountId, userId: session.user.id },
    }),
  ]);
  if (!from || !to) return { error: "Cuenta inválida." as const };

  const balance = await getAccountBalance(session.user.id, input.fromAccountId);
  if (balance < amount) {
    return { error: "Saldo insuficiente en la cuenta de origen." as const };
  }

  const title = input.title?.trim() || "Traspaso entre cuentas";
  const date = new Date(input.date);

  await prisma.transaction.create({
    data: {
      userId: session.user.id,
      accountId: input.fromAccountId,
      toAccountId: input.toAccountId,
      kind: "TRANSFER",
      amount,
      title,
      date,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/movimientos");
  revalidatePath("/dashboard/cuentas");
  return { ok: true as const };
}

export async function createBucketReallocation(input: {
  monthStart: string;
  fromBucket: BudgetBucket;
  toBucket: BudgetBucket;
  amount: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" as const };

  const amount = Math.round(input.amount);
  if (amount <= 0) return { error: "El monto debe ser mayor a 0." as const };
  if (input.fromBucket === input.toBucket) {
    return { error: "Elige dos bloques distintos." as const };
  }

  const monthDate = startOfMonth(new Date(`${input.monthStart}T12:00:00`));
  const { remaining } = await computeMonthBucketEnvelope(session.user.id, monthDate);
  const from = input.fromBucket as BucketKey;
  if (remaining[from] < amount) {
    return {
      error: `No hay suficiente disponible en «${bucketLabel(from)}» para mover (tras otros ajustes del mes).` as const,
    };
  }

  await prisma.bucketReallocation.create({
    data: {
      userId: session.user.id,
      monthStart: monthDate,
      fromBucket: input.fromBucket,
      toBucket: input.toBucket,
      amount,
    },
  });

  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function deleteBucketReallocation(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" as const };

  const deleted = await prisma.bucketReallocation.deleteMany({
    where: { id, userId: session.user.id },
  });
  if (deleted.count === 0) return { error: "Ajuste no encontrado." as const };

  revalidatePath("/dashboard");
  return { ok: true as const };
}
