export type SlotStatus = "available" | "few" | "unavailable"

export type SlotOption = {
  id: string
  label: string
  status: SlotStatus
  seats: string
}

export const slotStatusMeta: Record<SlotStatus, { label: string; badgeClass: string }> = {
  available: { label: "Available", badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  few: { label: "Few left", badgeClass: "border-amber-200 bg-amber-50 text-amber-700" },
  unavailable: { label: "Full", badgeClass: "border-slate-200 bg-slate-100 text-slate-400" },
}

export const slotStatusLegend: SlotStatus[] = ["available", "few", "unavailable"]
