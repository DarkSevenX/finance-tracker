"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { btnPrimaryClass, fieldClass, labelClass } from "@/lib/ui-classes";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
      name: String(fd.get("name") ?? "") || undefined,
    };
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "No se pudo registrar.");
      return;
    }
    router.push("/login?registered=1");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? (
        <p className="rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300/90">
          {error}
        </p>
      ) : null}
      <div>
        <label className={labelClass} htmlFor="reg-name">
          Nombre (opcional)
        </label>
        <input id="reg-name" name="name" type="text" className={fieldClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="reg-email">
          Correo
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={fieldClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="reg-password">
          Contraseña (mín. 8)
        </label>
        <input
          id="reg-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={fieldClass}
        />
      </div>
      <button type="submit" disabled={pending} className={cn(btnPrimaryClass, "w-full")}>
        {pending ? "Creando…" : "Crear cuenta"}
      </button>
      <p className="text-center text-sm text-zinc-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-zinc-300 underline-offset-4 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
