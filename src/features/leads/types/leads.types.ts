export type LeadStatus = "NEW" | "CONTACTED" | "CONVERTED" | "LOST";

export type LeadStory = {
  leadId: string;
  categoryId: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string | null;
  createdAt: string;
};

export type VendorLeadItem = {
  id: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  sequenceInDay: number;
  lead: LeadStory;
  isLocked: boolean;
  lockReason: "NO_SUBSCRIPTION" | "DAILY_QUOTA" | null;
};

export type VendorLeadsResponse = {
  data: VendorLeadItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type SubmitLeadInput = {
  categoryId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  source?: string;
};

export type SubmitLeadResponse = {
  success: boolean;
  leadId: string;
  categoryId: string;
  createdAt: string;
  distributedVendorsCount: number;
};
