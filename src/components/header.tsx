"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { CartIcon, ChevronDownIcon, CloseIcon, GlobeIcon, MenuIcon, SearchIcon } from "@/components/icons";
import { useStore } from "@/components/store-provider";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?category=tech", label: "Tech" },
  { href: "/shop?category=fashion", label: "Fashion" },
  { href: "/shop?category=home", label: "Home" },
  { href: "/shop?category=beauty", label: "Beauty" },
  { href: "/shop?category=sports", label: "Sports" },
  { href: "/shop?category=pantry", label: "Pantry" },
  { href: "/shipping", label: "Shipping" },
];

function SearchForm({ className, autoFocus = false, onSubmitted }: { className?: string; autoFocus?: boolean; onSubmitted?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const q = value.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
    onSubmitted?.();
  };

  return (
    <form onSubmit={submit} role="search" className={cn("relative", className)}>
      <SearchIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search US brands, products…"
        className="input h-11 rounded-full pl-10 pr-4"
        aria-label="Search products"
      />
    </form>
  );
}

function CurrencySelect({ className }: { className?: string }) {
  const { currency, setCurrency } = useStore();
  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <GlobeIcon size={16} className="pointer-events-none absolute left-2.5 text-slate-500" />
      <select
        value={currency}
        onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
        className="h-9 cursor-pointer appearance-none rounded-full border border-slate-200 bg-white pl-8 pr-8 text-xs font-semibold text-slate-800 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        aria-label="Select currency"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} · {c.symbol}
          </option>
        ))}
      </select>
      <ChevronDownIcon size={14} className="pointer-events-none absolute right-2.5 text-slate-500" />
    </label>
  );
}

export function Header() {
  const pathname = usePathname();
  const { itemCount, hydrated, setCartOpen } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="bg-brand-950 text-white">
        <div className="container-x flex h-9 items-center justify-center gap-6 text-[12px] font-medium tracking-wide">
          <span className="hidden sm:inline">🇺🇸 Shipped from our Delaware, USA fulfillment center</span>
          <span className="hidden h-3 w-px bg-white/30 sm:block" />
          <span>✈️ Tracked delivery to 150+ countries</span>
          <span className="hidden h-3 w-px bg-white/30 md:block" />
          <Link href="/shipping" className="hidden underline-offset-2 hover:underline md:inline">
            Free shipping thresholds by region →
          </Link>
        </div>
      </div>

      <div className="container-x flex h-16 items-center gap-3 lg:h-[72px]">
        <button
          type="button"
          className="btn-ghost -ml-2 h-10 w-10 rounded-full px-0 lg:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>

        <Link href="/" className="flex items-center gap-2" aria-label="Kurovia home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-900 font-display text-lg font-bold text-accent-400">K</span>
          <span className="font-display text-xl font-bold tracking-tight text-brand-950">
            Kurovia<span className="text-accent-500">.</span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Suspense fallback={<div className="hidden h-11 w-64 rounded-full bg-slate-100 xl:block" />}>
            <SearchForm className="hidden w-64 xl:block" />
          </Suspense>
          <button
            type="button"
            className="btn-ghost h-10 w-10 rounded-full px-0 xl:hidden"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
          >
            <SearchIcon />
          </button>
          <CurrencySelect className="hidden sm:inline-flex" />
          <Link href="/track" className="hidden text-sm font-medium text-slate-700 hover:text-slate-900 md:inline-block md:px-2">
            Track order
          </Link>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex h-10 items-center gap-2 rounded-full bg-brand-900 px-3.5 text-sm font-semibold text-white transition hover:bg-brand-800"
            aria-label="Open cart"
          >
            <CartIcon size={18} />
            <span className="hidden sm:inline">Cart</span>
            {hydrated && itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent-400 px-1 text-[11px] font-bold text-brand-950">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="container-x border-t border-slate-100 py-3 xl:hidden">
          <Suspense fallback={null}>
            <SearchForm autoFocus onSubmitted={() => setSearchOpen(false)} />
          </Suspense>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-900/50" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <span className="font-display text-lg font-bold text-brand-950">Menu</span>
              <button type="button" className="btn-ghost h-9 w-9 rounded-full px-0" onClick={() => setMenuOpen(false)} aria-label="Close">
                <CloseIcon />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="block rounded-xl px-3 py-3 text-base font-medium text-slate-800 hover:bg-slate-100">
                  {link.label}
                </Link>
              ))}
              <div className="my-3 h-px bg-slate-100" />
              {[
                { href: "/track", label: "Track your order" },
                { href: "/about", label: "About Kurovia" },
                { href: "/contact", label: "Contact support" },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="block rounded-xl px-3 py-3 text-base text-slate-700 hover:bg-slate-100">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-slate-100 p-5">
              <p className="label">Currency</p>
              <CurrencySelect />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
