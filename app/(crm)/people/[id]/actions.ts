"use server";

import { revalidatePath } from "next/cache";
import type {
  CallDisposition,
  CallSentiment,
  LeadStatus,
} from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

const VALID_STATUSES = new Set(["new", "contacted", "booked", "closed"]);
const VALID_DISPOSITIONS = new Set([
  "connected",
  "not_connected",
  "left_voicemail",
  "wrong_number",
  "callback_requested",
  "booked",
  "not_interested",
]);
const VALID_SENTIMENTS = new Set(["positive", "neutral", "negative"]);

export async function logCall(
  leadId: string,
  input: {
    notes: string;
    disposition: string;
    sentiment: string;
    status?: string;
  },
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Not authenticated." };

  if (!VALID_DISPOSITIONS.has(input.disposition)) {
    return { ok: false, error: "Invalid disposition." };
  }
  if (!VALID_SENTIMENTS.has(input.sentiment)) {
    return { ok: false, error: "Invalid sentiment." };
  }
  if (input.status && !VALID_STATUSES.has(input.status)) {
    return { ok: false, error: "Invalid status." };
  }

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, status")
    .eq("id", leadId)
    .single();

  if (leadError || !lead) {
    return { ok: false, error: leadError?.message ?? "Lead not found." };
  }

  const disposition = input.disposition as CallDisposition;
  const sentiment = input.sentiment as CallSentiment;
  const nextStatus = (input.status as LeadStatus | undefined) ?? undefined;

  const { error: activityError } = await supabase.from("lead_activities").insert({
    lead_id: leadId,
    user_id: user.id,
    type: "call",
    disposition,
    sentiment,
    notes: input.notes.trim() || null,
    outcome_summary: `${disposition.replaceAll("_", " ")} · ${sentiment}`,
  });

  if (activityError) {
    return { ok: false, error: activityError.message };
  }

  if (nextStatus && nextStatus !== lead.status) {
    const { error: statusError } = await supabase
      .from("leads")
      .update({ status: nextStatus })
      .eq("id", leadId);

    if (statusError) {
      return { ok: false, error: statusError.message };
    }

    await supabase.from("lead_activities").insert({
      lead_id: leadId,
      user_id: user.id,
      type: "status_change",
      notes: `Status changed from ${lead.status} to ${nextStatus}`,
      outcome_summary: `${lead.status} → ${nextStatus}`,
    });
  } else if (lead.status === "new") {
    await supabase.from("leads").update({ status: "contacted" }).eq("id", leadId);
    await supabase.from("lead_activities").insert({
      lead_id: leadId,
      user_id: user.id,
      type: "status_change",
      notes: "Status changed from new to contacted",
      outcome_summary: "new → contacted",
    });
  }

  revalidatePath(`/people/${leadId}`);
  revalidatePath("/people");
  return { ok: true };
}

export async function addNote(
  leadId: string,
  notes: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Not authenticated." };
  if (!notes.trim()) return { ok: false, error: "Note cannot be empty." };

  const { error } = await supabase.from("lead_activities").insert({
    lead_id: leadId,
    user_id: user.id,
    type: "note",
    notes: notes.trim(),
    outcome_summary: "Note added",
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/people/${leadId}`);
  revalidatePath("/people");
  return { ok: true };
}

export async function updateNote(
  leadId: string,
  activityId: string,
  notes: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Not authenticated." };
  if (!notes.trim()) return { ok: false, error: "Note cannot be empty." };

  const { data: activity, error: lookupError } = await supabase
    .from("lead_activities")
    .select("id, type, lead_id")
    .eq("id", activityId)
    .eq("lead_id", leadId)
    .maybeSingle();

  if (lookupError || !activity) {
    return { ok: false, error: lookupError?.message ?? "Note not found." };
  }
  if (activity.type !== "note") {
    return { ok: false, error: "Only notes can be edited." };
  }

  const { error } = await supabase
    .from("lead_activities")
    .update({
      notes: notes.trim(),
      outcome_summary: "Note updated",
    })
    .eq("id", activityId)
    .eq("lead_id", leadId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/people/${leadId}`);
  revalidatePath("/people");
  return { ok: true };
}

export async function updateLeadStatus(
  leadId: string,
  status: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Not authenticated." };
  if (!VALID_STATUSES.has(status)) {
    return { ok: false, error: "Invalid status." };
  }

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("status")
    .eq("id", leadId)
    .single();

  if (leadError || !lead) {
    return { ok: false, error: leadError?.message ?? "Lead not found." };
  }

  if (lead.status === status) return { ok: true };

  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", leadId);

  if (error) return { ok: false, error: error.message };

  await supabase.from("lead_activities").insert({
    lead_id: leadId,
    user_id: user.id,
    type: "status_change",
    notes: `Status changed from ${lead.status} to ${status}`,
    outcome_summary: `${lead.status} → ${status}`,
  });

  revalidatePath(`/people/${leadId}`);
  revalidatePath("/people");
  return { ok: true };
}
