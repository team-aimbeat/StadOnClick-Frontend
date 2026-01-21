import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type Coupon = {
  code: string;
  title: string;
  discount: number;
  minOrder: number;
  maxUses: number;
  expiry: string;
  status: "ACTIVE" | "EXPIRED" | "DISABLED";
  preview: string;
};

export const vendorcouponsApi = createApi({
  reducerPath: "couponsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
  }),
  tagTypes: ["Coupons"],
  endpoints: (builder) => ({
    getCoupons: builder.query<Coupon[], void>({
      query: () => "/vendor/coupons",
      providesTags: ["Coupons"],
    }),

    createCoupon: builder.mutation<Coupon, Partial<Coupon>>({
      query: (body) => ({
        url: "/vendor/coupons",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Coupons"],
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useCreateCouponMutation,
} = vendorcouponsApi;
