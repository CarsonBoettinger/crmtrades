"use client";

import { useEffect, useState } from "react";
import { formatRelativeDate } from "@/lib/utils";

function absoluteLabel(value: string) {
  // Parse the fixed ISO string only — never touch "now" during prerender.
  const [datePart, timePart = ""] = value.split("T");
  const time = timePart.slice(0, 5);
  return time ? `${datePart} ${time}` : datePart;
}

export function RelativeTime({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const [label, setLabel] = useState(() => absoluteLabel(value));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLabel(formatRelativeDate(value));
  }, [value]);

  return (
    <time dateTime={value} className={className} suppressHydrationWarning>
      {mounted ? label : absoluteLabel(value)}
    </time>
  );
}
