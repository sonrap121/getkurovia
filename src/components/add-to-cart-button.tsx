"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore, type CartProductInput } from "@/components/store-provider";
import { CartIcon, CheckIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  product: CartProductInput;
  variant?: "card" | "full";
  className?: string;
}

export function AddToCartButton({ product, variant = "card", className }: AddToCartButtonProps) {
  const { addItem, items } = useStore();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const inCart = items.find((item) => item.productId === product.productId)?.quantity ?? 0;
  const soldOut = product.stock <= 0;
  const remaining = Math.max(0, product.stock - inCart);

  const handleAdd = () => {
    if (soldOut || remaining <= 0) return;
    addItem(product, Math.min(quantity, remaining));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  const handleBuyNow = () => {
    if (soldOut) return;
    if (inCart === 0) addItem(product, Math.min(quantity, Math.max(1, remaining)));
    router.push("/checkout");
  };

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={handleAdd}
        disabled={soldOut || remaining <= 0}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:bg-brand-900 hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-900",
          added && "bg-emerald-600 text-white hover:bg-emerald-600",
          className,
        )}
        aria-label={soldOut ? "Sold out" : `Add ${product.name} to cart`}
        title={soldOut ? "Sold out" : "Add to cart"}
      >
        {added ? <CheckIcon size={18} /> : <PlusIcon size={18} />}
      </button>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-slate-300">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-l-full text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <MinusIcon size={16} />
          </button>
          <span className="w-10 text-center text-sm font-semibold tabular-nums">{quantity}</span>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-r-full text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.min(Math.max(1, remaining), q + 1))}
            disabled={quantity >= remaining}
            aria-label="Increase quantity"
          >
            <PlusIcon size={16} />
          </button>
        </div>
        <span className="text-xs text-slate-500">
          {soldOut ? "Currently sold out" : product.stock <= 10 ? `Only ${product.stock} left in stock` : "In stock & ready to ship"}
        </span>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut || remaining <= 0}
          className={cn("btn-primary h-12 flex-1 text-base", added && "bg-emerald-600 hover:bg-emerald-600")}
        >
          {added ? (
            <>
              <CheckIcon size={18} /> Added to cart
            </>
          ) : (
            <>
              <CartIcon size={18} /> {soldOut ? "Sold out" : "Add to cart"}
            </>
          )}
        </button>
        <button type="button" onClick={handleBuyNow} disabled={soldOut} className="btn-accent h-12 flex-1 text-base">
          Buy now
        </button>
      </div>
    </div>
  );
}
