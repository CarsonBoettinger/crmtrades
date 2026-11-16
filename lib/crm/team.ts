/** Display names for CRM callers (email → first name). */
export const TEAM_DISPLAY_NAMES: Record<string, string> = {
  "reecejecooper@gmail.com": "Reece",
  "akaike.ventures@gmail.com": "Carson",
};

export function displayNameForEmail(email: string | null | undefined) {
  if (!email) return null;
  return TEAM_DISPLAY_NAMES[email.toLowerCase()] ?? null;
}
