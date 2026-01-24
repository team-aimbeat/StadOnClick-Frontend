import { Badge } from "@/components/ui/badge";
import type { SupportTicket, SupportTicketPriority, SupportTicketStatus } from "@/features/support/support.types";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/components/notifications/notification.utils";
import { getInitials } from "@/components/support/chatUtils";

const statusTone: Record<SupportTicketStatus, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  WAITING: "bg-amber-50 text-amber-700 border-amber-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-600 border-slate-200",
};

const priorityDot: Record<SupportTicketPriority, string> = {
  LOW: "bg-slate-400",
  MEDIUM: "bg-blue-400",
  HIGH: "bg-amber-400",
  URGENT: "bg-rose-500",
};

type Props = {
  ticket: SupportTicket;
  active?: boolean;
  onSelect: () => void;
};

export default function TicketListItem({ ticket, active, onSelect }: Props) {
  const preview = ticket.lastMessagePreview || ticket.subject || "No messages yet";
  const time = formatRelativeTime(ticket.lastMessageAt || ticket.lastActivityAt || ticket.updatedAt);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border px-3 py-3 text-left transition",
        active
          ? "border-blue-200 bg-blue-50/60 shadow-sm ring-1 ring-blue-100"
          : "border-transparent hover:bg-slate-50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
          {ticket.vendor.profileImageUrl ? (
            <img
              src={ticket.vendor.profileImageUrl}
              alt={ticket.vendor.businessName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {getInitials(ticket.vendor.businessName || ticket.ticketNumber)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-slate-900">{ticket.vendor.businessName}</p>
            <span className="shrink-0 text-[11px] text-slate-500">{time}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
              {ticket.ticketNumber}
            </span>
            <Badge variant="outline" className={cn("border text-[10px] font-semibold", statusTone[ticket.status])}>
              {ticket.status}
            </Badge>
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-slate-500">
              <span className={cn("h-1.5 w-1.5 rounded-full", priorityDot[ticket.priority])} />
              {ticket.priority}
            </span>
          </div>

          <p className="truncate text-xs text-slate-600">{preview}</p>
        </div>

        {ticket.unread ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" /> : null}
      </div>
    </button>
  );
}
