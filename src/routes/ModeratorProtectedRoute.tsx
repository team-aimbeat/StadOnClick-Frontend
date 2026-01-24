import { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";
import ScreenLoader from "@/assets/animations/loader";

const MODERATOR_ROLES = ["MODERATOR", "ADMIN"] as const;

function hasModeratorAccess(roles?: string[]) {
  if (!roles?.length) return false;
  return roles.some((role) => MODERATOR_ROLES.includes(role as any));
}

export default function ModeratorProtectedRoute({ children }: PropsWithChildren) {
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const isBootstrapping = useAppSelector((state) => state.auth.isBootstrapping);

  if (isBootstrapping) {
    return <ScreenLoader />;
  }

  if (!user) {
    return (
      <Navigate
        to="/admin/sign-in"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (!hasModeratorAccess(user.roles)) {
    return <Navigate to="/admin/access-denied" replace />;
  }

  return <>{children}</>;
}
