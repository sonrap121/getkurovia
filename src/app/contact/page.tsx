"use client";

import { useState, type FormEvent } from "react";
import { HeadsetIcon, LoaderIcon, MailIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
import { SITE } from "@/lib/utils";

const SUBJECTS = ["Where is my order?", "Customs & duties question", "Return or exchange", "Product availability request", "Wholesale / business inquiry", "Other"];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0], orderNumber: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setStatus("success");
      setFeedback(data.message ?? "Message sent.");
      setForm({ name: "", email: "", subject: SUBJECTS[0], orderNumber: "", message: "" });
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  return (
    <div className="container-x py-12">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Support</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">We&apos;re here to help, in any time zone</h1>
          <p className="mt-4 text-slate-600">Our Delaware-based team answers in English, Türkçe, Deutsch, Español and العربية. Typical response time: under 4 business hours.</p>
          <ul className="mt-8 space-y-5 text-sm">
            <li className="flex gap-3">
              <MailIcon size={20} className="mt-0.5 text-brand-700" />
              <div>
                <p className="font-semibold text-slate-900">Email</p>
                <a href={`mailto:${SITE.supportEmail}`} className="text-slate-600 hover:text-brand-700">
                  {SITE.supportEmail}
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <PhoneIcon size={20} className="mt-0.5 text-brand-700" />
              <div>
                <p className="font-semibold text-slate-900">Phone & WhatsApp</p>
                <p className="text-slate-600">{SITE.phone} · Mon–Fri 9am–6pm ET</p>
              </div>
            </li>
            <li className="flex gap-3">
              <MapPinIcon size={20} className="mt-0.5 text-brand-700" />
              <div>
                <p className="font-semibold text-slate-900">Fulfillment center</p>
                <p className="text-slate-600">{SITE.address}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <HeadsetIcon size={20} className="mt-0.5 text-brand-700" />
              <div>
                <p className="font-semibold text-slate-900">Business & wholesale</p>
                <p className="text-slate-600">Need 50+ units or a product we don&apos;t list? Tell us — we source on request from any US retailer.</p>
              </div>
            </li>
          </ul>
        </div>

        <form onSubmit={submit} className="card p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">
                Name
              </label>
              <input id="name" className="input h-11" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input id="email" type="email" className="input h-11" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="subject">
                Subject
              </label>
              <select id="subject" className="input h-11" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="orderNumber">
                Order number (optional)
              </label>
              <input id="orderNumber" className="input h-11 uppercase" placeholder="KV-…" value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="message">
                Message
              </label>
              <textarea id="message" className="input" rows={6} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
          </div>
          <button type="submit" disabled={status === "loading"} className="btn-primary mt-5 h-12 w-full sm:w-auto sm:px-8">
            {status === "loading" ? <LoaderIcon size={18} /> : "Send message"}
          </button>
          {status === "success" && <p className="mt-3 text-sm text-emerald-700">{feedback}</p>}
          {status === "error" && <p className="mt-3 text-sm text-rose-600">{feedback}</p>}
        </form>
      </div>
    </div>
  );
}
