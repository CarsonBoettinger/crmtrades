import Link from "next/link";
import { notFound } from "next/navigation";
import { PersonWorkspace } from "@/components/crm/person-workspace";
import { loadPresenceReportForLead } from "@/lib/crm/load-presence-report";
import { createClient } from "@/lib/supabase/server";

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !lead) notFound();

  const [{ data: activities }, report] = await Promise.all([
    supabase
      .from("lead_activities")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
    loadPresenceReportForLead(supabase, lead),
  ]);

  return (
    <div className="min-h-full">
      <div className="border-b border-zinc-200 bg-white px-5 py-2 text-sm lg:hidden">
        <Link href="/people" className="text-emerald-800 hover:underline">
          ← Back to people
        </Link>
      </div>
      <PersonWorkspace
        lead={lead}
        activities={activities ?? []}
        report={report}
      />
    </div>
  );
}
