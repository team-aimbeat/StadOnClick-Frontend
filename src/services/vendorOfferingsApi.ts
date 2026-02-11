import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export type VendorSlot = {
  id: string;
  offeringId: string;
  startTime: string;
  endTime?: string | null;
  capacity: number;
  remaining: number;
  status: "OPEN" | "FULL" | "CANCELLED";
};

export type VendorRule = {
  id: string;
  offeringId: string;
  ruleType: string;
  value: string;
};

export type VendorOffering = {
  id: string;
  serviceId: string;
  name: string;
  description?: string | null;
  usesSlots: boolean;
  basePrice: number;
  salePrice: number;
  currency: string;
  maxQuantity: number | null;
  slots: VendorSlot[];
  rules: VendorRule[];
};

type RawVendorOffering = VendorOffering & {
  basePrice: string;
  salePrice: string;
};

export interface CreateOfferingPayload {
  serviceId: string;
  name: string;
  description: string;
  basePrice: number;
  salePrice: number;
  maxQuantity?: number | null;
}

export interface CreateSlotPayload {
  offeringId: string;
  startTime: string;
  endTime?: string;
  capacity: number;
}

export interface CreateRulePayload {
  offeringId: string;
  ruleType: string;
  value: string;
}

const toVendorOffering = (offering: RawVendorOffering): VendorOffering => ({
  ...offering,
  basePrice: Number(offering.basePrice),
  salePrice: Number(offering.salePrice),
  maxQuantity: offering.maxQuantity ?? null,
});

export const vendorOfferingsApi = createApi({
  reducerPath: "vendorOfferingsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["VendorOffering"],
  endpoints: (builder) => ({
    getServiceOfferings: builder.query<VendorOffering[], string>({
      query: (serviceId) => `/vendor/offerings/service/${serviceId}`,
      transformResponse: (response: RawVendorOffering[]) =>
        response.map(toVendorOffering),
      providesTags: (result, error, serviceId) =>
        result
          ? [
              ...result.map((offering) => ({
                type: "VendorOffering" as const,
                id: offering.id,
              })),
              { type: "VendorOffering" as const, id: serviceId },
            ]
          : [{ type: "VendorOffering" as const, id: serviceId }],
    }),

    createOffering: builder.mutation<VendorOffering, CreateOfferingPayload>({
      query: (body) => ({
        url: "/vendor/offerings",
        method: "POST",
        body,
      }),
      transformResponse: (response: RawVendorOffering) => toVendorOffering(response),
      invalidatesTags: (result, error, { serviceId }) => [
        { type: "VendorOffering", id: result?.id ?? serviceId },
      ],
    }),

    createSlot: builder.mutation<VendorSlot, CreateSlotPayload>({
      query: (body) => ({
        url: "/vendor/slots",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { offeringId }) => [
        { type: "VendorOffering", id: offeringId },
      ],
    }),

    createRule: builder.mutation<VendorRule, CreateRulePayload>({
      query: (body) => ({
        url: "/vendor/slots/rules",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { offeringId }) => [
        { type: "VendorOffering", id: offeringId },
      ],
    }),

    getOfferingSlots: builder.query<VendorSlot[], { offeringId: string; vendorId?: string }>({
      query: ({ offeringId, vendorId }) => {
        const params = vendorId ? `?vendorId=${vendorId}` : "";
        return `/vendor/slots/offering/${offeringId}${params}`;
      },
      providesTags: (result, error, { offeringId }) =>
        result
          ? [
              ...result.map((slot) => ({
                type: "VendorOffering" as const,
                id: slot.id,
              })),
              { type: "VendorOffering", id: offeringId },
            ]
          : [{ type: "VendorOffering", id: offeringId }],
    }),

    deleteServiceOfferings: builder.mutation<{ count: number }, string>({
      query: (serviceId) => ({
        url: `/vendor/offerings/service/${serviceId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, serviceId) => [
        { type: "VendorOffering", id: serviceId },
      ],
    }),
  }),
});

export const {
  useGetServiceOfferingsQuery,
  useLazyGetServiceOfferingsQuery,
  useCreateOfferingMutation,
  useCreateSlotMutation,
  useCreateRuleMutation,
  useDeleteServiceOfferingsMutation,
  useLazyGetOfferingSlotsQuery,
} = vendorOfferingsApi;
