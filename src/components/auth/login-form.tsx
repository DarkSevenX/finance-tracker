"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { btnPrimaryClass, fieldClass, labelClass } from "@/lib/ui-classes";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push("/dashboard");
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
        <label className={labelClass} htmlFor="login-email">
          Correo
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={fieldClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="login-password">
          Contraseña
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={fieldClass}
        />
      </div>
      <button type="submit" disabled={pending} className={cn(btnPrimaryClass, "w-full")}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
      <p className="text-center text-sm text-zinc-500">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-medium text-zinc-300 underline-offset-4 hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
