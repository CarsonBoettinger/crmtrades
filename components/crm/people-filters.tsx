"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { LEAD_STATUSES } from "@/lib/crm/constants";

export function PeopleFilters({
  trades,
  towns,
}: {
  trades: string[];
  towns: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    startTransition(() => {
      router.push(`/people?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateParams({ q });
          }}
          placeholder="Search name, email, business, phone…"
          className="w-full rounded-lg border border-zinc-200 bg-white py-2 pr-3 pl-9 text-sm outline-none ring-emerald-600/20 focus:ring-2"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          value={searchParams.get("status") ?? ""}
          onChange={(e) => updateParams({ status: e.target.value })}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={searchParams.get("trade") ?? ""}
          onChange={(e) => updateParams({ trade: e.target.value })}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">All trades</option>
          {trades.map((trade) => (
            <option key={trade} value={trade}>
              {trade}
            </option>
          ))}
        </select>
        <select
          value={searchParams.get("town") ?? ""}
          onChange={(e) => updateParams({ town: e.target.value })}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">All towns</option>
          {towns.map((town) => (
            <option key={town} value={town}>
              {town}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => updateParams({ q })}
          disabled={isPending}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          Search
        </button>
      </div>
    </div>
  );
}
