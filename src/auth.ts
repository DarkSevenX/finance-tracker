import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare, hash } from "bcryptjs";
import { db } from "@/lib/db";
import { User } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  // AUTH_SECRET: firma del JWT; debe coincidir con NEXTAUTH_SECRET / AUTH_SECRET en middleware.
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) return null;
        const users = await db.select().from(User).where(eq(User.email, String(email).toLowerCase().trim())).limit(1);
        const user = users[0];
        if (!user) return null;
        const ok = await compare(String(password), user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        const email = user.email.toLowerCase().trim();
        const existingUsers = await db.select().from(User).where(eq(User.email, email)).limit(1);
        if (existingUsers.length === 0) {
          const randomPassword = crypto.randomUUID();
          const passwordHash = await hash(randomPassword, 10);
          await db.insert(User).values({
            email,
            name: user.name || "Usuario Google",
            passwordHash,
          });
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        const email = token.email || user?.email;
        if (email) {
          const dbUser = await db.select().from(User).where(eq(User.email, email.toLowerCase().trim())).limit(1);
          if (dbUser[0]) {
            token.id = dbUser[0].id;
            token.email = dbUser[0].email;
          }
        }
      } else if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },
});

