import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Inbox, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import {
  useModeratorAcceptEscalationMutation,
  useModeratorCommentEscalationMutation,
  useModeratorGetEscalationQuery,
  useModeratorListEscalationsQuery,
  useModeratorListNotificationsQuery,
  useModeratorMarkNotificationReadMutation,
  useModeratorUpdateEscalationStatusMutation,
} from "@/features/escalations/escalationApi";
import type {
  EscalationCategory,
  EscalationInboxItem,
  EscalationSeverity,
  EscalationStatus,
} from "@/features/escalations/escalation.types";
import { useAppSelector } from "@/app/hooks";
import { formatRelativeTime } from "@/components/notifications/notification.utils";
import { formatEscalationLabel } from "@/features/escalations/escalation.utils";

import ModeratorEscalationDetailView from "./ModeratorEscalationDetailView";

const severityTone: Record<EscalationSeverity, string> = {
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
  MEDIUM: "bg-blue-50 text-blue-700 border-blue-200",
  HIGH: "bg-amber-50 text-amber-700 border-amber-200",
  URGENT: "bg-rose-50 text-rose-700 border-rose-200",
};

const statusTone: Record<EscalationStatus, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-200",
  BLOCKED: "bg-amber-50 text-amber-700 border-amber-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-slate-100 text-slate-600 border-slate-200",
};

const statusOptions: EscalationStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "BLOCKED",
  "RESOLVED",
  "REJECTED",
];

