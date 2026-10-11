"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_CURRENCY,
  FALLBACK_RATES,
  formatMoney,
  isCurrencyCode,
  type CurrencyCode,
  type RateTable,
} from "@/lib/currency";

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  brand: string | null;
  image: string;
  priceCents: number;
  quantity: number;
  weightGrams: number;
  stock: number;
}

export type CartProductInput = Omit<CartItem, "quantity">;

interface StoreContextValue {
  hydrated: boolean;
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  totalWeightGrams: number;
  addItem: (product: CartProductInput, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  rates: RateTable;
  ratesSource: "live" | "fallback";
  format: (cents: number) => string;
  formatIn: (cents: number, code: CurrencyCode) => string;
  countryCode: string;
  setCountryCode: (code: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_KEY = "kurovia.cart.v1";
const CURRENCY_KEY = "kurovia.currency";
const COUNTRY_KEY = "kurovia.country";

function readCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as CartItem).productId === "number" &&
        typeof (item as CartItem).quantity === "number",
    );
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [countryCode, setCountryCodeState] = useState("US");
  const [rates, setRates] = useState<RateTable>(FALLBACK_RATES);
  const [ratesSource, setRatesSource] = useState<"live" | "fallback">("fallback");
  const skipPersist = useRef(true);

  useEffect(() => {
    setItems(readCart());
    const storedCurrency = window.localStorage.getItem(CURRENCY_KEY);
    if (storedCurrency && isCurrencyCode(storedCurrency)) setCurrencyState(storedCurrency);
    const storedCountry = window.localStorage.getItem(COUNTRY_KEY);
    if (storedCountry && /^[A-Z]{2}$/.test(storedCountry)) setCountryCodeState(storedCountry);
    setHydrated(true);

    let cancelled = false;
    fetch("/api/rates")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { rates?: RateTable; source?: string } | null) => {
        if (cancelled || !data?.rates) return;
        setRates({ ...FALLBACK_RATES, ...data.rates });
        setRatesSource(data.source === "live" ? "live" : "fallback");
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    window.localStorage.setItem(CURRENCY_KEY, code);
  }, []);

  const setCountryCode = useCallback((code: string) => {
    setCountryCodeState(code);
    window.localStorage.setItem(COUNTRY_KEY, code);
  }, []);

  const addItem = useCallback((product: CartProductInput, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.productId);
      const maxQty = Math.max(1, product.stock);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.productId
            ? { ...item, ...product, quantity: Math.min(maxQty, item.quantity + quantity) }
            : item,
        );
      }
      return [...prev, { ...product, quantity: Math.min(maxQty, quantity) }];
    });
    setCartOpen(true);
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(Math.max(0, quantity), Math.max(1, item.stock)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<StoreContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
    const totalWeightGrams = items.reduce((sum, item) => sum + item.weightGrams * item.quantity, 0);
    return {
      hydrated,
      items,
      itemCount,
      subtotalCents,
      totalWeightGrams,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      cartOpen,
      setCartOpen,
      currency,
      setCurrency,
      rates,
      ratesSource,
      format: (cents: number) => formatMoney(cents, currency, rates),
      formatIn: (cents: number, code: CurrencyCode) => formatMoney(cents, code, rates),
      countryCode,
      setCountryCode,
    };
  }, [
    hydrated,
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    cartOpen,
    currency,
    setCurrency,
    rates,
    ratesSource,
    countryCode,
    setCountryCode,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
