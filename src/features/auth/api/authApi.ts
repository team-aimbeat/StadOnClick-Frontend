import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";
import type { BasicProfileRequest } from "../types/basicProfile.types";
import type { City } from "../types/city.types";
import { AuthUser } from "../authSlice";


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

    completeProfile: builder.mutation<
      { user: AuthUser; accessToken: string; refreshToken: string },
      BasicProfileRequest
    >({
      query: (body) => ({
        url: "/auth/basic-profile",
        method: "POST",
        body,
      }),
    }),

    getMe: builder.query<{ user: AuthUser }, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    login: builder.mutation<{ user: AuthUser }, { email: string; password: string }>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    requestVendorLoginLink: builder.mutation<
      { success: boolean; token: string; expiresAt: string; loginUrl: string },
      { email: string }
    >({
      query: (body) => ({
        url: "/auth/request-login-link",
        method: "POST",
        body,
      }),
    }),
    autoLogin: builder.mutation<{ success: boolean; user: AuthUser }, { token: string }>({
      query: ({ token }) => ({
        url: "/auth/auto-login",
        method: "GET",
        params: { token },
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
  useRequestVendorLoginLinkMutation,
  useAutoLoginMutation,
} = authApi;
