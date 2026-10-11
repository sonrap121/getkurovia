import Link from "next/link";
import { getAdminStats, getRecentOrders, getTopCountries } from "@/lib/data";
import { formatUsd } from "@/lib/currency";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/shipping";
import { cn, flagEmoji, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function statusClass(status: string): string {
  switch (status) {
    case "delivered":
      return "bg-emerald-50 text-emerald-700";
    case "shipped":
    case "in_transit":
      return "bg-brand-50 text-brand-700";
    case "cancelled":
      return "bg-rose-50 text-rose-700";
    case "packed":
      return "bg-accent-50 text-accent-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default async function AdminDashboardPage() {
  const [stats, recent, countries] = await Promise.all([getAdminStats(), getRecentOrders(8), getTopCountries(6)]);

  const cards = [
    { label: "Total revenue", value: formatUsd(stats.revenueCents), hint: "Excludes cancelled orders" },
    { label: "Orders", value: stats.totalOrders.toLocaleString("en-US"), hint: `${stats.openOrders} awaiting dispatch` },
    { label: "Countries served", value: stats.countries.toLocaleString("en-US"), hint: "Unique destinations" },
    { label: "Products", value: stats.totalProducts.toLocaleString("en-US"), hint: `${stats.lowStock} low on stock` },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="card p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">{card.label}</p>
            <p className="mt-2 font-display text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-brand-700 hover:underline">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">No orders yet. Orders placed through the checkout will appear here.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-2.5">Order</th>
                  <th className="px-5 py-2.5">Customer</th>
                  <th className="px-5 py-2.5">Destination</th>
                  <th className="px-5 py-2.5 text-right">Total</th>
                  <th className="px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                      <p className="text-xs text-slate-500">{formatDate(order.createdAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-slate-900">{order.fullName}</p>
                      <p className="text-xs text-slate-500">{order.email}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      {flagEmoji(order.countryCode)} {order.countryName}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatUsd(order.totalCents)}</td>
                    <td className="px-5 py-3">
                      <span className={cn("badge", statusClass(order.status))}>{ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card p-5">
          <h2 className="font-semibold text-slate-900">Top destinations</h2>
          {countries.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">Country breakdown appears once orders come in.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {countries.map((row) => {
                const max = countries[0]?.orderCount ?? 1;
                return (
                  <li key={row.countryCode}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-800">
                        {flagEmoji(row.countryCode)} {row.countryName}
                      </span>
                      <span className="text-slate-500">
                        {row.orderCount} · {formatUsd(row.revenueCents)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-brand-700" style={{ width: `${(row.orderCount / max) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
