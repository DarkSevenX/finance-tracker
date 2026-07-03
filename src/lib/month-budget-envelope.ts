import type { BudgetBucket, IncomeAllocationMode } from "@/lib/db/schema";
import { endOfMonth, startOfMonth } from "date-fns";
import { splitIncome } from "@/lib/budget-alloc";
import { buildBucketResolver } from "@/lib/budget-bucket-resolve";
import { db } from "@/lib/db";
import { BudgetSettings, Category, Transaction, BucketReallocation } from "@/lib/db/schema";
import { eq, and, gte, lte, inArray } from "drizzle-orm";

export type BucketKey = "NEEDS" | "WANTS" | "SAVINGS";

/** Aplica reasignaciones entre bloques del mes sobre el remanente base (presupuesto − gasto). */
export function applyBucketReallocations(
  baseRemaining: Record<BucketKey, number>,
  shifts: { fromBucket: string; toBucket: string; amount: number }[]
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

  const [settingsList, categories, txMonth] = await Promise.all([
    db.select().from(BudgetSettings).where(eq(BudgetSettings.userId, userId)).limit(1),
    db.select().from(Category).where(eq(Category.userId, userId)),
    db.select({
      kind: Transaction.kind,
      amount: Transaction.amount,
      categoryId: Transaction.categoryId,
      expenseBucket: Transaction.expenseBucket,
      allocationMode: Transaction.allocationMode
    })
    .from(Transaction)
    .where(and(
      eq(Transaction.userId, userId),
      gte(Transaction.date, start),
      lte(Transaction.date, end),
      inArray(Transaction.kind, ["INCOME", "EXPENSE"])
    )),
  ]);

  const settings = settingsList[0];
  const needsPct = settings?.needsPct ?? 50;
  const wantsPct = settings?.wantsPct ?? 30;
  const savingsPct = settings?.savingsPct ?? 20;

  const resolveBucket = buildBucketResolver(categories as any);
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

  const shifts = await db.select()
    .from(BucketReallocation)
    .where(and(
      eq(BucketReallocation.userId, userId),
      eq(BucketReallocation.monthStart, start)
    ));

  return {
    remaining: applyBucketReallocations(baseRemaining, shifts),
    resolveBucket,
  };
}

