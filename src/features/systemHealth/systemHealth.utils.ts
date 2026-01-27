import { HEALTH_CHECK_STATUS, OVERALL_STATUS, type HealthCheck, type OverallStatus } from "./systemHealth.types";

const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatUptime(seconds?: number | null) {
  if (!seconds || seconds < 0) return "—";

  const parts: Array<{ label: string; value: number }> = [];
  let remaining = Math.floor(seconds);

  const days = Math.floor(remaining / DAY);
  if (days) {
    parts.push({ label: "d", value: days });
    remaining -= days * DAY;
  }

  const hours = Math.floor(remaining / HOUR);
  if (hours) {
    parts.push({ label: "h", value: hours });
    remaining -= hours * HOUR;
  }

  const minutes = Math.floor(remaining / MINUTE);
  if (minutes) {
    parts.push({ label: "m", value: minutes });
    remaining -= minutes * MINUTE;
  }

  if (!parts.length) {
    parts.push({ label: "s", value: Math.max(remaining, 0) });
  } else if (parts.length < 2 && remaining) {
    const secondsLeft = Math.floor(remaining / SECOND);
    if (secondsLeft) {
      parts.push({ label: "s", value: secondsLeft });
    }
  }

  return parts.slice(0, 2).map((part) => `${part.value}${part.label}`).join(" ");
}

export function formatRelativeTime(timestamp?: string | number | null, nowMs: number = Date.now()) {
  if (!timestamp) return "—";

  const targetMs = typeof timestamp === "number" ? timestamp : new Date(timestamp).getTime();
  if (Number.isNaN(targetMs)) return "—";

  const diffMs = Math.max(nowMs - targetMs, 0);
  if (diffMs < 5000) return "just now";
  if (diffMs < 60_000) return `${Math.floor(diffMs / 1000)}s ago`;
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)}h ago`;
  return `${Math.floor(diffMs / 86_400_000)}d ago`;
}

export function deriveOverallStatus(checks?: Record<string, HealthCheck>): OverallStatus {
  if (!checks || Object.keys(checks).length === 0) {
    return OVERALL_STATUS.unknown;
  }

  const values = Object.values(checks);
  if (values.some((check) => check.status === HEALTH_CHECK_STATUS.down)) {
    return OVERALL_STATUS.down;
  }

  if (values.every((check) => check.status === HEALTH_CHECK_STATUS.up)) {
    return OVERALL_STATUS.operational;
  }

  return OVERALL_STATUS.degraded;
}
