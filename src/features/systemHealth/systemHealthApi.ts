import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { HealthLiveResponse, HealthReadyResponse } from "./systemHealth.types";

const baseUrl =
  (import.meta.env.VITE_SYSTEM_URL  || "").trim();


export const systemHealthApi = createApi({
  reducerPath: "systemHealthApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
  }),
  tagTypes: ["SystemHealth"],
  endpoints: (builder) => ({
    getHealthLive: builder.query<HealthLiveResponse, void>({
      query: () => "/health/live",
      providesTags: ["SystemHealth"],
    }),
    getHealthReady: builder.query<HealthReadyResponse, void>({
      query: () => "/health/ready",
      providesTags: ["SystemHealth"],
    }),
  }),
});

export const { useGetHealthLiveQuery, useGetHealthReadyQuery } = systemHealthApi;