const severityOptions: EscalationSeverity[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const categoryOptions: EscalationCategory[] = [
  "REFUND",
  "BOOKING",
  "KYC",
  "SUSPENSION",
  "PAYMENT",
  "PAYOUT",
  "SECURITY",
  "OTHER",
];

export default function ModeratorEscalationsInbox() {
  const authUser = useAppSelector((state) => state.auth.user);
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [status, setStatus] = useState<EscalationStatus | undefined>(
    (searchParams.get("status") as EscalationStatus) || undefined
  );
  const [category, setCategory] = useState<EscalationCategory | undefined>(
    (searchParams.get("category") as EscalationCategory) || undefined
  );
  const [severity, setSeverity] = useState<EscalationSeverity | undefined>(
    (searchParams.get("severity") as EscalationSeverity) || undefined
  );
  const [assigned, setAssigned] = useState<"me" | "unassigned" | "all">(
    (searchParams.get("assigned") as "me" | "unassigned" | "all") || "all"
  );

  const { data, isFetching } = useModeratorListEscalationsQuery({
    search: search || undefined,
    status,
    category,
    severity,
    assigned,
  });

  const selectedId = searchParams.get("id") || data?.items?.[0]?.id || null;

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedId) params.set("id", selectedId);
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (severity) params.set("severity", severity);
    if (assigned && assigned !== "all") params.set("assigned", assigned);
    setSearchParams(params, { replace: true });
  }, [assigned, category, search, selectedId, setSearchParams, severity, status]);

  const { data: escalation, isFetching: isDetailLoading } = useModeratorGetEscalationQuery(
    selectedId ?? "",
    { skip: !selectedId }
  );

  const [acceptEscalation, { isLoading: isAccepting }] =
    useModeratorAcceptEscalationMutation();
  const [updateStatus, { isLoading: isUpdating }] =
    useModeratorUpdateEscalationStatusMutation();
  const [commentEscalation, { isLoading: isCommenting }] =
    useModeratorCommentEscalationMutation();

  const { data: notifications } = useModeratorListNotificationsQuery();
  const [markNotificationRead] = useModeratorMarkNotificationReadMutation();

  useEffect(() => {
    if (!selectedId || !notifications?.length) return;
    const unread = notifications.filter(
      (notification) => notification.entityId === selectedId && !notification.readAt
    );
    unread.forEach((notification) => {
      markNotificationRead(notification.id);
    });
  }, [markNotificationRead, notifications, selectedId]);

  const handleSelect = (item: EscalationInboxItem) => {
    const params = new URLSearchParams(searchParams);
    params.set("id", item.id);
    setSearchParams(params, { replace: true });
  };

  const handleAccept = async () => {
    if (!selectedId) return;
    try {
      await acceptEscalation(selectedId).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to accept escalation");
    }
  };

  const handleUpdateStatus = async (nextStatus: EscalationStatus, summary?: string) => {
    if (!selectedId) return;
    try {
      await updateStatus({ id: selectedId, status: nextStatus, resolutionSummary: summary }).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to update status");
    }
  };

  const handleComment = async (body: string) => {
    if (!selectedId) return;
    try {
      await commentEscalation({ id: selectedId, body }).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to add comment");
    }
  };

  return (
    <div className="space-y-6 px-3 pb-8 sm:px-6">
      <TitleBreadCrumbs title="Escalations Inbox" breadCrumbTitle="Moderator / Escalations" />

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader className="space-y-4 border-b border-slate-200/80 bg-slate-50/70">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-lg text-slate-900">Escalation queue</CardTitle>
                <p className="text-sm text-slate-600">Filter and open escalations fast.</p>
              </div>
              <Badge
                variant="outline"
                className="rounded-full border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600"
              >
                Total {data?.total ?? 0}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by ticket number, vendor, or reason"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-10 rounded-xl border-slate-200 bg-white pl-9"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FilterSelect
                  placeholder="Status"
                  value={status ?? "all"}
                  onChange={(value) => setStatus(value === "all" ? undefined : (value as EscalationStatus))}
                  options={statusOptions}
                  allLabel="All statuses"
                />
                <FilterSelect
                  placeholder="Severity"
                  value={severity ?? "all"}
                  onChange={(value) =>
                    setSeverity(value === "all" ? undefined : (value as EscalationSeverity))
                  }
                  options={severityOptions}
                  allLabel="All severities"
                />
                <FilterSelect
                  placeholder="Category"
                  value={category ?? "all"}
                  onChange={(value) =>
                    setCategory(value === "all" ? undefined : (value as EscalationCategory))
                  }
                  options={categoryOptions}
                  allLabel="All categories"
                />
                <FilterSelect
                  placeholder="Assigned"
                  value={assigned}
                  onChange={(value) => setAssigned(value as "me" | "unassigned" | "all")}
                  options={["me", "unassigned"]}
                  allLabel="All"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            {isFetching && !data ? (
              <div className="space-y-2">
                {[1, 2, 3].map((key) => (
                  <Skeleton key={key} className="h-16 w-full rounded-2xl" />
                ))}
              </div>
            ) : data?.items?.length ? (
              <div className="space-y-2">
                {data.items.map((item) => {
                  const isActive = item.id === selectedId;
                  const assignedLabel =
                    item.assignedToModeratorId === authUser?.id
                      ? "Me"
                      : item.assignedToModeratorId
                        ? "Assigned"
                        : "Unassigned";
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={cn(
                        "group w-full rounded-2xl border px-3 py-3 text-left transition focus:outline-none",
                        isActive
                          ? "border-blue-200 bg-blue-50/70 shadow-sm ring-1 ring-blue-100"
                          : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
                              {item.ticket.ticketNumber}
                            </span>
                            <span className="truncate">{item.ticket.vendor.businessName}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">{item.reason}</p>
                          <p className="text-xs text-slate-500">{item.ticket.subject}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-right">
                          <Badge
                            variant="outline"
                            className={cn("border text-[10px] font-semibold", severityTone[item.severity])}
                          >
                            {formatEscalationLabel(item.severity)}
                          </Badge>
                          <span className="text-[11px] text-slate-500">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("border text-[10px] font-semibold", statusTone[item.status])}
                        >
                          {formatEscalationLabel(item.status)}
                        </Badge>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {formatEscalationLabel(item.category)}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {assignedLabel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <Inbox className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No escalations found</p>
                <p className="text-xs text-slate-500">Try changing filters or clearing search.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm">
          <ModeratorEscalationDetailView
            escalation={escalation}
            isLoading={isDetailLoading}
            currentUserId={authUser?.id}
            onAccept={handleAccept}
            onUpdateStatus={handleUpdateStatus}
            onComment={handleComment}
            isAccepting={isAccepting}
            isUpdating={isUpdating}
            isCommenting={isCommenting}
          />
        </div>
      </div>
    </div>
  );
}

type FilterSelectProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel: string;
};

function FilterSelect({ placeholder, value, onChange, options, allLabel }: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-white text-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {formatEscalationLabel(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
