"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { CountrySelect } from "@/components/country-select";
import { CreditCardIcon, LoaderIcon, LockIcon, PlaneIcon, ShieldIcon, TruckIcon } from "@/components/icons";
import { useStore } from "@/components/store-provider";
import { getCountry } from "@/lib/countries";
import { detectCardBrand } from "@/lib/payments";
import { quoteShipping, type ShippingMethod } from "@/lib/shipping";
import { addDays, cn, formatDate, isValidEmail } from "@/lib/utils";

interface FormState {
  email: string;
  phone: string;
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  customerNotes: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
}

const INITIAL: FormState = {
  email: "",
  phone: "",
  fullName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  customerNotes: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
  cardName: "",
};

function formatCardNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, hydrated, subtotalCents, totalWeightGrams, format, formatIn, currency, countryCode, setCountryCode, clearCart } = useStore();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [method, setMethod] = useState<ShippingMethod>("standard");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const quote = useMemo(() => quoteShipping({ countryCode, subtotalCents, weightGrams: totalWeightGrams }), [countryCode, subtotalCents, totalWeightGrams]);
  const selected = quote.options.find((o) => o.method === method) ?? quote.options[0];
  const totalCents = subtotalCents + selected.priceCents;
  const country = getCountry(countryCode);
  const brand = detectCardBrand(form.cardNumber);

  const update = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let value = event.target.value;
    if (key === "cardNumber") value = formatCardNumber(value);
    if (key === "cardExpiry") value = formatExpiry(value);
    if (key === "cardCvc") value = value.replace(/\D/g, "").slice(0, 4);
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!isValidEmail(form.email)) next.email = "Enter a valid email";
    if (form.fullName.trim().length < 2) next.fullName = "Required";
    if (form.addressLine1.trim().length < 3) next.addressLine1 = "Required";
    if (form.city.trim().length < 2) next.city = "Required";
    if (form.postalCode.trim().length < 2) next.postalCode = "Required";
    if (form.cardNumber.replace(/\D/g, "").length < 12) next.cardNumber = "Enter a valid card number";
    if (!/^\d{2}\/\d{2}$/.test(form.cardExpiry)) next.cardExpiry = "MM/YY";
    if (!/^\d{3,4}$/.test(form.cardCvc)) next.cardCvc = "3–4 digits";
    if (form.cardName.trim().length < 2) next.cardName = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setServerError(null);
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          phone: form.phone,
          fullName: form.fullName,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          countryCode,
          shippingMethod: method,
          displayCurrency: currency,
          customerNotes: form.customerNotes,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          card: { number: form.cardNumber, expiry: form.cardExpiry, cvc: form.cardCvc, name: form.cardName },
        }),
      });
      const data = (await res.json()) as { orderNumber?: string; error?: string };
      if (!res.ok || !data.orderNumber) throw new Error(data.error ?? "We couldn't place your order. Please try again.");
      clearCart();
      router.push(`/order/${data.orderNumber}?placed=1`);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Something went wrong.");
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!hydrated) {
    return <div className="container-x py-20 text-center text-sm text-slate-500">Preparing secure checkout…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-900">Nothing to check out yet</h1>
        <p className="mt-2 text-slate-600">Add a few products to your cart first.</p>
        <Link href="/shop" className="btn-primary mt-6">
          Go to shop
        </Link>
      </div>
    );
  }

  const field = (key: keyof FormState, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={key} className="label">
        {label}
      </label>
      <input id={key} value={form[key]} onChange={update(key)} className={cn("input h-11", errors[key] && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20")} {...props} />
      {errors[key] && <p className="mt-1 text-xs text-rose-600">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="bg-slate-50">
      <div className="container-x py-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-slate-900">Checkout</h1>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <LockIcon size={14} /> 256-bit SSL encrypted
          </span>
        </div>

        {serverError && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]" noValidate>
          <div className="space-y-6">
            <section className="card p-6">
              <h2 className="font-display text-lg font-bold text-slate-900">1. Contact</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {field("email", "Email address", { type: "email", autoComplete: "email", placeholder: "you@example.com" })}
                {field("phone", "Phone (for the courier)", { type: "tel", autoComplete: "tel", placeholder: "+90 5xx xxx xx xx" })}
              </div>
              <p className="mt-2 text-xs text-slate-500">We send tracking updates to this email. A phone number helps customs and couriers reach you.</p>
            </section>

            <section className="card p-6">
              <h2 className="font-display text-lg font-bold text-slate-900">2. Shipping address</h2>
              <div className="mt-4 grid gap-4">
                <div>
                  <label htmlFor="country" className="label">
                    Country / region
                  </label>
                  <CountrySelect id="country" value={countryCode} onChange={setCountryCode} />
                </div>
                {field("fullName", "Full name (as on ID — required by customs)", { autoComplete: "name" })}
                {field("addressLine1", "Street address", { autoComplete: "address-line1", placeholder: "Street, building, apartment" })}
                {field("addressLine2", "Address line 2 (optional)", { autoComplete: "address-line2" })}
                <div className="grid gap-4 sm:grid-cols-3">
                  {field("city", "City", { autoComplete: "address-level2" })}
                  {field("state", "State / province", { autoComplete: "address-level1" })}
                  {field("postalCode", "Postal code", { autoComplete: "postal-code" })}
                </div>
                <div>
                  <label htmlFor="customerNotes" className="label">
                    Order notes (sizes, delivery instructions)
                  </label>
                  <textarea id="customerNotes" value={form.customerNotes} onChange={update("customerNotes")} rows={2} className="input" placeholder="e.g. Sneakers US size 10, leave with concierge" />
                </div>
              </div>
            </section>

            <section className="card p-6">
              <h2 className="font-display text-lg font-bold text-slate-900">3. Shipping method</h2>
              <p className="mt-1 text-sm text-slate-500">
                Shipping to <strong>{country?.name}</strong> · zone: {quote.zone.name}
              </p>
              <div className="mt-4 grid gap-3">
                {quote.options.map((option) => (
                  <label
                    key={option.method}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition",
                      method === option.method ? "border-brand-900 bg-brand-50/60 ring-1 ring-brand-900" : "border-slate-200 hover:border-slate-400",
                    )}
                  >
                    <input type="radio" name="shipping" value={option.method} checked={method === option.method} onChange={() => setMethod(option.method)} className="mt-1 accent-brand-900" />
                    <span className="text-brand-800">{option.method === "express" ? <PlaneIcon size={20} /> : <TruckIcon size={20} />}</span>
                    <span className="flex-1">
                      <span className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{option.label}</span>
                        <span className="font-bold text-slate-900 tabular-nums">{option.isFree ? <span className="text-emerald-700">FREE</span> : format(option.priceCents)}</span>
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {option.carrier} · {option.description} · est. {formatDate(addDays(new Date(), option.minDays + 1), { month: "short", day: "numeric" })} – {formatDate(addDays(new Date(), option.maxDays + 2), { month: "short", day: "numeric" })}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className="card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-slate-900">4. Payment</h2>
                <div className="flex gap-1.5">
                  {["VISA", "MC", "AMEX"].map((b) => (
                    <span key={b} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid gap-4">
                <div>
                  <label htmlFor="cardNumber" className="label">
                    Card number
                  </label>
                  <div className="relative">
                    <CreditCardIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input id="cardNumber" inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" value={form.cardNumber} onChange={update("cardNumber")} className={cn("input h-11 pl-10 pr-20", errors.cardNumber && "border-rose-500")} />
                    {form.cardNumber && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">{brand}</span>}
                  </div>
                  {errors.cardNumber && <p className="mt-1 text-xs text-rose-600">{errors.cardNumber}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {field("cardExpiry", "Expiry (MM/YY)", { inputMode: "numeric", autoComplete: "cc-exp", placeholder: "12/28" })}
                  {field("cardCvc", "CVC", { inputMode: "numeric", autoComplete: "cc-csc", placeholder: "123" })}
                  {field("cardName", "Name on card", { autoComplete: "cc-name" })}
                </div>
              </div>
              <p className="mt-3 flex items-start gap-2 text-xs text-slate-500">
                <ShieldIcon size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                Card details are encrypted and processed by our PCI-DSS compliant payment partner. Kurovia never stores your full card number. You will be charged {formatIn(totalCents, "USD")}.
              </p>
            </section>
          </div>

          <aside className="card h-fit p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-lg font-bold text-slate-900">Order summary</h2>
            <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                    <span className="absolute -right-0 -top-0 grid h-5 min-w-5 place-items-center rounded-bl-lg bg-brand-900 px-1 text-[10px] font-bold text-white">{item.quantity}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.brand}</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{format(item.priceCents * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Subtotal</dt>
                <dd className="font-semibold tabular-nums">{format(subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">{selected.label}</dt>
                <dd className="font-semibold tabular-nums">{selected.isFree ? <span className="text-emerald-700">Free</span> : format(selected.priceCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Import duties & taxes</dt>
                <dd className="text-xs text-slate-500">Paid on delivery if applicable</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-slate-200 pt-3">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="text-right">
                  <span className="font-display text-2xl font-bold text-slate-900 tabular-nums">{format(totalCents)}</span>
                  {currency !== "USD" && <span className="block text-xs text-slate-500">Charged as {formatIn(totalCents, "USD")}</span>}
                </dd>
              </div>
            </dl>
            <button type="submit" disabled={submitting} className="btn-accent mt-5 h-12 w-full text-base">
              {submitting ? (
                <>
                  <LoaderIcon size={18} /> Processing…
                </>
              ) : (
                <>
                  <LockIcon size={18} /> Pay {formatIn(totalCents, "USD")}
                </>
              )}
            </button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500">
              By placing your order you agree to our{" "}
              <Link href="/legal/terms" className="underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="underline">
                Privacy Policy
              </Link>
              . Parcels ship from Wilmington, DE, USA.
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}
