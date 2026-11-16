"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/app/login/actions";

export function SignOutButton({ email }: { email?: string | null }) {
  return (
    <form action={signOut} className="flex items-center gap-3">
      {email ? (
        <span className="hidden text-sm text-zinc-600 sm:inline">{email}</span>
      ) : null}
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </button>
    </form>
  );
}
