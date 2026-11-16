"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  Mail,
  Phone,
  StickyNote,
} from "lucide-react";
import { updateLeadStatus } from "@/app/(crm)/people/[id]/actions";
import { ActivityTimeline } from "@/components/crm/activity-timeline";
import { AddNoteModal } from "@/components/crm/add-note-modal";
import { LogCallModal } from "@/components/crm/log-call-modal";
import {
  PresencePanel,
  type PresencePanelReport,
} from "@/components/crm/presence-panel";
import { StatusBadge } from "@/components/crm/status-badge";
import { LEAD_STATUSES } from "@/lib/crm/constants";
import type { Lead, LeadActivity } from "@/lib/database.types";
import { formatPhone, fullName } from "@/lib/utils";

type Tab = "activity" | "notes" | "calls";

export function PersonWorkspace({
  lead,
  activities,
  report,
}: {
  lead: Lead;
  activities: LeadActivity[];
  report: PresencePanelReport | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("activity");
  const [callOpen, setCallOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const stats = useMemo(() => {
    const calls = activities.filter((a) => a.type === "call").length;
    const notes = activities.filter((a) => a.type === "note").length;
    const connected = activities.filter(
      (a) => a.type === "call" && a.disposition === "connected",
    ).length;
    return { calls, notes, connected };
  }, [activities]);

  function copyPhone() {
    void navigator.clipboard.writeText(lead.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function onStatusChange(status: string) {
    setStatusError(null);
    startTransition(async () => {
      const result = await updateLeadStatus(lead.id, status);
      if (!result.ok) {
        setStatusError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "activity", label: "Activity" },
    { id: "calls", label: "Calls" },
    { id: "notes", label: "Notes" },
  ];

  return (
    <div className="flex min-h-full flex-col lg:h-[calc(100vh-3.5rem)] lg:flex-row lg:overflow-hidden">
      <aside className="w-full shrink-0 border-b border-zinc-200 bg-white lg:w-80 lg:overflow-y-auto lg:border-r lg:border-b-0">
        <div className="space-y-5 p-5">
          <div>
            <p className="text-xs text-zinc-500">
              People / {fullName(lead.first_name, lead.last_name)}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
              {fullName(lead.first_name, lead.last_name)}
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              {lead.trade} · {lead.business}
            </p>
            <p className="text-sm text-zinc-500">{lead.town}</p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <ActionButton
              icon={Phone}
              label="Call"
              onClick={() => setCallOpen(true)}
            />
            <ActionButton
              icon={StickyNote}
              label="Note"
              onClick={() => setNoteOpen(true)}
            />
            <ActionButton
              icon={Mail}
              label="Email"
              href={`mailto:${lead.email}`}
            />
            <ActionButton
              icon={copied ? CheckCircle2 : Copy}
              label={copied ? "Copied" : "Copy"}
              onClick={copyPhone}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center">
            <Stat label="Calls" value={stats.calls} />
            <Stat label="Connected" value={stats.connected} />
            <Stat label="Notes" value={stats.notes} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                Status
              </p>
              <StatusBadge status={lead.status} />
            </div>
            <select
              value={lead.status}
              disabled={isPending}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {statusError ? (
              <p className="text-xs text-red-600">{statusError}</p>
            ) : null}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
              Person details
            </p>
            <DetailRow label="Email" value={lead.email} href={`mailto:${lead.email}`} />
            <DetailRow
              label="Phone"
              value={formatPhone(lead.phone)}
              href={`tel:${lead.phone}`}
            />
            <DetailRow label="Best time" value={lead.best_time} />
            <DetailRow label="Source" value={lead.source ?? "—"} />
            <DetailRow label="Channel" value={lead.channel ?? "—"} />
            <DetailRow label="Direction" value={lead.direction} />
            {lead.tags?.length ? (
              <div>
                <p className="text-xs text-zinc-500">Tags</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {lead.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {lead.comments ? (
              <div>
                <p className="text-xs text-zinc-500">Comments</p>
                <p className="mt-1 text-sm text-zinc-700">{lead.comments}</p>
              </div>
            ) : null}
          </div>

        </div>
      </aside>

      <section className="min-w-0 flex-1 overflow-y-auto p-5">
        <div className="mb-4 flex gap-1 border-b border-zinc-200">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={
                tab === t.id
                  ? "border-b-2 border-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-800"
                  : "px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-800"
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <ActivityTimeline
          leadId={lead.id}
          createdAt={lead.created_at}
          activities={activities}
          filter={tab === "activity" ? "all" : tab === "calls" ? "call" : "note"}
        />
      </section>

      <PresencePanel report={report} />

      <LogCallModal
        leadId={lead.id}
        firstName={lead.first_name}
        lastName={lead.last_name}
        business={lead.business}
        phone={lead.phone}
        currentStatus={lead.status}
        open={callOpen}
        onClose={() => setCallOpen(false)}
      />
      <AddNoteModal
        leadId={lead.id}
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
      />
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  href?: string;
}) {
  const className =
    "flex flex-col items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2 py-2.5 text-xs font-medium text-zinc-700 transition hover:border-emerald-300 hover:bg-emerald-50";

  if (href) {
    return (
      <a href={href} className={className}>
        <Icon className="h-4 w-4 text-emerald-700" />
        {label}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <Icon className="h-4 w-4 text-emerald-700" />
      {label}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-lg font-semibold text-zinc-900">{value}</p>
      <p className="text-[11px] text-zinc-500">{label}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      {href ? (
        <a href={href} className="text-sm text-emerald-800 hover:underline">
          {value}
        </a>
      ) : (
        <p className="text-sm text-zinc-800 capitalize">{value}</p>
      )}
    </div>
  );
}
