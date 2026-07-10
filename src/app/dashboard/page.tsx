import { endOfMonth, format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AvailableBalanceCard } from "@/components/dashboard/available-balance-card";
// [NOTA AI]: Se desactivó el componente 50/30/20 temporalmente
// import { BucketCards } from "@/components/dashboard/bucket-cards";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { IncomeExpenseChartPanel } from "@/components/dashboard/income-expense-chart-panel";
import { MonthMovementsTable } from "@/components/dashboard/month-movements-table";
import { RecentMovementsList } from "@/components/dashboard/recent-movements-list";
import { QuickTransactionFab } from "@/components/dashboard/quick-transaction-fab";
import { MonthNav } from "@/components/dashboard/month-nav";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { getDashboardSnapshot, type DashboardMonthMovement } from "@/lib/dashboard-data";
import { expenseCategoriesForForm, incomeOptions } from "@/lib/category-options";
import { walletLabel } from "@/lib/labels";
import { formatCOP } from "@/lib/money";
import { db } from "@/lib/db";
import { FinancialAccount, Category } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
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
    db.select({ id: FinancialAccount.id, name: FinancialAccount.name, kind: FinancialAccount.kind }).from(FinancialAccount).where(eq(FinancialAccount.userId, session.user.id)).orderBy(asc(FinancialAccount.name)),
    db.select().from(Category).where(eq(Category.userId, session.user.id)),
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
      {/* Header con navegación de mes */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">Resumen</p>
          <h1 className="mt-1 text-xl font-semibold capitalize tracking-tight text-zinc-100">
            {ref.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
          </h1>
        </div>
        <MonthNav year={y} month={m} />
      </div>

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

        {/* [NOTA AI]: Se desactivó la sección de sobres 50/30/20. 
        <BucketCards
          needsPct={data.needsPct}
          wantsPct={data.wantsPct}
          savingsPct={data.savingsPct}
          budget={data.budget}
          spent={data.spent}
          remaining={data.remaining}
        />
        */}
      </div>

      <section className="space-y-4 sm:space-y-5">
        <div className="flex items-center gap-2.5">
          <span className="h-4 w-0.5 rounded-full bg-emerald-400"></span>
          <h2 className="text-[13px] font-semibold tracking-tight text-zinc-200">Cuentas</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          {data.accountStats.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Aún no hay cuentas. Crea una en la sección <span className="text-zinc-300">Cuentas</span>.
            </p>
          ) : (
            data.accountStats.map((a: (typeof data.accountStats)[number]) => {
              const pct = Number(a.pctSpent);
              const isOverspent = pct >= 100;
              const barColor = isOverspent ? "bg-rose-400/80" : "bg-emerald-400/80";
              const ringColor = a.kind === "CASH" ? "ring-amber-500/20" : "ring-emerald-500/20";
              const iconBg = a.kind === "CASH" ? "bg-amber-500/10" : "bg-emerald-500/10";
              const iconColor = a.kind === "CASH" ? "text-amber-400" : "text-emerald-400";

              return (
                <SpotlightCard key={a.id} className="min-w-0 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:p-5" spotlightColor="rgba(16, 185, 129, 0.15)">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${iconBg} ring-1 ${ringColor}`}>
                        {a.kind === "CASH" ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className={`size-4 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2" /><path d="M2 10h20" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className={`size-4 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-zinc-100">{a.name}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">{walletLabel(a.kind)}</p>
                      </div>
                    </div>
                    <p className="shrink-0 text-right text-base font-semibold tabular-nums text-zinc-50 sm:text-lg">
                      {formatCOP(a.balance)}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-between text-xs text-zinc-500">
                    <span>{formatCOP(a.income)} ingresado</span>
                    <span>{formatCOP(a.expense)} gastado</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
                  </div>
                  <p className="mt-1 text-right text-[11px] text-zinc-600">{a.pctSpent}% gastado</p>
                </SpotlightCard>
              );
            })
          )}
        </div>
      </section>

      <RecentMovementsList
        movements={movementsPayload}
        accounts={accounts}
        categories={categories}
      />

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

