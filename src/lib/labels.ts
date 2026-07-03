import type { BudgetBucket, IncomeAllocationMode, WalletKind } from "@/lib/db/schema";

const wallet: Record<WalletKind, string> = {
  CASH: "Efectivo",
  BANK: "Banco",
  CARD: "Tarjeta",
  OTHER: "Otra",
};

export function walletLabel(k: WalletKind): string {
  return wallet[k];
}

const bucket: Record<BudgetBucket, string> = {
  NEEDS: "Necesidades",
  WANTS: "Deseos",
  SAVINGS: "Ahorros",
};

export function bucketLabel(b: BudgetBucket): string {
  return bucket[b];
}

const alloc: Record<IncomeAllocationMode, string> = {
  SPLIT: "Repartir según % (50/30/20)",
  ALL_NEEDS: "100% a necesidades",
  ALL_WANTS: "100% a deseos",
  ALL_SAVINGS: "100% a ahorros",
};

export function allocationLabel(m: IncomeAllocationMode): string {
  return alloc[m];
}

