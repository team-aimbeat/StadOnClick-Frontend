import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export type VendorServiceEntity = {
  longitude: any;
  latitude: any;
 
  id: string;
  name: string;
  description: string;
  status: "DRAFT" | "LIVE" | "PAUSED";
  category?: any;
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
