import { Outlet, useLocation } from "react-router-dom";
import { Suspense } from "react";
import AppLayoutSkeleton from "@/components/Layout/skeletons/AppLayoutSkeleton";
import UserFooter from "./UserFooter";
import UserHeader from "./UserHeader";

export default function AppLayout() {
  const { pathname } = useLocation();
  const hideHeader =
    pathname.startsWith("/signup") || pathname.startsWith("/sign-in");

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeader && <UserHeader />}
      <main className="flex-1">
        <Suspense fallback={<AppLayoutSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      {!hideHeader && <UserFooter />}
    </div>
  );
}
