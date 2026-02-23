import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export interface City {
  id: string;
  name: string;
  municipality: string | null;
  county: string | null;
  countryCode: string;
}

export interface BusinessHour {
  day: string;
  value: string;
}

export interface VendorProfile {
  id: string;
  slug: string;
  businessName: string;
  description: string | null;
  headquarters: string | null;
  serviceOverview: string | null;
  businessHours: BusinessHour[] | null;
  city: City | null;
  status: string;
  kycStatus: string;
  contactEmail: string | null;
  contactPhone: string | null;
  isIndexable: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  seoImageKey: string | null;
  stripeAccountId: string | null;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  totalBookings: number;
  totalRevenue: string;
  ratingAvg: string | null;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    services: number;
  };
}

export interface VendorProfileResponse {
  data: VendorProfile;
}

export interface CreateVendorBusinessProfileRequest {
  businessName: string;
  description?: string;
  cityId?: string;
  headquarters?: string;
  serviceOverview?: string;
  businessHours?: BusinessHour[];
  contactEmail?: string;
  contactPhone?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  isIndexable?: boolean;
}

export interface UpdateVendorProfileRequest {
  businessName?: string;
  description?: string | null;
  headquarters?: string | null;
  cityId?: string | null;
  serviceOverview?: string;
  businessHours?: BusinessHour[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoImageKey?: string | null;
  seoKeywords?: string[];
  isIndexable?: boolean;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export interface UpdateVendorProfileResponse {
  success: boolean;
  vendor: VendorProfile;
}

export interface CreateVendorBusinessProfileResponse {
  success: boolean;
  vendor: VendorProfile & {
    vendorId?: string;
    isBusinessProfileComplete?: boolean;
    lifecycleStatus?: "DRAFT" | "ACTIVE" | "SUSPENDED";
    setupRequired?: boolean;
  };
}

export interface EnsureVendorBusinessOnboardingResponse {
  success: boolean;
  isVendor: boolean;
  hasVendorProfile: boolean;
  vendorId: string | null;
  isBusinessProfileComplete: boolean;
  lifecycleStatus: "DRAFT" | "ACTIVE" | "SUSPENDED";
  setupRequired: boolean;
}

export const vendorProfileApi = createApi({
  reducerPath: "vendorProfileApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["VendorProfile"],
  endpoints: (builder) => ({
    getVendorProfile: builder.query<VendorProfileResponse, void>({
      query: () => ({
        url: "/vendor/profile",
        method: "GET",
      }),
      providesTags: ["VendorProfile"],
    }),

    updateVendorProfile: builder.mutation<UpdateVendorProfileResponse, UpdateVendorProfileRequest>({
      query: (body) => ({
        url: "/vendor/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["VendorProfile"],
    }),
    createVendorBusinessProfile: builder.mutation<
      CreateVendorBusinessProfileResponse,
      CreateVendorBusinessProfileRequest
    >({
      query: (body) => ({
        url: "/vendor/onboarding/business-profile",
        method: "POST",
        body,
      }),
      invalidatesTags: ["VendorProfile"],
    }),
    ensureVendorBusinessOnboarding: builder.mutation<EnsureVendorBusinessOnboardingResponse, void>({
      query: () => ({
        url: "/vendor/onboarding/business-onboarding/ensure",
        method: "POST",
      }),
      invalidatesTags: ["VendorProfile"],
    }),
  }),
});

export const {
  useGetVendorProfileQuery,
  useUpdateVendorProfileMutation,
  useCreateVendorBusinessProfileMutation,
  useEnsureVendorBusinessOnboardingMutation,
} = vendorProfileApi;
