import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { PersonWorkspace } from "@/components/crm/person-workspace";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const supabase = await createClient();

  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !lead) notFound();

  const [{ data: activities }, reportResult] = await Promise.all([
    supabase
      .from("lead_activities")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
    lead.report_id
      ? supabase
          .from("presence_reports")
          .select(
            "id, business_name, website, phone, rating, review_count, grade, overall_score, status, formatted_address, town, trade, place_id, public_payload",
          )
          .eq("id", lead.report_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
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
        report={reportResult.data ?? null}
      />
    </div>
  );
}
