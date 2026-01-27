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

export type AdminInterestInput = {
  name: string;
  icon?: string | null;
  color?: string | null;
  sortOrder?: number;
  mlTags?: string[];
};

export type AdminTimeDurationInput = {
  label: string;
  minutes: number;
  icon?: string | null;
  isDefault?: boolean;
  sortOrder?: number;
  mlTags?: string[];
};

export const preferencesApi = createApi({
  reducerPath: "preferencesApi",
  baseQuery: baseQuery,
  tagTypes: ["Preferences"],
  endpoints: (builder) => ({
    getPublicInterests: builder.query<PublicInterest[], void>({
      query: () => "/preferences/public/interests",
      providesTags: ["Preferences"],
    }),

    getPublicTimeDurations: builder.query<PublicTimeDuration[], void>({
      query: () => "/preferences/public/time-durations",
      providesTags: ["Preferences"],
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

    adminCreateInterest: builder.mutation<PublicInterest, AdminInterestInput>({
      query: (body) => ({
        url: "/admin/interests",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Preferences"],
    }),

    adminUpdateInterest: builder.mutation<
      PublicInterest,
      { id: string; data: Partial<AdminInterestInput> }
    >({
      query: ({ id, data }) => ({
        url: `/admin/interests/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Preferences"],
    }),

    adminDeleteInterest: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/admin/interests/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Preferences"],
    }),

    adminCreateTimeDuration: builder.mutation<PublicTimeDuration, AdminTimeDurationInput>({
      query: (body) => ({
        url: "/admin/time-durations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Preferences"],
    }),

    adminUpdateTimeDuration: builder.mutation<
      PublicTimeDuration,
      { id: string; data: Partial<AdminTimeDurationInput> }
    >({
      query: ({ id, data }) => ({
        url: `/admin/time-durations/${id}`,
        method: "PATCH",
        body: data,
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
  useAdminCreateInterestMutation,
  useAdminUpdateInterestMutation,
  useAdminDeleteInterestMutation,
  useAdminCreateTimeDurationMutation,
  useAdminUpdateTimeDurationMutation,
} = preferencesApi;
