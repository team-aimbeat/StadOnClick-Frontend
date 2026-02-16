import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";

export type WishlistItem = {
  id: string;
  serviceId: string;
  title: string;
  image: string;
  location: string;
  categoryName: string;
  rating: number;
  reviews: number;
};

export const wishlistApi = createApi({
  reducerPath: "wishlistApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Wishlist"],
  endpoints: (builder) => ({
    getWishlist: builder.query<WishlistItem[], void>({
      query: () => "/wishlist",
      transformResponse: (response: { data?: WishlistItem[] }) =>
        response.data ?? [],
      providesTags: ["Wishlist"],
    }),
    addWishlistItem: builder.mutation<{ success: boolean }, { serviceId: string }>({
      query: (body) => ({
        url: "/wishlist",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wishlist"],
    }),
    removeWishlistItem: builder.mutation<{ success: boolean }, { serviceId: string }>({
      query: ({ serviceId }) => ({
        url: `/wishlist/${serviceId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddWishlistItemMutation,
  useRemoveWishlistItemMutation,
} = wishlistApi;

