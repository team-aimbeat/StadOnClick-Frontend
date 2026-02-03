import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export type WelcomeCoupon = {
  code: string;
  title: string;
  discountType: "PERCENT" | "FLAT";
  value: string;
  validFrom: string;
  validTill: string;
  minorder: string;
  uses: string;
  Status: "ACTIVE" | "EXPIRED" | "DISABLED";
  onlyNewCustomers: boolean;
};

type WelcomeCouponsResponse = {
  data: WelcomeCoupon[];
};

export const welcomeCouponsApi = createApi({
  reducerPath: "welcomeCouponsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["WelcomeCoupons"],
  endpoints: (builder) => ({
    getWelcomeCoupons: builder.query<WelcomeCoupon[], { limit?: number } | void>({
      query: (params) => ({
        url: "/coupons/welcome",
        method: "GET",
        params: params ?? {},
      }),
      transformResponse: (response: WelcomeCouponsResponse) => response.data,
      providesTags: ["WelcomeCoupons"],
    }),
  }),
});

export const { useGetWelcomeCouponsQuery } = welcomeCouponsApi;

