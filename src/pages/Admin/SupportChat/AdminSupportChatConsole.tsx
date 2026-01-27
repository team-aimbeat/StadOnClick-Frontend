import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import {
  useAdminAssignTicketMutation,
  useAdminGetTicketMessagesQuery,
  useAdminGetTicketQuery,
  useAdminJoinTicketMutation,
  useAdminListTicketsQuery,
  useAdminMarkTicketReadMutation,
  useAdminSendTicketMessageMutation,
  useAdminUpdateStatusMutation,
} from "@/features/support/supportApi";
import {
  useAdminCommentEscalationMutation,
  useAdminCreateEscalationMutation,
  useAdminListTicketEscalationsQuery,
} from "@/features/escalations/escalationApi";
import type {
  EscalationCategory,
  EscalationDetail,
  EscalationSeverity,
} from "@/features/escalations/escalation.types";
import type { SupportTicket, SupportTicketPriority, SupportTicketStatus } from "@/features/support/support.types";
import { initSupportSocket } from "@/lib/supportSocket";

import ChatComposer from "./ChatComposer";
import ChatHeader from "./ChatHeader";
import ChatThread from "./ChatThread";
import EscalationDialog from "./EscalationDialog";
import EscalationDetailsDialog from "./EscalationDetailsDialog";
import TicketDetailsPanel from "./TicketDetailsPanel";
import TicketListSidebar from "./TicketListSidebar";

const statusRank: Record<SupportTicketStatus, number> = { 
  OPEN: 0,
  WAITING: 1,
  RESOLVED: 2,
  CLOSED: 3,
};

const sortTickets = (tickets: SupportTicket[]) => {
  return [...tickets].sort((a, b) => {
    const rank = statusRank[a.status] - statusRank[b.status];
    if (rank !== 0) return rank;
    const aTime = new Date(a.lastActivityAt || a.updatedAt).getTime();
    const bTime = new Date(b.lastActivityAt || b.updatedAt).getTime();
    return bTime - aTime;
  });
};

