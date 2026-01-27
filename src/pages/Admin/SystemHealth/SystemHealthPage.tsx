import { useEffect, useMemo, useState } from "react";
import { HiOutlineExclamationTriangle, HiOutlineShieldCheck } from "react-icons/hi2";

import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { DashboardContainer, DashboardSection } from "@/components/dashboard";
import { useGetHealthLiveQuery, useGetHealthReadyQuery } from "@/features/systemHealth/systemHealthApi";
import { deriveOverallStatus, formatUptime } from "@/features/systemHealth/systemHealth.utils";
import { OVERALL_STATUS } from "@/features/systemHealth/systemHealth.types";
import { useHealthSocket } from "@/lib/healthSocket";
import HealthChecksTable from "./HealthChecksTable";
import HealthStatCards from "./HealthStatCards";
import { cn } from "@/lib/utils";

const HEALTH_POLL_INTERVAL_MS = 20_000;

export default function SystemHealthPage() {
  const { isConnected: socketConnected, latestReady } = useHealthSocket();

  const {
    data: liveData,
    isLoading: liveLoading,
    isError: liveError,
  } = useGetHealthLiveQuery(undefined, {
    pollingInterval: socketConnected ? 0 : HEALTH_POLL_INTERVAL_MS,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const {
    data: readyData,
    isLoading: readyLoading,
    isError: readyError,
  } = useGetHealthReadyQuery(undefined, {
    pollingInterval: socketConnected ? 0 : HEALTH_POLL_INTERVAL_MS,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);

  const effectiveReady = latestReady ?? readyData;
  const effectiveLive = liveData;
  const baseOverallStatus = useMemo(
    () => deriveOverallStatus(effectiveReady?.checks),
    [effectiveReady?.checks]
  );

  const showLiveError = liveError;
  const showReadyError = !liveError && readyError;
  const isLoading = (readyLoading || liveLoading) && !effectiveReady && !effectiveLive;
  const overallStatus = showLiveError
    ? OVERALL_STATUS.down
    : showReadyError && !effectiveReady
    ? OVERALL_STATUS.degraded
    : baseOverallStatus;

  return (
    <div className="min-h-screen pb-12 text-slate-900">
      <DashboardContainer className="space-y-6">
        <TitleBreadCrumbs
          title="System Health & Infrastructure Status"
          breadCrumbTitle="Admin / System / Health"
        />

        {(showLiveError || showReadyError) && (
          <div
            className={cn(
              "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium",
              showLiveError
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-amber-200 bg-amber-50 text-amber-800"
            )}
          >
            <HiOutlineExclamationTriangle className="mt-0.5 h-4 w-4" aria-hidden />
            <span>
              {showLiveError
                ? "Service is not responding"
                : "Service running but dependencies unavailable"}
            </span>
          </div>
        )}

        <DashboardSection>
          <HealthStatCards
            overallStatus={overallStatus}
            ready={effectiveReady}
            live={effectiveLive}
            nowMs={nowMs}
            isLoading={isLoading}
          />
        </DashboardSection>

        <DashboardSection>
          <HealthChecksTable checks={effectiveReady?.checks} isLoading={readyLoading} />
        </DashboardSection>

        <DashboardSection>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  liveError ? "bg-rose-500" : "bg-emerald-500 animate-pulse"
                )}
              />
              <span>{liveError ? "Service status unknown" : "Service is alive"}</span>
            </div>

            <div className="mt-4 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Current Uptime</p>
                <p className="mt-1 text-base font-semibold text-slate-800">
                  {formatUptime(effectiveLive?.uptimeSeconds)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Started At</p>
                <p className="mt-1 text-base font-semibold text-slate-800">
                  {effectiveLive?.startedAt
                    ? new Date(effectiveLive.startedAt).toLocaleString()
                    : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Heartbeat</p>
                <div className="mt-1 flex items-center gap-2 text-base font-semibold text-slate-800">
                  <HiOutlineShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden />
                  {liveError ? "Awaiting response" : "Healthy"}
                </div>
              </div>
            </div>
          </div>
        </DashboardSection>
      </DashboardContainer>
    </div>
  );
}
