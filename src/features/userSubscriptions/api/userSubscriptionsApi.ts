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

export const hasActivePaidPlan = (plan: UserPlanResponse | null | undefined) => {
  if (!plan) return false;
  if (String(plan.status).toUpperCase() !== "ACTIVE") return false;

  const endDate = new Date(plan.endDate);
  if (Number.isNaN(endDate.getTime()) || endDate <= new Date()) return false;

  return String(plan.plan?.planName ?? "").trim().toUpperCase() !== "BASIC";
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
    createCheckoutSession: builder.mutation<{ data: { checkoutUrl: string; sessionId: string } }, { planId: string }>(
      {
        query: ({ planId }) => ({
          url: "/subscriptions/checkout",
          method: "POST",
          body: { planId },
        }),
      }
    ),
    confirmCheckoutSession: builder.mutation<{ data: UserPlanResponse }, { sessionId: string }>({
      query: ({ sessionId }) => ({
        url: "/subscriptions/checkout/confirm",
        method: "POST",
        body: { sessionId },
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

export const {
  useCreateCheckoutSessionMutation,
  useConfirmCheckoutSessionMutation,
} = userSubscriptionsApi;
