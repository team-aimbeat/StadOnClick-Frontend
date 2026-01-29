import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export type VendorServiceEntity = {
  id: string;
  vendorId: string;
  categoryId: string;
  title: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  status: "DRAFT" | "LIVE" | "PAUSED";
};

export interface CreateVendorServicePayload {
  vendorId: string;
  categoryId: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
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
