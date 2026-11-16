import type { User } from "@supabase/supabase-js";
import { displayNameForEmail } from "@/lib/crm/team";

export function actorNameFromUser(user: User) {
  const fromTeam = displayNameForEmail(user.email);
  if (fromTeam) return fromTeam;

  const meta = user.user_metadata ?? {};
  const fullName =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim()) ||
    "";

  if (fullName) return fullName;

  if (user.email) {
    const local = user.email.split("@")[0]?.trim();
    if (local) return local;
    return user.email;
  }

  return "Unknown";
}
