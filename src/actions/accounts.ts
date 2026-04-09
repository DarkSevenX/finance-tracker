"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { WalletKind } from "@prisma/client";

export async function createAccount(name: string, kind: WalletKind) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" as const };
  const n = name.trim();
  if (!n) return { error: "Nombre requerido." as const };
  await prisma.financialAccount.create({
    data: {
      user: { connect: { id: session.user.id } },
      name: n,
      kind,
    },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cuentas");
  return { ok: true as const };
}

export async function deleteAccount(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" as const };
  const count = await prisma.transaction.count({
    where: { accountId: id, userId: session.user.id },
  });
  if (count > 0) {
    return { error: "No puedes eliminar una cuenta con movimientos." as const };
  }
  await prisma.financialAccount.deleteMany({
    where: { id, userId: session.user.id },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cuentas");
  return { ok: true as const };
}
