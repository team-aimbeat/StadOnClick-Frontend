/**
 * Types
 */
export type VendorApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type VendorApplication = {
  id: string;
  userId: string;
  vendorProfileId?: string | null;
  status: VendorApplicationStatus;
  createdAt: string;
  updatedAt: string;

  // optional extras if your backend sends them
  user?: {
    id: string;
    firstName: string;
    lastName?: string | null;
    email: string;
    phone?: string | null;
  };
};

export type Vendor = {
  id: string;
  userId: string;
  businessName?: string | null;
  createdAt: string;
  updatedAt: string;

  // optional extras
  user?: {
    id: string;
    firstName: string;
    lastName?: string | null;
    email: string;
    phone?: string | null;
  };
};

export type RejectVendorRequest = {
  reason: string;
};
