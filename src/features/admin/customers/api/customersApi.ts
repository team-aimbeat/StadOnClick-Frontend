import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";

export type AdminCustomerStatus = "PENDING_ONBOARDING" | "ACTIVE" | "DISABLED" | "DELETED";

export type AdminCustomer = {
  id: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  nickName?: string | null;
  phone?: string | null;
  status: AdminCustomerStatus;
  profileImageKey?: string | null;
  profileImageUrl?: string | null;
  referralCode?: string | null;
  createdAt: string;
  lastLoginAt?: string | null;
  city?: {
    id: string;
    name: string;
    countryCode: string;
  } | null;
  walletBalance?: number;
  _count: {
    orders: number;
    serviceBookings: number;
    leads: number;
  };
};

export type ListAdminCustomersParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminCustomerStatus;
  sortBy?: "createdAt" | "updatedAt" | "firstName" | "email" | "lastLoginAt";
  sortOrder?: "asc" | "desc";
  fromDate?: string;
  toDate?: string;
};

export type ListAdminCustomersResponse = {
  data: AdminCustomer[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const adminCustomersApi = createApi({
  reducerPath: "adminCustomersApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminCustomers"],
  endpoints: (builder) => ({
    listCustomers: builder.query<ListAdminCustomersResponse, ListAdminCustomersParams | void>({
      query: (params) => ({
        url: "/admin/customers",
        method: "GET",
        params: params ?? {},
      }),
      providesTags: ["AdminCustomers"],
    }),
  }),
});

export const { useListCustomersQuery } = adminCustomersApi;
