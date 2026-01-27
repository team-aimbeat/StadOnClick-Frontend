import { Link } from "react-router-dom";
import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { HiBolt, HiCheckCircle, HiClock, HiInboxStack } from "react-icons/hi2";

import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Card, CardContent } from "@/components/ui/card";
import StatsCard from "@/components/shared/StatsCard";
import {
  useModeratorListEscalationsQuery,
} from "@/features/escalations/escalationApi";
import type { EscalationInboxItem, EscalationStatus } from "@/features/escalations/escalation.types";
import { formatEscalationLabel } from "@/features/escalations/escalation.utils";
import { cn } from "@/lib/utils";

const statusTone: Record<EscalationStatus, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-200",
  BLOCKED: "bg-amber-50 text-amber-700 border-amber-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-slate-100 text-slate-600 border-slate-200",
};

const OVERDUE_HOURS = 48;

const buildTodayRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return { start: start.toISOString(), end: end.toISOString() };
};

export default function ModeratorDashboard() {
  const todayRange = useMemo(buildTodayRange, []);
  const overdueCutoff = useMemo(() => Date.now() - OVERDUE_HOURS * 60 * 60 * 1000, []);

  const { data: openData } = useModeratorListEscalationsQuery({
    status: "OPEN",
    page: 1,
    limit: 1,
  });

  const { data: resolvedTodayData } = useModeratorListEscalationsQuery({
    status: "RESOLVED",
    resolvedFrom: todayRange.start,
    resolvedTo: todayRange.end,
    page: 1,
    limit: 1,
  });

  const { data: assignedToMeData } = useModeratorListEscalationsQuery({
    assigned: "me",
    page: 1,
    limit: 100,
  });

  const activeAssigned = useMemo(() => {
    return (assignedToMeData?.items ?? []).filter(
      (item) => !["RESOLVED", "REJECTED"].includes(item.status)
    );
  }, [assignedToMeData?.items]);

  const overdueCount = useMemo(() => {
    return activeAssigned.filter((item) => {
      const updatedAt = new Date(item.updatedAt).getTime();
      return Number.isFinite(updatedAt) && updatedAt < overdueCutoff;
    }).length;
  }, [activeAssigned, overdueCutoff]);

  const kpis = [
    {
      title: "Open escalations",
      value: openData?.total ?? 0,
      icon: HiInboxStack,
      accentColor: "cyan",
    },
    {
      title: "Assigned to me",
      value: activeAssigned.length,
      icon: HiClock,
      accentColor: "blue",
    },
    {
      title: "Overdue",
      value: overdueCount,
      icon: HiBolt,
      accentColor: "yellow",
    },
    {
      title: "Resolved today",
      value: resolvedTodayData?.total ?? 0,
      icon: HiCheckCircle,
      accentColor: "green",
    },
  ];

  return (
    <div className="space-y-6">
      <TitleBreadCrumbs title="Moderator Dashboard" breadCrumbTitle="Admin / Moderator / Dashboard" />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <StatsCard key={kpi.title} {...kpi} />
        ))}
      </section>

      <section>
        <Card className="border border-slate-200/80 shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">My active escalations</h3>
                <p className="text-sm text-slate-500">Focus on items awaiting your action.</p>
              </div>
              <Link
                to="/admin/moderator/escalations?assigned=me"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
              >
                View queue
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {activeAssigned.length ? (
              <div className="divide-y divide-slate-200/80 rounded-xl border border-slate-200/80 bg-white">
                {activeAssigned.slice(0, 6).map((item: EscalationInboxItem) => (
                  <Link
                    key={item.id}
                    to={`/admin/moderator/escalations/${item.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-slate-50"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">
                        {item.ticket.vendor.businessName}
                        <span className="text-slate-500"> · {item.ticket.ticketNumber}</span>
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1">{item.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {formatEscalationLabel(item.category)}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          statusTone[item.status]
                        )}
                      >
                        {formatEscalationLabel(item.status)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No active escalations assigned to you.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

