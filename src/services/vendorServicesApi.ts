import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export type RefundPolicyType =
  | "NO_REFUND"
  | "PARTIAL_BEFORE_WINDOW";

export type RefundPolicyInput = {
  type: RefundPolicyType;
  /**
   * Cutoff window before service start (in hours) within which the policy applies.
   * Required for PARTIAL_BEFORE_WINDOW.
   */
  windowHours?: number | null;
  /**
   * Percent of the booking amount to refund (0-100).
   * Required for PARTIAL_BEFORE_WINDOW.
   */
  refundPercent?: number | null;
};

export type VendorServiceEntity = {
  name: string;
  longitude: any;
  latitude: any;
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "LIVE" | "PAUSED";
  category?: any;
  media?: { url: string; type?: string; title?: string }[];
  reviews?: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user?: {
      firstName?: string | null;
      lastName?: string | null;
      nickName?: string | null;
      profileImageKey?: string | null;
      profileImageUrl?: string | null;
    } | null;
  }[];
  refundPolicy?: RefundPolicyInput | null;
  terms?: string | null;
  offerings?: {
    id: string;
    serviceId: string;
    name: string;
    description?: string | null;
    bookingUrl?: string | null;
    basePrice: number;
    salePrice: number;
    currency?: string | null;
    maxQuantity?: number | null;
    remainingQuantity?: number | null;
  }[];
};

export interface CreateVendorServicePayload {
  categoryId: string;
  title: string;
  description: string;
  latitude?: number;
  longitude?: number;
  refundPolicy: RefundPolicyInput;
}

export interface UpdateVendorServicePayload {
  id: string;
  title?: string;
  description?: string;
  terms?: string;
  status?: "DRAFT" | "LIVE" | "PAUSED";
  latitude?: number;
  longitude?: number;
  categoryId?: string;
  refundPolicy?: RefundPolicyInput;
}

export interface CreateVendorMasterServicePayload {
  name: string;
  slug?: string;
  icon?: string;
  sortOrder?: number;
  createDefaultCategory?: boolean;
}

export interface VendorMasterServiceEntity {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface CreateVendorServiceCategoryPayload {
  masterCategoryId: string;
  name: string;
  slug?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface VendorServiceCategoryEntity {
  id: string;
  masterCategoryId: string;
  name: string;
  slug: string;
  icon?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export const vendorServicesApi = createApi({
  reducerPath: "vendorServicesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["VendorServices"],
  endpoints: (builder) => ({
    createVendorService: builder.mutation<VendorServiceEntity, CreateVendorServicePayload>({
      query: (body) => ({
        url: "/vendor/vendor-services",
        method: "POST",
        body,
      }),
      invalidatesTags: ["VendorServices"],
    }),
    updateVendorService: builder.mutation<VendorServiceEntity, UpdateVendorServicePayload>({
      query: ({ id, ...body }) => ({
        url: `/vendor/vendor-services/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["VendorServices"],
    }),
    getVendorServices: builder.query<VendorServiceEntity[], string | void>({
      query: (vendorId) =>
        vendorId ? `/vendor/vendor-services/${vendorId}` : "/vendor/vendor-services/me",
      transformResponse: (response: unknown) =>
        (Array.isArray(response) ? response : []).map((s: any) => ({
          name: s.name ?? s.title ?? "",
          id: s.id,
          title: s.title,
          description: s.description,
          status: s.status,
          category: s.category,
          latitude: s.latitude,
          longitude: s.longitude,
          terms: s.terms,
          media: s.media,
          reviews: s.reviews,
          refundPolicy: s.refundPolicy,
          offerings: (s.offerings ?? []).map((o: any) => ({
            id: o.id,
            serviceId: o.serviceId,
            name: o.name,
            description: o.description ?? null,
            bookingUrl: o.bookingUrl ?? null,
            basePrice: Number(o.basePrice ?? 0),
            salePrice: Number(o.salePrice ?? 0),
            currency: o.currency ?? "SEK",
            maxQuantity: o.maxQuantity ?? null,
            remainingQuantity: o.remainingQuantity ?? null,
          })),
        })),
      providesTags: ["VendorServices"],
    }),
    getVendorProfileStatus: builder.query<any, void>({
      query: () => "/vendor/onboarding/status",
    }),
    createVendorMasterService: builder.mutation<
      VendorMasterServiceEntity,
      CreateVendorMasterServicePayload
    >({
      query: (body) => ({
        url: "/vendor/vendor-services/master",
        method: "POST",
        body,
      }),
    }),
    createVendorServiceCategory: builder.mutation<
      VendorServiceCategoryEntity,
      CreateVendorServiceCategoryPayload
    >({
      query: (body) => ({
        url: "/vendor/vendor-services/categories",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useCreateVendorServiceMutation,
  useUpdateVendorServiceMutation,
  useGetVendorServicesQuery,
  useGetVendorProfileStatusQuery,
  useCreateVendorMasterServiceMutation,
  useCreateVendorServiceCategoryMutation,
} = vendorServicesApi;
