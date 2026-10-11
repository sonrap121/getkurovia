import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { getCountry } from "@/lib/countries";
import { isCurrencyCode } from "@/lib/currency";
import { authorizePayment } from "@/lib/payments";
import { getShippingOption, quoteShipping } from "@/lib/shipping";
import { generateOrderNumber, isValidEmail } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface OrderRequest {
  email?: string;
  phone?: string;
  fullName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  shippingMethod?: string;
  displayCurrency?: string;
  customerNotes?: string;
  items?: Array<{ productId?: number; quantity?: number }>;
  card?: { number?: string; expiry?: string; cvc?: string; name?: string };
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: OrderRequest;
  try {
    body = (await request.json()) as OrderRequest;
  } catch {
    return bad("Invalid request body.");
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const fullName = body.fullName?.trim() ?? "";
  const addressLine1 = body.addressLine1?.trim() ?? "";
  const city = body.city?.trim() ?? "";
  const postalCode = body.postalCode?.trim() ?? "";
  const country = getCountry(body.countryCode);
  const shippingMethod = body.shippingMethod === "express" ? "express" : body.shippingMethod === "standard" ? "standard" : null;

  if (!isValidEmail(email)) return bad("Please enter a valid email address.");
  if (fullName.length < 2) return bad("Please enter the recipient's full name.");
  if (addressLine1.length < 3) return bad("Please enter a street address.");
  if (city.length < 2) return bad("Please enter a city.");
  if (postalCode.length < 2) return bad("Please enter a postal code.");
  if (!country) return bad("Please select a destination country.");
  if (!shippingMethod) return bad("Please choose a shipping method.");
  if (!Array.isArray(body.items) || body.items.length === 0) return bad("Your cart is empty.");
  if (!body.card) return bad("Payment details are required.");

  const requested = new Map<number, number>();
  for (const item of body.items) {
    const id = Number(item.productId);
    const qty = Math.floor(Number(item.quantity));
    if (!Number.isInteger(id) || !Number.isInteger(qty) || qty <= 0) return bad("Invalid cart item.");
    requested.set(id, (requested.get(id) ?? 0) + qty);
  }

  const ids = [...requested.keys()];
  const rows = await db
    .select()
    .from(products)
    .where(sql`${products.id} in (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})`);

  if (rows.length !== ids.length) return bad("One or more products are no longer available.");

  let subtotalCents = 0;
  let weightGrams = 0;
  const lines: Array<{ product: (typeof rows)[number]; quantity: number }> = [];
  for (const product of rows) {
    const quantity = requested.get(product.id) ?? 0;
    if (!product.isActive) return bad(`${product.name} is no longer available.`, 409);
    if (product.stock < quantity) return bad(`Only ${product.stock} unit(s) of ${product.name} are in stock.`, 409);
    subtotalCents += product.priceCents * quantity;
    weightGrams += product.weightGrams * quantity;
    lines.push({ product, quantity });
  }

  const quote = quoteShipping({ countryCode: country.code, subtotalCents, weightGrams });
  const option = getShippingOption(quote, shippingMethod);
  if (!option) return bad("Shipping method unavailable for this destination.");
  const totalCents = subtotalCents + option.priceCents;

  const payment = await authorizePayment(
    {
      number: body.card.number ?? "",
      expiry: body.card.expiry ?? "",
      cvc: body.card.cvc ?? "",
      name: body.card.name ?? "",
    },
    totalCents,
  );
  if (!payment.ok) return bad(payment.error ?? "Payment failed.", 402);

  const displayCurrency = body.displayCurrency && isCurrencyCode(body.displayCurrency) ? body.displayCurrency : "USD";

  try {
    const orderNumber = await db.transaction(async (tx) => {
      let number = generateOrderNumber();
      for (let attempt = 0; attempt < 3; attempt++) {
        const existing = await tx.select({ id: orders.id }).from(orders).where(eq(orders.orderNumber, number)).limit(1);
        if (existing.length === 0) break;
        number = generateOrderNumber();
      }

      const [created] = await tx
        .insert(orders)
        .values({
          orderNumber: number,
          email,
          phone: body.phone?.trim() || null,
          fullName,
          addressLine1,
          addressLine2: body.addressLine2?.trim() || null,
          city,
          state: body.state?.trim() || null,
          postalCode,
          countryCode: country.code,
          countryName: country.name,
          shippingMethod,
          shippingZone: quote.zone.id,
          carrier: option.carrier,
          etaMinDays: option.minDays,
          etaMaxDays: option.maxDays,
          subtotalCents,
          shippingCents: option.priceCents,
          totalCents,
          currency: "USD",
          displayCurrency,
          status: "processing",
          paymentStatus: "paid",
          paymentMethod: payment.brand ? payment.brand.toLowerCase() : "card",
          cardLast4: payment.last4 ?? null,
          customerNotes: body.customerNotes?.trim().slice(0, 1000) || null,
        })
        .returning({ id: orders.id, orderNumber: orders.orderNumber });

      await tx.insert(orderItems).values(
        lines.map(({ product, quantity }) => ({
          orderId: created.id,
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          productImage: product.imageUrl,
          unitPriceCents: product.priceCents,
          quantity,
          lineTotalCents: product.priceCents * quantity,
        })),
      );

      for (const { product, quantity } of lines) {
        await tx
          .update(products)
          .set({ stock: sql`greatest(${products.stock} - ${quantity}, 0)` })
          .where(eq(products.id, product.id));
      }

      return created.orderNumber;
    });

    return NextResponse.json({ orderNumber, totalCents, paymentMode: payment.mode }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not place the order.";
    return bad(message, 409);
  }
}
