import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";

export type MarketplaceServiceOfferingPreview = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  salePrice: number;
  discountPercent: number;
  dealStartTime: string | null;
  dealEndTime: string | null;
  isDealActive: boolean;
  effectivePrice: number;
  currency: string;
  durationLabel?: string | null;
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

export type PremiumDealsResponse = ListMarketplaceServicesResponse & {
  isLocked: boolean;
};

export type ListMarketplaceServicesParams = {
  masterCategoryId?: string;
  categoryIds?: string[]; // sent as comma-separated list
  serviceId?: string;
  ref?: string;
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

export type VendorVisitStats = {
  vendorId: string;
  totalVisitors: number;
  todayVisitors: number;
};

export type VendorVisitStatsResponse = {
  data: VendorVisitStats;
};

export const marketplaceApi = createApi({
  reducerPath: "marketplaceApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["VendorVisitStats"],
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
    listActiveDeals: builder.query<ListMarketplaceServicesResponse, Omit<ListMarketplaceServicesParams, "serviceId"> | void>({
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
          url: "/marketplace/deals",
          method: "GET",
          params: normalizedParams,
        };
      },
    }),
    listPremiumDeals: builder.query<PremiumDealsResponse, Omit<ListMarketplaceServicesParams, "serviceId"> | void>({
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
          url: "/marketplace/premium-deals",
          method: "GET",
          params: normalizedParams,
        };
      },
    }),
    trackVendorStoreVisit: builder.mutation<{ message: string }, { vendorId: string }>({
      query: ({ vendorId }) => ({
        url: `/marketplace/vendors/${vendorId}/visit`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "VendorVisitStats", id: arg.vendorId },
      ],
    }),
    getVendorStoreVisitStats: builder.query<VendorVisitStatsResponse, string>({
      query: (vendorId) => ({
        url: `/marketplace/vendors/${vendorId}/visit-stats`,
        method: "GET",
      }),
      providesTags: (_result, _error, vendorId) => [
        { type: "VendorVisitStats", id: vendorId },
      ],
    }),
  }),
});

export const {
  useLazyListMarketplaceServicesQuery,
  useListMarketplaceServicesQuery,
  useListActiveDealsQuery,
  useListPremiumDealsQuery,
  useGetVendorStoreVisitStatsQuery,
  useTrackVendorStoreVisitMutation,
} =
  marketplaceApi;
