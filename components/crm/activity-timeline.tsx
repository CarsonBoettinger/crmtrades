"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FileText, Pencil, Phone, RefreshCw, UserPlus, X } from "lucide-react";
import { updateNote } from "@/app/(crm)/people/[id]/actions";
import { RelativeTime } from "@/components/crm/relative-time";
import {
  resolveActivityActor,
  resolveActivityDetail,
} from "@/lib/crm/activity-display";
import type { LeadActivity } from "@/lib/database.types";

type TimelineItem =
  | { kind: "created"; created_at: string }
  | ({ kind: "activity" } & LeadActivity);

function iconFor(item: TimelineItem) {
  if (item.kind === "created") return UserPlus;
  if (item.type === "call") return Phone;
  if (item.type === "status_change") return RefreshCw;
  return FileText;
}

export function ActivityTimeline({
  leadId,
  createdAt,
  activities,
  filter,
  actorByUserId = {},
}: {
  leadId: string;
  createdAt: string;
  activities: LeadActivity[];
  filter?: "all" | "call" | "note";
  actorByUserId?: Record<string, string>;
}) {
  const filtered =
    !filter || filter === "all"
      ? activities
      : activities.filter((a) => a.type === filter);

  const items: TimelineItem[] = [
    ...filtered.map((a): TimelineItem => ({ kind: "activity", ...a })),
    { kind: "created", created_at: createdAt } satisfies TimelineItem,
  ].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  if (items.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-zinc-500">
        No activity yet.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {items.map((item) => {
        const Icon = iconFor(item);
        const key =
          item.kind === "created" ? `created-${item.created_at}` : item.id;

        const actor =
          item.kind === "activity"
            ? resolveActivityActor({
                actorName: item.actor_name,
                outcomeSummary: item.outcome_summary,
                userId: item.user_id,
                actorByUserId,
              })
            : null;

        const detail =
          item.kind === "activity"
            ? resolveActivityDetail({
                outcomeSummary: item.outcome_summary,
                actorName: item.actor_name,
              })
            : null;

        return (
          <li key={key} className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {item.kind === "created"
                      ? "Lead created"
                      : item.type === "call"
                        ? "Call logged"
                        : item.type === "status_change"
                          ? "Status updated"
                          : "Note"}
                  </p>
                  {actor ? (
                    <p className="text-xs font-medium text-zinc-500">
                      by {actor}
                    </p>
                  ) : null}
                </div>
                <RelativeTime
                  value={item.created_at}
                  className="text-xs text-zinc-500"
                />
              </div>
              {item.kind === "activity" &&
              item.type !== "note" &&
              detail ? (
                <p className="mt-1 text-xs font-medium text-emerald-800 capitalize">
                  {detail}
                </p>
              ) : null}
              {item.kind === "activity" && item.type === "note" ? (
                <EditableNote
                  leadId={leadId}
                  activityId={item.id}
                  notes={item.notes ?? ""}
                />
              ) : null}
              {item.kind === "activity" &&
              item.type !== "note" &&
              item.notes ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">
                  {item.notes}
                </p>
              ) : null}
              {item.kind === "created" ? (
                <p className="mt-1 text-sm text-zinc-600">
                  Inbound lead captured in Foreman.
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function EditableNote({
  leadId,
  activityId,
  notes,
}: {
  leadId: string;
  activityId: string;
  notes: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(notes);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateNote(leadId, activityId, draft);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  if (!editing) {
    return (
      <div className="mt-2">
        <p className="whitespace-pre-wrap text-sm text-zinc-700">
          {notes || "Empty note"}
        </p>
        <button
          type="button"
          onClick={() => {
            setDraft(notes);
            setEditing(true);
          }}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-800 hover:underline"
        >
          <Pencil className="h-3 w-3" />
          Edit note
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={4}
        className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none ring-emerald-600/20 focus:ring-2"
      />
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setDraft(notes);
            setError(null);
          }}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <X className="h-3 w-3" />
          Cancel
        </button>
      </div>
    </div>
  );
}
