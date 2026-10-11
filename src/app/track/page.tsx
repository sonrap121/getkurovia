"use client";

import { useState, type FormEvent } from "react";
import { LoaderIcon, PackageIcon } from "@/components/icons";
import { OrderSummary, type SerializedOrder } from "@/components/order-summary";

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<SerializedOrder | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const data = (await res.json()) as { order?: SerializedOrder; error?: string };
      if (!res.ok || !data.order) throw new Error(data.error ?? "Order not found.");
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50">
      <div className="container-x py-12">
        <div className="mx-auto max-w-xl text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-900 text-accent-400">
            <PackageIcon size={28} />
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-slate-900 sm:text-4xl">Track your order</h1>
          <p className="mt-2 text-slate-600">Enter your Kurovia order number and the email address you used at checkout.</p>
        </div>

        <form onSubmit={submit} className="card mx-auto mt-8 grid max-w-xl gap-4 p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label className="label" htmlFor="orderNumber">
              Order number
            </label>
            <input id="orderNumber" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value.toUpperCase())} placeholder="KV-250101-ABCDE" className="input h-11 uppercase" required />
          </div>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input h-11" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary h-11">
            {loading ? <LoaderIcon size={18} /> : "Track"}
          </button>
        </form>

        {error && (
          <p className="mx-auto mt-4 max-w-xl rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
            {error}
          </p>
        )}

        {order && (
          <div className="mt-10">
            <p className="text-xs uppercase tracking-wider text-slate-500">Order</p>
            <h2 className="mb-6 font-display text-2xl font-bold text-slate-900">{order.orderNumber}</h2>
            <OrderSummary order={order} />
          </div>
        )}
      </div>
    </div>
  );
}
