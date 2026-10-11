import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { StarIcon } from "@/components/icons";
import { Price } from "@/components/price";
import type { ProductWithCategory } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: ProductWithCategory;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const discount =
    product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents
      ? Math.round((1 - product.priceCents / product.compareAtPriceCents) * 100)
      : 0;
  const badge = product.stock <= 0 ? "Sold out" : discount > 0 ? `-${discount}%` : product.tags.includes("new") ? "New" : product.tags.includes("bestseller") ? "Bestseller" : null;

  return (
    <article className={cn("group card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]", className)}>
      <Link href={`/shop/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {badge && (
          <span
            className={cn(
              "badge absolute left-3 top-3 shadow-sm",
              product.stock <= 0 ? "bg-slate-900 text-white" : discount > 0 ? "bg-rose-600 text-white" : "bg-white text-slate-900",
            )}
          >
            {badge}
          </span>
        )}
        <span className="badge absolute right-3 top-3 bg-white/90 text-[11px] text-slate-700 backdrop-blur">🇺🇸 Ships from USA</span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <span className="truncate font-medium">{product.brand ?? product.categoryName}</span>
          <span className="inline-flex items-center gap-1 text-slate-700">
            <StarIcon size={13} className="text-accent-500" />
            <span className="font-semibold">{product.rating.toFixed(1)}</span>
            <span className="text-slate-400">({product.reviewCount.toLocaleString("en-US")})</span>
          </span>
        </div>
        <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
          <Link href={`/shop/${product.slug}`} className="hover:text-brand-700">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <Price cents={product.priceCents} compareAtCents={product.compareAtPriceCents} className="text-base font-bold text-slate-900" />
          <AddToCartButton
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
      </div>
    </article>
  );
}
