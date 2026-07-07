"use client";

import { useState } from "react";
import { Plus, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { TransactionExpenseForm } from "@/components/forms/transaction-expense-form";
import { TransactionIncomeForm } from "@/components/forms/transaction-income-form";

export function NewTransactionModals({
  accounts,
  expenseCategories,
  incomeCategories,
}: {
  accounts: { id: string; name: string }[];
  expenseCategories: { id: string; label: string; bucket: any }[];
  incomeCategories: { id: string; label: string; }[];
}) {
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={() => setIncomeOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 px-4 py-2 text-sm font-medium transition hover:bg-emerald-600/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      >
        <ArrowDownToLine className="h-4 w-4" />
        Ingreso
      </button>
      <button
        onClick={() => setExpenseOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
      >
        <ArrowUpFromLine className="h-4 w-4" />
        Gasto
      </button>

      <Modal
        isOpen={incomeOpen}
        onClose={() => setIncomeOpen(false)}
        title="Registrar Ingreso"
        description="Añade dinero que entra a tus cuentas."
      >
        <div className="mt-6">
          <TransactionIncomeForm
            accounts={accounts}
            categories={incomeCategories}
            onSuccess={() => setIncomeOpen(false)}
          />
        </div>
      </Modal>

      <Modal
        isOpen={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        title="Registrar Gasto"
        description="Añade dinero que sale de tus bolsillos."
      >
        <div className="mt-6">
          <TransactionExpenseForm
            accounts={accounts}
            categories={expenseCategories}
            onSuccess={() => setExpenseOpen(false)}
          />
        </div>
      </Modal>
    </div>
  );
}
