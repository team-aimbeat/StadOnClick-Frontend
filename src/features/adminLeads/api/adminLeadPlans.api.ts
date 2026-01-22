import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";
import {
  CreateLeadPlanRequest,
  LeadPlan,
  UpdateLeadPlanRequest,
} from "../types/leadPlans.types";

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
  }),
});

export const {
  useListLeadPlansQuery,
  useCreateLeadPlanMutation,
  useUpdateLeadPlanMutation,
} = adminLeadPlansApi;
