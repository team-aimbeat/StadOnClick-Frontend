import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from '@/app/services/baseApi';

export interface MenuMedia {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  sortOrder: number;
  signedUrl: string;
  title: string;
}

export const menuMediaApi = createApi({
  reducerPath: 'menuMediaApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['MenuMedia'],
  endpoints: (builder) => ({
    getServiceMenuMedia: builder.query<MenuMedia[], string>({
      query: (serviceId) => `/vendor/menu-media/service/${serviceId}`,
      transformResponse: (response: any) => {
        const media = Array.isArray(response?.data) ? response.data : [];
        return media.sort((a: any, b: any) => a.sortOrder - b.sortOrder);
      },
      providesTags: (result, error, serviceId) => [{ type: 'MenuMedia', id: serviceId }],
    }),
    uploadServiceMenuMedia: builder.mutation<
      MenuMedia,
      { serviceId: string; file: File; title: string; sortOrder?: number }
    >({
      query: ({ serviceId, file, title, sortOrder }) => {
        const form = new FormData();
        form.append('serviceId', serviceId);
        form.append('title', title);
        if (typeof sortOrder === 'number') {
          form.append('sortOrder', sortOrder.toString());
        }
        form.append('file', file);

        return {
          url: '/vendor/menu-media',
          method: 'POST',
          body: form,
        };
      },
      transformResponse: (response: any) => response.data as MenuMedia,
      invalidatesTags: (result, error, { serviceId }) =>
        result ? [{ type: 'MenuMedia', id: serviceId }] : [],
    }),
    deleteServiceMenuMedia: builder.mutation<void, { serviceId: string; mediaId: string }>({
      query: ({ mediaId }) => ({
        url: `/vendor/menu-media/${mediaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { serviceId }) => [{ type: 'MenuMedia', id: serviceId }],
    }),
  }),
});

export const {
  useGetServiceMenuMediaQuery,
  useUploadServiceMenuMediaMutation,
  useDeleteServiceMenuMediaMutation,
} = menuMediaApi;
