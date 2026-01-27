import { Link } from "react-router-dom";
import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { HiBolt, HiCheckCircle, HiClock, HiInboxStack } from "react-icons/hi2";

import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import StatsCard from "@/components/shared/StatsCard";
import { cn } from "@/lib/utils";
import {
  useModeratorListEscalationsQuery,
} from "@/features/escalations/escalationApi";
import type { EscalationInboxItem, EscalationSeverity, EscalationStatus } from "@/features/escalations/escalation.types";

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

const buildTodayRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return { start: start.toISOString(), end: end.toISOString() };
};

export default function ModeratorDashboard() {
  const todayRange = useMemo(buildTodayRange, []);

  const { data: openData } = useModeratorListEscalationsQuery({
    status: "OPEN",
    page: 1,
    limit: 1,
  });

  const { data: inProgressData } = useModeratorListEscalationsQuery({
    status: "IN_PROGRESS",
    page: 1,
    limit: 1,
  });

  const { data: blockedData } = useModeratorListEscalationsQuery({
    status: "BLOCKED",
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

  const { data: recentData } = useModeratorListEscalationsQuery({
    page: 1,
    limit: 6,
  });

  const kpis = [
    {
      title: "Open escalations",
      value: openData?.total ?? 0,
      icon: HiInboxStack,
      accentColor: "cyan",
    },
    {
      title: "In progress",
      value: inProgressData?.total ?? 0,
      icon: HiClock,
      accentColor: "blue",
    },
    {
      title: "Blocked",
      value: blockedData?.total ?? 0,
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
    <div className="space-y-6 px-3 pb-8 sm:px-6">
      <TitleBreadCrumbs title="Moderator Dashboard" breadCrumbTitle="Moderator / Dashboard" />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <StatsCard key={kpi.title} {...kpi} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <Card className="border border-slate-200/80 shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Recent escalations</h3>
              <Link
                to="/moderator/escalations"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
              >
                View inbox
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {(recentData?.items ?? []).map((item: EscalationInboxItem) => (
                <Link
                  key={item.id}
                  to={`/moderator/escalations/${item.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.ticket.ticketNumber} - {item.ticket.vendor.businessName}
                    </p>
                    <p className="text-xs text-slate-500">{item.ticket.subject}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("border text-[10px] font-semibold", severityTone[item.severity])}
                    >
                      {item.severity}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn("border text-[10px] font-semibold", statusTone[item.status])}
                    >
                      {item.status}
                    </Badge>
                  </div>
                </Link>
              ))}
              {!recentData?.items?.length ? (
                <p className="text-sm text-slate-500">No escalations yet.</p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-sm">
          <CardContent className="space-y-4 p-5">
            <h3 className="text-lg font-semibold text-slate-900">Quick filters</h3>
            <div className="grid gap-3">
              <FilterLink label="Assigned to me" to="/moderator/escalations?assigned=me" />
              <FilterLink label="Unassigned" to="/moderator/escalations?assigned=unassigned" />
              <FilterLink label="Urgent" to="/moderator/escalations?severity=URGENT" />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function FilterLink({ label, to }: { label: string; to: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
    >
      {label}
      <ArrowUpRight className="h-4 w-4 text-slate-400" />
    </Link>
  );
}
