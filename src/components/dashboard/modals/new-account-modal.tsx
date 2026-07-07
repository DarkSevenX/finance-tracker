"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { AccountForm } from "@/components/forms/account-form";

export function NewAccountModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      >
        <Plus className="h-4 w-4" />
        Nueva cuenta
      </button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Añadir cuenta"
        description="Montos iniciales o nuevas tarjetas (en pesos, sin decimales)."
      >
        <div className="mt-6">
          <AccountForm onSuccess={() => setOpen(false)} />
        </div>
      </Modal>
    </>
  );
}
