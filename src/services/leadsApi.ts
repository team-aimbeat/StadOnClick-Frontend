import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export type SubmitLeadInput = {
  categoryId: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  source?: string;
};

export type SubmitLeadResponse = {
  success: boolean;
  leadId: string;
  categoryId: string;
  createdAt: string;
  distributedVendorsCount: number;
};

export const leadsApi = createApi({
  reducerPath: "leadsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [],
  endpoints: (builder) => ({
    submitLead: builder.mutation<SubmitLeadResponse, SubmitLeadInput>({
      query: (body) => ({
        url: "/leads",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useSubmitLeadMutation } = leadsApi;
