import Link from "next/link";
import { Search } from "lucide-react";
import { SidebarNav } from "@/components/crm/sidebar-nav";
import { SignOutButton } from "@/components/crm/sign-out-button";

export function AppShell({
  children,
  email,
  searchSlot,
}: {
  children: React.ReactNode;
  email?: string | null;
  searchSlot?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 bg-zinc-100 text-zinc-900">
      <aside className="flex w-16 shrink-0 flex-col items-center border-r border-zinc-800 bg-zinc-950 py-4">
        <Link
          href="/people"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white"
          title="Foreman CRM"
        >
          F
        </Link>
        <SidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-zinc-200 bg-white px-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <p className="hidden text-sm font-semibold tracking-tight text-zinc-900 sm:block">
              Foreman
            </p>
            <div className="relative max-w-xl flex-1">
              {searchSlot ?? (
                <div className="pointer-events-none flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-400">
                  <Search className="h-4 w-4" />
                  Search people…
                </div>
              )}
            </div>
          </div>
          <SignOutButton email={email} />
        </header>
        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
