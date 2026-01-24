import { Mail, Phone, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { SupportTicket, SupportTicketPriority, SupportTicketStatus } from "@/features/support/support.types";
import { cn } from "@/lib/utils";

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

type Props = {
  ticket?: SupportTicket;
  isLoading?: boolean;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

export default function TicketDetailsPanel({ ticket, isLoading }: Props) {
  return (
    <aside className="hidden w-[320px] flex-col border-l border-slate-200/80 bg-white/95 lg:flex">
      <div className="border-b border-slate-200/80 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Details</p>
        <h3 className="text-sm font-semibold text-slate-900">Ticket Overview</h3>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 text-sm text-slate-700">
        {isLoading && !ticket ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((key) => (
              <Skeleton key={key} className="h-4 w-full" />
            ))}
          </div>
        ) : ticket ? (
          <>
            <Card className="gap-3 border-slate-200/80 bg-slate-50/80 py-4 shadow-none">
              <CardContent className="space-y-3 px-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("border text-[11px] font-semibold", statusTone[ticket.status])}
                    >
                      {ticket.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn("border text-[11px] font-semibold", priorityTone[ticket.priority])}
                    >
                      {ticket.priority}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{ticket.subject}</p>
                  <p className="text-xs text-slate-500">Ticket {ticket.ticketNumber}</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <DetailRow label="Vendor" value={ticket.vendor.businessName} />
                  <DetailRow label="Created" value={formatDateTime(ticket.createdAt)} />
                  <DetailRow label="Last activity" value={formatDateTime(ticket.lastActivityAt)} />
                  <DetailRow label="Category" value={ticket.category} />
                  <DetailRow
                    label="Assigned"
                    value={
                      ticket.assignedTo
                        ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName ?? ""}`.trim()
                        : "Unassigned"
                    }
                  />
                  <DetailRow label="Last message" value={formatDateTime(ticket.lastMessageAt)} />
                </div>
              </CardContent>
            </Card>

            <Separator />

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <span>{ticket.createdBy?.firstName ?? "Requester"}</span>
              </div>
              {ticket.vendor.contactEmail ? (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{ticket.vendor.contactEmail}</span>
                </div>
              ) : null}
              {ticket.vendor.contactPhone ? (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{ticket.vendor.contactPhone}</span>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-600">
            <p className="text-sm font-semibold text-slate-700">No ticket selected</p>
            <p className="text-xs text-slate-500">Pick a conversation to view details.</p>
          </div>
        )}
      </div>
    </aside>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-900">{value || "-"}</span>
    </div>
  );
}
