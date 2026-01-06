import { baseQuery } from "@/app/services/baseApi";
import { createApi } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQuery,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    sendOtp: builder.mutation<any, { phone: string }>({
      query: (body) => ({ url: "/auth/send-otp", method: "POST", body }),
    }),

    verifyOtp: builder.mutation<any, { phone: string; code: string }>({
      query: (body) => ({ url: "/auth/verify-otp", method: "POST", body }),
    }),

    completeProfile: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/auth/basic-profile",
        method: "POST",
        body: formData,
      }),
    }),

    getMe: builder.query<{ user: any }, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
    }),

    login: builder.mutation<any, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),

    uploadAvatar: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/auth/profile/avatar",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useCompleteProfileMutation,
  useLoginMutation,
  useLogoutMutation,
  useUploadAvatarMutation,
  useGetMeQuery,
} = authApi;
