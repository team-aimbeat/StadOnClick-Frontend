import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export type AffiliateActivationResponse = {
  success: boolean;
  data: {
    affiliateId: string;
    referralCode: string;
    referralLink: string;
    commissionRate: number;
    totalEarnings: number;
    totalPending: number;
  };
};

export type AffiliateDashboardResponse = {
  success: boolean;
  data: {
    affiliate: {
      id: string;
      referralCode: string;
      referralLink: string;
      commissionRate: number;
      joinedAt: string;
      totalEarnings: number;
      totalPending: number;
    };
    summary: {
      totalReferrals: number;
      activeReferrals: number;
      totalCommissionEarned: number;
      pendingCommission: number;
    };
    monthlyEarnings: Array<{
      month: string;
      amount: number;
    }>;
    recentCommissions: Array<{
      orderId: string;
      date: string;
      amount: number;
      status: string;
      bookingAmount: number;
      bookingStatus: string;
    }>;
  };
};

export type AffiliateReferralRow = {
  referralId: string;
  referredUserId: string;
  referredName: string;
  referredEmail: string;
  bookingId: string | null;
  date: string;
  amount: number;
  status: string;
  bookingStatus: string | null;
};

export type AffiliateReferralsResponse = {
  success: boolean;
  items: AffiliateReferralRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AffiliateCommissionRow = {
  id: string;
  bookingId: string;
  date: string;
  amount: number;
  status: string;
  bookingAmount: number;
  bookingStatus: string;
  referredUser: string | null;
};

export type AffiliateCommissionsResponse = {
  success: boolean;
  items: AffiliateCommissionRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const affiliateApi = createApi({
  reducerPath: "affiliateApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AffiliateDashboard", "AffiliateReferrals", "AffiliateCommissions"],
  endpoints: (builder) => ({
    activateAffiliate: builder.mutation<AffiliateActivationResponse, void>({
      query: () => ({
        url: "/affiliate/activate",
        method: "POST",
      }),
      invalidatesTags: ["AffiliateDashboard", "AffiliateReferrals", "AffiliateCommissions"],
    }),
    getAffiliateDashboard: builder.query<AffiliateDashboardResponse, void>({
      query: () => ({
        url: "/affiliate/dashboard",
        method: "GET",
      }),
      providesTags: ["AffiliateDashboard"],
    }),
    getAffiliateReferrals: builder.query<
      AffiliateReferralsResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/affiliate/referrals",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["AffiliateReferrals"],
    }),
    getAffiliateCommissions: builder.query<
      AffiliateCommissionsResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/affiliate/commissions",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["AffiliateCommissions"],
    }),
  }),
});

export const {
  useActivateAffiliateMutation,
  useGetAffiliateDashboardQuery,
  useGetAffiliateReferralsQuery,
  useGetAffiliateCommissionsQuery,
} = affiliateApi;
