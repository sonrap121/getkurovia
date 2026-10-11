import { NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { isValidEmail } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { name?: string; email?: string; subject?: string; message?: string; orderNumber?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const subject = body.subject?.trim() ?? "";
  const message = body.message?.trim() ?? "";
  if (name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!isValidEmail(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  if (subject.length < 2) return NextResponse.json({ error: "Please choose a subject." }, { status: 400 });
  if (message.length < 10) return NextResponse.json({ error: "Please write a few more details (10+ characters)." }, { status: 400 });

  await db.insert(contactMessages).values({
    name: name.slice(0, 120),
    email,
    subject: subject.slice(0, 120),
    message: message.slice(0, 4000),
    orderNumber: body.orderNumber?.trim().toUpperCase().slice(0, 40) || null,
  });

  return NextResponse.json({ ok: true, message: "Thanks! Our support team will reply within one business day." });
}
