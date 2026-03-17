/**
 * Types
 */
export type VendorApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "MORE_INFO_REQUIRED";

export type VendorStatus = "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "REJECTED";
export type KycStatus = "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";

export type VendorApplication = {
  id: string;

  vendorId: string;

  // Prisma: applicationData Json
  applicationData: unknown;

  // ✅ Prisma fields (missing before)
  submittedAt: string; // API should return ISO string
  reviewedAt?: string | null;

  status: VendorApplicationStatus;

  // ✅ Prisma fields (missing before)
  adminComment?: string | null;
  reviewedBy?: string | null;

  // Optional relation (if backend includes it)
  vendor?: {
    id: string;
    businessName: string;
    slug: string;
    status: VendorStatus;
    kycStatus: KycStatus;
    contactEmail?: string | null;
    contactPhone?: string | null;
    city?: { name: string } | null;
  };
};

export type Vendor = {
  id: string;
  userId?: string;
  businessName?: string | null;
  createdAt: string;
  updatedAt: string;
  slug?: string;
  status?: VendorStatus;
  kycStatus?: KycStatus;
  city?: { name?: string } | null;
  country?: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  payoutsEnabled?: boolean;
  chargesEnabled?: boolean;
  totalBookings?: number;
  visitorCount?: number;
  totalRevenue?: string | number;
  ratingAvg?: number;
  ratingCount?: number;

  // optional extras
  user?: {
    id: string;
    firstName: string;
    lastName?: string | null;
    email: string;
    phone?: string | null;
    profileImageKey?: string | null;
    profileImageUrl?: string | null;
  };
};

export type RejectVendorRequest = {
  reason: string;
};
