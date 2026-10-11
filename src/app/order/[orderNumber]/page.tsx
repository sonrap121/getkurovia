import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckIcon, MailIcon } from "@/components/icons";
import { OrderSummary } from "@/components/order-summary";
import { getOrderByNumber } from "@/lib/data";
import { serializeOrder } from "@/lib/serialize";
import { SITE } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Order confirmation", robots: { index: false, follow: false } };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { orderNumber } = await params;
  const { placed } = await searchParams;
  const order = await getOrderByNumber(decodeURIComponent(orderNumber));
  if (!order) notFound();
  const serialized = serializeOrder(order);

  return (
    <div className="bg-slate-50">
      <div className="container-x py-10">
        {placed === "1" ? (
          <div className="card flex flex-col gap-4 border-emerald-200 bg-emerald-50 p-6 sm:flex-row sm:items-center">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
              <CheckIcon size={24} />
            </span>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-emerald-900">Thank you, {order.fullName.split(" ")[0]}! Your order is confirmed.</h1>
              <p className="mt-1 text-sm text-emerald-800">
                Order <strong>{order.orderNumber}</strong> · A confirmation email with your receipt was sent to <strong>{order.email}</strong>. We&apos;ll email tracking details as soon as your
                parcel leaves our Delaware facility.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Order</p>
            <h1 className="font-display text-3xl font-bold text-slate-900">{order.orderNumber}</h1>
          </div>
        )}

        <div className="mt-8">
          <OrderSummary order={serialized} />
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { title: "1. Packing in Delaware", text: "Your items are picked and quality-checked. Fragile goods get extra protection; chocolate ships with ice packs in summer." },
            { title: "2. Export & flight", text: "We file electronic customs data for your country so clearance is fast. Most parcels fly out within 24 hours of dispatch." },
            { title: "3. Local delivery", text: "The carrier may collect import VAT/duties on delivery depending on your country's threshold. You'll get SMS/email updates." },
          ].map((step) => (
            <div key={step.title} className="card p-5">
              <p className="font-semibold text-slate-900">{step.title}</p>
              <p className="mt-1.5 text-sm text-slate-600">{step.text}</p>
            </div>
          ))}
        </section>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/shop" className="btn-primary">
            Continue shopping
          </Link>
          <Link href="/track" className="btn-outline">
            Track this order later
          </Link>
          <a href={`mailto:${SITE.supportEmail}?subject=Order%20${order.orderNumber}`} className="btn-ghost">
            <MailIcon size={16} /> Need help with this order?
          </a>
        </div>
      </div>
    </div>
  );
}
