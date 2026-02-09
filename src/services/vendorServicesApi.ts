import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export type RefundPolicyType =
  | "NO_REFUND"
  | "PARTIAL_BEFORE_WINDOW";

export type RefundPolicyInput = {
  type: RefundPolicyType;
  /**
   * Cutoff window before service start (in hours) within which the policy applies.
   * Required for PARTIAL_BEFORE_WINDOW.
   */
  windowHours?: number | null;
  /**
   * Percent of the booking amount to refund (0-100).
   * Required for PARTIAL_BEFORE_WINDOW.
   */
  refundPercent?: number | null;
};

export type VendorServiceEntity = {
  name: string;
  longitude: any;
  latitude: any;
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "LIVE" | "PAUSED";
  category?: any;
  media?: { url: string; type?: string; title?: string }[];
  refundPolicy?: RefundPolicyInput | null;
  terms?: string | null;
};

export interface CreateVendorServicePayload {
  vendorId: string;
  categoryId: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  refundPolicy: RefundPolicyInput;
}

export interface UpdateVendorServicePayload {
  id: string;
  title?: string;
  description?: string;
  terms?: string;
  status?: "DRAFT" | "LIVE" | "PAUSED";
  latitude?: number;
  longitude?: number;
  categoryId?: string;
  refundPolicy?: RefundPolicyInput;
}

export const vendorServicesApi = createApi({
  reducerPath: "vendorServicesApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    createVendorService: builder.mutation<VendorServiceEntity, CreateVendorServicePayload>({
      query: (body) => ({
        url: "/vendor/vendor-services",
        method: "POST",
        body,
      }),
    }),
    updateVendorService: builder.mutation<VendorServiceEntity, UpdateVendorServicePayload>({
      query: ({ id, ...body }) => ({
        url: `/vendor/vendor-services/${id}`,
        method: "PUT",
        body,
      }),
    }),
    getVendorServices: builder.query<VendorServiceEntity[], string | void>({
      query: (vendorId) =>
        vendorId ? `/vendor/vendor-services/${vendorId}` : "/vendor/vendor-services/me",
      transformResponse: (response: any[]) =>
        response.map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          status: s.status,
          category: s.category,
          latitude: s.latitude,
          longitude: s.longitude,
          terms: s.terms,
          media: s.media,
          refundPolicy: s.refundPolicy,
        })),
    }),
    getVendorProfileStatus: builder.query<any, void>({
      query: () => "/vendor/onboarding/status",
    }),
  }),
});

export const {
  useCreateVendorServiceMutation,
  useUpdateVendorServiceMutation,
  useGetVendorServicesQuery,
  useGetVendorProfileStatusQuery,
} = vendorServicesApi;
