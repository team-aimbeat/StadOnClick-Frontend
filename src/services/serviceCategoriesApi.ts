import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type ServiceMasterCategory = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  sortOrder?: number;
};

export type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  masterCategoryId: string;
  isActive: boolean;
  sortOrder?: number;
};

type ListResponse = {
  data: ServiceCategory[];
};

export const serviceCategoriesApi = createApi({
  reducerPath: "serviceCategoriesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
  }),
  tagTypes: ["ServiceMasterCategory", "ServiceCategory"],
  endpoints: (builder) => ({
    getMasterCategories: builder.query<ServiceMasterCategory[], void>({
      query: () => "/service-categories/master-categories",
      transformResponse: (response: ServiceMasterCategory[] | undefined) =>
        response ?? [],
      providesTags: (result) =>
        result
          ? result.map((category) => ({
              type: "ServiceMasterCategory" as const,
              id: category.id,
            }))
          : [],
    }),
    getServiceCategoriesByMaster: builder.query<ServiceCategory[], string>({
      query: (masterId) => `/service-categories/master/${masterId}/categories`,
      transformResponse: (response: ServiceCategory[] | undefined) =>
        response ?? [],
      providesTags: (result) =>
        result
          ? result.map((category) => ({
              type: "ServiceCategory" as const,
              id: category.id,
            }))
          : [],
    }),
    listServiceCategories: builder.query<ServiceCategory[], void>({
      query: () => "/service-categories",
      transformResponse: (response: ListResponse | ServiceCategory[]) => {
        if (Array.isArray(response)) return response;
        return response.data ?? [];
      },
      providesTags: (result) =>
        result
          ? result.map((category) => ({
              type: "ServiceCategory" as const,
              id: category.id,
            }))
          : [],
    }),
  }),
});

export const {
  useGetMasterCategoriesQuery,
  useGetServiceCategoriesByMasterQuery,
  useListServiceCategoriesQuery,
} = serviceCategoriesApi;
