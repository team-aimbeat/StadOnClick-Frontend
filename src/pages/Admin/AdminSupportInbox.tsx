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

  const summary = useMemo(() => {
    const items = ticketsData?.items ?? [];
    const open = items.filter((t) => t.status === "OPEN").length;
    const waiting = items.filter((t) => t.status === "WAITING").length;
    const unassigned = items.filter((t) => !t.assignedTo).length;
    return { total: items.length, open, waiting, unassigned };
  }, [ticketsData]);

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
    <div className="space-y-6 px-3 pb-8 sm:px-6">
      <TitleBreadCrumbs title="Support Inbox" breadCrumbTitle="Admin / Support" />

      <div className="rounded-3xl border border-slate-200/80 bg-white/95 px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Inbox</p>
            <h2 className="text-2xl font-semibold text-slate-900">Ticket triage</h2>
            <p className="text-sm text-slate-600">Review, assign, and move fast on urgent tickets.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-700">
              Total {summary.total}
            </Badge>
            <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
              Open {summary.open}
            </Badge>
            <Badge variant="outline" className="rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
              Waiting {summary.waiting}
            </Badge>
            <Badge variant="outline" className="rounded-full border-purple-200 bg-purple-50 px-3 py-1 text-purple-700">
              Unassigned {summary.unassigned}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader className="space-y-4 border-b border-slate-200/80 bg-slate-50/70">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-lg text-slate-900">Tickets</CardTitle>
                <p className="text-sm text-slate-600">Triage, assign, and open chats quickly.</p>
              </div>
              <Button variant="outline" size="icon" onClick={() => refetchList()}>
                <HiArrowPath className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Search by ticket number, vendor, subject"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 rounded-xl border-slate-200 bg-white"
              />
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={status ?? "ALL"}
                  onValueChange={(val) => setStatus(val === "ALL" ? undefined : (val as SupportTicketStatus))}
                >
                  <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-white">
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
                  <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-white">
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
                <Button variant="secondary" className="h-10 rounded-xl" onClick={() => refetchList()}>
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isListFetching && !ticketsData ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3].map((key) => (
                  <Skeleton key={key} className="h-16 w-full" />
                ))}
              </div>
            ) : ticketsData?.items?.length ? (
              <div className="space-y-2 p-3">
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
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <HiChatBubbleOvalLeft className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No tickets found</p>
                <p className="text-xs text-slate-500">Try adjusting filters or refresh.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader className="space-y-4 border-b border-slate-200/80 bg-slate-50/70">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                    {ticket ? `#${ticket.ticketNumber}` : "Ticket"}
                  </span>
                  {ticket ? (
                    <>
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
                    </>
                  ) : null}
                </div>
                <CardTitle className="text-xl text-slate-900">
                  {ticket ? ticket.subject : "Select a ticket"}
                </CardTitle>
                {ticket ? <p className="text-sm text-slate-600">{ticket.vendor.businessName}</p> : null}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Select onValueChange={(val) => handleStatusChange(val as SupportTicketStatus)} value={ticket?.status}>
                  <SelectTrigger className="h-10 w-[160px] rounded-xl">
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
                <Button variant="default" size="sm" onClick={handleAssignToMe} disabled={!ticket} className="h-10">
                  Assign to me
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!ticket}
                  onClick={() => ticket && navigate(`/admin/chat?ticketId=${ticket.id}`)}
                  className="h-10 gap-2"
                >
                  <HiChatBubbleOvalLeft className="h-4 w-4" />
                  Open chat
                </Button>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="grid gap-5 p-4 lg:grid-cols-[1fr_0.38fr]">
            <div className="space-y-4">
              {isTicketFetching ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((key) => (
                    <Skeleton key={key} className="h-5 w-full" />
                  ))}
                </div>
              ) : ticket ? (
                <div className="space-y-4 text-sm text-slate-700">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Subject</span>
                      <span className="text-right font-semibold text-slate-900">{ticket.subject}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-slate-500">Created</span>
                      <span className="font-semibold text-slate-900">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-slate-500">Last activity</span>
                      <span className="font-semibold text-slate-900">
                        {ticket.lastActivityAt ? new Date(ticket.lastActivityAt).toLocaleString() : "-"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-slate-500">Assigned</span>
                      <span className="font-semibold text-slate-900">
                        {ticket.assignedTo
                          ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName ?? ""}`.trim()
                          : "Unassigned"}
                      </span>
                    </div>
                  </div>
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
                      className="gap-1"
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

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Vendor</span>
                <span className="font-semibold text-slate-900">{ticket?.vendor.businessName ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Contact</span>
                <span className="font-semibold text-slate-900">{ticket?.vendor.contactEmail ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last message</span>
                <span className="font-semibold text-slate-900">
                  {ticket?.lastMessageAt ? new Date(ticket.lastMessageAt).toLocaleString() : "-"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500">Last preview</span>
                <span className="max-w-[220px] text-right text-slate-900">
                  {ticket?.lastMessagePreview ?? "-"}
                </span>
              </div>
              <Separator />
              <p className="text-xs text-slate-500">
                Use "Open chat" to reply. Inbox is for triage and assignments.
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
        "w-full rounded-2xl border px-3 py-3 text-left transition focus:outline-none",
        active
          ? "border-blue-200 bg-blue-50/70 shadow-sm ring-1 ring-blue-100"
          : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
              {ticket.ticketNumber}
            </span>
            {ticket.unread ? (
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            ) : null}
            <span className="truncate">{ticket.vendor.businessName}</span>
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
