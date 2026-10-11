"use client";

import { CountrySelect } from "@/components/country-select";
import { PlaneIcon, TruckIcon } from "@/components/icons";
import { useStore } from "@/components/store-provider";
import { quoteShipping } from "@/lib/shipping";
import { addDays, formatDate } from "@/lib/utils";

export function ShippingEstimator({ priceCents, weightGrams }: { priceCents: number; weightGrams: number }) {
  const { countryCode, setCountryCode, format, subtotalCents } = useStore();
  const quote = quoteShipping({ countryCode, subtotalCents: subtotalCents + priceCents, weightGrams });
  const today = new Date();

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-900">Estimate delivery</p>
        <CountrySelect value={countryCode} onChange={setCountryCode} className="sm:w-64" />
      </div>
      <ul className="mt-3 space-y-2">
        {quote.options.map((option) => (
          <li key={option.method} className="flex items-start justify-between gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 text-brand-700">{option.method === "express" ? <PlaneIcon size={18} /> : <TruckIcon size={18} />}</span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                <p className="text-xs text-slate-500">
                  {option.carrier} · arrives {formatDate(addDays(today, option.minDays + 1), { month: "short", day: "numeric" })} –{" "}
                  {formatDate(addDays(today, option.maxDays + 2), { month: "short", day: "numeric" })}
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-900 tabular-nums">{option.isFree ? <span className="text-emerald-700">FREE</span> : format(option.priceCents)}</span>
          </li>
        ))}
      </ul>
      {quote.freeThresholdCents !== null && (
        <p className="mt-3 text-xs text-slate-500">
          Free standard shipping to {quote.zone.name} on orders over {format(quote.freeThresholdCents)}. Dispatched within 1 business day.
        </p>
      )}
    </div>
  );
}
