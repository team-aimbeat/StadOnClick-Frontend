import StatsCard from "@/components/shared/StatsCard";
import StatCardSkeleton from "@/components/skeletons/StatCardSkeleton";
import {
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineHeart,
} from "react-icons/hi2";
import { formatRelativeTime, formatUptime } from "@/features/systemHealth/systemHealth.utils";
import {
  OVERALL_STATUS,
  type HealthLiveResponse,
  type HealthReadyResponse,
  type OverallStatus,
} from "@/features/systemHealth/systemHealth.types";

type HealthStatCardsProps = {
  overallStatus: OverallStatus;
  ready?: HealthReadyResponse | null;
  live?: HealthLiveResponse | null;
  nowMs: number;
  isLoading?: boolean;
};

const statusCopy: Record<OverallStatus, { label: string; accent: "green" | "yellow" | "red" | "cyan" }> = {
  [OVERALL_STATUS.operational]: { label: "All systems operational", accent: "green" },
  [OVERALL_STATUS.degraded]: { label: "Degraded", accent: "yellow" },
  [OVERALL_STATUS.down]: { label: "Down", accent: "red" },
  [OVERALL_STATUS.unknown]: { label: "Checking status", accent: "cyan" },
};

export default function HealthStatCards({
  overallStatus,
  ready,
  live,
  nowMs,
  isLoading,
}: HealthStatCardsProps) {
  const lastChecked = ready?.timestamp ?? live?.timestamp ?? null;
  const startedAt = ready?.startedAt ?? live?.startedAt ?? null;
  const uptimeSeconds = ready?.uptimeSeconds ?? live?.uptimeSeconds ?? null;

  if (isLoading && !ready && !live) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <StatCardSkeleton key={`stat-skeleton-${idx}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        title="Overall Status"
        value={statusCopy[overallStatus].label}
        subtitle="Derived from readiness checks"
        icon={HiOutlineHeart}
        accentColor={statusCopy[overallStatus].accent}
        showTrendIcon={false}
      />

      <StatsCard
        title="Uptime"
        value={formatUptime(uptimeSeconds ?? undefined)}
        subtitle="Since last restart"
        icon={HiOutlineClock}
        accentColor="blue"
        showTrendIcon={false}
      />

      <div title={startedAt ?? undefined}>
        <StatsCard
          title="Started At"
          value={startedAt ? new Date(startedAt).toLocaleString() : "—"}
          subtitle="Local time"
          icon={HiOutlineCalendarDays}
          accentColor="purple"
          showTrendIcon={false}
        />
      </div>

      <StatsCard
        title="Last Checked"
        value={formatRelativeTime(lastChecked ?? undefined, nowMs)}
        subtitle={lastChecked ? new Date(lastChecked).toLocaleTimeString() : "—"}
        icon={HiOutlineClock}
        accentColor="cyan"
        showTrendIcon={false}
      />
    </div>
  );
}
