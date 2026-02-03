import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";

export type MarketplaceServiceOfferingPreview = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  salePrice: number;
  currency: string;
};

export type MarketplaceService = {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  categoryId: string;
  categoryName: string;
  masterCategoryId: string;
  masterCategoryName: string;
  vendorId: string;
  vendorName: string;
  vendorSlug: string;
  cityName: string | null;
  ratingAvg: number;
  ratingCount: number;
  hasActiveBoost: boolean;
  boostPriority: number;
  priceMin: number | null;
  priceMax: number | null;
  thumbnailUrl: string | null;
  mediaUrls: string[];
  offeringsPreview: MarketplaceServiceOfferingPreview[];
};

export type ListMarketplaceServicesResponse = {
  data: MarketplaceService[];
  total: number;
  limit: number;
  offset: number;
};

export type ListMarketplaceServicesParams = {
  masterCategoryId?: string;
  categoryIds?: string[]; // sent as comma-separated list
  cityId?: string;
  cityIds?: string[]; // sent as comma-separated list (preferred when multiple)
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  ratingMin?: number;
  sort?: "POPULAR" | "RATING" | "PRICE_ASC" | "PRICE_DESC" | "NEWEST";
  limit?: number;
  offset?: number;
};

export const marketplaceApi = createApi({
  reducerPath: "marketplaceApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    listMarketplaceServices: builder.query<ListMarketplaceServicesResponse, ListMarketplaceServicesParams | void>({
      query: (params) => {
        const safeParams = params ?? {};
        const normalizedParams: Record<string, unknown> = { ...safeParams };
        if (Array.isArray(safeParams.categoryIds)) {
          normalizedParams.categoryIds = safeParams.categoryIds.join(",");
        }
        if (Array.isArray(safeParams.cityIds)) {
          normalizedParams.cityIds = safeParams.cityIds.join(",");
        }

        return {
          url: "/marketplace/services",
          method: "GET",
          params: normalizedParams,
        };
      },
    }),
  }),
});

export const { useLazyListMarketplaceServicesQuery, useListMarketplaceServicesQuery } =
  marketplaceApi;
