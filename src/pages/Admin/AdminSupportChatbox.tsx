import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { HiArrowPath, HiMiniPaperAirplane, HiPaperClip } from "react-icons/hi2";
import { Bell } from "lucide-react";
import toast from "react-hot-toast";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import {
  useAdminAssignTicketMutation,
  useAdminGetTicketMessagesQuery,
  useAdminGetTicketQuery,
  useAdminJoinTicketMutation,
  useAdminMarkTicketReadMutation,
  useAdminListTicketsQuery,
  useAdminSendTicketMessageMutation,
  useAdminUpdateStatusMutation,
} from "@/features/support/supportApi";
import type { SupportTicketPriority, SupportTicketStatus } from "@/features/support/support.types";
import { cn } from "@/lib/utils";
import { initSupportSocket } from "@/lib/supportSocket";
import { SupportTicketRow } from "@/components/support/SupportTicketRow";
import { MessageBubble } from "@/components/support/MessageBubble";
import { useAutoScrollToBottom } from "@/hooks/useAutoScrollToBottom";

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

export default function AdminSupportChatbox() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((s) => s.auth.user);
  const unreadTotal = useAppSelector((s) => s.supportRealtime.unreadTotal);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SupportTicketStatus | undefined>();
  const [priority, setPriority] = useState<SupportTicketPriority | undefined>();

  const { data: ticketsData, isFetching: isListFetching, refetch: refetchList } = useAdminListTicketsQuery(
    {
      search,
      status,
      priority,
    }
  );

  const ticketId = useMemo(() => searchParams.get("ticketId"), [searchParams]);

  const { data: ticket, refetch: refetchTicket } = useAdminGetTicketQuery(ticketId || "", {
    skip: !ticketId,
  });

  const { data: messages, isLoading: isMessagesLoading, refetch: refetchMessages } = useAdminGetTicketMessagesQuery(
    { id: ticketId || "" },
    { skip: !ticketId }
  );

  const [messageBody, setMessageBody] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useAutoScrollToBottom(scrollRef, [messages?.length]);

  const [sendMessage, { isLoading: isSending }] = useAdminSendTicketMessageMutation();
  const [joinTicket] = useAdminJoinTicketMutation();
  const [assignTo] = useAdminAssignTicketMutation();
  const [updateStatus] = useAdminUpdateStatusMutation();
  const [markRead] = useAdminMarkTicketReadMutation();

  useEffect(() => {
    dispatch(setPageTitle("Support Chat"));
  }, [dispatch]);

  useEffect(() => {
    const socket = initSupportSocket();
    if (!ticketId || !socket) return;
    socket.emit("support:joinTicket", { ticketId });
    markRead({ id: ticketId });
    const handler = (payload: { ticketId: string }) => {
      if (payload.ticketId === ticketId) {
        refetchMessages();
        refetchTicket();
      }
      refetchList();
    };
    socket.on("support:message.created", handler);
    return () => {
      socket.emit("support:leaveTicket", { ticketId });
      socket.off("support:message.created", handler);
    };
  }, [ticketId, refetchMessages, refetchTicket, refetchList, markRead]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages?.length, isSending]);

  const handleSend = async () => {
    if (!ticketId || !messageBody.trim()) return;
    try {
      await joinTicket({ id: ticketId }).unwrap();
      await sendMessage({ id: ticketId, body: messageBody.trim() }).unwrap();
      setMessageBody("");
      await Promise.all([refetchMessages(), refetchTicket(), refetchList()]);
    } catch (err: any) {
      toast.error(err?.data?.message || "Unable to send message");
    }
  };

  const isAssignedToSelf = Boolean(ticket?.assignedTo?.id && ticket?.assignedTo?.id === authUser?.id);

  const handleAssignToMe = async () => {
    if (!ticketId || !authUser?.id || isAssignedToSelf) return;
    try {
      await assignTo({ id: ticketId, assignedToUserId: authUser.id }).unwrap();
      await Promise.all([refetchTicket(), refetchList()]);
      toast.success("Assigned to you");
    } catch (err: any) {
      toast.error(err?.data?.message || "Unable to assign");
    }
  };

  const handleStatusChange = async (value: SupportTicketStatus) => {
    if (!ticketId) return;
    try {
      await updateStatus({ id: ticketId, status: value }).unwrap();
      await Promise.all([refetchTicket(), refetchList()]);
    } catch (err: any) {
      toast.error(err?.data?.message || "Unable to update status");
    }
  };

  const canSend =
    !!ticket &&
    ticket.status !== "CLOSED" &&
    ticket.assignedTo?.id === authUser?.id;

  const sendHelper =
    !ticket
      ? "Select a ticket to start chatting."
      : ticket.status === "CLOSED"
        ? "Ticket closed. Reopen to continue the conversation."
        : !ticket.assignedTo
          ? "Assign this ticket to yourself to reply."
          : ticket.assignedTo.id !== authUser?.id
            ? "Assigned to another agent. Reassign to send a reply."
            : null;

  return (
    <div className="space-y-6 px-3 pb-8 sm:px-6">
      <TitleBreadCrumbs title="Support Chat" breadCrumbTitle="Admin / Support Chat" />

      <div className="flex h-[calc(100vh-200px)] overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <aside className="flex w-[360px] shrink-0 flex-col border-r border-slate-200/80 bg-slate-50/70">
          <div className="space-y-3 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">Queue</p>
              <Button variant="outline" size="icon" onClick={() => refetchList()}>
                <HiArrowPath className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Search tickets"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 rounded-xl border-slate-200"
            />
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={status ?? "ALL"}
                onValueChange={(val) => setStatus(val === "ALL" ? undefined : (val as SupportTicketStatus))}
              >
                <SelectTrigger className="h-9 w-full rounded-xl border-slate-200">
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
                <SelectTrigger className="h-9 w-full rounded-xl border-slate-200">
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
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isListFetching && !ticketsData ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3, 4].map((key) => (
                  <Skeleton key={key} className="h-16 w-full" />
                ))}
              </div>
            ) : ticketsData?.items?.length ? (
              <div className="space-y-1 p-2">
                {ticketsData.items.map((item) => (
                  <SupportTicketRow
                    key={item.id}
                    ticket={item}
                    active={ticketId === item.id}
                    unreadCount={item.unread ? 1 : 0}
                    onClick={() => setSearchParams({ ticketId: item.id })}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4 text-sm text-slate-600">No tickets found.</div>
            )}
          </div>
        </aside>

        <main className="flex flex-1 flex-col bg-slate-50/70">
          <header className="flex items-start justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-5 py-4 backdrop-blur">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700 shadow-sm">
                  {ticket ? ticket.vendor.businessName.slice(0, 2).toUpperCase() : ""}
                </div>
                <div className="space-y-1">
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
                  <p className="text-sm font-semibold text-slate-900">
                    {ticket ? ticket.vendor.businessName : "Select a ticket"}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {ticket ? `${ticket.ticketNumber} - ${ticket.subject}` : "Choose a conversation to start"}
                  </p>
                </div>
              </div>
              {ticket ? (
                <p className="text-xs text-slate-500">
                  {ticket.assignedTo
                    ? `Assigned to ${`${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName ?? ""}`.trim()}`
                    : "Unassigned"}
                </p>
              ) : null}
            </div>

            {ticket ? (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <Bell className="h-5 w-5 text-slate-600" />
                  {unreadTotal > 0 ? (
                    <span className="absolute -right-1 -top-1 h-4 min-w-[16px] rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">
                      {unreadTotal}
                    </span>
                  ) : null}
                </Button>
                <Select onValueChange={(val) => handleStatusChange(val as SupportTicketStatus)} value={ticket?.status}>
                  <SelectTrigger className="h-9 w-[150px] rounded-xl">
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
                <Button
                  variant={isAssignedToSelf ? "secondary" : ticket.assignedTo ? "outline" : "secondary"}
                  size="sm"
                  className="h-9 rounded-xl"
                  onClick={handleAssignToMe}
                  disabled={isAssignedToSelf}
                >
                  {ticket.assignedTo
                    ? isAssignedToSelf
                      ? "Assigned to you"
                      : "Reassign to me"
                    : "Assign to me"}
                </Button>
              </div>
            ) : null}
          </header>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-slate-50 px-5 py-4 space-y-4"
          >
            {isMessagesLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((key) => (
                  <Skeleton key={key} className="h-12 w-full" />
                ))}
              </div>
            ) : messages && messages.length ? (
              messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} isOwn={msg.senderRoleSnapshot !== "VENDOR"} />
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-sm text-slate-600">
                Select a ticket to start chatting
              </div>
            )}
          </div>

          <div className="sticky bottom-0 border-t border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-blue-200">
              <Button variant="ghost" size="icon" className="text-slate-500" type="button">
                <HiPaperClip className="h-5 w-5" />
              </Button>
              <Input
                placeholder={
                  ticket?.status === "CLOSED"
                    ? "Ticket closed. Reopen or create a new ticket."
                    : "Type a message"
                }
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={!ticket || !canSend}
                className="border-0 bg-transparent focus-visible:ring-0"
              />
              <Button
                type="button"
                disabled={!messageBody.trim() || isSending || !ticket || !canSend}
                onClick={handleSend}
                className="h-9 rounded-full px-3"
              >
                <HiMiniPaperAirplane className="h-4 w-4" />
              </Button>
            </div>
            {sendHelper ? (
              <p className="mt-1 text-xs text-amber-600">{sendHelper}</p>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
