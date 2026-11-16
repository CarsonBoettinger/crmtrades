import { STATUS_STYLES } from "@/lib/crm/constants";
import type { LeadStatus } from "@/lib/database.types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const key = status as LeadStatus;
  const styles = STATUS_STYLES[key] ?? "bg-zinc-100 text-zinc-700";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        styles,
      )}
    >
      {status}
    </span>
  );
}
