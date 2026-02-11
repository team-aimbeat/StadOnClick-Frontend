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
      { data: VendorApplication[]; meta?: { total?: number } },
      { page?: number; limit?: number; sortBy?: string; sortOrder?: "asc" | "desc" } | void
    >({
      query: (params) => ({
        url: "/admin/vendors/applications",
        method: "GET",
        params: params ?? {},
      }),
      providesTags: ["AdminVendorApplications"],
    }),

    /**
     * GET /admin/vendors
     */
    listAllVendors: builder.query<
      { data: Vendor[]; meta?: { total?: number } },
      { page?: number; limit?: number; sortBy?: string; sortOrder?: "asc" | "desc" } | void
    >({
      query: (params) => ({
        url: "/admin/vendors",
        method: "GET",
        params: params ?? {},
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
    updateVendorStatus: builder.mutation<
      { success: boolean; vendor: { id: string; status: string } },
      {
        id: string;
        status: "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "REJECTED";
      }
    >({
      query: ({ id, status }) => ({
        url: `/admin/vendors/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["AdminVendors", "AdminVendorApplications"],
    }),
  }),
});

export const {
  useListVendorApplicationsQuery,
  useListAllVendorsQuery,
  useApproveVendorApplicationMutation,
  useRejectVendorApplicationMutation,
  useUpdateVendorStatusMutation,
} = adminVendorApi;
