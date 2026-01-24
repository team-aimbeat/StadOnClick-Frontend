import { CheckCircle2, Copy, MoreHorizontal, UserPlus, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { SupportTicket, SupportTicketPriority, SupportTicketStatus } from "@/features/support/support.types";
import { cn } from "@/lib/utils";
import { getInitials } from "@/components/support/chatUtils";

const statusTone: Record<SupportTicketStatus, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  WAITING: "bg-amber-50 text-amber-700 border-amber-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-600 border-slate-200",
};

const priorityTone: Record<SupportTicketPriority, string> = {
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
  MEDIUM: "bg-blue-50 text-blue-700 border-blue-200",
  HIGH: "bg-amber-50 text-amber-700 border-amber-200",
  URGENT: "bg-rose-50 text-rose-700 border-rose-200",
};

const statusOptions: SupportTicketStatus[] = ["OPEN", "WAITING", "RESOLVED", "CLOSED"];

type Props = {
  ticket?: SupportTicket;
  authUserId?: string;
  isLoading?: boolean;
  isAssigning?: boolean;
  isUpdatingStatus?: boolean;
  onAssignToMe: () => void;
  onStatusChange: (value: SupportTicketStatus) => void;
};

export default function ChatHeader({
  ticket,
  authUserId,
  isLoading,
  isAssigning,
  isUpdatingStatus,
  onAssignToMe,
  onStatusChange,
}: Props) {
  const isAssignedToSelf = Boolean(ticket?.assignedTo?.id && ticket?.assignedTo?.id === authUserId);
  const assignedLabel = ticket?.assignedTo
    ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName ?? ""}`.trim()
    : "Unassigned";

  const assignLabel = !ticket
    ? "Assign to me"
    : isAssignedToSelf
      ? "Assigned to you"
      : ticket.assignedTo
        ? "Reassign to me"
        : "Assign to me";

  const handleCopyId = async () => {
    if (!ticket) return;
    try {
      await navigator.clipboard.writeText(ticket.id);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
            {ticket?.vendor.profileImageUrl ? (
              <img
                src={ticket.vendor.profileImageUrl}
                alt={ticket.vendor.businessName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                {getInitials(ticket?.vendor.businessName || "")}
              </div>
            )}
          </div>

          <div className="min-w-0">
            {isLoading && !ticket ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            ) : ticket ? (
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                    {ticket.ticketNumber}
                  </span>
                  <Badge variant="outline" className={cn("border text-[11px] font-semibold", statusTone[ticket.status])}>
                    {ticket.status}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("border text-[11px] font-semibold", priorityTone[ticket.priority])}
                  >
                    {ticket.priority}
                  </Badge>
                </div>
                <p className="truncate text-sm font-semibold text-slate-900">{ticket.subject}</p>
                <p className="text-xs text-slate-500">
                  {ticket.vendor.businessName} - {assignedLabel}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">Select a ticket</p>
                <p className="text-xs text-slate-500">Choose a conversation to get started.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={!ticket || isUpdatingStatus}>
                {ticket?.status ?? "Status"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {statusOptions.map((option) => (
                <DropdownMenuItem key={option} onClick={() => onStatusChange(option)}>
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant={isAssignedToSelf ? "secondary" : "default"}
            size="sm"
            onClick={onAssignToMe}
            disabled={!ticket || isAssigning || isAssignedToSelf}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            {assignLabel}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!ticket}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onStatusChange("RESOLVED")} disabled={!ticket}>
                <CheckCircle2 className="h-4 w-4" />
                Mark resolved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange("CLOSED")} disabled={!ticket}>
                <XCircle className="h-4 w-4" />
                Close ticket
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopyId} disabled={!ticket}>
                <Copy className="h-4 w-4" />
                Copy ticket ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
