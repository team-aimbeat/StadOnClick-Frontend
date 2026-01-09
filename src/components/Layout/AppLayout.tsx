import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import AppLayoutSkeleton from "@/components/Layout/skeletons/AppLayoutSkeleton";
import UserFooter from "./UserFooter";
import UserHeader from "./UserHeader";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <UserHeader />
      <main className="flex-1 min-w-0">
        <Suspense fallback={<AppLayoutSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <UserFooter />
    </div>
  );
}
