"use server";

import { revalidatePath } from "next/cache";
import { actorNameFromUser } from "@/lib/crm/actor";
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

async function requireActor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, actorName: null as string | null };
  return { supabase, user, actorName: actorNameFromUser(user) };
}

export async function logCall(
  leadId: string,
  input: {
    notes: string;
    disposition: string;
    sentiment: string;
    status?: string;
  },
): Promise<ActionResult> {
  const { supabase, user, actorName } = await requireActor();
  if (!user || !actorName) return { ok: false, error: "Not authenticated." };

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
    actor_name: actorName,
    type: "call",
    disposition,
    sentiment,
    notes: input.notes.trim() || null,
    outcome_summary: `${disposition.replaceAll("_", " ")} · ${sentiment}`,
  });

  if (activityError) {
    // Column may not exist yet — retry without actor_name
    if (activityError.message.toLowerCase().includes("actor_name")) {
      const { error: retryError } = await supabase.from("lead_activities").insert({
        lead_id: leadId,
        user_id: user.id,
        type: "call",
        disposition,
        sentiment,
        notes: input.notes.trim() || null,
        outcome_summary: `${actorName} · ${disposition.replaceAll("_", " ")} · ${sentiment}`,
      });
      if (retryError) return { ok: false, error: retryError.message };
    } else {
      return { ok: false, error: activityError.message };
    }
  }

  if (nextStatus && nextStatus !== lead.status) {
    const { error: statusError } = await supabase
      .from("leads")
      .update({ status: nextStatus })
      .eq("id", leadId);

    if (statusError) {
      return { ok: false, error: statusError.message };
    }

    await insertStatusChange(
      supabase,
      leadId,
      user.id,
      actorName,
      lead.status,
      nextStatus,
    );
  } else if (lead.status === "new") {
    await supabase.from("leads").update({ status: "contacted" }).eq("id", leadId);
    await insertStatusChange(
      supabase,
      leadId,
      user.id,
      actorName,
      "new",
      "contacted",
    );
  }

  revalidatePath(`/people/${leadId}`);
  revalidatePath("/people");
  return { ok: true };
}

async function insertStatusChange(
  supabase: Awaited<ReturnType<typeof createClient>>,
  leadId: string,
  userId: string,
  actorName: string,
  from: string,
  to: string,
) {
  const payload = {
    lead_id: leadId,
    user_id: userId,
    actor_name: actorName,
    type: "status_change" as const,
    notes: `Status changed from ${from} to ${to}`,
    outcome_summary: `${from} → ${to}`,
  };

  const { error } = await supabase.from("lead_activities").insert(payload);
  if (error?.message.toLowerCase().includes("actor_name")) {
    await supabase.from("lead_activities").insert({
      lead_id: leadId,
      user_id: userId,
      type: "status_change",
      notes: `Status changed from ${from} to ${to}`,
      outcome_summary: `${actorName} · ${from} → ${to}`,
    });
  }
}

export async function addNote(
  leadId: string,
  notes: string,
): Promise<ActionResult> {
  const { supabase, user, actorName } = await requireActor();
  if (!user || !actorName) return { ok: false, error: "Not authenticated." };
  if (!notes.trim()) return { ok: false, error: "Note cannot be empty." };

  const { error } = await supabase.from("lead_activities").insert({
    lead_id: leadId,
    user_id: user.id,
    actor_name: actorName,
    type: "note",
    notes: notes.trim(),
    outcome_summary: "Note added",
  });

  if (error) {
    if (error.message.toLowerCase().includes("actor_name")) {
      const { error: retryError } = await supabase.from("lead_activities").insert({
        lead_id: leadId,
        user_id: user.id,
        type: "note",
        notes: notes.trim(),
        outcome_summary: `${actorName} · Note added`,
      });
      if (retryError) return { ok: false, error: retryError.message };
    } else {
      return { ok: false, error: error.message };
    }
  }

  revalidatePath(`/people/${leadId}`);
  revalidatePath("/people");
  return { ok: true };
}

export async function updateNote(
  leadId: string,
  activityId: string,
  notes: string,
): Promise<ActionResult> {
  const { supabase, user, actorName } = await requireActor();
  if (!user || !actorName) return { ok: false, error: "Not authenticated." };
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
      actor_name: actorName,
    })
    .eq("id", activityId)
    .eq("lead_id", leadId);

  if (error) {
    if (error.message.toLowerCase().includes("actor_name")) {
      const { error: retryError } = await supabase
        .from("lead_activities")
        .update({
          notes: notes.trim(),
          outcome_summary: `${actorName} · Note updated`,
        })
        .eq("id", activityId)
        .eq("lead_id", leadId);
      if (retryError) return { ok: false, error: retryError.message };
    } else {
      return { ok: false, error: error.message };
    }
  }

  revalidatePath(`/people/${leadId}`);
  revalidatePath("/people");
  return { ok: true };
}

export async function updateLeadStatus(
  leadId: string,
  status: string,
): Promise<ActionResult> {
  const { supabase, user, actorName } = await requireActor();
  if (!user || !actorName) return { ok: false, error: "Not authenticated." };
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

  await insertStatusChange(
    supabase,
    leadId,
    user.id,
    actorName,
    lead.status,
    status,
  );

  revalidatePath(`/people/${leadId}`);
  revalidatePath("/people");
  return { ok: true };
}
