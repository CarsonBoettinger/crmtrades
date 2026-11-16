"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Phone, X } from "lucide-react";
import { logCall } from "@/app/(crm)/people/[id]/actions";
import {
  CALL_DISPOSITIONS,
  CALL_SENTIMENTS,
  LEAD_STATUSES,
} from "@/lib/crm/constants";
import { formatPhone, fullName } from "@/lib/utils";

export function LogCallModal({
  leadId,
  firstName,
  lastName,
  business,
  phone,
  currentStatus,
  open,
  onClose,
}: {
  leadId: string;
  firstName: string;
  lastName: string;
  business: string;
  phone: string;
  currentStatus: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [disposition, setDisposition] = useState("connected");
  const [sentiment, setSentiment] = useState("neutral");
  const [status, setStatus] = useState(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await logCall(leadId, {
        notes,
        disposition,
        sentiment,
        status,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNotes("");
      onClose();
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-zinc-950/40 p-4 sm:items-center sm:justify-center">
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-zinc-200 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              Opening Call with {firstName}
            </p>
            <a
              href={`tel:${phone}`}
              className="mt-1 inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline"
            >
              <Phone className="h-3.5 w-3.5" />
              {formatPhone(phone)}
            </a>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-zinc-100 px-4 py-3">
          <p className="font-medium text-zinc-900">
            {fullName(firstName, lastName)}
          </p>
          <p className="text-sm text-zinc-500">{business}</p>
          <a
            href={`tel:${phone}`}
            className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Call
          </a>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
          <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
            Log
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Call notes…"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none ring-emerald-600/20 focus:ring-2"
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600">
              Disposition
              <select
                value={disposition}
                onChange={(e) => setDisposition(e.target.value)}
                className="rounded-lg border border-zinc-200 px-2 py-2 text-sm text-zinc-900"
              >
                {CALL_DISPOSITIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600">
              Sentiment
              <select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value)}
                className="rounded-lg border border-zinc-200 px-2 py-2 text-sm text-zinc-900"
              >
                {CALL_SENTIMENTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600">
            Update status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-zinc-200 px-2 py-2 text-sm text-zinc-900"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Log and Complete"}
          </button>
        </form>
      </div>
    </div>
  );
}
