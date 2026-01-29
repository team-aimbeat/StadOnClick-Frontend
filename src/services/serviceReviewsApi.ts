import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export interface ServiceReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const serviceReviewsApi = createApi({
  reducerPath: "serviceReviewsApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getServiceReviews: builder.query<ServiceReview[], string>({
      query: (serviceId) => `/vendor/reviews/service/${serviceId}`,
      transformResponse: (response: any) => response.data ?? response,
    }),
  }),
});

export const { useGetServiceReviewsQuery } = serviceReviewsApi;
