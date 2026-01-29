import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";

export type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type ServiceMasterCategory = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  isActive: boolean;
  sortOrder: number;
};

type ListResponse<T> = {
  data: T[];
};

export const serviceCategoriesApi = createApi({
  reducerPath: "serviceCategoriesApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    listServiceCategories: builder.query<ServiceCategory[], void>({
      query: () => ({ url: "/service-categories", method: "GET" }),
      transformResponse: (response: ListResponse<ServiceCategory> | ServiceCategory[]) => {
        if (Array.isArray(response)) return response;
        return response.data ?? [];
      },
    }),
    listServiceMasterCategories: builder.query<ServiceMasterCategory[], void>({
      query: () => ({ url: "/service-categories/master-categories", method: "GET" }),
      transformResponse: (
        response: ListResponse<ServiceMasterCategory> | ServiceMasterCategory[]
      ) => {
        if (Array.isArray(response)) return response;
        return response.data ?? [];
      },
    }),
  }),
});

export const { useListServiceCategoriesQuery, useListServiceMasterCategoriesQuery } =
  serviceCategoriesApi;
