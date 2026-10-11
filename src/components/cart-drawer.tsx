"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CloseIcon, MinusIcon, PlusIcon, TrashIcon, TruckIcon } from "@/components/icons";
import { useStore } from "@/components/store-provider";
import { getCountry } from "@/lib/countries";
import { quoteShipping } from "@/lib/shipping";

export function CartDrawer() {
  const { cartOpen, setCartOpen, items, updateQuantity, removeItem, subtotalCents, totalWeightGrams, format, countryCode } = useStore();

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCartOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [cartOpen, setCartOpen]);

  if (!cartOpen) return null;

  const quote = quoteShipping({ countryCode, subtotalCents, weightGrams: totalWeightGrams });
  const country = getCountry(countryCode);

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-slate-900/50" aria-label="Close cart" onClick={() => setCartOpen(false)} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl fade-in" aria-label="Shopping cart">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Your cart <span className="text-sm font-normal text-slate-500">({items.length} {items.length === 1 ? "item" : "items"})</span>
          </h2>
          <button type="button" onClick={() => setCartOpen(false)} className="btn-ghost h-9 w-9 rounded-full px-0" aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-3xl">🛍️</div>
            <p className="font-semibold text-slate-900">Your cart is empty</p>
            <p className="text-sm text-slate-500">Discover premium American products shipped straight to your door.</p>
            <Link href="/shop" onClick={() => setCartOpen(false)} className="btn-primary">
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 py-4">
                  <Link href={`/shop/${item.slug}`} onClick={() => setCartOpen(false)} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-xs text-slate-500">{item.brand}</p>
                    <Link href={`/shop/${item.slug}`} onClick={() => setCartOpen(false)} className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-brand-700">
                      {item.name}
                    </Link>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="inline-flex items-center rounded-full border border-slate-200">
                        <button type="button" className="grid h-8 w-8 place-items-center rounded-l-full hover:bg-slate-100" onClick={() => updateQuantity(item.productId, item.quantity - 1)} aria-label="Decrease">
                          <MinusIcon size={14} />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                        <button type="button" className="grid h-8 w-8 place-items-center rounded-r-full hover:bg-slate-100 disabled:opacity-40" onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.stock} aria-label="Increase">
                          <PlusIcon size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-900 tabular-nums">{format(item.priceCents * item.quantity)}</span>
                        <button type="button" className="text-slate-400 hover:text-rose-600" onClick={() => removeItem(item.productId)} aria-label="Remove">
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
              {quote.amountToFreeShippingCents !== null && (
                <div className="mb-3 rounded-xl bg-white p-3 text-xs text-slate-700 ring-1 ring-slate-200">
                  <div className="flex items-center gap-2">
                    <TruckIcon size={16} className="text-brand-700" />
                    {quote.amountToFreeShippingCents === 0 ? (
                      <span>
                        🎉 You unlocked <strong>free standard shipping</strong> to {country?.name ?? "your country"}!
                      </span>
                    ) : (
                      <span>
                        Add <strong>{format(quote.amountToFreeShippingCents)}</strong> more for free shipping to {country?.name ?? "your country"}.
                      </span>
                    )}
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-600 transition-all"
                      style={{ width: `${Math.min(100, (subtotalCents / (quote.freeThresholdCents ?? 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-bold text-slate-900 tabular-nums">{format(subtotalCents)}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Shipping from {format(quote.options[0].priceCents)} to {country?.name ?? "your country"} · calculated at checkout
              </p>
              <div className="mt-4 grid gap-2">
                <Link href="/checkout" onClick={() => setCartOpen(false)} className="btn-accent h-12 text-base">
                  Checkout securely
                </Link>
                <Link href="/cart" onClick={() => setCartOpen(false)} className="btn-outline h-11">
                  View cart
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
