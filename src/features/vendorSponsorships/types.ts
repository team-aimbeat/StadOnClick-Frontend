export type SponsorshipPlan = {
  id: string;
  name: string;
  price: number;
  currency: string;
  durationDays: number;
  priorityScore: number;
  impressionCap?: number | null;
  isActive: boolean;
  createdAt: string;
};

export type VendorServiceLite = {
  id: string;
  title: string;
  status?: string;
  category?: {
    id: string;
    name: string;
  } | null;
};

export type ServiceSponsorship = {
  id: string;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  startsAt: string | null;
  endsAt: string | null;
  amountPaid: number;
  currency: string;
  prioritySnapshot: number;
  paymentIntentId?: string | null;
  plan: SponsorshipPlan;
  service: {
    id: string;
    title: string;
  };
  category?: {
    id: string;
    name: string;
  } | null;
  analytics?: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
  };
};

export type CheckoutResponse = {
  clientSecret?: string;
  sponsorshipId?: string;
  paymentIntentId?: string;
};
