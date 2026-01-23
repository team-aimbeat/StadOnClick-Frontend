import { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import ScreenLoader from "@/assets/animations/loader";

const ADMIN_ROLES = ["ADMIN", "MODERATOR"] as const;

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

  // Logged in but not admin
  if (!hasAdminAccess(user.roles)) {
    return <Navigate to="/admin/access-denied" replace />;
  }

  return <>{children}</>;
}
