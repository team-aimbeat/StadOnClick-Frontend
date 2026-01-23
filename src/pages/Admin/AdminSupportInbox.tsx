import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowPath, HiCheckCircle, HiChatBubbleOvalLeft } from "react-icons/hi2";
import toast from "react-hot-toast";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import {
  useAdminAssignTicketMutation,
  useAdminGetTicketQuery,
  useAdminListTicketsQuery,
  useAdminMarkTicketReadMutation,
  useAdminUpdateStatusMutation,
} from "@/features/support/supportApi";
import type { SupportTicket, SupportTicketPriority, SupportTicketStatus } from "@/features/support/support.types";
import { cn } from "@/lib/utils";
import { initSupportSocket } from "@/lib/supportSocket";

const statusOptions: { value?: SupportTicketStatus; label: string }[] = [
  { label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "WAITING", label: "Waiting" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const priorityOptions: { value?: SupportTicketPriority; label: string }[] = [
  { label: "All" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

const statusTone: Record<SupportTicketStatus, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  WAITING: "bg-amber-50 text-amber-700 border-amber-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
};

const priorityTone: Record<SupportTicketPriority, string> = {
  LOW: "bg-slate-100 text-slate-700 border-slate-200",
  MEDIUM: "bg-blue-50 text-blue-700 border-blue-200",
  HIGH: "bg-amber-50 text-amber-700 border-amber-200",
  URGENT: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function AdminSupportInbox() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authUser = useAppSelector((s) => s.auth.user);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SupportTicketStatus | undefined>();
  const [priority, setPriority] = useState<SupportTicketPriority | undefined>();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: ticketsData, isFetching: isListFetching, refetch: refetchList } = useAdminListTicketsQuery(
    { search, status, priority }
  );

  const selectedTicketId = useMemo(() => selectedId ?? ticketsData?.items?.[0]?.id ?? null, [selectedId, ticketsData]);

  const { data: ticket, isFetching: isTicketFetching, refetch: refetchTicket } = useAdminGetTicketQuery(
    selectedTicketId!,
    {
      skip: !selectedTicketId,
    }
  );

  const [updateStatus] = useAdminUpdateStatusMutation();
  const [assignTo] = useAdminAssignTicketMutation();
  const [markRead] = useAdminMarkTicketReadMutation();

  useEffect(() => {
    initSupportSocket();
  }, []);

  useEffect(() => {
    dispatch(setPageTitle("Support Inbox"));
  }, [dispatch]);

  useEffect(() => {
    if (selectedTicketId) {
      markRead({ id: selectedTicketId });
    }
  }, [selectedTicketId, markRead]);

  const handleStatusChange = async (value: SupportTicketStatus) => {
    if (!selectedTicketId) return;
    try {
      await updateStatus({ id: selectedTicketId, status: value }).unwrap();
      await Promise.all([refetchList(), refetchTicket()]);
    } catch (err: any) {
      toast.error(err?.data?.message || "Unable to update status");
    }
  };

  const handleAssignToMe = async () => {
    if (!selectedTicketId || !authUser?.id) return;
    try {
      await assignTo({ id: selectedTicketId, assignedToUserId: authUser.id }).unwrap();
      await Promise.all([refetchList(), refetchTicket()]);
    } catch (err: any) {
      toast.error(err?.data?.message || "Unable to assign");
    }
  };

  return (
    <div className="space-y-5 px-2 sm:px-4">
      <TitleBreadCrumbs title="Support Inbox" breadCrumbTitle="Admin / Support" />

      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <Card className="shadow-sm">
          <CardHeader className="space-y-3">
            <CardTitle className="text-lg">Tickets</CardTitle>
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Search by ticket number, vendor, subject"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Select
                  value={status ?? "ALL"}
                  onValueChange={(val) => setStatus(val === "ALL" ? undefined : (val as SupportTicketStatus))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.label} value={(opt.value ?? "ALL") as any}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={priority ?? "ALL"}
                  onValueChange={(val) => setPriority(val === "ALL" ? undefined : (val as SupportTicketPriority))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((opt) => (
                      <SelectItem key={opt.label} value={(opt.value ?? "ALL") as any}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => refetchList()}>
                  <HiArrowPath className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isListFetching && !ticketsData ? (
              <div className="space-y-2">
                {[1, 2, 3].map((key) => (
                  <Skeleton key={key} className="h-16 w-full" />
                ))}
              </div>
            ) : ticketsData?.items?.length ? (
              <div className="space-y-2">
                {ticketsData.items.map((item) => (
                  <TicketListRow
                    key={item.id}
                    ticket={item}
                    active={selectedTicketId === item.id}
                    onClick={() => setSelectedId(item.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No tickets found.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-lg">
                {ticket ? `#${ticket.ticketNumber} · ${ticket.subject}` : "Select a ticket"}
              </CardTitle>
              {ticket ? (
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <Badge variant="outline" className={cn("border text-[11px] font-semibold", statusTone[ticket.status])}>
                    {ticket.status}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("border text-[11px] font-semibold", priorityTone[ticket.priority])}
                  >
                    {ticket.priority}
                  </Badge>
                  <span>{ticket.vendor.businessName}</span>
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select onValueChange={(val) => handleStatusChange(val as SupportTicketStatus)} value={ticket?.status}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions
                    .filter((s) => s.value)
                    .map((opt) => (
                      <SelectItem key={opt.label} value={opt.value!}>
                        {opt.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button variant="default" size="sm" onClick={handleAssignToMe} disabled={!ticket}>
                Assign to me
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!ticket}
                onClick={() => ticket && navigate(`/admin/chat?ticketId=${ticket.id}`)}
                className="gap-2"
              >
                <HiChatBubbleOvalLeft className="h-4 w-4" />
                Open chat
              </Button>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="grid gap-4 lg:grid-cols-[1fr_0.38fr]">
            <div className="space-y-3">
              {isTicketFetching ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((key) => (
                    <Skeleton key={key} className="h-5 w-full" />
                  ))}
                </div>
              ) : ticket ? (
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Subject</span>
                    <span className="font-semibold text-slate-900 text-right">{ticket.subject}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Created</span>
                    <span className="font-semibold text-slate-900">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Last activity</span>
                    <span className="font-semibold text-slate-900">
                      {ticket.lastActivityAt ? new Date(ticket.lastActivityAt).toLocaleString() : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Assigned</span>
                    <span className="font-semibold text-slate-900">
                      {ticket.assignedTo
                        ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName ?? ""}`.trim()
                        : "Unassigned"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange("RESOLVED")}
                      disabled={!ticket}
                      className="gap-1"
                    >
                      <HiCheckCircle className="h-4 w-4" />
                      Mark resolved
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleStatusChange("CLOSED")}
                      disabled={!ticket}
                    >
                      Close ticket
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Select a ticket to preview details.
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Vendor</span>
                <span className="font-semibold text-slate-900">{ticket?.vendor.businessName ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Contact</span>
                <span className="font-semibold text-slate-900">{ticket?.vendor.contactEmail ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last message</span>
                <span className="font-semibold text-slate-900">
                  {ticket?.lastMessageAt ? new Date(ticket.lastMessageAt).toLocaleString() : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last preview</span>
                <span className="max-w-[180px] text-right text-slate-900">
                  {ticket?.lastMessagePreview ?? "—"}
                </span>
              </div>
              <Separator />
              <p className="text-xs text-slate-500">
                Use “Open chat” to reply. Inbox is for triage and assignments.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TicketListRow({
  ticket,
  active,
  onClick,
}: {
  ticket: SupportTicket;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border px-3 py-2 text-left transition",
        active ? "border-blue-200 bg-blue-50 shadow-sm" : "border-slate-100 bg-white hover:border-slate-200"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
              {ticket.ticketNumber}
            </span>
            {ticket.unread ? <span className="h-2 w-2 rounded-full bg-blue-500" /> : null}
            <span>{ticket.vendor.businessName}</span>
          </div>
          <p className="text-sm font-semibold text-slate-900">{ticket.subject}</p>
          {ticket.lastMessagePreview ? (
            <p className="text-xs text-slate-500">{ticket.lastMessagePreview}</p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge
            variant="outline"
            className={cn("border text-[11px] font-semibold", statusTone[ticket.status])}
          >
            {ticket.status}
          </Badge>
          <p className="text-[11px] text-slate-500">
            {ticket.lastMessageAt
              ? new Date(ticket.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : new Date(ticket.updatedAt).toLocaleDateString()}
          </p>
          <p className="text-[11px] text-slate-500">
            {ticket.assignedTo
              ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName ?? ""}`.trim()
              : "Unassigned"}
          </p>
        </div>
      </div>
    </button>
  );
}
