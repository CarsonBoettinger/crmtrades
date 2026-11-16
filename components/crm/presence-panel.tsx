import {
  ExternalLink,
  Globe,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import type { PresenceReport } from "@/lib/database.types";
import {
  googleMapsUrl,
  gradeTone,
  parsePresencePayload,
} from "@/lib/crm/presence";
import { cn, formatPhone } from "@/lib/utils";

export type PresencePanelReport = Pick<
  PresenceReport,
  | "id"
  | "business_name"
  | "website"
  | "phone"
  | "rating"
  | "review_count"
  | "grade"
  | "overall_score"
  | "status"
  | "formatted_address"
  | "town"
  | "trade"
  | "place_id"
  | "public_payload"
>;

export function PresencePanel({
  report,
}: {
  report: PresencePanelReport | null;
}) {
  if (!report) {
    return (
      <aside className="w-full shrink-0 border-t border-zinc-200 bg-white lg:w-[340px] lg:border-t-0 lg:border-l">
        <div className="p-5">
          <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
            Presence
          </p>
          <p className="mt-3 rounded-xl border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-500">
            No Google Business Profile or digital report linked to this lead.
          </p>
        </div>
      </aside>
    );
  }

  const payload = parsePresencePayload(report.public_payload);
  const mapsUrl = googleMapsUrl({
    mapsUri: payload.mapsUri,
    placeId: report.place_id,
    address: report.formatted_address ?? payload.address,
    businessName: report.business_name,
  });
  const rating = report.rating ?? payload.rating ?? null;
  const reviewCount = report.review_count ?? payload.reviewCount ?? null;
  const website = report.website ?? payload.website ?? payload.web?.url ?? null;
  const address = report.formatted_address ?? payload.address ?? null;
  const phone = report.phone ?? null;
  const checks = payload.web?.checks ?? [];
  const competitors = (payload.competitors ?? []).slice(0, 4);
  const reviews = (payload.reviews ?? []).slice(0, 3);

  return (
    <aside className="w-full shrink-0 border-t border-zinc-200 bg-zinc-50 lg:w-[340px] lg:overflow-y-auto lg:border-t-0 lg:border-l">
      <div className="space-y-4 p-4">
        <section className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="mb-3 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
            Google Business Profile
          </p>

          <h2 className="text-base font-semibold text-zinc-900">
            {report.business_name}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {[report.trade ?? payload.trade, report.town ?? payload.town]
              .filter(Boolean)
              .join(" · ")}
          </p>

          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Open Google Business Profile
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            {rating != null ? (
              <span className="inline-flex items-center gap-1 font-medium text-zinc-800">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {Number(rating).toFixed(1)}
                {reviewCount != null ? (
                  <span className="font-normal text-zinc-500">
                    ({reviewCount})
                  </span>
                ) : null}
              </span>
            ) : (
              <span className="text-zinc-500">No rating</span>
            )}
          </div>

          {address ? (
            <p className="mt-3 flex gap-2 text-sm text-zinc-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              <span>{address}</span>
            </p>
          ) : null}

          <div className="mt-3 space-y-1.5 text-sm">
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="block text-emerald-800 hover:underline"
              >
                {formatPhone(phone)}
              </a>
            ) : null}
            {website ? (
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-emerald-800 hover:underline"
              >
                <Globe className="h-3.5 w-3.5" />
                Website
              </a>
            ) : null}
          </div>

          {reviews.length > 0 ? (
            <div className="mt-4 space-y-2 border-t border-zinc-100 pt-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase">
                Recent reviews
              </p>
              {reviews.map((review, index) => (
                <div
                  key={`${review.author ?? "review"}-${index}`}
                  className="rounded-lg bg-zinc-50 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-zinc-800">
                      {review.author ?? "Reviewer"}
                    </p>
                    {review.rating != null ? (
                      <span className="inline-flex items-center gap-0.5 text-xs text-zinc-600">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {review.rating}
                      </span>
                    ) : null}
                  </div>
                  {review.relativeTime ? (
                    <p className="text-[11px] text-zinc-400">
                      {review.relativeTime}
                    </p>
                  ) : null}
                  {review.text ? (
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-600">
                      {review.text}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {competitors.length > 0 ? (
            <div className="mt-4 space-y-2 border-t border-zinc-100 pt-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase">
                <Users className="h-3.5 w-3.5" />
                Nearby competitors
              </p>
              {competitors.map((competitor) => (
                <div
                  key={competitor.placeId ?? competitor.name}
                  className="flex items-start justify-between gap-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-800">
                      {competitor.name}
                    </p>
                    {competitor.address ? (
                      <p className="truncate text-xs text-zinc-500">
                        {competitor.address}
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right text-xs text-zinc-600">
                    {competitor.rating != null ? (
                      <p className="inline-flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {competitor.rating}
                      </p>
                    ) : null}
                    {competitor.reviewCount != null ? (
                      <p className="text-zinc-400">
                        {competitor.reviewCount} reviews
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
              Digital report
            </p>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 capitalize">
              {report.status}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold",
                gradeTone(report.grade),
              )}
            >
              {report.grade ?? "—"}
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-zinc-900">
                {report.overall_score ?? "—"}
                <span className="text-sm font-medium text-zinc-400">/100</span>
              </p>
              <p className="text-xs text-zinc-500">Overall presence score</p>
            </div>
          </div>

          {payload.web ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <ScoreChip label="Web" value={payload.web.overall} />
              <ScoreChip label="SEO" value={payload.web.seo} />
              <ScoreChip label="Speed" value={payload.web.performance} />
              <ScoreChip label="A11y" value={payload.web.accessibility} />
            </div>
          ) : null}

          {payload.teaser ? (
            <div className="mt-4 space-y-2">
              {payload.teaser.webHint ? (
                <Hint text={payload.teaser.webHint} />
              ) : null}
              {payload.teaser.reviewHint ? (
                <Hint text={payload.teaser.reviewHint} />
              ) : null}
              {payload.teaser.competitorHint ? (
                <Hint text={payload.teaser.competitorHint} />
              ) : null}
            </div>
          ) : null}

          {payload.web?.screenshot ? (
            <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={payload.web.screenshot}
                alt={`${report.business_name} website screenshot`}
                className="h-36 w-full object-cover object-top"
              />
            </div>
          ) : null}

          {checks.length > 0 ? (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-zinc-500 uppercase">
                Website checks
              </p>
              {checks.map((check) => (
                <div
                  key={check.id}
                  className="flex items-start gap-2 rounded-lg bg-zinc-50 px-2.5 py-2"
                >
                  <span
                    className={cn(
                      "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                      check.pass === true
                        ? "bg-emerald-500"
                        : check.pass === false
                          ? "bg-red-500"
                          : "bg-zinc-300",
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-800">
                      {check.label}
                    </p>
                    <p className="text-[11px] text-zinc-500">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {payload.keywordsPreview && payload.keywordsPreview.length > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold text-zinc-500 uppercase">
                Keywords scanned
              </p>
              <div className="flex flex-wrap gap-1.5">
                {payload.keywordsPreview.map((item) => (
                  <span
                    key={item.keyword}
                    className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-800"
                  >
                    {item.keyword}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </aside>
  );
}

function ScoreChip({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-lg bg-zinc-50 px-2.5 py-2">
      <p className="text-[11px] text-zinc-500">{label}</p>
      <p className="text-sm font-semibold text-zinc-900">
        {value != null ? value : "—"}
      </p>
    </div>
  );
}

function Hint({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-950">
      {text}
    </p>
  );
}
