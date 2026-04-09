import type { BudgetBucket, IncomeAllocationMode } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { endOfMonth, startOfMonth } from "date-fns";
import { splitIncome } from "@/lib/budget-alloc";
import { buildBucketResolver } from "@/lib/budget-bucket-resolve";
import { prisma } from "@/lib/prisma";

export type BucketKey = "NEEDS" | "WANTS" | "SAVINGS";

/** Aplica reasignaciones entre bloques del mes sobre el remanente base (presupuesto − gasto). */
export function applyBucketReallocations(
  baseRemaining: Record<BucketKey, number>,
  shifts: { fromBucket: BudgetBucket; toBucket: BudgetBucket; amount: number }[]
): Record<BucketKey, number> {
  const r = { ...baseRemaining };
  for (const s of shifts) {
    r[s.fromBucket as BucketKey] -= s.amount;
    r[s.toBucket as BucketKey] += s.amount;
  }
  return r;
}

/**
 * Presupuesto del mes (según ingresos y reparto 50/30/20) y gasto ya imputado por bloque.
 * Misma lógica que el resumen del dashboard para ese mes.
 */
export async function computeMonthBucketEnvelope(
  userId: string,
  monthDate: Date
): Promise<{
  remaining: Record<BucketKey, number>;
  resolveBucket: (categoryId: string) => BudgetBucket;
}> {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);

  const [settings, categories, txMonth] = await Promise.all([
    prisma.budgetSettings.findUnique({ where: { userId } }),
    prisma.category.findMany({ where: { userId } }),
    /** SQL directo: evita fallos si el cliente de Prisma en caché (p. ej. Turbopack) va desfasado respecto al esquema con `expenseBucket`. */
    prisma.$queryRaw<
      Array<{
        kind: string;
        amount: number;
        categoryId: string | null;
        expenseBucket: string | null;
        allocationMode: string | null;
      }>
    >(Prisma.sql`
      SELECT "kind", "amount", "categoryId", "expenseBucket", "allocationMode"
      FROM "Transaction"
      WHERE "userId" = ${userId}
        AND "date" >= ${start}
        AND "date" <= ${end}
        AND "kind" IN ('INCOME', 'EXPENSE')
    `),
  ]);

  const needsPct = settings?.needsPct ?? 50;
  const wantsPct = settings?.wantsPct ?? 30;
  const savingsPct = settings?.savingsPct ?? 20;

  const resolveBucket = buildBucketResolver(categories);
  const budget = { NEEDS: 0, WANTS: 0, SAVINGS: 0 };
  const spent: Record<BucketKey, number> = { NEEDS: 0, WANTS: 0, SAVINGS: 0 };

  for (const t of txMonth) {
    if (t.kind === "INCOME") {
      const mode = (t.allocationMode ?? "SPLIT") as IncomeAllocationMode;
      const { needs, wants, savings } = splitIncome(
        t.amount,
        mode,
        needsPct,
        wantsPct,
        savingsPct
      );
      budget.NEEDS += needs;
      budget.WANTS += wants;
      budget.SAVINGS += savings;
    } else if (t.categoryId) {
      const b = resolveBucket(t.categoryId);
      spent[b] += t.amount;
    } else {
      const b = ((t.expenseBucket ?? "NEEDS") as BudgetBucket) as BucketKey;
      spent[b] += t.amount;
    }
  }

  const baseRemaining: Record<BucketKey, number> = {
    NEEDS: budget.NEEDS - spent.NEEDS,
    WANTS: budget.WANTS - spent.WANTS,
    SAVINGS: budget.SAVINGS - spent.SAVINGS,
  };

  const shifts = await prisma.bucketReallocation.findMany({
    where: { userId, monthStart: start },
  });

  return {
    remaining: applyBucketReallocations(baseRemaining, shifts),
    resolveBucket,
  };
}
