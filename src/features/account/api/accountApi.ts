import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";

export type AccountProfile = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  gender: "MALE" | "FEMALE" | "NON_BINARY" | "PREFER_NOT_TO_SAY" | null;
  phone: string | null;
  profileImageKey: string | null;
  birthday: string | null;
};

export type ShippingAddress = {
  id: string;
  name: string;
  phone: string | null;
  address1: string;
  address2: string | null;
  city: string;
  postalCode: string;
  county: string | null;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ShippingAddressFormInput = {
  name: string;
  phone?: string | null;
  address1: string;
  address2?: string | null;
  city: string;
  postalCode: string;
  county?: string | null;
  country?: string;
  isDefault?: boolean;
};

export type ShippingAddressUpdateInput = Partial<ShippingAddressFormInput>;

type ShippingAddressesResponse = { data: ShippingAddress[] };
type ProfileResponse = { data: AccountProfile };

export const accountApi = createApi({
  reducerPath: "accountApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AccountProfile", "ShippingAddresses"],
  endpoints: (builder) => ({
    getProfile: builder.query<ProfileResponse, void>({
      query: () => ({ url: "/account/profile", method: "GET" }),
      providesTags: [{ type: "AccountProfile", id: "CURRENT" }],
    }),

    updateProfile: builder.mutation<ProfileResponse, Partial<AccountProfile>>({
      query: (body) => ({
        url: "/account/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "AccountProfile", id: "CURRENT" }],
    }),

    changePassword: builder.mutation<{ success: boolean }, { currentPassword: string; newPassword: string; confirmPassword: string }>({
      query: (body) => ({
        url: "/account/change-password",
        method: "POST",
        body,
      }),
    }),

    listShippingAddresses: builder.query<ShippingAddressesResponse, void>({
      query: () => ({ url: "/account/shipping-addresses", method: "GET" }),
      providesTags: (result) =>
        result
          ? [{ type: "ShippingAddresses", id: "LIST" }]
          : [{ type: "ShippingAddresses", id: "LIST" }],
    }),

    createShippingAddress: builder.mutation<{ data: ShippingAddress }, ShippingAddressFormInput>({
      query: (body) => ({
        url: "/account/shipping-addresses",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ShippingAddresses", id: "LIST" }],
    }),

    updateShippingAddress: builder.mutation<{ data: ShippingAddress }, { id: string; data: ShippingAddressUpdateInput }>({
      query: ({ id, data }) => ({
        url: `/account/shipping-addresses/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [{ type: "ShippingAddresses", id: "LIST" }],
    }),

    deleteShippingAddress: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/account/shipping-addresses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ShippingAddresses", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useListShippingAddressesQuery,
  useCreateShippingAddressMutation,
  useUpdateShippingAddressMutation,
  useDeleteShippingAddressMutation,
} = accountApi;
