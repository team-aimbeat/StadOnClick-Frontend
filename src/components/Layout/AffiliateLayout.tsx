import { Navigate, Outlet } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";
import AffiliateSidebar from "./AffiliateSidebar";

export default function AffiliateLayout() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  const isAffiliate = (user.roles ?? []).includes("AFFILIATE");
  if (!isAffiliate) {
    return <Navigate to="/affiliate-marketing" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AffiliateSidebar />
      <div className="flex flex-1 flex-col transition-[margin] duration-300 ease-out lg:ml-65">
        <main className="flex-1 p-6">
          <section className="min-w-0">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
}
