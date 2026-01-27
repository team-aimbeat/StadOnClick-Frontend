import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";
import type { BasicProfileRequest } from "../types/basicProfile.types";
import type { City } from "../types/city.types";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth, // ✅ IMPORTANT
  tagTypes: ["User"],
  endpoints: (builder) => ({
    sendOtp: builder.mutation<any, { phone: string }>({
      query: (body) => ({
        url: "/auth/send-otp",
        method: "POST",
        body,
      }),
    }),

    verifyOtp: builder.mutation<any, { phone: string; code: string }>({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),

    resendOtp: builder.mutation<any, { phone: string }>({
      query: (body) => ({
        url: "/auth/send-otp",
        method: "POST",
        body,
      }),
    }),

    getCities: builder.query<{ data: City[] }, { q?: string } | void>({
      query: (params) => ({
        url: "/locations/cities",
        method: "GET",
        params: params?.q ? { q: params.q } : undefined,
      }),
    }),

    completeProfile: builder.mutation<any, BasicProfileRequest>({
      query: (body) => ({
        url: "/auth/basic-profile",
        method: "POST",
        body,
      }),
    }),

    getMe: builder.query<{ user: any }, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    login: builder.mutation<any, { email: string; password: string }>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    refresh: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
    }),

    uploadAvatar: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/auth/profile/avatar",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useGetCitiesQuery,
  useCompleteProfileMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
  useUploadAvatarMutation,
  useGetMeQuery,
} = authApi;
