export type LeadPlanTier = "BASIC" | "PRO" | "UNLIMITED";

export interface LeadPlan {
  id: string;
  name: LeadPlanTier;
  planId: string;
  price: number;
  currency?: string;
  leadsPerDay: number;
  durationDays: number;
  maxConcurrentLeads?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateLeadPlanRequest {
  name: LeadPlanTier;
  price: number;
  currency?: string;
  leadsPerDay: number;
  durationDays: number;
  maxConcurrentLeads?: number;
  isActive?: boolean;
}

export interface UpdateLeadPlanRequest {
  price?: number;
  currency?: string;
  leadsPerDay?: number;
  durationDays?: number;
  maxConcurrentLeads?: number | null;
  isActive?: boolean;
}
