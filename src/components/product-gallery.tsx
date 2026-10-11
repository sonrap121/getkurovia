"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name, badge }: { images: string[]; name: string; badge?: string | null }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="lg:sticky lg:top-28 lg:self-start">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt={name} className="h-full w-full object-cover" />
        {badge && <span className="badge absolute left-4 top-4 bg-rose-600 text-white shadow">{badge}</span>}
        <span className="badge absolute right-4 top-4 bg-white/90 text-slate-800 backdrop-blur">🇺🇸 Ships from USA</span>
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-3">
          {images.map((src, index) => (
            <button
              key={src + index}
              type="button"
              onClick={() => setActive(index)}
              className={cn("h-20 w-20 overflow-hidden rounded-xl border-2 bg-slate-100 transition", index === active ? "border-brand-900" : "border-transparent hover:border-slate-300")}
              aria-label={`View image ${index + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
