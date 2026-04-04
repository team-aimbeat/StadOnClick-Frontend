import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { HiClock, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

import { useAppDispatch } from "@/app/hooks";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import {
  useVendorCreateTicketMutation,
  useVendorListTicketsQuery,
} from "@/features/support/supportApi";
import type {
  SupportTicket,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/features/support/support.types";
import { cn } from "@/lib/utils";

type TicketFormState = {
  subject: string;
  description: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
};

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
  HIGH: { label: "High", badgeClass: "bg-red-50 text-red-700 border-red-200" },
  URGENT: { label: "Urgent", badgeClass: "bg-rose-50 text-rose-700 border-rose-200" },
};

const categories: { value: SupportTicketCategory; label: string }[] = [
  { value: "BOOKING", label: "Booking" },
  { value: "PAYOUT", label: "Payout" },
  { value: "KYC", label: "KYC" },
  { value: "SERVICE", label: "Service Listing" },
  { value: "SUBSCRIPTION", label: "Subscription" },
  { value: "OTHER", label: "Other" },
];

const statusFilters: { label: string; value?: SupportTicketStatus }[] = [
  { label: "All", value: undefined },
  { label: "Open", value: "OPEN" },
  { label: "Waiting", value: "WAITING" },
  { label: "Resolved", value: "RESOLVED" },
];

const formatRelativeTime = (date: string | Date) => {
  const input = new Date(date).getTime();
  const diffMs = input - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);
  const absSeconds = Math.abs(diffSeconds);

  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (absSeconds < 60) return formatter.format(diffSeconds, "second");

  const diffMinutes = Math.round(diffSeconds / 60);
  const absMinutes = Math.abs(diffMinutes);
  if (absMinutes < 60) return formatter.format(diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  const absHours = Math.abs(diffHours);
  if (absHours < 24) return formatter.format(diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
};

const getTicketUpdateCount = (ticket: SupportTicket) => {
  const meaningfulEvents =
    ticket.events?.filter((event) => /message|reply|update|status/i.test(event.type)) ?? [];
  if (meaningfulEvents.length) return meaningfulEvents.length;
  if (ticket.lastMessagePreview) return 1;
  return 0;
};

const VendorSupport = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | undefined>(undefined);
  const [formState, setFormState] = useState<TicketFormState>({
    subject: "",
    description: "",
    category: "OTHER",
    priority: "MEDIUM",
  });
  const [formErrors, setFormErrors] = useState<{ subject?: string; description?: string }>({});

  const { data, isLoading, isFetching, error, refetch } = useVendorListTicketsQuery(
    { status: statusFilter },
    { refetchOnMountOrArgChange: true }
  );
  const [createTicket, { isLoading: isCreating }] = useVendorCreateTicketMutation();

  useEffect(() => {
    dispatch(setPageTitle("Support"));
  }, [dispatch]);

  const systemStatus = useMemo(() => "System Status: Operational", []);
  const lastUpdated = useMemo(
    () =>
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  const resetForm = () =>
    setFormState({
      subject: "",
      description: "",
      category: "OTHER",
      priority: "MEDIUM",
    });

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedSubject = formState.subject.trim();
    const trimmedDescription = formState.description.trim();

    const errors: { subject?: string; description?: string; category?: string; priority?: string } = {};
    if (trimmedSubject.length < 5) {
      errors.subject = "Subject must be at least 5 characters.";
    }
    if (trimmedDescription.length < 10) {
      errors.description = "Description must be at least 10 characters.";
    }
    if (!categories.some((c) => c.value === formState.category)) {
      errors.category = "Please select a category.";
    }
    if (!["LOW", "MEDIUM", "HIGH", "URGENT"].includes(formState.priority)) {
      errors.priority = "Please select a valid priority.";
    }
    setFormErrors(errors);
    if (Object.keys(errors).length) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    try {
      const payload = {
        subject: trimmedSubject,
        description: trimmedDescription,
        priority: formState.priority,
        category: formState.category,
      };
      await createTicket(payload).unwrap();
      toast.success("Ticket created successfully. A support agent will respond shortly.");
      resetForm();
      setFormErrors({});
      refetch();
    } catch (err: any) {
      const message =
        err?.data?.message ||
        err?.message ||
        "Unable to create ticket. Please try again.";
      toast.error(message);
    }
  };

  const tickets = data?.items ?? [];

  const renderTickets = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((key) => (
            <div key={key} className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-[0_1px_0_rgba(15,23,42,0.06)]">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="mt-2 h-3 w-2/5" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Unable to load tickets. Please retry.
          <Button variant="link" className="px-2 text-rose-700" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      );
    }

    if (!tickets.length) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <HiOutlineChatBubbleLeftRight className="h-10 w-10 text-slate-400" />
          <p className="mt-3 text-sm font-semibold text-slate-800">No tickets yet</p>
          <p className="text-xs text-slate-500">
            Create your first ticket to reach our support team.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="border-b border-slate-100 last:border-b-0">
            <TicketRow
              ticket={ticket}
              onClick={() => navigate(`/vendor/support/tickets/${ticket.id}`)}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardContainer className="space-y-6 pb-12">
      <TitleBreadCrumbs title="Support" breadCrumbTitle="Vendor / Support" />

      <Card className="border-blue-100 bg-gradient-to-r from-blue-50 via-white to-emerald-50 shadow-sm">
        <CardContent className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-inner">
              <HiOutlineChatBubbleLeftRight className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                <span>{systemStatus}</span>
              </div>
              <p className="text-xs text-slate-500">
                Standard response time for technical queries is currently under 2 hours.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live Monitoring
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                Tickets
              </p>
              <CardTitle className="text-xl text-slate-900">Your support requests</CardTitle>
              <p className="text-xs text-slate-500">
                Click a ticket to view the full thread and updates.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-50 p-1">
              {statusFilters.map((filter) => (
                <button
                  key={filter.label}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition",
                    statusFilter === filter.value
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                  onClick={() => setStatusFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isFetching && !isLoading ? (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="h-2 w-2 animate-ping rounded-full bg-blue-500" />
                Refreshing tickets...
              </div>
            ) : null}
            {renderTickets()}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Create Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Subject
                </p>
                <Input
                  required
                  placeholder="Summary of the issue"
                  value={formState.subject}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, subject: event.target.value }))
                  }
                  aria-invalid={Boolean(formErrors.subject)}
                  className="h-12 rounded-2xl border-0 bg-slate-100 px-4 text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/40"
                />
              </div>
              {formErrors.subject ? (
                <p className="text-xs text-rose-600">{formErrors.subject}</p>
              ) : null}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Category
                </p>
              <Select
                value={formState.category}
                onValueChange={(value: SupportTicketCategory) =>
                  setFormState((prev) => ({ ...prev, category: value }))
                }
                required
              >
                <SelectTrigger className="h-12 rounded-2xl border-0 bg-slate-100 px-4 text-sm shadow-none focus:ring-2 focus:ring-blue-500/40">
                  <SelectValue placeholder="Technical Issue" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Urgency
                </p>
                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
                  {(["LOW", "MEDIUM", "HIGH"] as SupportTicketPriority[]).map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormState((prev) => ({ ...prev, priority }))}
                      className={cn(
                        "rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition",
                        formState.priority === priority
                          ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-200"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {priorityMeta[priority].label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Description
                </p>
                <Textarea
                  required
                  rows={5}
                  placeholder="Detailed explanation of the problem..."
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, description: event.target.value }))
                  }
                  aria-invalid={Boolean(formErrors.description)}
                  className="min-h-[120px] rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/40"
                />
              </div>
              {formErrors.description ? (
                <p className="text-xs text-rose-600">{formErrors.description}</p>
              ) : null}
              <Button
                type="submit"
                className="h-12 w-full rounded-2xl bg-blue-600 text-sm font-semibold  hover:bg-blue-700"
                disabled={isCreating || !formState.subject || !formState.description}
              >
                {isCreating ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardContainer>
  );
};

