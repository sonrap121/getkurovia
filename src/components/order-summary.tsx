"use client";

import Link from "next/link";
import { CheckIcon } from "@/components/icons";
import { useStore } from "@/components/store-provider";
import { ORDER_STATUS_LABELS, ORDER_TIMELINE, type OrderStatus } from "@/lib/shipping";
import { addDays, cn, flagEmoji, formatDate } from "@/lib/utils";

export interface SerializedOrderItem {
  id: number;
  productName: string;
  productSlug: string;
  productImage: string | null;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
}

export interface SerializedOrder {
  orderNumber: string;
  email: string;
  fullName: string;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  countryCode: string;
  countryName: string;
  shippingMethod: string;
  carrier: string | null;
  etaMinDays: number;
  etaMaxDays: number;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  cardLast4: string | null;
  trackingNumber: string | null;
  customerNotes: string | null;
  createdAt: string;
  updatedAt: string;
  items: SerializedOrderItem[];
}

export function OrderStatusTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">This order has been cancelled. A refund has been issued to the original payment method.</div>;
  }
  const currentIndex = Math.max(0, ORDER_TIMELINE.indexOf(status as OrderStatus));
  return (
    <ol className="grid grid-cols-5 gap-1">
      {ORDER_TIMELINE.map((step, index) => {
        const done = index <= currentIndex;
        return (
          <li key={step} className="flex flex-col items-center text-center">
            <div className="flex w-full items-center">
              <span className={cn("h-0.5 flex-1", index === 0 ? "bg-transparent" : done ? "bg-brand-700" : "bg-slate-200")} />
              <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold", done ? "bg-brand-900 text-white" : "bg-slate-200 text-slate-500")}>
                {done ? <CheckIcon size={14} /> : index + 1}
              </span>
              <span className={cn("h-0.5 flex-1", index === ORDER_TIMELINE.length - 1 ? "bg-transparent" : index < currentIndex ? "bg-brand-700" : "bg-slate-200")} />
            </div>
            <span className={cn("mt-2 text-[11px] font-medium leading-tight sm:text-xs", done ? "text-slate-900" : "text-slate-400")}>{ORDER_STATUS_LABELS[step]}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderSummary({ order, showItemsLink = true }: { order: SerializedOrder; showItemsLink?: boolean }) {
  const { formatIn } = useStore();
  const usd = (cents: number) => formatIn(cents, "USD");
  const placed = new Date(order.createdAt);
  const eta = `${formatDate(addDays(placed, order.etaMinDays + 1), { month: "short", day: "numeric" })} – ${formatDate(addDays(placed, order.etaMaxDays + 2), { month: "short", day: "numeric" })}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Order status</p>
              <p className="font-display text-xl font-bold text-slate-900">{ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-slate-500">Estimated delivery</p>
              <p className="font-semibold text-slate-900">{order.status === "delivered" ? "Delivered" : eta}</p>
            </div>
          </div>
          <div className="mt-6">
            <OrderStatusTimeline status={order.status} />
          </div>
          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Carrier</p>
              <p className="font-medium text-slate-900">{order.carrier ?? "Assigned at dispatch"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Tracking number</p>
              <p className="font-medium text-slate-900">{order.trackingNumber ?? "Available once shipped"}</p>
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-bold text-slate-900">Items ({order.items.reduce((s, i) => s + i.quantity, 0)})</h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {item.productImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.productImage} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {showItemsLink ? (
                    <Link href={`/shop/${item.productSlug}`} className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-brand-700">
                      {item.productName}
                    </Link>
                  ) : (
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">{item.productName}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    {item.quantity} × {usd(item.unitPriceCents)}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums">{usd(item.lineTotalCents)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="card p-6">
          <h2 className="font-display text-lg font-bold text-slate-900">Payment summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal</dt>
              <dd className="tabular-nums">{usd(order.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Shipping ({order.shippingMethod})</dt>
              <dd className="tabular-nums">{order.shippingCents === 0 ? "Free" : usd(order.shippingCents)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
              <dt>Total paid</dt>
              <dd className="tabular-nums">{usd(order.totalCents)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-slate-500">
            {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
            {order.cardLast4 ? ` •••• ${order.cardLast4}` : ""} · {order.paymentStatus === "paid" ? "Paid" : order.paymentStatus} · {formatDate(placed, { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </section>
        <section className="card p-6">
          <h2 className="font-display text-lg font-bold text-slate-900">Shipping to</h2>
          <address className="mt-3 text-sm not-italic leading-relaxed text-slate-700">
            <strong className="text-slate-900">{order.fullName}</strong>
            <br />
            {order.addressLine1}
            {order.addressLine2 && (
              <>
                <br />
                {order.addressLine2}
              </>
            )}
            <br />
            {order.city}
            {order.state ? `, ${order.state}` : ""} {order.postalCode}
            <br />
            {flagEmoji(order.countryCode)} {order.countryName}
            <br />
            <span className="text-slate-500">{order.email}</span>
            {order.phone && (
              <>
                <br />
                <span className="text-slate-500">{order.phone}</span>
              </>
            )}
          </address>
          {order.customerNotes && (
            <p className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
              <strong>Notes:</strong> {order.customerNotes}
            </p>
          )}
        </section>
      </aside>
    </div>
  );
}
