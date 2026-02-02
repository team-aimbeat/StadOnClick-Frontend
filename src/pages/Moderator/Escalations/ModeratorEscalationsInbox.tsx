import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Inbox, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import {
  useModeratorGetEscalationQuery,
  useModeratorListEscalationsQuery,
  useModeratorListNotificationsQuery,
  useModeratorMarkNotificationReadMutation,
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

const statusTone: Record<EscalationStatus, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-200",
  BLOCKED: "bg-amber-50 text-amber-700 border-amber-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-slate-100 text-slate-600 border-slate-200",
};

const severityTone: Record<EscalationSeverity, string> = {
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
  MEDIUM: "bg-blue-50 text-blue-700 border-blue-200",
  HIGH: "bg-amber-50 text-amber-700 border-amber-200",
  URGENT: "bg-rose-50 text-rose-700 border-rose-200",
};

const statusOptions: EscalationStatus[] = ["OPEN", "IN_PROGRESS", "BLOCKED", "RESOLVED", "REJECTED"];
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

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

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
  const [assigned, setAssigned] = useState<"me" | "unassigned" | "all">(
    (searchParams.get("assigned") as "me" | "unassigned" | "all") || "all"
  );

  const { data, isFetching } = useModeratorListEscalationsQuery({
    search: search || undefined,
    status,
    category,
    assigned,
  });

  const selectedId = searchParams.get("id") || data?.items?.[0]?.id || null;

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedId) params.set("id", selectedId);
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (assigned && assigned !== "all") params.set("assigned", assigned);
    setSearchParams(params, { replace: true });
  }, [assigned, category, search, selectedId, setSearchParams, status]);

  const { data: escalation, isFetching: isDetailLoading } = useModeratorGetEscalationQuery(
    selectedId ?? "",
    { skip: !selectedId }
  );

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

  const selectedItem = useMemo(
    () => data?.items?.find((item) => item.id === selectedId) ?? null,
    [data?.items, selectedId]
  );

  const ticketSnapshot = escalation?.ticket ?? selectedItem?.ticket ?? null;
  const vendorName = ticketSnapshot?.vendor?.businessName ?? "Vendor";
  const ticketNumber = ticketSnapshot?.ticketNumber ?? "Ticket";
  const ticketId = selectedItem?.ticketId ?? escalation?.ticketId ?? "";
  const selectedEscalationId = selectedId ?? escalation?.id ?? "";
  const previewStatus = escalation?.status ?? selectedItem?.status;
  const previewCategory = escalation?.category ?? selectedItem?.category;
  const previewReason = escalation?.reason ?? selectedItem?.reason ?? "Escalation";
  const hasSelection = Boolean(selectedId);

  return (
    <div className="space-y-6">
      <TitleBreadCrumbs title="Escalations Inbox" breadCrumbTitle="Admin / Moderator / Escalations" />

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-sm">
          <div className="space-y-4 border-b border-slate-200/80 bg-slate-50/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Queue</p>
                <h2 className="text-lg font-semibold text-slate-900">Escalation inbox</h2>
                <p className="text-sm text-slate-600">Find work fast and jump into action.</p>
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
                  placeholder="Search by vendor, ticket, or reason"
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
                  placeholder="Assigned"
                  value={assigned}
                  onChange={(value) => setAssigned(value as "me" | "unassigned" | "all")}
                  options={["me", "unassigned"]}
                  allLabel="All"
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
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-200/70">
            {isFetching && !data ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3].map((key) => (
                  <Skeleton key={key} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : data?.items?.length ? (
              data.items.map((item) => {
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
                      "group flex w-full items-center gap-3 px-4 py-3 text-left transition",
                      isActive ? "bg-slate-100" : "hover:bg-slate-50"
                    )}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-900">
                          {item.ticket.vendor.businessName}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {item.ticket.ticketNumber}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {formatEscalationLabel(item.category)}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">{assignedLabel}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 line-clamp-1">{item.reason}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant="outline"
                        className={cn("border text-[10px] font-semibold", statusTone[item.status])}
                      >
                        {formatEscalationLabel(item.status)}
                      </Badge>
                      <span className="text-[11px] text-slate-500">
                        {formatRelativeTime(item.updatedAt ?? item.createdAt)}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <Inbox className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No escalations found</p>
                <p className="text-xs text-slate-500">Try adjusting filters or clearing search.</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-sm">
          {!hasSelection ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-500">
              <Inbox className="h-6 w-6 text-slate-400" />
              Select an escalation to preview details.
            </div>
          ) : isDetailLoading && !escalation ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                      {ticketNumber}
                    </span>
                    {previewStatus ? (
                      <Badge
                        variant="outline"
                        className={cn("border text-[11px] font-semibold", statusTone[previewStatus])}
                      >
                        {formatEscalationLabel(previewStatus)}
                      </Badge>
                    ) : null}
                    {escalation?.severity ? (
                      <Badge
                        variant="outline"
                        className={cn("border text-[11px] font-semibold", severityTone[escalation.severity])}
                      >
                        {formatEscalationLabel(escalation.severity)}
                      </Badge>
                    ) : null}
                    {previewCategory ? (
                      <Badge variant="outline" className="border text-[11px] font-semibold">
                        {formatEscalationLabel(previewCategory)}
                      </Badge>
                    ) : null}
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {previewReason}
                  </h2>
                  <p className="text-sm text-slate-600">{vendorName}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm" disabled={!ticketId}>
                    <Link to={`/admin/support/inbox?ticketId=${ticketId}`}>Open ticket</Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm" disabled={!ticketId}>
                    <Link to={`/admin/chat?ticketId=${ticketId}`}>Open support chat</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to={`/admin/moderator/escalations/${selectedEscalationId}`}>Open details</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Summary
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {escalation?.description ?? previewReason}
                    </p>
                  </div>

                  {ticketSnapshot ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Ticket context
                      </p>
                      <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-500">Subject</span>
                          <span className="font-semibold text-slate-900">
                            {ticketSnapshot.subject ?? "-"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-500">Last activity</span>
                          <span className="font-semibold text-slate-900">
                            {formatDateTime(ticketSnapshot.lastActivityAt)}
                          </span>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-slate-500">Last preview</span>
                          <span className="max-w-[260px] text-right text-slate-700">
                            {escalation?.ticket?.lastMessagePreview ?? "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Metadata
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <DetailRow label="Created" value={formatDateTime(escalation?.createdAt)} />
                      <DetailRow label="Updated" value={formatDateTime(escalation?.updatedAt)} />
                      <DetailRow
                        label="Assigned"
                        value={
                          escalation?.assignedToModerator
                            ? `${escalation.assignedToModerator.firstName} ${
                                escalation.assignedToModerator.lastName ?? ""
                              }`.trim()
                            : "Unassigned"
                        }
                      />
                      <DetailRow
                        label="Created by"
                        value={
                          escalation?.createdBy
                            ? `${escalation.createdBy.firstName} ${escalation.createdBy.lastName ?? ""}`.trim()
                            : "-"
                        }
                      />
                    </div>
                  </div>

                  {escalation?.resolutionSummary ? (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 text-sm text-emerald-800">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
                        Resolution summary
                      </p>
                      <p className="mt-2">{escalation.resolutionSummary}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}


