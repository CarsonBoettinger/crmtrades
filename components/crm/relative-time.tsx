"use client";

import { useEffect, useState } from "react";
import { formatRelativeDate } from "@/lib/utils";

export function RelativeTime({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const [label, setLabel] = useState(() =>
    new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  );

  useEffect(() => {
    setLabel(formatRelativeDate(value));
  }, [value]);

  return (
    <time dateTime={value} className={className}>
      {label}
    </time>
  );
}
