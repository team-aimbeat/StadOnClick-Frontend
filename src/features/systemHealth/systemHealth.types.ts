export const HEALTH_CHECK_STATUS = {
  up: "up",
  down: "down",
} as const;

export type HealthCheckStatus = (typeof HEALTH_CHECK_STATUS)[keyof typeof HEALTH_CHECK_STATUS];

export type HealthCheck = {
  status: HealthCheckStatus;
  latencyMs?: number | null;
};

export type HealthReadyResponse = {
  status: string;
  uptimeSeconds: number;
  startedAt: string;
  timestamp: string;
  checks: Record<string, HealthCheck>;
};

export type HealthLiveResponse = {
  status: string;
  uptimeSeconds: number;
  startedAt: string;
  timestamp: string;
};

export const OVERALL_STATUS = {
  operational: "operational",
  degraded: "degraded",
  down: "down",
  unknown: "unknown",
} as const;

export type OverallStatus = (typeof OVERALL_STATUS)[keyof typeof OVERALL_STATUS];
