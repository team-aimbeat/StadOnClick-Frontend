import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";

export const adminServicesApi = createApi({
  reducerPath: "adminServicesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminServices"],
  endpoints: (builder) => ({
    listAdminServices: builder.query<
      { data: any[]; meta: { page: number; limit: number; total: number; totalPages: number } },
      {
        page?: number;
        limit?: number;
        search?: string;
        vendorId?: string;
        status?: "DRAFT" | "LIVE" | "PAUSED" | "all";
        sortBy?: string;
        sortOrder?: "asc" | "desc";
      } | void
    >({
      query: (params) => ({
        url: "/admin/services",
        method: "GET",
        params:
          params && params.status === "all"
            ? { ...params, status: undefined }
            : params ?? {},
      }),
      providesTags: ["AdminServices"],
    }),
    updateAdminService: builder.mutation<
      { success: boolean; service: any },
      { id: string; title?: string; description?: string; status?: "DRAFT" | "LIVE" | "PAUSED" }
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/services/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminServices"],
    }),
    deleteAdminService: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/admin/services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminServices"],
    }),
  }),
});

export const {
  useListAdminServicesQuery,
  useUpdateAdminServiceMutation,
  useDeleteAdminServiceMutation,
} = adminServicesApi;
