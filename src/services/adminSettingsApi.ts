import { baseQueryWithReauth } from "@/app/services/baseApi";
import { createApi } from "@reduxjs/toolkit/query/react";

/* ================= TYPES ================= */

export type SystemSettings = {
  PLATFORM_COMMISSION_RATE: number;
  CATEGORY_COMMISSION_RATES?: Record<string, number>;
};

export type SettingsResponse = {
  success: boolean;
  data: SystemSettings;
};

/* ================= API ================= */

export const adminSettingsApi = createApi({
  reducerPath: "adminSettingsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminSettings"],

  endpoints: (builder) => ({
    getSettings: builder.query<SystemSettings, void>({
      query: () => "/admin/settings",
      transformResponse: (response: SettingsResponse) => response.data,
      providesTags: ["AdminSettings"],
    }),

    updateSettings: builder.mutation<void, Partial<SystemSettings>>({
      query: (settings) => ({
        url: "/admin/settings",
        method: "PATCH",
        body: settings,
      }),
      invalidatesTags: ["AdminSettings"],
    }),
  }),
});

/* ================= HOOKS ================= */

export const { useGetSettingsQuery, useUpdateSettingsMutation } = adminSettingsApi;
