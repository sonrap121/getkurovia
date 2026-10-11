import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { isValidEmail } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { email?: string; source?: string };
  try {
    body = (await request.json()) as { email?: string; source?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!isValidEmail(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  const inserted = await db
    .insert(newsletterSubscribers)
    .values({ email, source: body.source?.slice(0, 50) || "website" })
    .onConflictDoNothing()
    .returning({ id: newsletterSubscribers.id });

  return NextResponse.json({
    ok: true,
    message: inserted.length > 0 ? "Welcome aboard! Check your inbox for your 10% code." : "You're already on the list — your 10% code is on its way again.",
  });
}
