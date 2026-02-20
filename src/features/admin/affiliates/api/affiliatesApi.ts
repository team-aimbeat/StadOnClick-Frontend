import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";

export type AdminAffiliate = {
  id: string;
  userId: string;
  referralCode: string;
  commissionRate: number;
  totalEarnings: number | string;
  totalPending: number | string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    nickName?: string | null;
    profileImageUrl?: string | null;
  };
  _count: {
    referrals: number;
    commissions: number;
    clicks: number;
    links: number;
  };
};

export const adminAffiliatesApi = createApi({
  reducerPath: "adminAffiliatesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminAffiliates"],
  endpoints: (builder) => ({
    listAllAffiliates: builder.query<
      { data: AdminAffiliate[]; meta?: { total?: number } },
      { page?: number; limit?: number; sortBy?: string; sortOrder?: "asc" | "desc" } | void
    >({
      query: (params) => ({
        url: "/admin/affiliates",
        method: "GET",
        params: params ?? {},
      }),
      providesTags: ["AdminAffiliates"],
    }),
    updateAffiliateStatus: builder.mutation<
      { success: boolean; affiliate: { id: string; status: "ACTIVE" | "INACTIVE" } },
      { id: string; status: "ACTIVE" | "INACTIVE" }
    >({
      query: ({ id, status }) => ({
        url: `/admin/affiliates/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["AdminAffiliates"],
    }),
    updateAffiliateCommissionRate: builder.mutation<
      { success: boolean; affiliate: { id: string; commissionRate: number } },
      { id: string; commissionRate: number }
    >({
      query: ({ id, commissionRate }) => ({
        url: `/admin/affiliates/${id}/commission-rate`,
        method: "PATCH",
        body: { commissionRate },
      }),
      invalidatesTags: ["AdminAffiliates"],
    }),
  }),
});

export const {
  useListAllAffiliatesQuery,
  useUpdateAffiliateStatusMutation,
  useUpdateAffiliateCommissionRateMutation,
} = adminAffiliatesApi;
