"use client";

import Link from "next/link";
import { CountrySelect } from "@/components/country-select";
import { ArrowRightIcon, LockIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { useStore } from "@/components/store-provider";
import { quoteShipping } from "@/lib/shipping";

export default function CartPage() {
  const { items, hydrated, updateQuantity, removeItem, subtotalCents, totalWeightGrams, format, countryCode, setCountryCode } = useStore();
  const quote = quoteShipping({ countryCode, subtotalCents, weightGrams: totalWeightGrams });
  const standard = quote.options[0];

  if (!hydrated) {
    return <div className="container-x py-20 text-center text-sm text-slate-500">Loading your cart…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-slate-100 text-4xl">🛍️</div>
        <h1 className="mt-6 font-display text-3xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-slate-600">Explore authentic American products shipped straight to your door.</p>
        <Link href="/shop" className="btn-primary mt-6">
          Browse the shop <ArrowRightIcon size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">Shopping cart</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y divide-slate-200 border-y border-slate-200">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-5 py-6">
              <Link href={`/shop/${item.slug}`} className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500">{item.brand}</p>
                    <Link href={`/shop/${item.slug}`} className="font-semibold text-slate-900 hover:text-brand-700">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">{format(item.priceCents)} each · {(item.weightGrams / 1000).toFixed(2)} kg</p>
                  </div>
                  <p className="font-bold text-slate-900 tabular-nums">{format(item.priceCents * item.quantity)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex items-center rounded-full border border-slate-300">
                    <button type="button" className="grid h-9 w-9 place-items-center rounded-l-full hover:bg-slate-100" onClick={() => updateQuantity(item.productId, item.quantity - 1)} aria-label="Decrease">
                      <MinusIcon size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                    <button type="button" className="grid h-9 w-9 place-items-center rounded-r-full hover:bg-slate-100 disabled:opacity-40" onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.stock} aria-label="Increase">
                      <PlusIcon size={14} />
                    </button>
                  </div>
                  <button type="button" onClick={() => removeItem(item.productId)} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-rose-600">
                    <TrashIcon size={16} /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="card h-fit p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-lg font-bold text-slate-900">Order summary</h2>
          <div className="mt-4">
            <label className="label" htmlFor="cart-country">
              Deliver to
            </label>
            <CountrySelect id="cart-country" value={countryCode} onChange={setCountryCode} />
          </div>
          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal</dt>
              <dd className="font-semibold tabular-nums">{format(subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Standard shipping ({standard.minDays}–{standard.maxDays} days)</dt>
              <dd className="font-semibold tabular-nums">{standard.isFree ? <span className="text-emerald-700">Free</span> : format(standard.priceCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Express courier</dt>
              <dd className="text-slate-500 tabular-nums">+{format(quote.options[1].priceCents)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
              <dt className="font-semibold text-slate-900">Estimated total</dt>
              <dd className="font-display text-xl font-bold text-slate-900 tabular-nums">{format(subtotalCents + standard.priceCents)}</dd>
            </div>
          </dl>
          {quote.amountToFreeShippingCents !== null && quote.amountToFreeShippingCents > 0 && (
            <p className="mt-3 rounded-xl bg-brand-50 px-3 py-2 text-xs text-brand-800">
              Add {format(quote.amountToFreeShippingCents)} more to unlock free standard shipping to {quote.countryName}.
            </p>
          )}
          <p className="mt-3 text-xs text-slate-500">Import duties/taxes, if applicable, are collected by the carrier on delivery. Charged in USD.</p>
          <Link href="/checkout" className="btn-accent mt-5 h-12 w-full text-base">
            <LockIcon size={18} /> Proceed to checkout
          </Link>
          <Link href="/shop" className="btn-ghost mt-2 w-full">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
