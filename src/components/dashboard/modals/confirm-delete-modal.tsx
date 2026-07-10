"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { deleteTransaction } from "@/actions/transaction-mutations";
import { btnPrimaryClass, btnSecondaryClass } from "@/lib/ui-classes";
import { cn } from "@/lib/cn";

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  transactionId,
  transactionTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  transactionTitle: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    const res = await deleteTransaction(transactionId);
    setPending(false);
    if ("error" in res && res.error) {
      toast.error(res.error);
    } else {
      toast.success("Movimiento eliminado.");
      onClose();
      router.refresh();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar movimiento"
      description={`¿Estás seguro de que deseas eliminar "${transactionTitle}"? Esta acción no se puede deshacer.`}
    >
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={onClose}
          className={btnSecondaryClass}
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={handleDelete}
          className={cn(btnPrimaryClass, "bg-rose-500 hover:bg-rose-600 focus-visible:ring-rose-500/50 text-white border-0")}
        >
          {pending ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </Modal>
  );
}
