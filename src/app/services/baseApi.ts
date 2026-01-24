import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { clearAuth } from "@/features/auth/authSlice";

const REFRESH_URL = "/auth/refresh";
let refreshFailed = false;

const getRequestUrl = (args: string | FetchArgs) =>
  typeof args === "string" ? args : args.url ?? "";

const getPortalSignInPath = (pathname: string) => {
  if (pathname.startsWith("/admin")) {
    return "/admin/sign-in";
  }

  if (pathname.startsWith("/vendor")) {
    return "/vendor/sign-in";
  }

  return "/sign-in";
};

const redirectToSignIn = () => {
  if (typeof window === "undefined") {
    return;
  }

  const targetPath = getPortalSignInPath(window.location.pathname);
  if (window.location.pathname !== targetPath) {
    window.location.assign(targetPath);
  }
};

export const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include", // REQUIRED for cookies
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  const requestUrl = getRequestUrl(args);
  const isRefreshRequest = requestUrl === REFRESH_URL;

  if (!result.error && (requestUrl === REFRESH_URL || requestUrl === "/auth/login")) {
    refreshFailed = false;
  }

  if (result.error?.status === 401) {
    if (isRefreshRequest) {
      refreshFailed = true;
      api.dispatch(clearAuth());
      redirectToSignIn();
      return result;
    }

    if (refreshFailed) {
      api.dispatch(clearAuth());
      redirectToSignIn();
      return result;
    }

    const refreshResult = await baseQuery(
      { url: REFRESH_URL, method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // retry original request after refresh
      refreshFailed = false;
      result = await baseQuery(args, api, extraOptions);
    } else {
      // refresh failed -> hard logout
      refreshFailed = true;
      api.dispatch(clearAuth());
      redirectToSignIn();
    }
  }

  return result;
};
