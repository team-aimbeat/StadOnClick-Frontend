import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { clearAuth } from "@/features/auth/authSlice";

const REFRESH_URL = "/auth/refresh";
let refreshInProgress: Promise<unknown> | null = null;

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

const runRefresh = (
  args: string | FetchArgs,
  api: Parameters<BaseQueryFn>[1],
  extraOptions: Parameters<BaseQueryFn>[2]
) => {
  if (!refreshInProgress) {
    refreshInProgress = Promise.resolve(
      baseQuery({ url: REFRESH_URL, method: "POST" }, api, extraOptions),
    ).finally(() => {
      refreshInProgress = null;
    });
  }
  return refreshInProgress;
};

const isRefreshAuthorized = (refreshResponse: unknown) => {
  if (!refreshResponse || typeof refreshResponse !== "object") return false;
  const response = refreshResponse as { success?: boolean; message?: string };
  if (Object.prototype.hasOwnProperty.call(response, "success")) {
    return response.success === true;
  }
  return true;
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

  if (result.error?.status === 401) {
    if (isRefreshRequest) {
      api.dispatch(clearAuth());
      redirectToSignIn();
      return result;
    }

    const refreshResult = await runRefresh(args, api, extraOptions);
    const refreshError = (refreshResult as { error?: FetchBaseQueryError }).error;
    const refreshData = (refreshResult as { data?: unknown }).data;

    if (refreshError?.status === 401 || !isRefreshAuthorized(refreshData)) {
      api.dispatch(clearAuth());
      redirectToSignIn();
      return result;
    }

    if (refreshResult && !refreshError) {
      result = await baseQuery(args, api, extraOptions);
      return result;
    }
  }

  return result;
};
