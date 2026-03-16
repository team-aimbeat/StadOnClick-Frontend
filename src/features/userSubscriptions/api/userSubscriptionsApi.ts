import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export type UserSubscriptionPlan = {
  id: string;
  planName: string;
  price: number | string;
  currency: string;
  durationDays: number;
  description: string | null;
  perks: string[];
  status: string;
};

export type UserPlanResponse = {
  id: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: string;
  plan: UserSubscriptionPlan;
};

export const userSubscriptionsApi = createApi({
  reducerPath: "userSubscriptionsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["UserPlan", "UserPlans"],
  endpoints: (builder) => ({
    listPlans: builder.query<{ data: UserSubscriptionPlan[] }, void>({
      query: () => ({ url: "/subscriptions/plans" }),
      providesTags: [{ type: "UserPlans", id: "LIST" }],
    }),
    getMyPlan: builder.query<{ data: UserPlanResponse | null }, void>({
      query: () => ({ url: "/subscriptions/my-plan" }),
      providesTags: [{ type: "UserPlan", id: "ME" }],
    }),
    purchasePlan: builder.mutation<{ data: UserPlanResponse }, { planId: string }>({
      query: ({ planId }) => ({
        url: "/subscriptions/purchase",
        method: "POST",
        body: { planId },
      }),
      invalidatesTags: [
        { type: "UserPlan", id: "ME" },
        { type: "UserPlans", id: "LIST" },
      ],
    }),
  }),
});

export const { useListPlansQuery, useGetMyPlanQuery, usePurchasePlanMutation } =
  userSubscriptionsApi;
