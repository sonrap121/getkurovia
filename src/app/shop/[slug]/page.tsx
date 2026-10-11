import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CheckIcon, LockIcon, RefreshIcon, ShieldIcon, StarIcon, TruckIcon } from "@/components/icons";
import { Price } from "@/components/price";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ShippingEstimator } from "@/components/shipping-estimator";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import { SITE } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} — Ships from USA`,
    description: product.shortDescription ?? undefined,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: [{ url: product.imageUrl, alt: product.name }],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.isActive) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id, 4);
  const images = product.gallery.length ? product.gallery : [product.imageUrl];
  const discount =
    product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents
      ? Math.round((1 - product.priceCents / product.compareAtPriceCents) * 100)
      : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images,
    description: product.shortDescription,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand ?? SITE.name },
    aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount },
    offers: {
      "@type": "Offer",
      url: `${SITE.url}/shop/${product.slug}`,
      priceCurrency: "USD",
      price: (product.priceCents / 100).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      shippingDetails: { "@type": "OfferShippingDetails", shippingDestination: { "@type": "DefinedRegion", addressCountry: "Worldwide" } },
    },
  };

  return (
    <div className="container-x py-8 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-xs text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-slate-900">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-slate-900">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/shop?category=${product.categorySlug}`} className="hover:text-slate-900">
          {product.categoryName}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <ProductGallery images={images} name={product.name} badge={discount > 0 ? `-${discount}%` : product.tags.includes("new") ? "New" : null} />

        <div>
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold text-brand-700">{product.brand}</span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 text-slate-700">
              <StarIcon size={14} className="text-accent-500" />
              <span className="font-semibold">{product.rating.toFixed(1)}</span>
              <span className="text-slate-400">({product.reviewCount.toLocaleString("en-US")} reviews)</span>
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">{product.name}</h1>
          <p className="mt-3 text-base text-slate-600">{product.shortDescription}</p>

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <Price cents={product.priceCents} compareAtCents={product.compareAtPriceCents} className="font-display text-3xl font-bold text-slate-900" compareClassName="text-lg" showUsdHint />
            {discount > 0 && <span className="badge bg-rose-100 text-rose-700">Save {discount}%</span>}
          </div>
          <p className="mt-1 text-xs text-slate-500">Import duties & taxes may apply on delivery depending on your country. SKU {product.sku}</p>

          <div className="mt-6">
            <AddToCartButton
              variant="full"
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                brand: product.brand,
                image: product.imageUrl,
                priceCents: product.priceCents,
                weightGrams: product.weightGrams,
                stock: product.stock,
              }}
            />
          </div>

          <div className="mt-6">
            <ShippingEstimator priceCents={product.priceCents} weightGrams={product.weightGrams} />
          </div>

          {product.highlights.length > 0 && (
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {product.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckIcon size={16} className="mt-0.5 shrink-0 text-emerald-600" /> {item}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-slate-600 sm:grid-cols-4">
            {[
              { icon: TruckIcon, label: "Ships in 24h from USA" },
              { icon: ShieldIcon, label: "100% authentic" },
              { icon: RefreshIcon, label: "30-day returns" },
              { icon: LockIcon, label: "Secure checkout" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 p-3 text-center">
                <item.icon size={18} className="text-brand-700" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <section className="prose-kv">
          <h2 className="!mt-0">About this product</h2>
          <p>{product.description}</p>
          <h3>Specifications</h3>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {[
              ["Brand", product.brand ?? "—"],
              ["SKU", product.sku],
              ["Shipping weight", `${(product.weightGrams / 1000).toFixed(2)} kg`],
              ["Category", product.categoryName],
              ["Ships from", "Wilmington, Delaware, USA"],
              ["Warranty", "US manufacturer warranty honored worldwide"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-slate-100 py-2">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-right font-medium text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
        <aside className="space-y-4">
          <details className="card group p-5" open>
            <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
              Shipping & delivery <span className="text-slate-400 transition group-open:rotate-45">+</span>
            </summary>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>Orders placed before 2pm ET ship the same business day from our Delaware facility. You receive a tracking link by email as soon as the carrier scans your parcel.</p>
              <p>Standard delivery takes 7–15 business days for most countries; Express Courier (DHL/FedEx) takes 3–7. See the estimator above for your destination.</p>
            </div>
          </details>
          <details className="card group p-5">
            <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
              Customs, duties & taxes <span className="text-slate-400 transition group-open:rotate-45">+</span>
            </summary>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>We declare every shipment accurately with harmonized codes to speed up clearance. Depending on your country, import VAT or duties may be collected by the carrier before delivery.</p>
              <p>
                Check the thresholds for your region in our <Link href="/shipping#duties" className="font-semibold text-brand-700 hover:underline">duties guide</Link>.
              </p>
            </div>
          </details>
          <details className="card group p-5">
            <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
              Returns & warranty <span className="text-slate-400 transition group-open:rotate-45">+</span>
            </summary>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>Return unused items within 30 days of delivery for a full refund of the product price. Damaged or defective items are replaced free of charge, including shipping.</p>
            </div>
          </details>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold text-slate-900">You may also like</h2>
            <Link href={`/shop?category=${product.categorySlug}`} className="text-sm font-semibold text-brand-700 hover:underline">
              More in {product.categoryName}
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
