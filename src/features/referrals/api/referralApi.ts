import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";

export type ReferralSummaryResponse = {
  data: {
    referralCode: string | null;
    totalReferrals: number;
    successfulReferrals: number;
    totalRewardEarned: number;
    walletBalance: number;
    recentReferrals: Array<{
      id: string;
      rewardStatus: "PENDING" | "REWARDED";
      createdAt: string;
      rewardedAt: string | null;
      referredUser: {
        id: string;
        email: string;
        name: string | null;
      };
    }>;
  };
};

export const referralApi = createApi({
  reducerPath: "referralApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ReferralSummary"],
  endpoints: (builder) => ({
    getMyReferralSummary: builder.query<ReferralSummaryResponse["data"], void>({
      query: () => ({
        url: "/referrals/me/summary",
        method: "GET",
      }),
      transformResponse: (response: ReferralSummaryResponse) => response.data,
      providesTags: ["ReferralSummary"],
    }),
  }),
});

export const { useGetMyReferralSummaryQuery } = referralApi;

