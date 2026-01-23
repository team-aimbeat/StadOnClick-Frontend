export type LeadPlanTier = "BASIC" | "PRO" | "UNLIMITED" | string;

export interface LeadPlan {
  id: string;
  name: LeadPlanTier;
  description?: string | null;
  price: number;
  currency?: string | null;
  leadsPerDay: number;
  durationDays: number;
  maxConcurrentLeads?: number | null;
  isActive: boolean;
  createdAt?: string;
}

export interface LeadSubscriptionStatus {
  isActive: boolean;
  planName?: string;
  leadsPerDay?: number;
  leadsToday?: number;
  expiresAt?: string;
  remainingToday?: number;
  receiptUrl?: string | null;
  receiptNumber?: string | null;
  paymentIntentId?: string | null;
}

export const tierRank = (tier: LeadPlanTier): number => {
  const normalized = tier.toUpperCase();
  if (normalized === "BASIC") return 1;
  if (normalized === "PRO") return 2;
  if (normalized === "UNLIMITED") return 3;
  return 99;
};

export const tierLabel = (tier: LeadPlanTier): string => {
  const normalized = tier.toUpperCase();
  if (normalized === "BASIC") return "Basic";
  if (normalized === "PRO") return "Pro";
  if (normalized === "UNLIMITED") return "Unlimited";
  return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
};

export const formatPrice = (value: number, currency?: string | null): string => {
  const safeCurrency = currency && currency.length === 3 ? currency : "USD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: safeCurrency,
    maximumFractionDigits: 0,
  }).format(value);
};
