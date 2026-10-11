"use client";

import { ChevronDownIcon } from "@/components/icons";
import { COUNTRIES_SORTED, POPULAR_COUNTRY_CODES, getCountry } from "@/lib/countries";
import { cn, flagEmoji } from "@/lib/utils";

interface CountrySelectProps {
  value: string;
  onChange: (code: string) => void;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

export function CountrySelect({ value, onChange, className, id, name, required }: CountrySelectProps) {
  const popular = POPULAR_COUNTRY_CODES.map((code) => getCountry(code)).filter((c): c is NonNullable<typeof c> => Boolean(c));
  return (
    <div className={cn("relative", className)}>
      <select
        id={id}
        name={name}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input h-11 cursor-pointer appearance-none pr-10"
      >
        <optgroup label="Popular destinations">
          {popular.map((country) => (
            <option key={`p-${country.code}`} value={country.code}>
              {flagEmoji(country.code)} {country.name}
            </option>
          ))}
        </optgroup>
        <optgroup label="All countries (A–Z)">
          {COUNTRIES_SORTED.map((country) => (
            <option key={country.code} value={country.code}>
              {flagEmoji(country.code)} {country.name}
            </option>
          ))}
        </optgroup>
      </select>
      <ChevronDownIcon size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
    </div>
  );
}
