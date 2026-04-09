import type { BudgetBucket, IncomeAllocationMode, Prisma } from "@prisma/client";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { buildBucketResolver } from "@/lib/budget-bucket-resolve";
import { splitIncome } from "@/lib/budget-alloc";
import { applyBucketReallocations, type BucketKey } from "@/lib/month-budget-envelope";
import { prisma } from "@/lib/prisma";

export type { BucketKey } from "@/lib/month-budget-envelope";

export type DashboardMonthMovement = Prisma.TransactionGetPayload<{
  include: { category: true; account: true };
}> & { resolvedBucket: BudgetBucket | null };

export type IncomeExpenseMonthPoint = {
  key: string;
  /** Etiqueta corta del mes (ej. «ene»). */
  label: string;
  income: number;
  expense: number;
};

export async function getDashboardSnapshot(userId: string, ref: Date) {
  const start = startOfMonth(ref);
  const end = endOfMonth(ref);

  const seriesStart = startOfMonth(subMonths(ref, 5));
  const seriesEnd = endOfMonth(ref);

  const [settings, accounts, categories, txMonth, txAll, txsForSeries, bucketShifts] = await Promise.all([
    prisma.budgetSettings.findUnique({ where: { userId } }),
    prisma.financialAccount.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { userId } }),
    prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
        kind: { in: ["INCOME", "EXPENSE"] },
      },
      include: { category: true, account: true },
      orderBy: { date: "desc" },
    }),
    prisma.transaction.findMany({
      where: { userId },
      select: { accountId: true, kind: true, amount: true, toAccountId: true },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: seriesStart, lte: seriesEnd },
        kind: { in: ["INCOME", "EXPENSE"] },
      },
      select: { date: true, kind: true, amount: true },
    }),
    prisma.bucketReallocation.findMany({
      where: { userId, monthStart: start },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const needsPct = settings?.needsPct ?? 50;
  const wantsPct = settings?.wantsPct ?? 30;
  const savingsPct = settings?.savingsPct ?? 20;

  const resolveBucket = buildBucketResolver(categories);

  const budget = { NEEDS: 0, WANTS: 0, SAVINGS: 0 };
  const spent: Record<BucketKey, number> = { NEEDS: 0, WANTS: 0, SAVINGS: 0 };

  for (const t of txMonth) {
    if (t.kind === "INCOME") {
      /** Reparto según los % actuales (no los guardados en el ingreso), para que al editar 50/30/20 el resumen se actualice. */
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
      const b = (t.expenseBucket ?? "NEEDS") as BucketKey;
      spent[b] += t.amount;
    }
  }

  const accountStats = accounts.map((a) => {
    let income = 0;
    let expense = 0;
    let transferNet = 0;
    for (const row of txAll) {
      if (row.kind === "TRANSFER") {
        if (row.accountId === a.id) transferNet -= row.amount;
        if (row.toAccountId === a.id) transferNet += row.amount;
        continue;
      }
      if (row.accountId !== a.id) continue;
      if (row.kind === "INCOME") income += row.amount;
      else if (row.kind === "EXPENSE") expense += row.amount;
    }
    const balance = income - expense + transferNet;
    const pctSpent = income > 0 ? Math.round((expense / income) * 100) : expense > 0 ? 100 : 0;
    return {
      id: a.id,
      name: a.name,
      kind: a.kind,
      income,
      expense,
      balance,
      pctSpent,
    };
  });

  let totalIncomeAll = 0;
  let totalExpenseAll = 0;
  for (const row of txAll) {
    if (row.kind === "INCOME") totalIncomeAll += row.amount;
    else if (row.kind === "EXPENSE") totalExpenseAll += row.amount;
  }

  const incomeExpenseLast6Months: IncomeExpenseMonthPoint[] = [];
  for (let i = 0; i < 6; i++) {
    const monthDate = startOfMonth(subMonths(ref, 5 - i));
    incomeExpenseLast6Months.push({
      key: format(monthDate, "yyyy-MM"),
      label: format(monthDate, "MMM", { locale: es }),
      income: 0,
      expense: 0,
    });
  }
  const byMonthKey = new Map(incomeExpenseLast6Months.map((row) => [row.key, row]));
  for (const t of txsForSeries) {
    const key = format(startOfMonth(t.date), "yyyy-MM");
    const row = byMonthKey.get(key);
    if (!row) continue;
    if (t.kind === "INCOME") row.income += t.amount;
    else row.expense += t.amount;
  }

  const monthMovements: DashboardMonthMovement[] = txMonth.map((t): DashboardMonthMovement => ({
    ...t,
    resolvedBucket:
      t.kind === "EXPENSE" && t.categoryId
        ? resolveBucket(t.categoryId)
        : t.kind === "EXPENSE"
          ? ((t.expenseBucket ?? "NEEDS") as BudgetBucket)
          : null,
  }));

  return {
    month: ref,
    needsPct,
    wantsPct,
    savingsPct,
    budget,
    spent,
    remaining: applyBucketReallocations(
      {
        NEEDS: budget.NEEDS - spent.NEEDS,
        WANTS: budget.WANTS - spent.WANTS,
        SAVINGS: budget.SAVINGS - spent.SAVINGS,
      },
      bucketShifts
    ),
    accountStats,
    totalBalance: totalIncomeAll - totalExpenseAll,
    totalIncomeAll,
    totalExpenseAll,
    /** Ingresos y gastos por mes (últimos 6 meses hasta el mes de `ref`). */
    incomeExpenseLast6Months,
    /** Todos los movimientos del mes de referencia (fecha descendente). */
    monthMovements,
    /** Reasignaciones entre bloques del mes (no son ingresos/gastos). */
    bucketShiftsMonth: bucketShifts,
  };
}
