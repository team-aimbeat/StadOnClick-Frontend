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
    <div className="mx-auto max-w-8xl bg-slate-50 py-5 ">
      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AffiliateSidebar />  

        <section className="min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
