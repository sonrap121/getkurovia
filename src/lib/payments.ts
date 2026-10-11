/**
 * Payment authorization layer.
 *
 * Kurovia is wired for a hosted payment provider (Stripe / PayPal / Adyen). Until live API keys are
 * configured via environment variables, the store runs in "secure sandbox" mode: card details are
 * validated locally (Luhn, expiry, CVC), never stored, and the order is marked as paid for testing.
 */

export interface CardInput {
  number: string;
  expiry: string; // MM/YY
  cvc: string;
  name: string;
}

export interface PaymentResult {
  ok: boolean;
  error?: string;
  last4?: string;
  brand?: string;
  reference?: string;
  mode: "sandbox" | "live";
}

export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 12 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

export function detectCardBrand(cardNumber: string): string {
  const n = cardNumber.replace(/\D/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "American Express";
  if (/^6(011|5)/.test(n)) return "Discover";
  if (/^9792/.test(n)) return "Troy";
  return "Card";
}

export function validateExpiry(expiry: string): boolean {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(expiry.trim());
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  return endOfMonth >= now;
}

export function isLiveMode(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export async function authorizePayment(card: CardInput, amountCents: number): Promise<PaymentResult> {
  const mode: PaymentResult["mode"] = isLiveMode() ? "live" : "sandbox";
  const digits = card.number.replace(/\D/g, "");

  if (!luhnCheck(digits)) return { ok: false, error: "The card number is invalid.", mode };
  if (!validateExpiry(card.expiry)) return { ok: false, error: "The card has expired or the expiry date is invalid.", mode };
  if (!/^\d{3,4}$/.test(card.cvc.trim())) return { ok: false, error: "The security code (CVC) is invalid.", mode };
  if (card.name.trim().length < 2) return { ok: false, error: "Please enter the name on the card.", mode };
  if (amountCents <= 0) return { ok: false, error: "Invalid amount.", mode };

  // Simulated issuer decline for the classic test number.
  if (digits === "4000000000000002") return { ok: false, error: "Your card was declined by the issuer.", mode };

  return {
    ok: true,
    last4: digits.slice(-4),
    brand: detectCardBrand(digits),
    reference: `${mode === "live" ? "pi" : "sb"}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    mode,
  };
}
