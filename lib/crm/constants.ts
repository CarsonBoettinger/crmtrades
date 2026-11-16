import type { CallDisposition, CallSentiment, LeadStatus } from "@/lib/database.types";

export const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "booked", label: "Booked" },
  { value: "closed", label: "Closed" },
];

export const CALL_DISPOSITIONS: { value: CallDisposition; label: string }[] = [
  { value: "connected", label: "Connected" },
  { value: "not_connected", label: "Not Connected" },
  { value: "left_voicemail", label: "Left Voicemail" },
  { value: "wrong_number", label: "Wrong Number" },
  { value: "callback_requested", label: "Callback Requested" },
  { value: "booked", label: "Booked" },
  { value: "not_interested", label: "Not Interested" },
];

export const CALL_SENTIMENTS: { value: CallSentiment; label: string }[] = [
  { value: "positive", label: "Positive" },
  { value: "neutral", label: "Neutral" },
  { value: "negative", label: "Negative" },
];

export const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-sky-100 text-sky-800",
  contacted: "bg-amber-100 text-amber-900",
  booked: "bg-emerald-100 text-emerald-800",
  closed: "bg-zinc-200 text-zinc-700",
};
