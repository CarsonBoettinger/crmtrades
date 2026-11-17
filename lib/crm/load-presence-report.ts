import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Lead } from "@/lib/database.types";
import type { PresencePanelReport } from "@/components/crm/presence-panel";

const REPORT_SELECT =
  "id, business_name, website, phone, rating, review_count, grade, overall_score, status, formatted_address, town, trade, place_id, public_payload";

type Client = SupabaseClient<Database>;

/**
 * Resolve the presence report for a specific lead — never by place alone.
 * Activities and reports belong to the lead row, not the Google place.
 */
export async function loadPresenceReportForLead(
  supabase: Client,
  lead: Lead,
): Promise<PresencePanelReport | null> {
  // 1) Explicit report on this lead
  if (lead.report_id) {
    const { data, error } = await supabase
      .from("presence_reports")
      .select(REPORT_SELECT)
      .eq("id", lead.report_id)
      .maybeSingle();

    if (!error && data) return data;
  }

  // 2) Report that points at this lead (and matches place when lead has one)
  {
    let query = supabase
      .from("presence_reports")
      .select(REPORT_SELECT)
      .eq("lead_id", lead.id)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (lead.place_id) {
      query = query.eq("place_id", lead.place_id);
    }

    const { data } = await query.maybeSingle();
    if (data) return data;
  }

  return null;
}
