import { endOfMonth, format, startOfMonth } from "date-fns";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AvailableBalanceCard } from "@/components/dashboard/available-balance-card";
import { BucketCards } from "@/components/dashboard/bucket-cards";
import { IncomeExpenseChartPanel } from "@/components/dashboard/income-expense-chart-panel";
import { MonthMovementsTable } from "@/components/dashboard/month-movements-table";
import { QuickTransactionFab } from "@/components/dashboard/quick-transaction-fab";
import { MonthNav } from "@/components/dashboard/month-nav";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { getDashboardSnapshot, type DashboardMonthMovement } from "@/lib/dashboard-data";
import { expenseCategoriesForForm, incomeOptions } from "@/lib/category-options";
import { walletLabel } from "@/lib/labels";
import { formatCOP } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sp = await searchParams;
  const now = new Date();
  const y = sp.y ? parseInt(sp.y, 10) : now.getFullYear();
  const m = sp.m ? parseInt(sp.m, 10) : now.getMonth() + 1;
  const ref = new Date(y, m - 1, 1);

  const [data, accounts, categories] = await Promise.all([
    getDashboardSnapshot(session.user.id, ref),
    prisma.financialAccount.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, kind: true },
    }),
    prisma.category.findMany({ where: { userId: session.user.id } }),
  ]);

  const accOpts = accounts.map((a) => ({ id: a.id, name: `${a.name} (${walletLabel(a.kind)})` }));
  const incOpts = incomeOptions(categories);
  const expOpts = expenseCategoriesForForm(categories);

  const monthMin = format(startOfMonth(ref), "yyyy-MM-dd");
  const monthMax = format(endOfMonth(ref), "yyyy-MM-dd");
  const movementsPayload = data.monthMovements.map((t: DashboardMonthMovement) => ({
    id: t.id,
    date: t.date.toISOString(),
    title: t.title,
    kind: t.kind as "INCOME" | "EXPENSE",
    amount: t.amount,
    accountId: t.account.id,
    accountName: t.account.name,
    categoryId: t.category?.id ?? null,
    categoryName: t.category?.name ?? null,
    allocationMode: t.allocationMode,
    resolvedBucket: t.resolvedBucket,
  }));

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      <PageHeader
        // title="Resumen"
        // description="Saldo global y presupuesto del mes según ingresos registrados y regla configurada."
        title=""
        description=""
        action={<MonthNav year={y} month={m} />}
      />

      <div className="space-y-4 sm:space-y-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:items-stretch md:gap-4">
          <AvailableBalanceCard
            balance={data.totalBalance}
            accountCount={accounts.length}
            totalIncome={data.totalIncomeAll}
            totalExpense={data.totalExpenseAll}
          />
          <Card className="flex flex-col justify-center p-6 sm:p-8">
            <IncomeExpenseChartPanel
              income={data.totalIncomeAll}
              expense={data.totalExpenseAll}
              series={data.incomeExpenseLast6Months}
            />
          </Card>
        </div>

        <BucketCards
          needsPct={data.needsPct}
          wantsPct={data.wantsPct}
          savingsPct={data.savingsPct}
          budget={data.budget}
          spent={data.spent}
          remaining={data.remaining}
        />
      </div>

      <section className="space-y-4 sm:space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Cuentas</h2>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          {data.accountStats.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Aún no hay cuentas. Crea una en la sección <span className="text-zinc-300">Cuentas</span>.
            </p>
          ) : (
            data.accountStats.map((a: (typeof data.accountStats)[number]) => (
              <Card key={a.id} className="min-w-0 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium text-zinc-100">{a.name}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{walletLabel(a.kind)}</p>
                  </div>
                  <p className="shrink-0 text-right text-base font-semibold tabular-nums text-zinc-50 sm:text-lg">
                    {formatCOP(a.balance)}
                  </p>
                </div>
                <dl className="mt-5 space-y-2 border-t border-zinc-800/80 pt-4 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-zinc-500">Ingresos (total)</dt>
                    <dd className="tabular-nums text-zinc-300">{formatCOP(a.income)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-zinc-500">Gastos (total)</dt>
                    <dd className="tabular-nums text-zinc-300">{formatCOP(a.expense)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-zinc-500">Gastado / ingresado</dt>
                    <dd className="tabular-nums text-zinc-300">{a.pctSpent}%</dd>
                  </div>
                </dl>
              </Card>
            ))
          )}
        </div>
      </section>

      <section>
        <MonthMovementsTable
          movements={movementsPayload}
          accountOptions={accounts.map((a) => ({ id: a.id, name: a.name }))}
          categoryOptions={categories.map((c) => ({
            id: c.id,
            name: c.name,
            kind: c.kind,
          }))}
          monthMin={monthMin}
          monthMax={monthMax}
        />
      </section>

      <QuickTransactionFab
        accounts={accOpts}
        incomeCategories={incOpts}
        expenseCategories={expOpts}
        internalTransfers={{
          plainAccounts: accounts.map((a) => ({ id: a.id, name: a.name })),
          monthStart: monthMin,
          bucketShifts: data.bucketShiftsMonth.map((s: (typeof data.bucketShiftsMonth)[number]) => ({
            id: s.id,
            fromBucket: s.fromBucket,
            toBucket: s.toBucket,
            amount: s.amount,
            createdAt: s.createdAt.toISOString(),
          })),
        }}
      />
    </div>
  );
}
