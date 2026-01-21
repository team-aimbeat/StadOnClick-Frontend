import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import ScreenLoader from "@/assets/animations/loader";
import { useAppSelector } from "@/app/hooks";

const VENDOR_ROLES = ["VENDOR"] as const;

function hasVendorAccess(roles?: string[]) {
  if (!roles?.length) return false;
  return roles.some((r) => VENDOR_ROLES.includes(r as any));
}

export default function VendorProtectedRoute({ children }: PropsWithChildren) {
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const isBootstrapping = useAppSelector((s) => s.auth.isBootstrapping);

  // Prevent flicker
  if (isBootstrapping) {
    return <ScreenLoader />;
  }

  // Not logged in
  if (!user) {
    return (
      <Navigate
        to="/vendor/sign-in"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Logged in but not vendor
  if (!hasVendorAccess(user.roles)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}
