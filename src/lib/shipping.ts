import { getCountry, type ZoneId } from "./countries";

export type ShippingMethod = "standard" | "express";

export interface ZoneRate {
  priceCents: number;
  perExtraKgCents: number;
  minDays: number;
  maxDays: number;
  carrier: string;
}

export interface ShippingZone {
  id: ZoneId;
  name: string;
  summary: string;
  freeThresholdCents: number | null;
  standard: ZoneRate;
  express: ZoneRate;
}

export const SHIPPING_ZONES: Record<ZoneId, ShippingZone> = {
  us: {
    id: "us",
    name: "United States",
    summary: "Domestic shipping from our Delaware fulfillment center.",
    freeThresholdCents: 7500,
    standard: { priceCents: 599, perExtraKgCents: 200, minDays: 3, maxDays: 5, carrier: "USPS / UPS Ground" },
    express: { priceCents: 1499, perExtraKgCents: 400, minDays: 1, maxDays: 2, carrier: "UPS Next Day / 2nd Day" },
  },
  na: {
    id: "na",
    name: "Canada & Mexico",
    summary: "Fast cross-border delivery with full tracking.",
    freeThresholdCents: 15000,
    standard: { priceCents: 1499, perExtraKgCents: 500, minDays: 5, maxDays: 9, carrier: "UPS Standard" },
    express: { priceCents: 2999, perExtraKgCents: 700, minDays: 2, maxDays: 4, carrier: "DHL Express" },
  },
  eu: {
    id: "eu",
    name: "Europe, UK & Türkiye",
    summary: "Tracked delivery to all of Europe, the United Kingdom and Türkiye.",
    freeThresholdCents: 20000,
    standard: { priceCents: 1999, perExtraKgCents: 600, minDays: 7, maxDays: 12, carrier: "USPS Priority International / DHL" },
    express: { priceCents: 3999, perExtraKgCents: 800, minDays: 3, maxDays: 5, carrier: "DHL Express Worldwide" },
  },
  me: {
    id: "me",
    name: "Middle East & Central Asia",
    summary: "Express couriers to the Gulf, Levant and Central Asia.",
    freeThresholdCents: 25000,
    standard: { priceCents: 2499, perExtraKgCents: 700, minDays: 8, maxDays: 14, carrier: "DHL eCommerce" },
    express: { priceCents: 4499, perExtraKgCents: 900, minDays: 3, maxDays: 6, carrier: "DHL Express / FedEx IP" },
  },
  apac: {
    id: "apac",
    name: "Asia Pacific",
    summary: "Reliable delivery across Asia, Australia and the Pacific.",
    freeThresholdCents: 25000,
    standard: { priceCents: 2499, perExtraKgCents: 700, minDays: 8, maxDays: 15, carrier: "USPS Priority International" },
    express: { priceCents: 4999, perExtraKgCents: 900, minDays: 4, maxDays: 7, carrier: "FedEx International Priority" },
  },
  latam: {
    id: "latam",
    name: "Latin America & Caribbean",
    summary: "Tracked shipping to Central & South America and the Caribbean.",
    freeThresholdCents: 30000,
    standard: { priceCents: 2799, perExtraKgCents: 800, minDays: 10, maxDays: 18, carrier: "DHL eCommerce" },
    express: { priceCents: 5499, perExtraKgCents: 1000, minDays: 5, maxDays: 8, carrier: "DHL Express Worldwide" },
  },
  row: {
    id: "row",
    name: "Africa & Rest of World",
    summary: "We reach the places other stores won't ship to.",
    freeThresholdCents: null,
    standard: { priceCents: 3299, perExtraKgCents: 900, minDays: 12, maxDays: 21, carrier: "USPS / DHL eCommerce" },
    express: { priceCents: 5999, perExtraKgCents: 1200, minDays: 6, maxDays: 10, carrier: "DHL Express Worldwide" },
  },
};

export const ZONE_ORDER: ZoneId[] = ["us", "na", "eu", "me", "apac", "latam", "row"];

export interface ShippingOption {
  method: ShippingMethod;
  label: string;
  description: string;
  carrier: string;
  priceCents: number;
  isFree: boolean;
  minDays: number;
  maxDays: number;
}

export interface ShippingQuote {
  zone: ShippingZone;
  countryCode: string;
  countryName: string;
  options: ShippingOption[];
  freeThresholdCents: number | null;
  amountToFreeShippingCents: number | null;
}

export function getZoneForCountry(countryCode: string): ShippingZone {
  const country = getCountry(countryCode);
  return SHIPPING_ZONES[country?.zone ?? "row"];
}

function computeRate(rate: ZoneRate, weightGrams: number): number {
  const extraKg = Math.max(0, Math.ceil((weightGrams - 1000) / 1000));
  return rate.priceCents + extraKg * rate.perExtraKgCents;
}

export function quoteShipping(params: {
  countryCode: string;
  subtotalCents: number;
  weightGrams: number;
}): ShippingQuote {
  const country = getCountry(params.countryCode);
  const zone = SHIPPING_ZONES[country?.zone ?? "row"];
  const weight = Math.max(100, params.weightGrams || 0);

  const standardPrice = computeRate(zone.standard, weight);
  const expressPrice = computeRate(zone.express, weight);
  const qualifiesForFree =
    zone.freeThresholdCents !== null && params.subtotalCents >= zone.freeThresholdCents;

  const options: ShippingOption[] = [
    {
      method: "standard",
      label: "Standard Tracked",
      description: `${zone.standard.minDays}–${zone.standard.maxDays} business days`,
      carrier: zone.standard.carrier,
      priceCents: qualifiesForFree ? 0 : standardPrice,
      isFree: qualifiesForFree,
      minDays: zone.standard.minDays,
      maxDays: zone.standard.maxDays,
    },
    {
      method: "express",
      label: "Express Courier",
      description: `${zone.express.minDays}–${zone.express.maxDays} business days`,
      carrier: zone.express.carrier,
      priceCents: qualifiesForFree ? Math.max(0, expressPrice - standardPrice) : expressPrice,
      isFree: false,
      minDays: zone.express.minDays,
      maxDays: zone.express.maxDays,
    },
  ];

  return {
    zone,
    countryCode: country?.code ?? params.countryCode.toUpperCase(),
    countryName: country?.name ?? "International",
    options,
    freeThresholdCents: zone.freeThresholdCents,
    amountToFreeShippingCents:
      zone.freeThresholdCents === null
        ? null
        : Math.max(0, zone.freeThresholdCents - params.subtotalCents),
  };
}

export function getShippingOption(quote: ShippingQuote, method: string): ShippingOption | undefined {
  return quote.options.find((option) => option.method === method);
}

export const ORDER_STATUSES = ["processing", "packed", "shipped", "in_transit", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  in_transit: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_TIMELINE: OrderStatus[] = ["processing", "packed", "shipped", "in_transit", "delivered"];
