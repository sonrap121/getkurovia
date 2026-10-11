import { NextResponse } from "next/server";
import { getOrderForTracking } from "@/lib/data";
import { serializeOrder } from "@/lib/serialize";
import { isValidEmail } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { orderNumber?: string; email?: string };
  try {
    body = (await request.json()) as { orderNumber?: string; email?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const orderNumber = body.orderNumber?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  if (!orderNumber || !isValidEmail(email)) {
    return NextResponse.json({ error: "Enter your order number and the email used at checkout." }, { status: 400 });
  }
  const order = await getOrderForTracking(orderNumber, email);
  if (!order) {
    return NextResponse.json({ error: "We couldn't find an order matching those details. Check the order number (e.g. KV-250101-ABCDE) and email." }, { status: 404 });
  }
  return NextResponse.json({ order: serializeOrder(order) });
}
