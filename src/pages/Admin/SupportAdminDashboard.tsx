import { useEffect, useMemo } from "react";
import type React from "react";
import { HiBolt, HiChatBubbleLeftRight, HiClock, HiInboxStack } from "react-icons/hi2";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import StatsCard from "@/components/shared/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAdminListTicketsQuery, useAdminUnreadCountQuery } from "@/features/support/supportApi";
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

  return (
    <div className="space-y-5 px-2 sm:px-4">
      <TitleBreadCrumbs title="Support Dashboard" breadCrumbTitle="Admin / Support" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Open tickets"
          value={stats.open}
          subtitle="Actively handled now"
          trend="neutral"
          icon={HiInboxStack}
          accentColor="blue"
        />
        <StatsCard
          title="Waiting on vendor"
          value={stats.waiting}
          subtitle="Follow up pending"
          trend="neutral"
          icon={HiChatBubbleLeftRight}
          accentColor="yellow"
        />
        <StatsCard
          title="Unassigned"
          value={stats.unassigned}
          subtitle="Needs owner"
          trend="down"
          changeValue={stats.unassigned}
          icon={HiBolt}
          accentColor="purple"
        />
        <StatsCard
          title="Avg response time"
          value="—"
          subtitle="Based on last 50 tickets"
          icon={HiClock}
          accentColor="green"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="shadow-sm">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Activity feed</CardTitle>
            <Button variant="outline" size="sm" onClick={() => refetchUnread()}>
              Refresh
            </Button>
          </CardHeader>
          <Separator />
          <CardContent>
            {isFetching ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <ScrollArea className="h-[260px] pr-3">
                <div className="space-y-3">
                  {(tickets?.items ?? []).slice(0, 12).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-xs"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">{item.subject}</p>
                        <p className="text-xs text-slate-500">
                          {item.vendor.businessName} • {item.ticketNumber}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[11px]">
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>System status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <p className="text-sm font-semibold text-slate-900">
                  {connected ? "Realtime connected" : "Realtime disconnected"}
                </p>
              </div>
              <Badge variant={connected ? "outline" : "destructive"} className="text-[11px]">
                {connected ? "Live" : "Offline"}
              </Badge>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Unread tickets</span>
                <Badge variant="outline" className="text-[11px]">
                  {unreadData?.total ?? unreadTotal}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-slate-500">New vendor replies will appear here instantly.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
