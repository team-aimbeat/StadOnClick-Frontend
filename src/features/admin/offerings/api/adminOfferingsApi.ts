import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";

export const adminOfferingsApi = createApi({
  reducerPath: "adminOfferingsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminOfferings"],
  endpoints: (builder) => ({
    listAdminOfferings: builder.query<
      { data: any[]; meta: { page: number; limit: number; total: number; totalPages: number } },
      {
        page?: number;
        limit?: number;
        search?: string;
        vendorId?: string;
        serviceId?: string;
        active?: "active" | "inactive" | "all";
        sortBy?: string;
        sortOrder?: "asc" | "desc";
      } | void
    >({
      query: (params) => ({
        url: "/admin/offerings",
        method: "GET",
        params:
          params && params.active === "all"
            ? { ...params, active: undefined }
            : params ?? {},
      }),
      providesTags: ["AdminOfferings"],
    }),
    toggleAdminOfferingStatus: builder.mutation<
      { success: boolean; offering: any },
      { id: string; active: boolean }
    >({
      query: ({ id, active }) => ({
        url: `/admin/offerings/${id}/status`,
        method: "PATCH",
        body: { active },
      }),
      invalidatesTags: ["AdminOfferings"],
    }),
    bulkToggleAdminOfferingStatus: builder.mutation<
      { success: boolean; count: number },
      { ids: string[]; active: boolean }
    >({
      query: (body) => ({
        url: "/admin/offerings/bulk-status",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminOfferings"],
    }),
  }),
});

export const {
  useListAdminOfferingsQuery,
  useToggleAdminOfferingStatusMutation,
  useBulkToggleAdminOfferingStatusMutation,
} = adminOfferingsApi;
