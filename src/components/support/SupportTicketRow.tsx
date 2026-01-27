import React from "react";
import { cn } from "@/lib/utils";
import type { SupportTicket } from "@/features/support/support.types";
import { formatTime, getInitials, statusColorMap } from "./chatUtils";

type Props = {
  ticket: SupportTicket;
  active?: boolean;
  unreadCount?: number;
  onClick?: () => void;
};

export function SupportTicketRow({ ticket, active, unreadCount = 0, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full px-3 py-3 flex items-center gap-3 text-left transition-colors rounded-xl border",
        active ? "bg-white shadow-sm ring-1 ring-blue-100 border-blue-100" : "border-transparent hover:bg-slate-50",
        statusColorMap(ticket.status)
      )}
    >
      <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200 text-sm font-semibold text-slate-700">
        {ticket.vendor.profileImageUrl ? (
          <img
            src={ticket.vendor.profileImageUrl}
            alt={ticket.vendor.businessName}
            className="h-11 w-11 rounded-xl object-cover"
          />
        ) : (
          getInitials(ticket.vendor.businessName || ticket.ticketNumber)
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-slate-900 truncate">{ticket.vendor.businessName}</p>
          <p className="text-[11px] text-slate-500 shrink-0">{formatTime(ticket.lastMessageAt || ticket.updatedAt)}</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-slate-600">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
            {ticket.ticketNumber}
          </span>
          <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
            {ticket.status}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-slate-700 truncate">{ticket.lastMessagePreview || "No messages yet"}</p>
          {unreadCount > 0 ? (
            <span className="h-5 min-w-[20px] px-1 rounded-full bg-emerald-500 text-white text-[11px] font-semibold flex items-center justify-center">
              {unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
