import { useEffect, useMemo } from "react";
import { HiBolt, HiChatBubbleLeftRight, HiClock, HiInboxStack } from "react-icons/hi2";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import StatsCard from "@/components/shared/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAdminListTicketsQuery, useAdminUnreadCountQuery } from "@/features/support/supportApi";
import type { SupportTicketStatus } from "@/features/support/support.types";
import { initSupportSocket } from "@/lib/supportSocket";

export default function SupportAdminDashboard() {
  const dispatch = useAppDispatch();
  const { connected, unreadTotal } = useAppSelector((s) => s.supportRealtime);

  useEffect(() => {
    dispatch(setPageTitle("Support Dashboard"));
    initSupportSocket();
  }, [dispatch]);

  const { data: tickets, isFetching } = useAdminListTicketsQuery({ page: 1, limit: 50 });
  const { data: unreadData, refetch: refetchUnread } = useAdminUnreadCountQuery();

  const stats = useMemo(() => {
    const items = tickets?.items ?? [];
    const open = items.filter((t) => t.status === "OPEN").length;
    const waiting = items.filter((t) => t.status === "WAITING").length;
    const unassigned = items.filter((t) => !t.assignedTo).length;
    return { open, waiting, unassigned, total: items.length };
  }, [tickets]);

  const statusTone: Record<SupportTicketStatus, string> = {
    OPEN: "bg-blue-50 text-blue-700 border-blue-200",
    WAITING: "bg-amber-50 text-amber-700 border-amber-200",
    RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="space-y-6 px-3 pb-8 sm:px-6">
      <TitleBreadCrumbs title="Support Dashboard" breadCrumbTitle="Admin / Support" />

      <div className="rounded-3xl border border-slate-200/80 bg-white/95 px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Support Overview
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">Realtime queue pulse</h2>
            <p className="text-sm text-slate-600">
              Stay on top of vendor replies and triage faster.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                connected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {connected ? "Realtime live" : "Realtime offline"}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
            >
              Unread {unreadData?.total ?? unreadTotal}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => refetchUnread()}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Open tickets"
          value={stats.open}
          subtitle="Actively handled now"
          trend="neutral"
          icon={HiInboxStack}
          accentColor="blue"
          className="shadow-sm"
        />
        <StatsCard
          title="Waiting on vendor"
          value={stats.waiting}
          subtitle="Follow up pending"
          trend="neutral"
          icon={HiChatBubbleLeftRight}
          accentColor="yellow"
          className="shadow-sm"
        />
        <StatsCard
          title="Unassigned"
          value={stats.unassigned}
          subtitle="Needs owner"
          trend="down"
          changeValue={stats.unassigned}
          icon={HiBolt}
          accentColor="purple"
          className="shadow-sm"
        />
        <StatsCard
          title="Avg response time"
          value="-"
          subtitle="Based on last 50 tickets"
          icon={HiClock}
          accentColor="green"
          className="shadow-sm"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/70">
            <div>
              <CardTitle className="text-lg text-slate-900">Activity feed</CardTitle>
              <p className="text-sm text-slate-600">Latest ticket updates across the queue.</p>
            </div>
            <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-xs">
              {stats.total} tickets
            </Badge>
          </CardHeader>
          <CardContent className="p-4">
            {isFetching ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <ScrollArea className="h-[280px] pr-3">
                {(tickets?.items ?? []).length ? (
                  <div className="space-y-2">
                    {(tickets?.items ?? []).slice(0, 12).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
                              {item.ticketNumber}
                            </span>
                            <span className="truncate">{item.vendor.businessName}</span>
                          </div>
                          <p className="truncate text-sm font-semibold text-slate-900">{item.subject}</p>
                          <p className="text-xs text-slate-500">
                            Last activity{" "}
                            {item.lastActivityAt
                              ? new Date(item.lastActivityAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "-"}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[11px] font-semibold ${statusTone[item.status]}`}
                        >
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[220px] flex-col items-center justify-center text-sm text-slate-500">
                    No tickets yet.
                  </div>
                )}
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader className="border-b border-slate-200/80 bg-slate-50/70">
            <CardTitle className="text-lg text-slate-900">System status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-emerald-500" : "bg-rose-500"}`} />
                  <p className="text-sm font-semibold text-slate-900">
                    {connected ? "Realtime connected" : "Realtime disconnected"}
                  </p>
                </div>
                <Badge variant={connected ? "outline" : "destructive"} className="text-[11px]">
                  {connected ? "Live" : "Offline"}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-slate-500">Socket updates are flowing in real time.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Unread tickets</span>
                <Badge variant="outline" className="text-[11px]">
                  {unreadData?.total ?? unreadTotal}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                New vendor replies will appear here instantly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
