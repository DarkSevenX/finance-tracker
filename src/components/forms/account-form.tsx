"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { WalletKind } from "@prisma/client";
import { createAccount } from "@/actions/accounts";
import { cn } from "@/lib/cn";
import { btnPrimaryClass, fieldClass, labelClass } from "@/lib/ui-classes";

const kinds: { value: WalletKind; label: string }[] = [
  { value: "CASH", label: "Efectivo" },
  { value: "BANK", label: "Banco" },
  { value: "CARD", label: "Tarjeta" },
  { value: "OTHER", label: "Otra" },
];

export function AccountForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "");
    const kind = String(fd.get("kind") ?? "OTHER") as WalletKind;
    const res = await createAccount(name, kind);
    setPending(false);
    if ("error" in res && res.error) {
      toast.error(res.error);
    } else {
      toast.success("Cuenta creada.");
      e.currentTarget.reset();
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="acc-name">
          Nombre
        </label>
        <input
          id="acc-name"
          name="name"
          required
          placeholder="Ej. Nequi, Bancolombia ahorros"
          className={fieldClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="acc-kind">
          Tipo
        </label>
        <select id="acc-kind" name="kind" className={fieldClass}>
          {kinds.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={pending} className={cn(btnPrimaryClass)}>
        {pending ? "Guardando…" : "Agregar cuenta"}
      </button>
    </form>
  );
}
