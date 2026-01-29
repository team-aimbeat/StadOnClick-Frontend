
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

    
    uploadServiceMedia: builder.mutation<
      ServiceMedia,
      { serviceId: string; file: File; title:string;sortOrder?: number }
    >({
      query: ({ serviceId, file,title, sortOrder }) => {
        const form = new FormData();
        form.append('serviceId', serviceId)
         form.append('title', title);
        if (typeof sortOrder === 'number') {
          form.append('sortOrder', sortOrder.toString());
        }
        form.append('file', file);

        return {
          url: '/vendor/media',
          method: 'POST',
          body: form,
        };
      },
      transformResponse: (response: any) => response.data as ServiceMedia,
      invalidatesTags: (result, error, { serviceId }) =>
        result ? [{ type: 'ServiceMedia', id: serviceId }] : [],
    }),
    deleteServiceMedia: builder.mutation<
      void,
      { serviceId: string; mediaId: string }
    >({
      query: ({ mediaId }) => ({
        url: `/vendor/media/${mediaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { serviceId }) => [
        { type: 'ServiceMedia', id: serviceId },
      ],
    }),
  }),
});

export const {
  useGetServiceMediaQuery,
  useUploadServiceMediaMutation,
  useDeleteServiceMediaMutation,
} = serviceMediaApi;
