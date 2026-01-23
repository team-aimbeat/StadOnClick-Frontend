import type { SupportTicketStatus } from "@/features/support/support.types";

export function formatTime(dateInput?: string | Date | null) {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function getInitials(name?: string) {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function statusColorMap(status: SupportTicketStatus) {
  switch (status) {
    case "OPEN":
      return "border-l-2 border-blue-500";
    case "WAITING":
      return "border-l-2 border-amber-500";
    case "RESOLVED":
      return "border-l-2 border-emerald-500";
    case "CLOSED":
    default:
      return "border-l-2 border-slate-400";
  }
}