function TicketRow({ ticket, onClick }: { ticket: SupportTicket; onClick: () => void }) {
  const status = statusMeta[ticket.status];
  const priority = priorityMeta[ticket.priority];
  const priorityDotClass =
    ticket.priority === "URGENT"
      ? "bg-rose-500"
      : ticket.priority === "HIGH"
        ? "bg-amber-500"
        : ticket.priority === "MEDIUM"
          ? "bg-blue-500"
          : "bg-slate-400";
  const updateCount = getTicketUpdateCount(ticket);
  const relativeTime = formatRelativeTime(ticket.lastActivityAt || ticket.updatedAt);
  const statusNote =
    ticket.status === "RESOLVED"
      ? "Closed by Support"
      : ticket.status === "WAITING"
        ? "SLA: 45m remaining"
        : `SLA: ${ticket.priority === "URGENT" ? "45m remaining" : "6h remaining"}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left transition hover:bg-slate-50/80"
    >
      <div className="flex items-center gap-4 px-5 py-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
            ticket.status === "RESOLVED"
              ? "bg-emerald-50 text-emerald-500"
              : ticket.status === "WAITING"
                ? "bg-amber-50 text-amber-500"
                : "bg-blue-50 text-blue-500"
            )}
          >
            <HiOutlineChatBubbleLeftRight className="h-5 w-5" />
          </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {ticket.ticketNumber}
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
              {ticket.subject}
            </p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              {relativeTime}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              {updateCount} updates
            </span>
            <span
              className={cn(
                "flex items-center gap-1.5 font-semibold uppercase tracking-[0.16em]",
                ticket.priority === "URGENT"
                  ? "text-rose-600"
                  : ticket.priority === "HIGH"
                    ? "text-amber-600"
                  : ticket.priority === "MEDIUM"
                    ? "text-blue-600"
                    : "text-slate-500"
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", priorityDotClass)} />
              {priority.label}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge
            variant="outline"
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
              status.badgeClass
            )}
          >
            {status.label}
          </Badge>
          <p className="text-[11px] font-medium text-slate-500">{statusNote}</p>
        </div>
      </div>
    </button>
  );
}

export default VendorSupport;
