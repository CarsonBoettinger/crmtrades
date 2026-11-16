"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [{ href: "/people", label: "People", icon: Users }];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col items-center gap-2 pt-3">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl transition",
              active
                ? "bg-emerald-600 text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="sr-only">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
