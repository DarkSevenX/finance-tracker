"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider session={session}>
      {children}
      <Toaster
        position="top-center"
        theme="dark"
        richColors
        closeButton
        offset="1rem"
        toastOptions={{
          duration: 4500,
          classNames: {
            toast:
              "group border border-zinc-800/90 bg-zinc-900/95 text-zinc-100 shadow-xl backdrop-blur-sm",
            title: "text-zinc-50",
            description: "text-zinc-400",
            closeButton: "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200",
          },
        }}
      />
    </SessionProvider>
  );
}
