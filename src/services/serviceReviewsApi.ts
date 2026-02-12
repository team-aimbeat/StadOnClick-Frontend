import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export interface ServiceReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    nickName?: string | null;
  } | null;
}

export const serviceReviewsApi = createApi({
  reducerPath: "serviceReviewsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ServiceReview"],
  endpoints: (builder) => ({
    getServiceReviews: builder.query<ServiceReview[], string>({
      query: (serviceId) => `/vendor/reviews/service/${serviceId}`,
      transformResponse: (response: any) => response.data ?? response,
      providesTags: (result, error, serviceId) => [{ type: "ServiceReview" as const, id: serviceId }],
    }),
    createReview: builder.mutation<ServiceReview, { serviceId: string; rating: number; comment: string }>({
      query: (body) => ({
        url: "/vendor/reviews",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { serviceId }) => [{ type: "ServiceReview" as const, id: serviceId }],
    }),
  }),
});

export const {
  useGetServiceReviewsQuery,
  useLazyGetServiceReviewsQuery,
  useCreateReviewMutation,
} = serviceReviewsApi;
