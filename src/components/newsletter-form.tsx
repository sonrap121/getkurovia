"use client";

import { useState, type FormEvent } from "react";
import { LoaderIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function NewsletterForm({ className, dark = false }: { className?: string; dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setStatus("success");
      setMessage(data.message ?? "You're on the list!");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  return (
    <form onSubmit={submit} className={cn("w-full", className)}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          className={cn("input h-12 flex-1 rounded-full px-5", dark && "border-white/15 bg-white/10 text-white placeholder:text-white/50 focus:border-accent-400 focus:ring-accent-400/30")}
          aria-label="Email address"
        />
        <button type="submit" disabled={status === "loading"} className="btn-accent h-12 px-6">
          {status === "loading" ? <LoaderIcon size={18} /> : "Get 10% off"}
        </button>
      </div>
      {status !== "idle" && status !== "loading" && (
        <p className={cn("mt-2 text-sm", status === "success" ? (dark ? "text-emerald-300" : "text-emerald-700") : "text-rose-500")} role="status">
          {message}
        </p>
      )}
    </form>
  );
}
