import Link from "next/link";
import { RelativeTime } from "@/components/crm/relative-time";
import { StatusBadge } from "@/components/crm/status-badge";
import type { Lead } from "@/lib/database.types";
import { formatPhone, fullName } from "@/lib/utils";

export type LeadListItem = Lead & {
  last_activity_at: string | null;
};

export function PeopleTable({ leads }: { leads: LeadListItem[] }) {
  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
        <p className="text-sm font-medium text-zinc-900">No leads found</p>
        <p className="mt-1 text-sm text-zinc-500">
          Try adjusting filters or wait for new inbound leads.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          <tr>
            <th className="px-4 py-3">Person</th>
            <th className="px-4 py-3">Business</th>
            <th className="px-4 py-3">Trade</th>
            <th className="px-4 py-3">Town</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Channel</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Last activity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-emerald-50/40">
              <td className="px-4 py-3">
                <Link
                  href={`/people/${lead.id}`}
                  className="font-medium text-zinc-900 hover:text-emerald-800"
                >
                  {fullName(lead.first_name, lead.last_name)}
                </Link>
                <p className="text-xs text-zinc-500">{formatPhone(lead.phone)}</p>
              </td>
              <td className="px-4 py-3 text-zinc-700">{lead.business}</td>
              <td className="px-4 py-3 text-zinc-700">{lead.trade}</td>
              <td className="px-4 py-3 text-zinc-700">{lead.town}</td>
              <td className="px-4 py-3">
                <StatusBadge status={lead.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {lead.channel ? (
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">
                      {lead.channel}
                    </span>
                  ) : null}
                  {lead.tags?.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-zinc-500">
                <RelativeTime value={lead.created_at} />
              </td>
              <td className="px-4 py-3 text-zinc-500">
                {lead.last_activity_at ? (
                  <RelativeTime value={lead.last_activity_at} />
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
