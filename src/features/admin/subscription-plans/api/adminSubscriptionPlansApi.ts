import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export type SubscriptionPlan = {
  id: string;
  planName: string;
  price: string | number;
  currency: string;
  durationDays: number;
  description: string | null;
  perks: string[];
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
};

export type ListSubscriptionPlansResponse = {
  data: SubscriptionPlan[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateSubscriptionPlanRequest = {
  planName: string;
  price: number;
  durationDays: number;
  description?: string | null;
  perks?: string[];
  status?: "ACTIVE" | "INACTIVE";
};

export type UpdateSubscriptionPlanRequest = Partial<CreateSubscriptionPlanRequest>;

export const adminSubscriptionPlansApi = createApi({
  reducerPath: "adminSubscriptionPlansApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminSubscriptionPlans"],
  endpoints: (builder) => ({
    listSubscriptionPlans: builder.query<ListSubscriptionPlansResponse, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: "/admin/subscription-plans",
        method: "GET",
        params: params ?? {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((plan) => ({ type: "AdminSubscriptionPlans" as const, id: plan.id })),
              { type: "AdminSubscriptionPlans", id: "LIST" },
            ]
          : [{ type: "AdminSubscriptionPlans", id: "LIST" }],
    }),

    createSubscriptionPlan: builder.mutation<SubscriptionPlan, CreateSubscriptionPlanRequest>({
      query: (body) => ({
        url: "/admin/subscription-plans",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "AdminSubscriptionPlans", id: "LIST" }],
    }),

    updateSubscriptionPlan: builder.mutation<SubscriptionPlan, { id: string; body: UpdateSubscriptionPlanRequest }>({
      query: ({ id, body }) => ({
        url: `/admin/subscription-plans/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "AdminSubscriptionPlans", id },
        { type: "AdminSubscriptionPlans", id: "LIST" },
      ],
    }),

    deleteSubscriptionPlan: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/admin/subscription-plans/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "AdminSubscriptionPlans", id: "LIST" }],
    }),
  }),
});

export const {
  useListSubscriptionPlansQuery,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
} = adminSubscriptionPlansApi;
