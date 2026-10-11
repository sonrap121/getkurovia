"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDownIcon } from "@/components/icons";
import { SORT_OPTIONS } from "@/lib/catalog";

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "featured";

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") params.delete("sort");
    else params.set("sort", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <label className="relative inline-flex items-center text-sm">
      <span className="mr-2 hidden text-slate-500 sm:inline">Sort by</span>
      <select
        value={current}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 cursor-pointer appearance-none rounded-full border border-slate-300 bg-white pl-4 pr-9 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        aria-label="Sort products"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon size={14} className="pointer-events-none absolute right-3 text-slate-500" />
    </label>
  );
}
