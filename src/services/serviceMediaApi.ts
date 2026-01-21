import { baseQueryWithReauth } from '@/app/services/baseApi';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ServiceMedia {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  isActive: boolean;
  sortOrder: number;
  signedUrl: string;
}

export const serviceMediaApi = createApi({
  reducerPath: 'serviceMediaApi',
   baseQuery: fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  }),
  tagTypes: ['ServiceMedia'],
  endpoints: (builder) => ({
    getServiceMedia: builder.query<ServiceMedia[], string>({
      query: (serviceId) =>
        `/vendor/media/service/${serviceId}`,

      transformResponse: (response: any) => {
        const media = response.media ?? response.data ?? [];

        return media.sort(
          (a: any, b: any) => a.sortOrder - b.sortOrder
        );
      },

      providesTags: (result, error, serviceId) => [
        { type: 'ServiceMedia', id: serviceId },
      ],
    }),
  }),
});

export const {
  useGetServiceMediaQuery,
} = serviceMediaApi;
