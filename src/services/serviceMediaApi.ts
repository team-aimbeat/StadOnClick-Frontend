
import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from '@/app/services/baseApi';

export interface ServiceMedia {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  isActive: boolean;
  sortOrder: number;
  signedUrl: string;
  title: string;
}

export const serviceMediaApi = createApi({
  reducerPath: 'serviceMediaApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ServiceMedia'],
  endpoints: (builder) => ({
    getServiceMedia: builder.query<ServiceMedia[], string>({
      query: (serviceId) =>
        `/vendor/media/service/${serviceId}`,

      transformResponse: (response: any) => {
        const media = Array.isArray(response?.media)
          ? response.media
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.data?.data)
              ? response.data.data
              : [];

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
  useLazyGetServiceMediaQuery,
  useUploadServiceMediaMutation,
  useDeleteServiceMediaMutation,
} = serviceMediaApi;
