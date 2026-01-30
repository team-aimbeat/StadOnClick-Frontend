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
  longitude: any;
  latitude: any;
  id: string;
  name: string;
  description: string;
  status: "DRAFT" | "LIVE" | "PAUSED";
  category?: any;
  refundPolicy?: RefundPolicyInput | null;
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
    getVendorServices: builder.query<VendorServiceEntity[], string>({
      query: (vendorId) => `/vendor/vendor-services/${vendorId}`,
      transformResponse: (response: any[]) =>
        response.map((s: any) => ({
          id: s.id,
          name: s.title,
          description: s.description,
          status: s.status,
          category: s.category,
        })),
    }),
    getVendorProfileStatus: builder.query<any, void>({
      query: () => "/vendor/onboarding/status",
    }),
  }),
});

export const {
  useCreateVendorServiceMutation,
  useGetVendorServicesQuery,
  useGetVendorProfileStatusQuery,
} = vendorServicesApi;
