import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { HiCheckCircle, HiClock, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

import { useAppDispatch } from "@/app/hooks";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  HIGH: { label: "High", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
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

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

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
      <div className="space-y-2">
        {tickets.map((ticket) => (
          <TicketRow key={ticket.id} ticket={ticket} onClick={() => navigate(`/vendor/support/tickets/${ticket.id}`)} />
        ))}
      </div>
    );
  };

  return (
    <DashboardContainer className="space-y-6 pb-12">
      <TitleBreadCrumbs title="Support" breadCrumbTitle="Vendor / Support" />

      <Card className="border-blue-100 bg-gradient-to-r from-emerald-50 via-white to-blue-50 shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
              Status
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              {systemStatus}
            </div>
            <p className="text-xs text-slate-500">Last updated {lastUpdated}</p>
          </div>
          <div className="flex flex-col gap-1 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <HiClock className="h-4 w-4 text-slate-400" />
              Response SLA: under 2 hours
            </div>
            <div className="flex items-center gap-2">
              <HiOutlineChatBubbleLeftRight className="h-4 w-4 text-slate-400" />
              Chat opens inside a ticket when an agent joins
            </div>
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
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Create ticket</p>
            <CardTitle className="text-lg">Tell us what you need</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleCreate}>
            <Input
              required
              placeholder="Subject"
              value={formState.subject}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, subject: event.target.value }))
              }
              aria-invalid={Boolean(formErrors.subject)}
            />
            {formErrors.subject ? (
              <p className="text-xs text-rose-600">{formErrors.subject}</p>
            ) : null}
              <Select
                value={formState.category}
                onValueChange={(value: SupportTicketCategory) =>
                  setFormState((prev) => ({ ...prev, category: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={formState.priority}
                onValueChange={(value: SupportTicketPriority) =>
                  setFormState((prev) => ({ ...prev, priority: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {["LOW", "MEDIUM", "HIGH"].map((priority) => (
                    <SelectItem key={priority} value={priority as SupportTicketPriority}>
                      {priorityMeta[priority as SupportTicketPriority].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            <Textarea
              required
              rows={4}
              placeholder="Describe the issue with as much detail as possible"
              value={formState.description}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, description: event.target.value }))
              }
              aria-invalid={Boolean(formErrors.description)}
            />
            {formErrors.description ? (
              <p className="text-xs text-rose-600">{formErrors.description}</p>
            ) : null}
              <Button
                type="submit"
                className="w-full"
                disabled={isCreating || !formState.subject || !formState.description}
              >
                {isCreating ? "Submitting..." : "Submit ticket"}
              </Button>
              <div className="flex items-start gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-800">
                <HiCheckCircle className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-semibold">Priority routing</p>
                  <p>We respond fastest to booking and payout blockers.</p>
                </div>
              </div>
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

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left transition hover:-translate-y-[1px] hover:shadow-[0_8px_24px_-18px_rgba(15,23,42,0.35)]"
    >
      <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-[0_1px_0_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                {ticket.ticketNumber}
              </span>
              <Separator orientation="vertical" className="h-4" />
              Updated {formatDate(ticket.updatedAt)}
            </div>
            <p className="text-sm font-semibold text-slate-900">{ticket.subject}</p>
            {ticket.lastMessagePreview ? (
              <p className="text-xs text-slate-500">{ticket.lastMessagePreview}</p>
            ) : null}
            {status?.description ? (
              <p className="text-xs text-slate-500">{status.description}</p>
            ) : null}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn("border text-[11px] font-semibold", status.badgeClass)}
              >
                {status.label}
              </Badge>
              <Badge
                variant="outline"
                className={cn("border text-[11px] font-semibold", priority.badgeClass)}
              >
                {priority.label}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500">Last activity {formatDate(ticket.lastActivityAt)}</p>
          </div>
        </div>
      </div>
    </button>
  );
}

export default VendorSupport;
