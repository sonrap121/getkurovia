import Link from "next/link";
import { ArrowRightIcon, GlobeIcon, HeadsetIcon, LockIcon, PackageIcon, PlaneIcon, RefreshIcon, ShieldIcon, StarIcon, TruckIcon } from "@/components/icons";
import { NewsletterForm } from "@/components/newsletter-form";
import { Money } from "@/components/price";
import { ProductCard } from "@/components/product-card";
import { getCategoriesWithCounts, getFeaturedProducts, getNewArrivals } from "@/lib/data";
import { SHIPPING_ZONES, ZONE_ORDER } from "@/lib/shipping";
import { flagEmoji } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TRUST_ITEMS = [
  { icon: TruckIcon, title: "Ships from the USA", text: "Every order leaves our Delaware fulfillment center within 1 business day." },
  { icon: GlobeIcon, title: "150+ countries", text: "Tracked door-to-door delivery with USPS, UPS, FedEx and DHL Express." },
  { icon: ShieldIcon, title: "100% authentic", text: "Sourced directly from US brands and authorized retailers. No grey market." },
  { icon: RefreshIcon, title: "30-day returns", text: "Changed your mind? Return within 30 days for a full refund." },
];

const TESTIMONIALS = [
  {
    name: "Elif K.",
    country: "TR",
    location: "Istanbul, Türkiye",
    quote: "I'd been trying to get the LumaDerm serum for a year. Kurovia had it at my door in 5 days, with tracking the whole way. Customs was zero hassle.",
    product: "Vitamin C Serum",
  },
  {
    name: "Jonas W.",
    country: "DE",
    location: "Munich, Germany",
    quote: "Prices shown in euros, shipping calculated upfront, DHL Express delivery. This is how buying from the US should feel.",
    product: "AeroSound Pro Headphones",
  },
  {
    name: "Amira H.",
    country: "AE",
    location: "Dubai, UAE",
    quote: "The candy box was a hit with my kids and the chocolate arrived intact thanks to the ice packs. Already placed a second order.",
    product: "American Candy Box",
  },
];

