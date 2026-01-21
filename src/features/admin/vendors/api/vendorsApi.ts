import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";
import { RejectVendorRequest, Vendor, VendorApplication } from "../types/vendor.types";


export const adminVendorApi = createApi({
  reducerPath: "adminVendorApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminVendorApplications", "AdminVendors"],
  endpoints: (builder) => ({
    /**
     * GET /admin/vendors/applications
     */
    listVendorApplications: builder.query<
      { data: VendorApplication[] },
      void
    >({
      query: () => ({
        url: "/admin/vendors/applications",
        method: "GET",
      }),
      providesTags: ["AdminVendorApplications"],
    }),

    /**
     * GET /admin/vendors
     */
    listAllVendors: builder.query<{ data: Vendor[] }, void>({
      query: () => ({
        url: "/admin/vendors",
        method: "GET",
      }),
      providesTags: ["AdminVendors"],
    }),

    /**
     * POST /admin/vendors/:id/approve
     */
    approveVendorApplication: builder.mutation<
      { message: string; data?: any },
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/admin/vendors/${id}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["AdminVendorApplications", "AdminVendors"],
    }),

    /**
     * POST /admin/vendors/:id/reject
     */
    rejectVendorApplication: builder.mutation<
      { message: string; data?: any },
      { id: string; body: RejectVendorRequest }
    >({
      query: ({ id, body }) => ({
        url: `/admin/vendors/${id}/reject`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminVendorApplications", "AdminVendors"],
    }),
  }),
});

export const {
  useListVendorApplicationsQuery,
  useListAllVendorsQuery,
  useApproveVendorApplicationMutation,
  useRejectVendorApplicationMutation,
} = adminVendorApi;
