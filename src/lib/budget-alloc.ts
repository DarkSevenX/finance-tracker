import type { IncomeAllocationMode } from "@/lib/db/schema";

export function splitIncome(
  amount: number,
  mode: IncomeAllocationMode,
  needsPct: number,
  wantsPct: number,
  savingsPct: number
): { needs: number; wants: number; savings: number } {
  const a = Math.round(amount);
  if (mode === "ALL_NEEDS") return { needs: a, wants: 0, savings: 0 };
  if (mode === "ALL_WANTS") return { needs: 0, wants: a, savings: 0 };
  if (mode === "ALL_SAVINGS") return { needs: 0, wants: 0, savings: a };

  const n = Math.round((a * needsPct) / 100);
  const w = Math.round((a * wantsPct) / 100);
  const s = a - n - w;
  return { needs: n, wants: w, savings: s };
}

export function validateBudgetPercents(needs: number, wants: number, savings: number): boolean {
  return needs >= 0 && wants >= 0 && savings >= 0 && needs + wants + savings === 100;
}

