import { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import ScreenLoader from "@/assets/animations/loader";

const ADMIN_ROLES = ["ADMIN"] as const;

function hasAdminAccess(roles?: string[]) {
  if (!roles?.length) return false;
  return roles.some((r) => ADMIN_ROLES.includes(r as any));
}

export default function AdminProtectedRoute({ children }: PropsWithChildren) {
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const isBootstrapping = useAppSelector((s) => s.auth.isBootstrapping);

  // 🔥 This prevents the "sign-in flicker"
  if (isBootstrapping) {
    return <ScreenLoader />;
  }

  // Not logged in
  if (!user) {
    return (
      <Navigate
        to="/admin/sign-in"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  const isElevatedAdmin = hasAdminAccess(user.roles);
  const isSupportAdmin = user.roles?.includes("SUPPORT_ADMIN");
  const isModerator = user.roles?.includes("MODERATOR");
  const isSupportOnly = Boolean(isSupportAdmin && !isElevatedAdmin && !isModerator);
  const isModeratorOnly = Boolean(isModerator && !isElevatedAdmin && !isSupportAdmin);

  // Logged in but not allowed
  if (!isElevatedAdmin && !isSupportAdmin && !isModerator) {
    return <Navigate to="/admin/access-denied" replace />;
  }

  if (isSupportOnly) {
    const allowedPrefixes = [
      "/admin/support/inbox",
      "/admin/support/dashboard",
      "/admin/chat",
      "/admin/system/health",
    ];
    const canAccess = allowedPrefixes.some((prefix) => location.pathname.startsWith(prefix));
    if (!canAccess) {
      return <Navigate to="/admin/access-denied" replace />;
    }
  }

  if (isModeratorOnly) {
    const allowedPrefixes = ["/admin/moderator", "/admin/system/health"];
    const canAccess = allowedPrefixes.some((prefix) => location.pathname.startsWith(prefix));
    if (!canAccess) {
      return <Navigate to="/admin/access-denied" replace />;
    }
  }

  return <>{children}</>;
}
