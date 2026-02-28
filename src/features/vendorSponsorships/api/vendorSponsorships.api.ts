import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";
import type {
  CheckoutResponse,
  ServiceSponsorship,
  SponsorshipPlan,
  VendorServiceLite,
} from "../types";

export const vendorSponsorshipsApi = createApi({
  reducerPath: "vendorSponsorshipsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["SponsorshipPlans", "VendorServices", "VendorSponsorships"],
  endpoints: (builder) => ({
    listPlans: builder.query<SponsorshipPlan[], void>({
      query: () => ({
        url: "/vendor/sponsorship-plans",
        method: "GET",
      }),
      transformResponse: (response: SponsorshipPlan[] | { data?: SponsorshipPlan[] }) => {
        const normalize = (plans: SponsorshipPlan[]) =>
          plans.map((p) => ({ ...p, price: Number((p as any).price ?? 0) }));

        if (Array.isArray(response)) return normalize(response);
        if (response && Array.isArray(response.data)) return normalize(response.data);
        return [];
      },
      providesTags: (result) =>
        result && result.length
          ? [
              ...result.map((plan) => ({ type: "SponsorshipPlans" as const, id: plan.id })),
              { type: "SponsorshipPlans" as const, id: "LIST" },
            ]
          : [{ type: "SponsorshipPlans" as const, id: "LIST" }],
    }),

    listVendorServices: builder.query<VendorServiceLite[], { userId?: string; vendorId?: string } | void>({
      query: (arg) => ({
        url: arg?.vendorId
          ? `/vendor/vendor-services/${arg.vendorId}`
          : "/vendor/vendor-services/me",
        method: "GET",
      }),
      transformResponse: (response: VendorServiceLite[] | { data?: VendorServiceLite[] }) => {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.data)) return response.data;
        return [];
      },
      providesTags: [{ type: "VendorServices", id: "LIST" }],
    }),

    listVendorSponsorships: builder.query<ServiceSponsorship[], void>({
      query: () => ({
        url: "/vendor/sponsorships",
        method: "GET",
      }),
      transformResponse: (response: ServiceSponsorship[] | { data?: ServiceSponsorship[] }) => {
        const normalize = (rows: ServiceSponsorship[]) =>
          rows.map((row) => ({
            ...row,
            amountPaid: Number((row as any).amountPaid ?? 0),
            prioritySnapshot: Number((row as any).prioritySnapshot ?? 0),
            plan: row.plan
              ? { ...row.plan, price: Number((row.plan as any).price ?? 0) }
              : row.plan,
          }));

        if (Array.isArray(response)) return normalize(response);
        if (response && Array.isArray(response.data)) return normalize(response.data);
        return [];
      },
      providesTags: (result) =>
        result && result.length
          ? [
              ...result.map((s) => ({ type: "VendorSponsorships" as const, id: s.id })),
              { type: "VendorSponsorships" as const, id: "LIST" },
            ]
          : [{ type: "VendorSponsorships" as const, id: "LIST" }],
    }),

    createSponsorshipCheckout: builder.mutation<
      CheckoutResponse,
      { planId: string; serviceId: string }
    >({
      query: (body) => ({
        url: "/vendor/sponsorships/checkout",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "VendorSponsorships", id: "LIST" },
        { type: "SponsorshipPlans", id: "LIST" },
      ],
    }),
    confirmSponsorshipCheckout: builder.mutation<
      { sponsorshipId: string; status: string; paymentIntentId: string },
      { sponsorshipId: string; paymentIntentId?: string }
    >({
      query: (body) => ({
        url: "/vendor/sponsorships/confirm",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "VendorSponsorships", id: "LIST" },
        { type: "SponsorshipPlans", id: "LIST" },
      ],
    }),

    listVendorServicesByMaster: builder.query<
      VendorServiceLite[],
      { masterId: string; search?: string; userId?: string; vendorId?: string }
    >({
      query: ({ masterId, search, vendorId }) => ({
        url: `/vendor/vendor-services/master/${masterId}/services`,
        method: "GET",
        params: {
          ...(search ? { q: search } : {}),
          ...(vendorId ? { vendorId } : {}),
        },
      }),
      transformResponse: (response: VendorServiceLite[] | { data?: VendorServiceLite[] }) => {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.data)) return response.data;
        return [];
      },
      providesTags: (_result, _err, arg) => [{ type: "VendorServices", id: `MASTER-${arg.masterId}` }],
    }),
  }),
});

export const {
  useListPlansQuery,
  useListVendorServicesQuery,
  useListVendorServicesByMasterQuery,
  useListVendorSponsorshipsQuery,
  useCreateSponsorshipCheckoutMutation,
  useConfirmSponsorshipCheckoutMutation,
} = vendorSponsorshipsApi;
