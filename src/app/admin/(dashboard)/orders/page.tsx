import { updateOrderAction } from "@/app/admin/actions";
import { getOrdersWithItems } from "@/lib/data";
import { formatUsd } from "@/lib/currency";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/shipping";
import { flagEmoji, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getOrdersWithItems(100);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-900">Orders</h1>
        <span className="text-sm text-slate-500">{orders.length} most recent</span>
      </div>

      {orders.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-sm text-slate-500">No orders yet.</div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="card p-5">
              <div className="grid gap-6 lg:grid-cols-[1fr_1fr_320px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{order.orderNumber}</h2>
                    <span className="text-xs text-slate-500">{formatDate(order.createdAt, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-800">{order.fullName}</p>
                  <p className="text-xs text-slate-500">
                    {order.email}
                    {order.phone ? ` · ${order.phone}` : ""}
                  </p>
                  <address className="mt-2 text-xs not-italic leading-relaxed text-slate-600">
                    {order.addressLine1}
                    {order.addressLine2 ? `, ${order.addressLine2}` : ""}
                    <br />
                    {order.city}
                    {order.state ? `, ${order.state}` : ""} {order.postalCode}
                    <br />
                    {flagEmoji(order.countryCode)} {order.countryName} · zone {order.shippingZone.toUpperCase()}
                  </address>
                  {order.customerNotes && <p className="mt-2 rounded-lg bg-accent-50 px-2.5 py-1.5 text-xs text-accent-700">Note: {order.customerNotes}</p>}
                </div>

                <div>
                  <ul className="space-y-1.5 text-sm">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between gap-3">
                        <span className="text-slate-700">
                          {item.quantity} × {item.productName}
                        </span>
                        <span className="tabular-nums text-slate-900">{formatUsd(item.lineTotalCents)}</span>
                      </li>
                    ))}
                  </ul>
                  <dl className="mt-3 space-y-1 border-t border-slate-100 pt-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <dt>Shipping ({order.shippingMethod})</dt>
                      <dd>{formatUsd(order.shippingCents)}</dd>
                    </div>
                    <div className="flex justify-between font-semibold text-slate-900">
                      <dt>Total ({order.paymentStatus})</dt>
                      <dd>{formatUsd(order.totalCents)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Payment</dt>
                      <dd>
                        {order.paymentMethod}
                        {order.cardLast4 ? ` •••• ${order.cardLast4}` : ""}
                      </dd>
                    </div>
                  </dl>
                </div>

                <form action={updateOrderAction} className="space-y-3 rounded-xl bg-slate-50 p-4">
                  <input type="hidden" name="orderId" value={order.id} />
                  <div>
                    <label className="label" htmlFor={`status-${order.id}`}>
                      Status
                    </label>
                    <select id={`status-${order.id}`} name="status" defaultValue={order.status} className="input h-10">
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {ORDER_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor={`carrier-${order.id}`}>
                      Carrier
                    </label>
                    <input id={`carrier-${order.id}`} name="carrier" defaultValue={order.carrier ?? ""} className="input h-10" placeholder="DHL Express" />
                  </div>
                  <div>
                    <label className="label" htmlFor={`tracking-${order.id}`}>
                      Tracking number
                    </label>
                    <input id={`tracking-${order.id}`} name="trackingNumber" defaultValue={order.trackingNumber ?? ""} className="input h-10" placeholder="1Z999AA10123456784" />
                  </div>
                  <button type="submit" className="btn-primary h-10 w-full">
                    Update order
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
