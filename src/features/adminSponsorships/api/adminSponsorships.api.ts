import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";
import type { SponsorshipPlan } from "@/features/vendorSponsorships/types";

type PlanPayload = Omit<
  SponsorshipPlan,
  "id" | "createdAt"
> & {
  impressionCap?: number | null;
};

export const adminSponsorshipsApi = createApi({
  reducerPath: "adminSponsorshipsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminSponsorshipPlans"],
  endpoints: (builder) => ({
    listAdminSponsorshipPlans: builder.query<SponsorshipPlan[], void>({
      query: () => ({ url: "/admin/sponsorship-plans", method: "GET" }),
      transformResponse: (response: SponsorshipPlan[] | { data?: SponsorshipPlan[] }) => {
        const normalize = (plans: SponsorshipPlan[]) =>
          plans.map((p) => ({ ...p, price: Number((p as any).price ?? 0) }));
        if (Array.isArray(response)) return normalize(response);
        if (response && Array.isArray((response as any).data)) return normalize((response as any).data);
        return [];
      },
      providesTags: (result) =>
        result && result.length
          ? [
              ...result.map((plan) => ({ type: "AdminSponsorshipPlans" as const, id: plan.id })),
              { type: "AdminSponsorshipPlans" as const, id: "LIST" },
            ]
          : [{ type: "AdminSponsorshipPlans" as const, id: "LIST" }],
    }),

    createAdminSponsorshipPlan: builder.mutation<SponsorshipPlan, PlanPayload>({
      query: (body) => ({
        url: "/admin/sponsorship-plans",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "AdminSponsorshipPlans", id: "LIST" }],
    }),

    updateAdminSponsorshipPlan: builder.mutation<
      SponsorshipPlan,
      { id: string; body: Partial<PlanPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/admin/sponsorship-plans/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "AdminSponsorshipPlans", id: arg.id },
        { type: "AdminSponsorshipPlans", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListAdminSponsorshipPlansQuery,
  useCreateAdminSponsorshipPlanMutation,
  useUpdateAdminSponsorshipPlanMutation,
} = adminSponsorshipsApi;
