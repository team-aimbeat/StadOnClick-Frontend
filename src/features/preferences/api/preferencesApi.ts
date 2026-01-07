import { baseQuery } from "@/app/services/baseApi";
import { createApi } from "@reduxjs/toolkit/query/react";

export type PublicInterest = {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
};

export type PublicTimeDuration = {
  id: string;
  label: string;
  minutes: number;
  icon?: string | null;
  isDefault?: boolean;
};

export const preferencesApi = createApi({
  reducerPath: "preferencesApi",
  baseQuery: baseQuery,
  tagTypes: ["Preferences"],
  endpoints: (builder) => ({
    getPublicInterests: builder.query<PublicInterest[], void>({
      query: () => "/preferences/public/interests",
    }),

    getPublicTimeDurations: builder.query<PublicTimeDuration[], void>({
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
