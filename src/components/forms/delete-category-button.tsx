"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteCategory } from "@/actions/categories";

export function DeleteCategoryButton({ id }: { id: string }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function onClick() {
    if (!confirm("¿Eliminar esta categoría?")) return;
    setPending(true);
    const res = await deleteCategory(id);
    setPending(false);
    if ("error" in res && res.error) alert(res.error);
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
