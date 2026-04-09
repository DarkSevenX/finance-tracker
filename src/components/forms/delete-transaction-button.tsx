"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteTransaction } from "@/actions/transaction-mutations";

export function DeleteTransactionButton({ id }: { id: string }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function onClick() {
    if (!confirm("¿Eliminar este movimiento?")) return;
    setPending(true);
    await deleteTransaction(id);
    setPending(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="text-xs text-rose-400 hover:underline disabled:opacity-50"
    >
      Eliminar
    </button>
  );
}
