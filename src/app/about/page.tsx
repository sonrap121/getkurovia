import type { Metadata } from "next";
import Link from "next/link";
import { GlobeIcon, PackageIcon, ShieldIcon, SparkIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "About Kurovia — your personal shopper in the USA",
  description: "Kurovia makes American products accessible to the world. Learn how we source, pack in Delaware and ship to 150+ countries.",
};

const VALUES = [
  { icon: ShieldIcon, title: "Authentic, always", text: "We buy directly from brands and authorized US retailers. Every product carries its original packaging and warranty." },
  { icon: GlobeIcon, title: "Built for international buyers", text: "Local currency pricing, duty guidance, dual-voltage checks and plug adapters — we remove every friction of buying from abroad." },
  { icon: PackageIcon, title: "Obsessive about packing", text: "Our Delaware team repacks fragile and perishable items for a 5,000-mile journey. Less than 0.3% of parcels arrive damaged." },
  { icon: SparkIcon, title: "Curated, not endless", text: "We stock the products people actually ask us to bring from the US — and add new ones every week based on customer requests." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-brand-950 py-20 text-white">
        <div className="absolute inset-0 opacity-30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hero.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/90 to-brand-950/50" />
        <div className="container-x relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-400">Our story</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold sm:text-5xl">Kurovia started with one question: why is it so hard to buy from America?</h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Founded by a team of expats who kept filling their suitcases with US products for friends and family back home, Kurovia turned that habit into a world-class
            cross-border store. Today we ship thousands of parcels a month from Wilmington, Delaware to more than 150 countries.
          </p>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <div key={value.title} className="card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <value.icon size={22} />
              </span>
              <p className="mt-4 font-semibold text-slate-900">{value.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{value.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl shadow-[var(--shadow-soft)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.pexels.com/photos/10834810/pexels-photo-10834810.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
              alt="Kurovia warehouse in Delaware"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Why Delaware?</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">A sales-tax-free home base, minutes from the East Coast air hubs</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Delaware has no state sales tax, which means you never pay US tax on top of your order. Our 2,800 m² facility in Wilmington sits within two hours of the Philadelphia,
              Newark and JFK cargo hubs used by DHL, FedEx and UPS, so parcels leave the country faster than from almost anywhere else in the US.
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-6">
              {[
                { value: "150+", label: "Countries" },
                { value: "99.7%", label: "Delivered intact" },
                { value: "4.9/5", label: "Customer rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs uppercase tracking-wider text-slate-500">{stat.label}</dt>
                  <dd className="mt-1 font-display text-2xl font-bold text-slate-900">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="container-x py-16 text-center">
        <h2 className="font-display text-3xl font-bold text-slate-900">Can&apos;t find a product?</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Our personal-shopper team can source almost anything sold in the United States — from limited sneakers to specialty supplements. Send us a link and we&apos;ll quote within 24 hours.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/contact" className="btn-primary">
            Request a product
          </Link>
          <Link href="/shop" className="btn-outline">
            Browse the catalog
          </Link>
        </div>
      </section>
    </div>
  );
}
