import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE } from "@/lib/utils";

interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

const PAGES: Record<string, { title: string; intro: string; updated: string; sections: LegalSection[] }> = {
  returns: {
    title: "Returns & Refunds",
    intro: "We want you to love what you ordered. If something isn't right, here's how returns work for international customers.",
    updated: "January 2026",
    sections: [
      {
        heading: "30-day return window",
        paragraphs: ["You may return most unused items in their original packaging within 30 days of delivery for a full refund of the product price. Outbound shipping fees and any import duties paid in your country are non-refundable, unless the return is due to our error."],
      },
      {
        heading: "Damaged, defective or wrong items",
        paragraphs: ["Contact us within 7 days of delivery with photos. We will send a replacement at no cost or issue a full refund including shipping. You will not need to send the item back in most cases."],
      },
      {
        heading: "How to start a return",
        bullets: ["Email support with your order number and the item(s) you'd like to return.", "We issue a return authorization and a discounted international return label (DHL/UPS) where available.", "Refunds are processed within 5 business days of the item reaching our Delaware facility, to the original payment method."],
      },
      {
        heading: "Non-returnable items",
        bullets: ["Opened cosmetics, skincare and fragrance (for hygiene reasons).", "Food and pantry items.", "Items marked final sale."],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro: "Kurovia LLC (\"Kurovia\", \"we\") respects your privacy. This policy explains what we collect and how we use it.",
    updated: "January 2026",
    sections: [
      {
        heading: "Information we collect",
        bullets: ["Contact and shipping details you provide at checkout (name, address, email, phone).", "Order history and customer-service correspondence.", "Technical data such as IP address, browser and device type, used for security and analytics.", "Payment details are processed by our PCI-DSS compliant payment partner; Kurovia never stores full card numbers."],
      },
      {
        heading: "How we use it",
        bullets: ["To fulfil and ship your order, including sharing your name, address and phone with carriers and customs authorities as legally required.", "To send order and shipping notifications.", "To send marketing emails only if you opted in — you can unsubscribe at any time.", "To prevent fraud and comply with US export regulations."],
      },
      {
        heading: "International transfers & your rights",
        paragraphs: ["Data is stored on servers in the United States. If you are located in the EU/EEA, UK, Türkiye (KVKK) or another jurisdiction with data-protection laws, you have the right to access, correct, export or delete your personal data. Email us and we will respond within 30 days."],
      },
      {
        heading: "Cookies",
        paragraphs: ["We use strictly necessary cookies and local storage to keep your cart and currency preference. Analytics cookies are only set with your consent."],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    intro: "These terms govern purchases made on GetKurovia.com. By placing an order you agree to them.",
    updated: "January 2026",
    sections: [
      {
        heading: "Orders & pricing",
        paragraphs: ["All prices are listed and charged in US dollars. Converted prices are indicative and depend on your bank's exchange rate. We reserve the right to cancel orders affected by obvious pricing errors or suspected fraud, with a full refund."],
      },
      {
        heading: "Shipping & risk",
        paragraphs: ["Kurovia acts as the exporter of record. Title and risk of loss pass to you on delivery; all shipments are insured against loss and damage in transit. Delivery estimates are not guarantees and exclude customs processing time."],
      },
      {
        heading: "Import duties & taxes",
        paragraphs: ["You are the importer of record and responsible for any import VAT, duties or fees levied by your country. If a parcel is refused or abandoned because duties were not paid, return shipping and carrier fees will be deducted from any refund."],
      },
      {
        heading: "Warranty",
        paragraphs: ["Products carry the manufacturer's warranty. Where a brand does not honor warranties outside the US, Kurovia will facilitate the claim on your behalf."],
      },
      {
        heading: "Governing law",
        paragraphs: ["These terms are governed by the laws of the State of Delaware, USA, without prejudice to mandatory consumer-protection rights in your country of residence."],
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) return { title: "Not found" };
  return { title: page.title, description: page.intro };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();

  return (
    <div className="container-x max-w-3xl py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Legal</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">{page.title}</h1>
      <p className="mt-3 text-slate-600">{page.intro}</p>
      <p className="mt-1 text-xs text-slate-400">Last updated: {page.updated}</p>
      <div className="prose-kv mt-8">
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {section.bullets && (
              <ul>
                {section.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
        <h2>Contact</h2>
        <p>
          Kurovia LLC · {SITE.address} · {SITE.supportEmail}
        </p>
      </div>
    </div>
  );
}
