import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { User, BudgetSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  name: z.string().max(80).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { email, password, name } = parsed.data;
    
    const exists = await db.select().from(User).where(eq(User.email, email.toLowerCase().trim())).limit(1);
    if (exists[0]) {
      return NextResponse.json({ error: "Ese correo ya está registrado." }, { status: 409 });
    }
    
    const passwordHash = await hash(password, 12);
    
    await db.transaction(async (tx) => {
      const [newUser] = await tx.insert(User).values({
        email: email.toLowerCase().trim(),
        passwordHash,
        name: name?.trim() || null,
      }).returning({ id: User.id });
      
      await tx.insert(BudgetSettings).values({
        userId: newUser.id,
        needsPct: 50,
        wantsPct: 30,
        savingsPct: 20,
      });
    });
    
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al registrar." }, { status: 500 });
  }
}

