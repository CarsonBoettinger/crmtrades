import { AppShell } from "@/components/crm/app-shell";
import { createClient } from "@/lib/supabase/server";

export default async function CrmLayout({
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
