import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";
import {
  CreateLeadPlanRequest,
  LeadPlan,
  UpdateLeadPlanRequest,
} from "../types/leadPlans.types";

export type LeadPlanSubscribersSummary = {
  totalSubscribers: number;
  dailyAverage: number;
  growthPercent: number;
  weeklySubscriptions: Array<{ day: string; value: number }>;
  mostPopularPlan: string;
};

export type LeadSourceOverview = {
  period: "MONTHLY" | "WEEKLY" | "YEARLY";
  total: number;
  data: Array<{
    key: string;
    label: string;
    value: number;
    color: string;
  }>;
};

export type VendorSubscriptionRow = {
  id: string;
  vendorId: string;
  planId: string;
  startsAt: string;
  endsAt: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "SUSPENDED";
  leadsToday: number;
  lastLeadReset: string;
  paymentIntentId?: string | null;
  chargeId?: string | null;
  receiptUrl?: string | null;
  receiptNumber?: string | null;
  createdAt: string;
  vendor: {
    id: string;
    businessName: string;
    slug: string;
    user: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      email: string;
    };
  };
  plan: {
    id: string;
    name: string;
    planId: string;
    leadsPerDay: number;
    durationDays: number;
    price: string | number;
    currency?: string;
  };
};

export type ListVendorSubscriptionsResponse = {
  data: VendorSubscriptionRow[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const adminLeadPlansApi = createApi({
  reducerPath: "adminLeadPlansApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminLeadPlans"],
  endpoints: (builder) => ({
    listLeadPlans: builder.query<LeadPlan[], void>({
      query: () => ({
        url: "/admin/lead-plans",
        method: "GET",
      }),
      transformResponse: (response: LeadPlan[] | { data: LeadPlan[] }) => {
        if (Array.isArray(response)) {
          return response;
        }

        if (response && Array.isArray((response as { data?: LeadPlan[] }).data)) {
          return (response as { data: LeadPlan[] }).data;
        }

        return [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((plan) => ({ type: "AdminLeadPlans" as const, id: plan.id })),
              { type: "AdminLeadPlans", id: "LIST" },
            ]
          : [{ type: "AdminLeadPlans", id: "LIST" }],
    }),
    getLeadPlanSubscribersSummary: builder.query<LeadPlanSubscribersSummary, void>({
      query: () => ({
        url: "/admin/lead-plans/subscribers-summary",
        method: "GET",
      }),
      transformResponse: (
        response:
          | LeadPlanSubscribersSummary
          | { data?: LeadPlanSubscribersSummary }
      ) => {
        if (response && typeof response === "object" && "totalSubscribers" in response) {
          return response as LeadPlanSubscribersSummary;
        }
        return (response as { data?: LeadPlanSubscribersSummary })?.data ?? {
          totalSubscribers: 0,
          dailyAverage: 0,
          growthPercent: 0,
          weeklySubscriptions: [],
          mostPopularPlan: "N/A",
        };
      },
    }),
    getLeadSourceOverview: builder.query<LeadSourceOverview, { period: "MONTHLY" | "WEEKLY" | "YEARLY" }>({
      query: ({ period }) => ({
        url: "/admin/lead-plans/lead-source-overview",
        method: "GET",
        params: { period },
      }),
      transformResponse: (
        response:
          | LeadSourceOverview
          | { data?: LeadSourceOverview }
      ) => {
        if (response && typeof response === "object" && "period" in response) {
          return response as LeadSourceOverview;
        }
        return (response as { data?: LeadSourceOverview })?.data ?? {
          period: "MONTHLY",
          total: 0,
          data: [],
        };
      },
    }),
    listVendorSubscriptions: builder.query<
      ListVendorSubscriptionsResponse,
      { page?: number; limit?: number; search?: string; sortOrder?: "asc" | "desc"; status?: "ACTIVE" | "EXPIRED" | "CANCELLED" | "SUSPENDED" } | void
    >({
      query: (params) => ({
        url: "/admin/lead-plans/subscriptions",
        method: "GET",
        params: params ?? {},
      }),
      transformResponse: (
        response:
          | ListVendorSubscriptionsResponse
          | { data?: VendorSubscriptionRow[]; meta?: ListVendorSubscriptionsResponse["meta"] }
      ) => {
        if (response && typeof response === "object" && "data" in response && Array.isArray((response as any).data)) {
          const parsed = response as { data: VendorSubscriptionRow[]; meta?: ListVendorSubscriptionsResponse["meta"] };
          return {
            data: parsed.data,
            meta: parsed.meta ?? {
              page: 1,
              limit: parsed.data.length,
              total: parsed.data.length,
              totalPages: 1,
            },
          };
        }
        return {
          data: [],
          meta: { page: 1, limit: 0, total: 0, totalPages: 0 },
        };
      },
    }),

    createLeadPlan: builder.mutation<LeadPlan, CreateLeadPlanRequest>({
      query: (body) => ({
        url: "/admin/lead-plans",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "AdminLeadPlans", id: "LIST" }],
    }),

    updateLeadPlan: builder.mutation<LeadPlan, { id: string; body: UpdateLeadPlanRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/lead-plans/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "AdminLeadPlans", id: "LIST" }],
    }),

    deleteLeadPlan: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/admin/lead-plans/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "AdminLeadPlans", id: "LIST" }],
    }),
  }),
});

export const {
  useListLeadPlansQuery,
  useGetLeadPlanSubscribersSummaryQuery,
  useGetLeadSourceOverviewQuery,
  useListVendorSubscriptionsQuery,
  useCreateLeadPlanMutation,
  useUpdateLeadPlanMutation,
  useDeleteLeadPlanMutation,
} = adminLeadPlansApi;
