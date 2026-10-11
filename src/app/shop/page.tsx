import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CloseIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { SortSelect } from "@/components/shop-controls";
import { getCategoriesWithCounts, getProducts } from "@/lib/data";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

const PRICE_RANGES = [
  { label: "Under $50", min: undefined, max: 4999 },
  { label: "$50 – $100", min: 5000, max: 9999 },
  { label: "$100 – $200", min: 10000, max: 19999 },
  { label: "$200+", min: 20000, max: undefined },
] as const;

const TAGS = ["bestseller", "new", "gift", "made-in-usa", "travel"];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function buildHref(base: SearchParams, patch: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(base)) {
    const v = first(value);
    if (v) params.set(key, v);
  }
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) params.delete(key);
    else params.set(key, value);
  }
  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const params = await searchParams;
  const q = first(params.q);
  const category = first(params.category);
  if (q) return { title: `Search: ${q}` };
  if (category) {
    const categories = await getCategoriesWithCounts();
    const match = categories.find((c) => c.slug === category);
    if (match) return { title: `${match.name} — Shipped from USA`, description: match.description ?? undefined };
  }
  return { title: "Shop all products — Shipped from USA worldwide", description: "Browse authentic American products across tech, fashion, home, beauty, sports and pantry. Worldwide tracked delivery." };
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const q = first(params.q)?.trim() || undefined;
  const category = first(params.category) || undefined;
  const sort = first(params.sort) || "featured";
  const tag = first(params.tag) || undefined;
  const min = first(params.min);
  const max = first(params.max);
  const minCents = min ? Number(min) : undefined;
  const maxCents = max ? Number(max) : undefined;

  const [categories, products] = await Promise.all([
    getCategoriesWithCounts(),
    getProducts({ q, category, sort, tag, minCents: Number.isFinite(minCents) ? minCents : undefined, maxCents: Number.isFinite(maxCents) ? maxCents : undefined }),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);
  const activeFilters = [
    q ? { label: `“${q}”`, href: buildHref(params, { q: undefined }) } : null,
    activeCategory ? { label: activeCategory.name, href: buildHref(params, { category: undefined }) } : null,
    tag ? { label: `#${tag}`, href: buildHref(params, { tag: undefined }) } : null,
    min || max ? { label: PRICE_RANGES.find((r) => String(r.min ?? "") === (min ?? "") && String(r.max ?? "") === (max ?? ""))?.label ?? "Price", href: buildHref(params, { min: undefined, max: undefined }) } : null,
  ].filter((f): f is { label: string; href: string } => f !== null);

  return (
    <div className="container-x py-10">
      <nav className="text-xs text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-slate-900">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-slate-900">
          Shop
        </Link>
        {activeCategory && (
          <>
            <span className="mx-2">/</span>
            <span className="text-slate-900">{activeCategory.name}</span>
          </>
        )}
      </nav>

      <header className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            {q ? `Results for “${q}”` : activeCategory ? activeCategory.name : "All products"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {activeCategory?.description ?? "Authentic American products, shipped from Delaware to 150+ countries. Prices in your currency, shipping calculated upfront."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            {products.length} {products.length === 1 ? "product" : "products"}
          </span>
          <Suspense fallback={null}>
            <SortSelect />
          </Suspense>
        </div>
      </header>

      {activeFilters.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <Link key={filter.label} href={filter.href} className="badge border border-slate-300 bg-white py-1 pl-3 pr-2 text-slate-700 hover:border-slate-900">
              {filter.label} <CloseIcon size={14} />
            </Link>
          ))}
          <Link href="/shop" className="text-xs font-semibold text-brand-700 hover:underline">
            Clear all
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
          <div>
            <p className="label">Category</p>
            <ul className="space-y-1">
              <li>
                <Link href={buildHref(params, { category: undefined })} className={cn("flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm hover:bg-slate-100", !category ? "bg-brand-50 font-semibold text-brand-800" : "text-slate-700")}>
                  All products
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={buildHref(params, { category: c.slug })}
                    className={cn("flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm hover:bg-slate-100", category === c.slug ? "bg-brand-50 font-semibold text-brand-800" : "text-slate-700")}
                  >
                    {c.name}
                    <span className="text-xs text-slate-400">{c.productCount}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label">Price (USD)</p>
            <ul className="space-y-1">
              {PRICE_RANGES.map((range) => {
                const active = String(range.min ?? "") === (min ?? "") && String(range.max ?? "") === (max ?? "") && (min || max);
                return (
                  <li key={range.label}>
                    <Link
                      href={buildHref(params, { min: range.min !== undefined ? String(range.min) : undefined, max: range.max !== undefined ? String(range.max) : undefined })}
                      className={cn("block rounded-lg px-2.5 py-1.5 text-sm hover:bg-slate-100", active ? "bg-brand-50 font-semibold text-brand-800" : "text-slate-700")}
                    >
                      {range.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <p className="label">Collections</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <Link key={t} href={buildHref(params, { tag: tag === t ? undefined : t })} className={cn("badge border py-1", tag === t ? "border-brand-900 bg-brand-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-900")}>
                  #{t}
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-brand-950 p-5 text-white">
            <p className="font-display text-lg font-bold">Not sure about duties?</p>
            <p className="mt-1 text-sm text-slate-300">Read our country-by-country guide to customs, taxes and delivery times.</p>
            <Link href="/shipping#duties" className="btn-accent mt-4 h-10 w-full text-sm">
              Shipping guide
            </Link>
          </div>
        </aside>

        <section>
          {products.length === 0 ? (
            <div className="card flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
              <span className="text-4xl">🔎</span>
              <p className="font-semibold text-slate-900">No products match your filters</p>
              <p className="max-w-sm text-sm text-slate-500">Try a different search term or clear some filters. New US products are added every week.</p>
              <Link href="/shop" className="btn-primary mt-2">
                Browse everything
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
