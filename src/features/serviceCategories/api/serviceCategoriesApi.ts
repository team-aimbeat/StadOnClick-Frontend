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

type ListResponse = {
  data: ServiceCategory[];
};

export const serviceCategoriesApi = createApi({
  reducerPath: "serviceCategoriesApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    listServiceCategories: builder.query<ServiceCategory[], void>({
      query: () => ({ url: "/service-categories", method: "GET" }),
      transformResponse: (response: ListResponse | ServiceCategory[]) => {
        if (Array.isArray(response)) return response;
        return response.data ?? [];
      },
    }),
  }),
});

export const { useListServiceCategoriesQuery } = serviceCategoriesApi;
