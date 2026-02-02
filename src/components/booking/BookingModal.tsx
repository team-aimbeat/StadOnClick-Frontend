import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { SlotOption, SlotStatus } from "./slotData"

export type BookingModalProps = {
  isOpen: boolean
  serviceName: string
  bookedOfferingName?: string
  selectedDate?: Date
  selectedSlot?: SlotOption
  selectedSlotId: string | null
  formattedSelectedDate: string
  selectedDateIso: string
  slotOptions: SlotOption[]
  slotStatusLegend: SlotStatus[]
  slotStatusMeta: Record<SlotStatus, { label: string; badgeClass: string }>
  onSelectDate: (date: Date) => void
  onSelectSlot: (slotId: string) => void
  onClose: () => void
  onConfirm: () => void
  requiresSlot: boolean
  isLoading: boolean
}

export function BookingModal({
  isOpen,
  serviceName,
  bookedOfferingName,
  selectedDate,
  selectedSlot,
  selectedSlotId,
  formattedSelectedDate,
  selectedDateIso,
  slotOptions,
  slotStatusLegend,
  slotStatusMeta,
  onSelectDate,
  onSelectSlot,
  onClose,
  onConfirm,
  requiresSlot,
  isLoading,
}: BookingModalProps) {
  if (!isOpen) return null

  const showSlotGrid = requiresSlot && slotOptions.length > 0
  const confirmDisabled =
    isLoading || (requiresSlot && (!slotOptions.length || !selectedSlot))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8">
      <div className="w-full max-w-5xl rounded-[32px] bg-white p-6 shadow-2xl text-sm">
        <div className="flex items-start justify-between">
          <div>
           
            <h3 className="mt-1 text-xl font-semibold text-slate-900">
              {bookedOfferingName || serviceName}
            </h3>
          </div>
        
        </div>
       
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-slate-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Calendar</p>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onSelectDate(date)}
              fromDate={new Date()}
              className="mt-4 rounded-2xl"
            />
          </div>
          <div className="rounded-3xl border border-slate-100 p-5">
            <div className="flex items-start justify-between gap-6 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400">Selected date</p>
                <p className="text-sm font-semibold text-slate-900">{formattedSelectedDate}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400">Time slot</p>
                <p className="text-sm font-semibold  text-slate-900">{selectedSlot?.label || "Pick a slot"}</p>
                <p className="text-[11px] text-slate-400">{selectedSlot?.seats}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400">Time slots</p>
                {requiresSlot && (
                  <div className="flex flex-wrap gap-2 justify-end">
                    {slotStatusLegend.map((status) => (
                      <span
                        key={status}
                        className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${slotStatusMeta[status].badgeClass}`}
                      >
                        {slotStatusMeta[status].label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {requiresSlot ? (
              showSlotGrid ? (
                  <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {slotOptions.map((slot) => {
                      const statusInfo = slotStatusMeta[slot.status]
                      const isSelected = selectedSlotId === slot.id
                      return (
                        <button
                          type="button"
                          key={slot.id}
                          disabled={slot.status === "unavailable"}
                          onClick={() => onSelectSlot(slot.id)}
                          className={`flex flex-col gap-1 rounded-2xl border px-4 py-3 text-left transition ${statusInfo.badgeClass} ${
                            isSelected ? "ring-2 ring-blue-500" : "border-opacity-70"
                          } ${
                            slot.status === "unavailable"
                              ? "cursor-not-allowed opacity-60"
                              : "hover:border-blue-300"
                          } w-full`}
                        >
                          <span className="text-sm font-semibold text-current">{slot.label}</span>
                          <span className="text-[11px] text-slate-500">{slot.seats}</span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="mt-6 text-center text-sm text-slate-500">No slots are available right now.</p>
                )
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  This service does not require a time slot. We will send you the details after booking.
                </p>
              )}
          </div>
        </div>
        <div className="mt-6">
          <p className="text-sm text-slate-500">
            Confirming adds {bookedOfferingName || serviceName} to your cart and holds any selected slot while you finish checkout.
          </p>
        </div>
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="rounded-2xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Adding..." : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  )
}
