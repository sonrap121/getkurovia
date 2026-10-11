import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { SITE } from "@/lib/utils";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/shop?category=tech", label: "Tech & Gadgets" },
      { href: "/shop?category=fashion", label: "Fashion & Accessories" },
      { href: "/shop?category=home", label: "Home & Living" },
      { href: "/shop?category=beauty", label: "Beauty & Wellness" },
      { href: "/shop?category=sports", label: "Sports & Outdoors" },
      { href: "/shop?category=pantry", label: "American Pantry" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/shipping", label: "International shipping" },
      { href: "/track", label: "Track your order" },
      { href: "/legal/returns", label: "Returns & refunds" },
      { href: "/shipping#duties", label: "Customs, duties & taxes" },
      { href: "/shipping#faq", label: "FAQ" },
      { href: "/contact", label: "Contact support" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Kurovia" },
      { href: "/legal/privacy", label: "Privacy policy" },
      { href: "/legal/terms", label: "Terms of service" },
      { href: "/admin", label: "Store admin" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 bg-brand-950 text-slate-300">
      <div className="container-x py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2" aria-label="Kurovia home">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white font-display text-lg font-bold text-brand-900">K</span>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Kurovia<span className="text-accent-400">.</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              {SITE.tagline} We source authentic US products and ship them from our Delaware fulfillment center to 150+ countries with full tracking.
            </p>
            <div className="mt-6">
              <p className="text-sm font-semibold text-white">Join the Kurovia list</p>
              <p className="mb-3 text-xs text-slate-400">New US drops, member-only deals and 10% off your first order.</p>
              <NewsletterForm dark />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="text-sm font-semibold uppercase tracking-wider text-white">{column.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-slate-400 transition hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">Contact</p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>
                <a href={`mailto:${SITE.supportEmail}`} className="hover:text-white">
                  {SITE.supportEmail}
                </a>
              </li>
              <li>{SITE.phone}</li>
              <li className="leading-relaxed">{SITE.address}</li>
              <li className="text-xs text-slate-500">Support hours: Mon–Fri, 9am–6pm ET · Replies in every language</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              {["VISA", "Mastercard", "AMEX", "PayPal", "Apple Pay", "Google Pay"].map((method) => (
                <span key={method} className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-semibold text-slate-200">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Kurovia LLC · {SITE.domain} · Wilmington, Delaware, USA
          </p>
          <p>Prices shown in your currency are indicative; all orders are charged in USD. 🔒 256-bit SSL secured checkout.</p>
        </div>
      </div>
    </footer>
  );
}
