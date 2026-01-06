import { baseQuery } from "@/app/services/baseApi";
import { createApi } from "@reduxjs/toolkit/query/react";

export const preferencesApi = createApi({
  reducerPath: "preferencesApi",
  baseQuery: baseQuery,
  tagTypes: ["Preferences"],
  endpoints: (builder) => ({
    getPublicInterests: builder.query<any[], void>({
      query: () => "/preferences/public/interests",
    }),

    getPublicTimeDurations: builder.query<any[], void>({
      query: () => "/preferences/public/time-durations",
    }),

    getMyPreferences: builder.query<any, void>({
      query: () => "/preferences/me",
      providesTags: ["Preferences"],
    }),

    saveMyPreferences: builder.mutation<any, any>({
      query: (body) => ({
        url: "/preferences/me",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Preferences"],
    }),
  }),
});

export const {
  useGetPublicInterestsQuery,
  useGetPublicTimeDurationsQuery,
  useGetMyPreferencesQuery,
  useSaveMyPreferencesMutation,
} = preferencesApi;
