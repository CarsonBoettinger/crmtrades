import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Lead } from "@/lib/database.types";
import type { PresencePanelReport } from "@/components/crm/presence-panel";

const REPORT_SELECT =
  "id, business_name, website, phone, rating, review_count, grade, overall_score, status, formatted_address, town, trade, place_id, public_payload";

type Client = SupabaseClient<Database>;

export async function loadPresenceReportForLead(
  supabase: Client,
  lead: Lead,
): Promise<PresencePanelReport | null> {
  // 1) Direct report link on the lead
  if (lead.report_id) {
    const { data, error } = await supabase
      .from("presence_reports")
      .select(REPORT_SELECT)
      .eq("id", lead.report_id)
      .maybeSingle();

    if (!error && data) return data;
  }

  // 2) Report that points back at this lead
  {
    const { data } = await supabase
      .from("presence_reports")
      .select(REPORT_SELECT)
      .eq("lead_id", lead.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) return data;
  }

  // 3) Same Google place_id (latest unlocked/ready report)
  if (lead.place_id) {
    const { data } = await supabase
      .from("presence_reports")
      .select(REPORT_SELECT)
      .eq("place_id", lead.place_id)
      .in("status", ["unlocked", "ready"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) return data;
  }

  // 4) Fuzzy match on business name for free-demo / unlinked leads
  const business = lead.business?.trim();
  if (business) {
    const { data } = await supabase
      .from("presence_reports")
      .select(REPORT_SELECT)
      .ilike("business_name", `%${business}%`)
      .in("status", ["unlocked", "ready"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) return data;
  }

  return null;
}