export default function AdminSupportChatConsole() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SupportTicketStatus | undefined>();
  const [priority, setPriority] = useState<SupportTicketPriority | undefined>();
  const [messageBody, setMessageBody] = useState("");
  const [isEscalationDialogOpen, setEscalationDialogOpen] = useState(false);
  const [activeEscalation, setActiveEscalation] = useState<EscalationDetail | null>(null);

  const {
    data: ticketsData,
    isFetching: isListFetching,
    refetch: refetchList,
  } = useAdminListTicketsQuery({ search, status, priority });

  const sortedTickets = useMemo(
    () => sortTickets(ticketsData?.items ?? []),
    [ticketsData?.items]
  );

  const ticketIdParam = searchParams.get("ticketId");
  const selectedTicketId = useMemo(() => {
    if (ticketIdParam) return ticketIdParam;
    return sortedTickets[0]?.id ?? null;
  }, [ticketIdParam, sortedTickets]);

  useEffect(() => {
    if (!ticketIdParam && selectedTicketId) {
      setSearchParams({ ticketId: selectedTicketId });
    }
  }, [selectedTicketId, ticketIdParam, setSearchParams]);

  const {
    data: ticket,
    isFetching: isTicketFetching,
    refetch: refetchTicket,
  } = useAdminGetTicketQuery(selectedTicketId ?? "", {
    skip: !selectedTicketId,
  });

  const {
    data: escalations,
    refetch: refetchEscalations,
  } = useAdminListTicketEscalationsQuery(
    { ticketId: selectedTicketId ?? "" },
    { skip: !selectedTicketId }
  );

  const latestEscalation = useMemo(() => {
    if (!escalations?.length) return null;
    return escalations[0];
  }, [escalations]);

  useEffect(() => {
    if (!activeEscalation || !escalations?.length) return;
    const updated = escalations.find((item) => item.id === activeEscalation.id);
    if (updated && updated !== activeEscalation) {
      setActiveEscalation(updated);
    }
  }, [activeEscalation, escalations]);

  const {
    data: messages,
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
  } = useAdminGetTicketMessagesQuery(
    { id: selectedTicketId ?? "" },
    { skip: !selectedTicketId, pollingInterval: 3000 }
  );

  const [sendMessage, { isLoading: isSending }] = useAdminSendTicketMessageMutation();
  const [joinTicket] = useAdminJoinTicketMutation();
  const [assignTo, { isLoading: isAssigning }] = useAdminAssignTicketMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useAdminUpdateStatusMutation();
  const [markRead] = useAdminMarkTicketReadMutation();
  const [createEscalation, { isLoading: isCreatingEscalation }] =
    useAdminCreateEscalationMutation();
  const [commentEscalation, { isLoading: isCommentingEscalation }] =
    useAdminCommentEscalationMutation();

  useEffect(() => {
    dispatch(setPageTitle("Support Chat"));
    initSupportSocket();
  }, [dispatch]);

  useEffect(() => {
    if (selectedTicketId) {
      markRead({ id: selectedTicketId });
    }
  }, [selectedTicketId, markRead]);

  useEffect(() => {
    setActiveEscalation(null);
  }, [selectedTicketId]);

  const handleSelectTicket = (id: string) => {
    setSearchParams({ ticketId: id });
  };

  const handleSend = async () => {
    if (!selectedTicketId || !messageBody.trim()) return;
    try {
      await joinTicket({ id: selectedTicketId }).unwrap();
      await sendMessage({ id: selectedTicketId, body: messageBody.trim() }).unwrap();
      setMessageBody("");
      await Promise.all([refetchMessages(), refetchTicket(), refetchList()]);
    } catch (err: any) {
      toast.error(err?.data?.message || "Unable to send message");
    }
  };

  const handleAssignToMe = async () => {
    if (!selectedTicketId || !authUser?.id) return;
    try {
      await assignTo({ id: selectedTicketId, assignedToUserId: authUser.id }).unwrap();
      await Promise.all([refetchTicket(), refetchList()]);
    } catch (err: any) {
      toast.error(err?.data?.message || "Unable to assign ticket");
    }
  };

  const handleStatusChange = async (value: SupportTicketStatus) => {
    if (!selectedTicketId) return;
    try {
      await updateStatus({ id: selectedTicketId, status: value }).unwrap();
      await Promise.all([refetchTicket(), refetchList()]);
    } catch (err: any) {
      toast.error(err?.data?.message || "Unable to update status");
    }
  };

  const handleEscalate = async (values: {
    category: EscalationCategory;
    severity: EscalationSeverity;
    reason: string;
    description: string;
  }) => {
    if (!selectedTicketId) return;
    try {
      await createEscalation({ ticketId: selectedTicketId, ...values }).unwrap();
      toast.success("Escalation created");
      setEscalationDialogOpen(false);
      await Promise.all([refetchEscalations(), refetchTicket(), refetchList()]);
    } catch (err: any) {
      toast.error(err?.data?.message || "Unable to create escalation");
    }
  };

  const handleEscalationComment = async (body: string) => {
    if (!activeEscalation) return;
    try {
      await commentEscalation({ escalationId: activeEscalation.id, body }).unwrap();
      await refetchEscalations();
    } catch (err: any) {
      toast.error(err?.data?.message || "Unable to add comment");
    }
  };

  const canSend =
    !!ticket && ticket.status !== "CLOSED" && ticket.assignedTo?.id === authUser?.id;

  const helperText = !ticket
    ? "Select a ticket to start the conversation."
    : ticket.status === "CLOSED"
      ? "Ticket closed. Reopen to continue the conversation."
      : !ticket.assignedTo
        ? "Assign this ticket to yourself to reply."
        : ticket.assignedTo.id !== authUser?.id
          ? "Assigned to another agent. Reassign to send a reply."
          : "";

  return (
    <div className="space-y-6 px-3 pb-8 sm:px-6">
      <TitleBreadCrumbs title="Support Chat" breadCrumbTitle="Admin / Support Chat" />

      <div className="flex h-[calc(100vh-200px)] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm lg:flex-row">
        <TicketListSidebar
          tickets={sortedTickets}
          isLoading={isListFetching}
          selectedId={selectedTicketId}
          search={search}
          onSearch={setSearch}
          status={status}
          onStatusChange={setStatus}
          priority={priority}
          onPriorityChange={setPriority}
          onSelectTicket={handleSelectTicket}
          onRefresh={refetchList}
        />

        <div className="flex flex-1 flex-col border-slate-200/80 lg:border-l">
          <ChatHeader
            ticket={ticket}
            escalation={latestEscalation}
            authUserId={authUser?.id}
            onAssignToMe={handleAssignToMe}
            onStatusChange={handleStatusChange}
            onEscalate={() => setEscalationDialogOpen(true)}
            isAssigning={isAssigning}
            isUpdatingStatus={isUpdatingStatus}
            isLoading={isTicketFetching}
          />

          <ChatThread
            ticket={ticket}
            messages={messages}
            isLoading={isMessagesLoading}
            authUserId={authUser?.id}
          />

          <ChatComposer
            value={messageBody}
            onChange={setMessageBody}
            onSend={handleSend}
            disabled={!canSend}
            isSending={isSending}
            helperText={helperText}
          />
        </div>

        <TicketDetailsPanel
          ticket={ticket}
          escalations={escalations}
          isLoading={isTicketFetching}
          onSelectEscalation={(escalation) => {
            setActiveEscalation(escalation);
          }}
        />
      </div>

      <EscalationDialog
        open={isEscalationDialogOpen}
        onOpenChange={setEscalationDialogOpen}
        onSubmit={handleEscalate}
        isSubmitting={isCreatingEscalation}
      />

      <EscalationDetailsDialog
        escalation={activeEscalation}
        open={Boolean(activeEscalation)}
        onOpenChange={(open) => {
          if (!open) setActiveEscalation(null);
        }}
        onAddComment={handleEscalationComment}
        isCommenting={isCommentingEscalation}
      />
    </div>
  );
}
