import { TEAM_DISPLAY_NAMES } from "@/lib/crm/team";

const KNOWN_NAMES = new Set(Object.values(TEAM_DISPLAY_NAMES));

export function resolveActivityActor(opts: {
  actorName?: string | null;
  outcomeSummary?: string | null;
  userId?: string | null;
  actorByUserId?: Record<string, string>;
}) {
  if (opts.actorName?.trim()) return opts.actorName.trim();

  if (opts.userId && opts.actorByUserId?.[opts.userId]) {
    return opts.actorByUserId[opts.userId];
  }

  const summary = opts.outcomeSummary?.trim();
  if (!summary) return null;

  const sep = " · ";
  const idx = summary.indexOf(sep);
  if (idx === -1) {
    return KNOWN_NAMES.has(summary) ? summary : null;
  }

  const maybeName = summary.slice(0, idx).trim();
  if (KNOWN_NAMES.has(maybeName)) return maybeName;

  return null;
}

export function resolveActivityDetail(opts: {
  outcomeSummary?: string | null;
  actorName?: string | null;
}) {
  const summary = opts.outcomeSummary?.trim();
  if (!summary) return null;

  const actor = resolveActivityActor({
    actorName: opts.actorName,
    outcomeSummary: summary,
  });

  if (!actor) return summary;

  const prefix = `${actor} · `;
  if (summary.startsWith(prefix)) {
    const rest = summary.slice(prefix.length).trim();
    if (!rest || rest === "Note added" || rest === "Note updated") return null;
    return rest;
  }

  if (summary === actor) return null;
  return summary;
}
