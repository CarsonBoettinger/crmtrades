import { Suspense } from "react";
import { AppShell } from "@/components/crm/app-shell";
import { createClient } from "@/lib/supabase/server";

async function AuthenticatedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <AppShell email={user?.email}>{children}</AppShell>;
}

export default function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-100 text-sm text-zinc-500">
          Loading workspace…
        </div>
      }
    >
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </Suspense>
  );
}
