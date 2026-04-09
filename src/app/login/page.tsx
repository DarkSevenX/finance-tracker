import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const sp = await searchParams;
  const showOk = sp.registered === "1";

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-16">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="text-sm text-zinc-500 transition-colors hover:text-zinc-300">
          ← Volver
        </Link>
        <h1 className="mt-8 text-2xl font-semibold tracking-tight text-white">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-zinc-500">Entra con tu correo y contraseña.</p>
        {showOk ? (
          <p className="mt-4 rounded-lg border border-emerald-900/60 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300/90">
            Cuenta creada. Ya puedes entrar.
          </p>
        ) : null}
        <Card className="mt-8">
          <LoginForm />
        </Card>
      </div>
    </div>
  );
}
