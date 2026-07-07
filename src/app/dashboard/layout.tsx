import { AppShell } from "@/components/app-shell";
import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return <AppShell user={session?.user || null}>{children}</AppShell>;
}

