import { Outlet } from "react-router-dom";

import ModeratorHeader from "@/components/layout/ModeratorHeader";
import ModeratorSidebar from "@/components/layout/ModeratorSidebar";

export default function ModeratorLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <ModeratorSidebar />

      <div className="flex flex-1 flex-col">
        <ModeratorHeader />
        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
