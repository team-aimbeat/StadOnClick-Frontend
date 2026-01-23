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
        "w-full px-3 py-2 flex items-center gap-3 text-left transition-colors",
        "hover:bg-slate-100/80",
        active ? "bg-white" : "",
        statusColorMap(ticket.status)
      )}
    >
      <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
        {ticket.vendor.profileImageUrl ? (
          <img
            src={ticket.vendor.profileImageUrl}
            alt={ticket.vendor.businessName}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          getInitials(ticket.vendor.businessName || ticket.ticketNumber)
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-slate-900 truncate">{ticket.vendor.businessName}</p>
          <p className="text-[11px] text-slate-500 shrink-0">{formatTime(ticket.lastMessageAt || ticket.updatedAt)}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-slate-500 truncate">{ticket.ticketNumber}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-slate-700 truncate">
            {ticket.lastMessagePreview || "No messages yet"}
          </p>
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
