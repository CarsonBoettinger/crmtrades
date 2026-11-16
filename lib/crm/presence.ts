import type { Json } from "@/lib/database.types";

export type PresenceWebCheck = {
  id: string;
  pass: boolean | null;
  label: string;
  detail: string;
};

export type PresenceReview = {
  text?: string;
  author?: string;
  rating?: number;
  relativeTime?: string;
};

export type PresenceCompetitor = {
  name: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  placeId?: string;
};

export type PresencePublicPayload = {
  lat?: number;
  lng?: number;
  town?: string;
  trade?: string;
  rating?: number;
  address?: string;
  mapsUri?: string;
  website?: string;
  businessName?: string;
  reviewCount?: number;
  reviews?: PresenceReview[];
  competitors?: PresenceCompetitor[];
  keywordsPreview?: { keyword: string; scanned?: boolean }[];
  teaser?: {
    webHint?: string;
    reviewHint?: string;
    competitorHint?: string;
  };
  web?: {
    seo?: number;
    url?: string;
    overall?: number;
    loadMs?: number;
    hasHttps?: boolean;
    screenshot?: string;
    performance?: number;
    accessibility?: number;
    bestPractices?: number;
    checks?: PresenceWebCheck[];
  };
};

export function parsePresencePayload(
  value: Json | null | undefined,
): PresencePublicPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as PresencePublicPayload;
}

export function googleMapsUrl(opts: {
  mapsUri?: string | null;
  placeId?: string | null;
  address?: string | null;
  businessName?: string | null;
}) {
  // Prefer the Places API maps URI when present — opens the GBP listing.
  if (opts.mapsUri) return opts.mapsUri;
  if (opts.placeId) {
    return `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${encodeURIComponent(opts.placeId)}`;
  }
  const query = [opts.businessName, opts.address].filter(Boolean).join(" ");
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function gradeTone(grade: string | null | undefined) {
  switch (grade) {
    case "A":
      return "bg-emerald-100 text-emerald-800";
    case "B":
      return "bg-lime-100 text-lime-800";
    case "C":
      return "bg-amber-100 text-amber-900";
    case "D":
      return "bg-orange-100 text-orange-900";
    case "F":
      return "bg-red-100 text-red-800";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}
