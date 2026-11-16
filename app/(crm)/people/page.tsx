import { Suspense } from "react";
import { PeopleFilters } from "@/components/crm/people-filters";
import { PeopleTable, type LeadListItem } from "@/components/crm/people-table";
import { createClient } from "@/lib/supabase/server";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    trade?: string;
    town?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (params.status) query = query.eq("status", params.status);
  if (params.trade) query = query.eq("trade", params.trade);
  if (params.town) query = query.eq("town", params.town);

  const { data: leads, error } = await query;
  if (error) {
    return (
      <div className="p-6">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load leads: {error.message}
        </p>
      </div>
    );
  }

  const q = params.q?.trim().toLowerCase();
  let filtered = (leads ?? []) as LeadListItem[];
  if (q) {
    filtered = filtered.filter((lead) => {
      const haystack = [
        lead.first_name,
        lead.last_name,
        lead.email,
        lead.business,
        lead.phone,
        lead.town,
        lead.trade,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  const leadIds = filtered.map((l) => l.id);
  const lastActivityMap = new Map<string, string>();
  if (leadIds.length > 0) {
    const { data: activities } = await supabase
      .from("lead_activities")
      .select("lead_id, created_at")
      .in("lead_id", leadIds)
      .order("created_at", { ascending: false });

    for (const activity of activities ?? []) {
      if (!lastActivityMap.has(activity.lead_id)) {
        lastActivityMap.set(activity.lead_id, activity.created_at);
      }
    }
  }

  const rows: LeadListItem[] = filtered.map((lead) => ({
    ...lead,
    last_activity_at: lastActivityMap.get(lead.id) ?? null,
  }));

  const trades = Array.from(new Set((leads ?? []).map((l) => l.trade))).sort();
  const towns = Array.from(new Set((leads ?? []).map((l) => l.town))).sort();

  return (
    <div className="space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          People
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {rows.length} lead{rows.length === 1 ? "" : "s"} from Foreman
        </p>
      </div>

      <Suspense fallback={null}>
        <PeopleFilters trades={trades} towns={towns} />
      </Suspense>

      <PeopleTable leads={rows} />
    </div>
  );
}
