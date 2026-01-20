import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

/**
 * Types (adjust as per your backend response)
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
