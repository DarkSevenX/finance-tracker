import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-16">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="text-sm text-zinc-500 transition-colors hover:text-zinc-300">
          ← Volver
        </Link>
        <h1 className="mt-8 text-2xl font-semibold tracking-tight text-white">Crear cuenta</h1>
        <p className="mt-2 text-sm text-zinc-500">Los datos se guardan en tu base SQLite local.</p>
        <Card className="mt-8">
          <RegisterForm />
        </Card>
      </div>
    </div>
  );
}
