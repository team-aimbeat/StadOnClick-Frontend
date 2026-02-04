import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export type AdminCoupon = {
  code: string;
  title: string;
  discount: number;
  minOrder: number;
  maxUses: number;
  expiry: string;
  status: "ACTIVE" | "EXPIRED" | "DISABLED";
  preview: string;
  onlyNewCustomers: boolean;
};

type AdminCouponResponse = {
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

type ListAdminCouponsResponse = {
  data: AdminCouponResponse[];
};

const mapToAdminCoupon = (payload: AdminCouponResponse): AdminCoupon => ({
  code: payload.code,
  title: payload.title,
  discount: Number(payload.value),
  minOrder: Number(payload.minorder),
  maxUses: Number(payload.uses) || 0,
  expiry: new Date(payload.validTill).toISOString().split("T")[0],
  status: payload.Status,
  preview: `${payload.title} - ${payload.value}% off`,
  onlyNewCustomers: payload.onlyNewCustomers,
});

export const adminCouponsApi = createApi({
  reducerPath: "adminCouponsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminCoupons"],
  endpoints: (builder) => ({
    getAdminCoupons: builder.query<AdminCoupon[], void>({
      query: () => "/admin/coupons",
      transformResponse: (response: ListAdminCouponsResponse) =>
        response.data.map(mapToAdminCoupon),
      providesTags: ["AdminCoupons"],
    }),
    createAdminCoupon: builder.mutation<AdminCoupon, Partial<AdminCoupon>>({
      query: (body) => ({
        url: "/admin/coupons",
        method: "POST",
        body: {
          code: body.code,
          title: body.title,
          discountType: "PERCENT",
          value: body.discount,
          validFrom: new Date().toISOString(),
          validTill: body.expiry,
          minorder: String(body.minOrder ?? 0),
          uses: String(body.maxUses ?? 0),
          onlyNewCustomers: true,
        },
      }),
      transformResponse: (response: { data: AdminCouponResponse }) =>
        mapToAdminCoupon(response.data),
      invalidatesTags: ["AdminCoupons"],
    }),
    disableAdminCoupon: builder.mutation<AdminCoupon, string>({
      query: (code) => ({
        url: `/admin/coupons/${code}/deactivate`,
        method: "PATCH",
      }),
      transformResponse: (response: { data: AdminCouponResponse }) =>
        mapToAdminCoupon(response.data),
      invalidatesTags: ["AdminCoupons"],
    }),
  }),
});

export const {
  useGetAdminCouponsQuery,
  useCreateAdminCouponMutation,
  useDisableAdminCouponMutation,
} = adminCouponsApi;

