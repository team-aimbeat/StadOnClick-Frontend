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

type VendorCouponResponse = {
  code: string;
  title: string;
  value: string;
  validFrom: string;
  validTill: string;
  minorder: string;
  uses: string;
  Status: "ACTIVE" | "EXPIRED" | "DISABLED";
};

type CouponsResponse = {
  data: VendorCouponResponse[];
};

const mapToCoupon = (payload: VendorCouponResponse): Coupon => ({
  code: payload.code,
  title: payload.title,
  discount: Number(payload.value),
  minOrder: Number(payload.minorder),
  maxUses: Number(payload.uses) || 0,
  expiry: new Date(payload.validTill).toISOString().split("T")[0],
  status: payload.Status,
  preview: `${payload.title} · ${payload.value}% off`,
});

const DEFAULT_VENDOR_ID = import.meta.env.VITE_VENDOR_ID ?? "40ea7f68-95d4-4588-82e0-916d56a24272";

export const vendorcouponsApi = createApi({
  reducerPath: "couponsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
  }),
  tagTypes: ["Coupons"],
  endpoints: (builder) => ({
    getCoupons: builder.query<Coupon[], void>({
      query: () => "/vendor/coupons/",
      transformResponse: (response: CouponsResponse) =>
        response.data.map(mapToCoupon),
      providesTags: ["Coupons"],
    }),

    createCoupon: builder.mutation<Coupon, Partial<Coupon>>({
      query: (body) => ({
        url: "/vendor/coupons",
        method: "POST",
        body: {
          vendorId: DEFAULT_VENDOR_ID,
          code: body.code,
          title: body.title,
          discountType: "PERCENT",
          value: body.discount,
          validFrom: new Date().toISOString(),
          validTill: body.expiry,
          minorder: String(body.minOrder ?? 0),
          uses: String(body.maxUses ?? 0),
        },
      }),
      transformResponse: (response: { data: VendorCouponResponse }) =>
        mapToCoupon(response.data),
      invalidatesTags: ["Coupons"],
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useCreateCouponMutation,
} = vendorcouponsApi;
