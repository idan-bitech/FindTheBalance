export function formatMemberRole(role: string): string {
  if (role === "admin") {
    return "מנהל";
  }

  return "חבר קבוצה";
}
