import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  HiArrowLeft,
  HiChatBubbleLeftRight,
  HiClipboardDocumentList,
  HiMiniPaperAirplane,
} from "react-icons/hi2";
import toast from "react-hot-toast";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import {
  useVendorGetTicketMessagesQuery,
  useVendorGetTicketQuery,
  useVendorReplyTicketMutation,
} from "@/features/support/supportApi";
import type {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
  TicketMessage,
} from "@/features/support/support.types";
import { cn } from "@/lib/utils";

const statusMeta: Record<
  SupportTicketStatus,
  { label: string; badgeClass: string; description?: string }
> = {
  OPEN: { label: "Open", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  WAITING: {
    label: "Waiting",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Waiting for your response",
  },
  RESOLVED: {
    label: "Resolved",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Resolved — if the issue persists, open a new ticket.",
  },
  CLOSED: {
    label: "Closed",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

const priorityMeta: Record<SupportTicketPriority, { label: string; badgeClass: string }> = {
  LOW: { label: "Low", badgeClass: "bg-slate-100 text-slate-700 border-slate-200" },
  MEDIUM: { label: "Medium", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  HIGH: { label: "High", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  URGENT: { label: "Urgent", badgeClass: "bg-rose-50 text-rose-700 border-rose-200" },
};

const categoryLabel: Record<SupportTicketCategory, string> = {
  BOOKING: "Booking",
  PAYOUT: "Payout",
  KYC: "KYC",
  SERVICE: "Service Listing",
  SUBSCRIPTION: "Subscription",
  OTHER: "Other",
};

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function MessageBubble({
  message,
  isOwn,
  createdAt,
}: {
  message: TicketMessage;
  isOwn: boolean;
  createdAt: string;
}) {
  return (
    <div className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[72%] rounded-2xl px-3 py-2 text-sm shadow-sm",
          isOwn ? "bg-blue-600 text-white" : "bg-white text-slate-800 border border-slate-100"
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
        <p className={cn("mt-1 text-[11px]", isOwn ? "text-blue-100" : "text-slate-500")}>
          {formatTime(createdAt)}
        </p>
      </div>
    </div>
  );
}

export default function VendorTicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [messageBody, setMessageBody] = useState("");

  const { data: ticket, isLoading, isFetching, error, refetch } = useVendorGetTicketQuery(
    ticketId || "",
    { skip: !ticketId }
  );
  const {
    data: messages,
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
  } = useVendorGetTicketMessagesQuery(
    { id: ticketId || "" },
    { skip: !ticketId, pollingInterval: 5000 }
  );
  const [sendMessage, { isLoading: isSending }] = useVendorReplyTicketMutation();

  useEffect(() => {
    dispatch(setPageTitle("Ticket Details"));
  }, [dispatch]);

  const status = useMemo(() => (ticket ? statusMeta[ticket.status] : null), [ticket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages?.length, isSending]);

  const handleSendMessage = async () => {
    if (!ticketId || !messageBody.trim()) return;
    try {
      await sendMessage({ id: ticketId, body: messageBody.trim() }).unwrap();
      setMessageBody("");
      await refetch();
      await refetchMessages();
    } catch (err: any) {
      toast.error(err?.data?.message || "Unable to send message");
    }
  };

  if (isLoading) {
    return (
      <DashboardContainer className="space-y-4">
        <TitleBreadCrumbs title="Support" breadCrumbTitle="Vendor / Support" />
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Card className="shadow-sm">
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-6 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
        </div>
      </DashboardContainer>
    );
  }

  if (error || !ticket) {
    return (
      <DashboardContainer className="space-y-4">
        <TitleBreadCrumbs title="Support" breadCrumbTitle="Vendor / Support" />
        <Card className="border-rose-200 bg-rose-50 shadow-sm">
          <CardContent className="flex flex-col gap-3 p-5 text-sm text-rose-800">
            <div className="font-semibold">Unable to load this ticket.</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/vendor/support")}>
                Back to tickets
              </Button>
              <Button size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TitleBreadCrumbs
          title="Support"
          breadCrumbTitle="Vendor / Support / Ticket"
          className="w-full sm:w-auto"
        />
        <Button variant="outline" size="sm" onClick={() => navigate("/vendor/support")}>
          <HiArrowLeft className="mr-2 h-4 w-4" />
          Back to tickets
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="shadow-sm">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                {ticket.ticketNumber}
              </span>
              <Separator orientation="vertical" className="h-4" />
              Last updated {formatDate(ticket.updatedAt)}
              {isFetching ? (
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              ) : null}
            </div>
            <CardTitle className="text-xl text-slate-900">{ticket.subject}</CardTitle>
            {status?.description ? (
              <p className="text-sm text-slate-500">{status.description}</p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={cn("border text-[11px] font-semibold", status?.badgeClass)}
              >
                {status?.label}
              </Badge>
              <Badge
                variant="outline"
                className={cn("border text-[11px] font-semibold", priorityMeta[ticket.priority].badgeClass)}
              >
                {priorityMeta[ticket.priority].label}
              </Badge>
              <Badge variant="outline" className="border text-[11px] font-semibold text-slate-700">
                {categoryLabel[ticket.category]}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-500">Description</p>
              <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">Metadata</p>
            <CardTitle className="text-lg text-slate-900">Ticket overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Created</span>
              <span className="font-semibold text-slate-900">{formatDate(ticket.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Last activity</span>
              <span className="font-semibold text-slate-900">
                {formatDate(ticket.lastActivityAt)}
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
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Status</span>
              <Badge
                variant="outline"
                className={cn("border text-[11px] font-semibold", status?.badgeClass)}
              >
                {status?.label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="shadow-sm">
          <CardHeader className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">Conversation</p>
              <CardTitle className="text-lg text-slate-900">Messages</CardTitle>
              <p className="text-xs text-slate-500">
                {ticket.status === "CLOSED"
                  ? "Ticket closed. Please create a new ticket for further help."
                  : ticket.status === "RESOLVED"
                    ? "This ticket is resolved. You can still reply if the issue persists."
                    : "Chat is active with support."}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              ref={scrollRef}
              className="max-h-[420px] min-h-[260px] space-y-3 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-3"
            >
              {isMessagesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((key) => (
                    <div key={key} className="flex gap-2">
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : messages && messages.length ? (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.senderRoleSnapshot === "VENDOR"}
                    createdAt={msg.createdAt}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center">
                  <HiChatBubbleLeftRight className="h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-sm font-semibold text-slate-800">No messages yet</p>
                  <p className="text-xs text-slate-500">
                    A support agent will reply shortly.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Textarea
                disabled={!ticket || ticket.status === "CLOSED"}
                placeholder={
                  ticket.status === "CLOSED"
                    ? "Ticket closed. Please create a new ticket for further help."
                    : "Type your message..."
                }
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!messageBody.trim() || isSending || ticket.status === "CLOSED"}
                  className="flex items-center gap-2"
                >
                  {isSending ? "Sending..." : "Send"}
                  <HiMiniPaperAirplane className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">Activity</p>
              <CardTitle className="text-lg text-slate-900">Timeline</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticket.events && ticket.events.length ? (
              <div className="space-y-4">
                {ticket.events.map((event) => (
                  <div key={event.id} className="relative pl-7">
                    <span className="absolute left-1 top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{event.type}</p>
                      <span className="text-[11px] text-slate-500">{formatDate(event.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {event.performedBy
                        ? `${event.performedBy.firstName} ${event.performedBy.lastName ?? ""}`.trim()
                        : "System"}
                    </p>
                    {event.type === "STATUS_CHANGED" && event.newValue ? (
                      <p className="text-xs text-slate-500">
                        Status updated to {(event.newValue as any)?.status}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                <HiClipboardDocumentList className="h-7 w-7 text-slate-400" />
                <p className="mt-2 text-sm font-semibold text-slate-800">No activity yet</p>
                <p className="text-xs text-slate-500">Updates will appear here automatically.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button asChild variant="ghost" size="sm">
          <Link to="/vendor/support">Back to tickets</Link>
        </Button>
      </div>
    </DashboardContainer>
  );
}
