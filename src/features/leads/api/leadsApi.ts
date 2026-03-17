import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";
import type {
  LeadStatus,
  SubmitLeadInput,
  SubmitLeadResponse,
  VendorLeadsResponse,
} from "../types/leads.types";

type VendorLeadsQuery = {
  page?: number;
  limit?: number;
  status?: LeadStatus;
  date?: string;
  categoryId?: string;
};

export const leadsApi = createApi({
  reducerPath: "leadsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["VendorLeads"],
  endpoints: (builder) => ({
    submitLead: builder.mutation<SubmitLeadResponse, SubmitLeadInput>({
      query: (body) => ({
        url: "/leads",
        method: "POST",
        body,
      }),
    }),
    getVendorLeads: builder.query<VendorLeadsResponse, VendorLeadsQuery>({
      query: (params) => ({
        url: "/vendor/leads",
        method: "GET",
        params,
      }),
      providesTags: [{ type: "VendorLeads", id: "LIST" }],
    }),
    updateVendorLeadStatus: builder.mutation<
      { lead?: { id: string; status: LeadStatus } },
      { id: string; status: LeadStatus }
    >({
      query: ({ id, status }) => ({
        url: `/vendor/leads/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: [{ type: "VendorLeads", id: "LIST" }],
    }),
    exportVendorLeads: builder.mutation<Blob, Omit<VendorLeadsQuery, "page" | "limit"> | void>({
      query: (params) => ({
        url: "/vendor/leads/export",
        method: "GET",
        params: params ?? {},
        responseHandler: async (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useSubmitLeadMutation,
  useGetVendorLeadsQuery,
  useUpdateVendorLeadStatusMutation,
  useExportVendorLeadsMutation,
} = leadsApi;
