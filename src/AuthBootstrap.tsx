import { PropsWithChildren, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetMeQuery, useRefreshMutation } from "@/features/auth/api/authApi";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setBootstrapping, setUser } from "@/features/auth/authSlice";
import ScreenLoader from "@/assets/animations/loader";
import { getPostLoginRoute } from "@/lib/authRouting";

const ADMIN_ROLES = ["ADMIN", "SUPPORT_ADMIN", "MODERATOR"] as const;
const VENDOR_ROLES = ["VENDOR"] as const;

function hasAdminAccess(roles?: string[]) {
  if (!roles?.length) return false;
  return roles.some((role) => ADMIN_ROLES.includes(role as any));
}

function hasVendorAccess(roles?: string[]) {
  if (!roles?.length) return false;
  return roles.some((role) => VENDOR_ROLES.includes(role as any));
}

export function AuthBootstrap({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const isBootstrapping = useAppSelector((state) => state.auth.isBootstrapping);
  const [refreshSession] = useRefreshMutation();

  const { data, isLoading, isFetching, isSuccess, isError } = useGetMeQuery();

  useEffect(() => {
    dispatch(setBootstrapping(true));
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess) {
      dispatch(setUser(data?.user ?? null));
      dispatch(setBootstrapping(false));
    }

    if (isError) {
      dispatch(setUser(null));
      dispatch(setBootstrapping(false));
    }
  }, [data?.user, dispatch, isError, isSuccess]);

  useEffect(() => {
    if (!user) return;
      const path = location.pathname;

      if (user.status && user.status !== "ACTIVE") {
        if (isBootstrapping) return;
        if (!path.startsWith("/sign-up")) {
          navigate("/sign-up?step=4", { replace: true });
        }
        return;
      }

      const isVendor = (user.roles ?? []).includes("VENDOR");
      const nextAction = user.nextAction;
      const roles = user.roles ?? [];
      const isAdminAuthEntry = path === "/admin/sign-in" || path === "/admin";
      const isVendorAuthEntry = path === "/vendor/sign-in";

      if (isAdminAuthEntry && !hasAdminAccess(roles)) {
        navigate("/admin/access-denied", { replace: true });
        return;
      }

      if (isVendorAuthEntry && !hasVendorAccess(roles)) {
        navigate("/access-denied", { replace: true });
        return;
      }

      const shouldForceVendorSetup =
        isVendor &&
        !!nextAction &&
        path !== nextAction &&
        (path.startsWith("/vendor") || nextAction === "/business/onboarding");
      if (shouldForceVendorSetup && nextAction) {
        navigate(nextAction, { replace: true });
        return;
      }

      const isLegacyModerator = path.startsWith("/moderator");
      if (!isAdminAuthEntry && !isLegacyModerator) return;
      const target = getPostLoginRoute(roles);
      if (target && target !== path) {
        navigate(target, { replace: true });
      }
  }, [location.pathname, navigate, user, isBootstrapping]);

  useEffect(() => {
    if (!user || typeof window === "undefined") {
      return;
    }

    const runRefresh = async () => {
      try {
        await refreshSession().unwrap();
      } catch {
        // refresh errors are handled by baseApi; this guard avoids unhandled rejections.
      }
    };

    const intervalId = window.setInterval(() => {
      void runRefresh();
    }, 10 * 60 * 1000);

    void runRefresh();

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshSession, user]);

  if (isLoading || isFetching) {
    return <ScreenLoader />;
  }

  return <>{children}</>;
}