export default async function HomePage() {
  const [categories, featured, arrivals] = await Promise.all([getCategoriesWithCounts(), getFeaturedProducts(8), getNewArrivals(4)]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hero.jpg" alt="" className="h-full w-full object-cover object-right opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/85 to-brand-950/20" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-brand-950 to-transparent" />
        </div>
        <div className="container-x relative py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl fade-in">
            <span className="badge bg-white/10 text-accent-300 ring-1 ring-white/15">
              <PlaneIcon size={14} /> Now shipping to 150+ countries
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              America&apos;s best brands,
              <br />
              <span className="text-accent-400">delivered to your door.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              Kurovia curates authentic US products — the ones that never seem to ship abroad — and delivers them worldwide from our fulfillment
              center in Delaware. Transparent pricing in your currency, tracked shipping, no surprises.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-accent h-12 px-7 text-base">
                Shop the collection <ArrowRightIcon size={18} />
              </Link>
              <Link href="/shipping" className="btn h-12 border border-white/25 bg-white/5 px-7 text-base text-white backdrop-blur hover:bg-white/10">
                Shipping rates & times
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8">
              {[
                { value: "150+", label: "Countries served" },
                { value: "24h", label: "Dispatch time" },
                { value: "4.9★", label: "Average rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs uppercase tracking-wider text-slate-400">{stat.label}</dt>
                  <dd className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-b border-slate-100 bg-white">
        <div className="container-x grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="flex gap-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <item.icon size={22} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-x py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Shop by category</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">Everything worth importing</h2>
          </div>
          <Link href="/shop" className="hidden text-sm font-semibold text-brand-700 hover:underline sm:inline-flex sm:items-center sm:gap-1">
            View all <ArrowRightIcon size={16} />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/shop?category=${category.slug}`} className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-200">
              {category.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={category.imageUrl} alt={category.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-display text-base font-bold leading-tight text-white">{category.name}</p>
                <p className="mt-1 text-xs text-slate-300">{category.productCount} products</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="bg-slate-50 py-16">
        <div className="container-x">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Customer favorites</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">Bestsellers shipping worldwide</h2>
            </div>
            <Link href="/shop?sort=rating" className="hidden text-sm font-semibold text-brand-700 hover:underline sm:inline-flex sm:items-center sm:gap-1">
              Top rated <ArrowRightIcon size={16} />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container-x py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">How Kurovia works</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">From a US warehouse to your doorstep in three steps</h2>
            <ol className="mt-8 space-y-6">
              {[
                { icon: PackageIcon, title: "Shop US-exclusive products", text: "Browse authentic American brands with prices shown in your local currency and shipping calculated before you check out." },
                { icon: LockIcon, title: "We pack it in Delaware", text: "Orders are picked, quality-checked and packed with protective, recyclable materials within one business day." },
                { icon: PlaneIcon, title: "Tracked delivery, anywhere", text: "Choose Standard or Express courier. Follow your parcel from Wilmington to your door with real-time tracking." },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-900 text-accent-400">
                    <step.icon size={22} />
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-accent-400 text-[11px] font-bold text-brand-950">{index + 1}</span>
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/about" className="btn-outline mt-8">
              More about Kurovia
            </Link>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl shadow-[var(--shadow-soft)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.pexels.com/photos/4487383/pexels-photo-4487383.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
                alt="Kurovia fulfillment center"
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-4 hidden rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] ring-1 ring-slate-100 sm:block">
              <p className="text-xs text-slate-500">Live from Wilmington, DE</p>
              <p className="mt-1 font-display text-lg font-bold text-slate-900">1,284 parcels shipped this week</p>
              <p className="mt-1 text-xs text-emerald-700">● All carriers on time</p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="container-x pb-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Just landed</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">New arrivals</h2>
          </div>
          <Link href="/shop?sort=newest" className="hidden text-sm font-semibold text-brand-700 hover:underline sm:inline-flex sm:items-center sm:gap-1">
            See all new <ArrowRightIcon size={16} />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {arrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* SHIPPING ZONES */}
      <section className="bg-brand-950 py-16 text-white">
        <div className="container-x">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-400">Worldwide shipping</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Transparent rates for every region</h2>
            <p className="mt-3 text-slate-300">Shipping is calculated before you pay — no surprises at checkout. Prices below are for parcels up to 1 kg.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ZONE_ORDER.filter((id) => id !== "us").map((id) => {
              const zone = SHIPPING_ZONES[id];
              return (
                <div key={zone.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <p className="font-semibold">{zone.name}</p>
                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-400">Standard</dt>
                      <dd className="font-semibold">
                        <Money cents={zone.standard.priceCents} /> · {zone.standard.minDays}–{zone.standard.maxDays}d
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-400">Express</dt>
                      <dd className="font-semibold">
                        <Money cents={zone.express.priceCents} /> · {zone.express.minDays}–{zone.express.maxDays}d
                      </dd>
                    </div>
                  </dl>
                  {zone.freeThresholdCents !== null && (
                    <p className="mt-4 rounded-lg bg-accent-400/15 px-2.5 py-1.5 text-xs font-medium text-accent-300">
                      Free standard over <Money cents={zone.freeThresholdCents} />
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <HeadsetIcon size={18} className="text-accent-400" /> Multilingual support
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldIcon size={18} className="text-accent-400" /> Loss & damage protection included
            </span>
            <Link href="/shipping" className="ml-auto inline-flex items-center gap-1 font-semibold text-white hover:underline">
              Full shipping guide <ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-x py-16">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Loved worldwide</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">What customers say</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="card flex flex-col p-6">
              <div className="flex items-center gap-1 text-accent-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} size={16} />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-700">“{t.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">
                    {flagEmoji(t.country)} {t.location}
                  </p>
                </div>
                <span className="text-xs text-slate-400">Bought: {t.product}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="container-x pb-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 to-brand-700 px-6 py-12 text-white sm:px-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent-400/20 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold">Get 10% off your first international order</h2>
              <p className="mt-3 text-slate-200">Plus early access to US-exclusive launches, restocks and seasonal American pantry boxes.</p>
            </div>
            <NewsletterForm dark />
          </div>
        </div>
      </section>
    </>
  );
}
