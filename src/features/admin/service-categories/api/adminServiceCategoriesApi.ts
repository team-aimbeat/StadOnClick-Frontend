import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";

export type AdminServiceSubCategory = {
  id: string;
  masterCategoryId: string;
  name: string;
  slug: string;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
  deletedAt?: string | null;
  masterCategory?: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
};

export type AdminServiceMasterCategory = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
  deletedAt?: string | null;
  categories: AdminServiceSubCategory[];
  _count?: { categories: number };
};

type ListResponse<T> = { data: T[] };

type MasterPayload = {
  name: string;
  slug?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
};

type CategoryPayload = {
  masterCategoryId: string;
  name: string;
  slug?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export const adminServiceCategoriesApi = createApi({
  reducerPath: "adminServiceCategoriesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminServiceMasters", "AdminServiceCategories"],
  endpoints: (builder) => ({
    listAdminServiceMasters: builder.query<AdminServiceMasterCategory[], void>({
      query: () => ({ url: "/admin/service-categories/masters", method: "GET" }),
      transformResponse: (response: ListResponse<AdminServiceMasterCategory>) => response.data ?? [],
      providesTags: ["AdminServiceMasters"],
    }),
    createAdminServiceMaster: builder.mutation<
      { success: boolean; data: AdminServiceMasterCategory },
      MasterPayload
    >({
      query: (body) => ({
        url: "/admin/service-categories/masters",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminServiceMasters"],
    }),
    updateAdminServiceMaster: builder.mutation<
      { success: boolean; data: AdminServiceMasterCategory },
      { id: string; body: Partial<MasterPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/admin/service-categories/masters/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminServiceMasters"],
    }),
    deleteAdminServiceMaster: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/admin/service-categories/masters/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminServiceMasters", "AdminServiceCategories"],
    }),
    listAdminServiceCategories: builder.query<AdminServiceSubCategory[], { masterCategoryId?: string } | void>({
      query: (params) => ({
        url: "/admin/service-categories/categories",
        method: "GET",
        params: params ?? {},
      }),
      transformResponse: (response: ListResponse<AdminServiceSubCategory>) => response.data ?? [],
      providesTags: ["AdminServiceCategories"],
    }),
    createAdminServiceCategory: builder.mutation<
      { success: boolean; data: AdminServiceSubCategory },
      CategoryPayload
    >({
      query: (body) => ({
        url: "/admin/service-categories/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminServiceMasters", "AdminServiceCategories"],
    }),
    updateAdminServiceCategory: builder.mutation<
      { success: boolean; data: AdminServiceSubCategory },
      { id: string; body: Partial<CategoryPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/admin/service-categories/categories/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminServiceMasters", "AdminServiceCategories"],
    }),
    deleteAdminServiceCategory: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/admin/service-categories/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminServiceMasters", "AdminServiceCategories"],
    }),
  }),
});

export const {
  useListAdminServiceMastersQuery,
  useCreateAdminServiceMasterMutation,
  useUpdateAdminServiceMasterMutation,
  useDeleteAdminServiceMasterMutation,
  useListAdminServiceCategoriesQuery,
  useCreateAdminServiceCategoryMutation,
  useUpdateAdminServiceCategoryMutation,
  useDeleteAdminServiceCategoryMutation,
} = adminServiceCategoriesApi;

