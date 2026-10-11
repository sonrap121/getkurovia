import type { Metadata } from "next";
import Link from "next/link";
import { Money } from "@/components/price";
import { COUNTRIES } from "@/lib/countries";
import { SHIPPING_ZONES, ZONE_ORDER } from "@/lib/shipping";
import { flagEmoji } from "@/lib/utils";

export const metadata: Metadata = {
  title: "International shipping from the USA — rates, times, duties",
  description: "Kurovia ships from Delaware, USA to 150+ countries. See shipping rates, delivery times, free-shipping thresholds and customs guidance by region.",
};

const DUTY_GUIDE = [
  { region: "European Union", note: "Import VAT (17–27%) applies on all goods; customs duty usually only above €150. Carrier collects on delivery or via a payment link." },
  { region: "United Kingdom", note: "20% VAT on orders over £135 plus duty on some categories. Below £135 VAT is prepaid by Kurovia — no fees at the door." },
  { region: "Türkiye", note: "Shipments valued over €30 (goods) are subject to a flat 30–60% customs tax depending on the origin; some electronics add ÖTV. The carrier (DHL/UPS) handles the declaration and contacts you for payment." },
  { region: "Gulf countries (UAE, SA, QA, KW)", note: "5% VAT plus 5% duty above ~AED 1,000 / SAR 1,000 thresholds; personal shipments under the threshold are usually duty-free." },
  { region: "Canada", note: "GST/HST and provincial taxes on the full value; duty-free under CAD 150 for courier shipments." },
  { region: "Australia & New Zealand", note: "10% GST / 15% GST is collected on all imports; no additional duty under AUD 1,000 / NZD 1,000." },
  { region: "Japan, Korea, Singapore", note: "Low de-minimis thresholds (JPY 10,000, USD 150, SGD 400). Consumption tax applies above those values." },
  { region: "Latin America", note: "Thresholds vary (e.g. Brazil taxes 60% on most imports, Mexico duty-free under USD 50). We provide invoice documents for faster clearance." },
];

const FAQ = [
  { q: "How quickly do you dispatch?", a: "Orders placed before 2pm ET ship the same business day; all others within one business day. You receive a tracking link by email as soon as the carrier scans the parcel." },
  { q: "Which carriers do you use?", a: "USPS Priority International and DHL eCommerce for Standard; DHL Express Worldwide, FedEx International Priority and UPS Worldwide Expedited for Express." },
  { q: "Will I have to pay customs fees?", a: "Depending on your country and the order value, import VAT and/or duties may be collected by the carrier before delivery. Our estimates above help you plan — the amount is never charged by Kurovia." },
  { q: "Do you ship electronics with US plugs?", a: "Yes. All electronics are US-market versions. Chargers are dual-voltage (100–240V); we include a free plug adapter for your region in every tech order." },
  { q: "What if my parcel is lost or damaged?", a: "Every shipment is insured. If tracking stalls or an item arrives damaged, contact us within 7 days and we will reship or refund — your choice." },
  { q: "Can I change my address after ordering?", a: "Email support with your order number within 2 hours of ordering and we'll update it before dispatch. After dispatch, we can request a carrier redirect where available." },
  { q: "Do you consolidate multiple orders?", a: "Yes — orders placed within 24 hours to the same address are automatically combined into one parcel, and we refund any shipping difference." },
];

export default function ShippingPage() {
  return (
    <div>
      <section className="bg-brand-950 py-16 text-white">
        <div className="container-x">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-400">Worldwide shipping guide</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold sm:text-5xl">From Delaware to your door — rates, delivery times & customs, explained.</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            We ship to {COUNTRIES.length}+ countries and territories. Every parcel is tracked, insured and declared accurately so it clears customs fast.
          </p>
        </div>
      </section>

      <section className="container-x py-14">
        <h2 className="font-display text-2xl font-bold text-slate-900">Shipping zones & rates</h2>
        <p className="mt-2 text-sm text-slate-600">Rates for parcels up to 1 kg. Each additional kilogram is charged at the per-kg rate shown. Prices convert to your selected currency; charged in USD.</p>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Standard tracked</th>
                <th className="px-4 py-3">Express courier</th>
                <th className="px-4 py-3">Extra per kg</th>
                <th className="px-4 py-3">Free standard shipping</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ZONE_ORDER.map((id) => {
                const zone = SHIPPING_ZONES[id];
                const examples = COUNTRIES.filter((c) => c.zone === id).slice(0, 6);
                return (
                  <tr key={id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{zone.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{examples.map((c) => flagEmoji(c.code)).join(" ")}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">
                        <Money cents={zone.standard.priceCents} />
                      </p>
                      <p className="text-xs text-slate-500">
                        {zone.standard.minDays}–{zone.standard.maxDays} business days · {zone.standard.carrier}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">
                        <Money cents={zone.express.priceCents} />
                      </p>
                      <p className="text-xs text-slate-500">
                        {zone.express.minDays}–{zone.express.maxDays} business days · {zone.express.carrier}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      <Money cents={zone.standard.perExtraKgCents} /> / <Money cents={zone.express.perExtraKgCents} />
                    </td>
                    <td className="px-4 py-4">
                      {zone.freeThresholdCents !== null ? (
                        <span className="badge bg-emerald-50 text-emerald-700">
                          Orders over <Money cents={zone.freeThresholdCents} />
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Not available</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section id="duties" className="bg-slate-50 py-14">
        <div className="container-x">
          <h2 className="font-display text-2xl font-bold text-slate-900">Customs, duties & taxes by region</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Kurovia prices never include destination import taxes. The guide below reflects typical rules — official thresholds change, so treat these as estimates. We attach a commercial invoice and HS codes to every shipment.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {DUTY_GUIDE.map((item) => (
              <div key={item.region} className="card p-5">
                <p className="font-semibold text-slate-900">{item.region}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-14">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Restricted & special items</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>• <strong>Perfume & aerosols</strong> ship via ground-approved express only (DHL Express Dangerous Goods) — allow 1–2 extra days.</li>
              <li>• <strong>Food & candy</strong> are sealed, shelf-stable and shipped with ice packs May–September.</li>
              <li>• <strong>Lithium batteries</strong> (headphones, watches, speakers) ship installed in the device, fully compliant with IATA PI967.</li>
              <li>• We cannot ship to sanctioned destinations or P.O. boxes for Express services.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Packaging</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              Every order is packed in double-wall boxes with recycled paper cushioning. Fragile items get custom foam inserts. Original retail boxes are kept intact for gifts and warranty purposes. Tell us in the order notes if you want a gift note included.
            </p>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-slate-50 py-14">
        <div className="container-x max-w-4xl">
          <h2 className="font-display text-2xl font-bold text-slate-900">Frequently asked questions</h2>
          <div className="mt-6 space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="card group p-5">
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                  {item.q}
                  <span className="ml-4 text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-sm text-slate-600">
            Still have questions?{" "}
            <Link href="/contact" className="font-semibold text-brand-700 hover:underline">
              Contact our support team
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
