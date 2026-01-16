import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import Sidebar from "./Sidebar";
import VendorHeader from "./VendorHeader";
import Footer from "./Footer";

export default function VendorLayout() {
  const themeConfig = useSelector((state: RootState) => state.themeConfig);
  const isSidebarCollapsed = !themeConfig.sidebar;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar basePath="/vendor" />

      <div
        className={`
        flex flex-col flex-1
        transition-[margin] duration-300 ease-out
        lg:ml-[70px]
        ${!isSidebarCollapsed ? "lg:ml-[260px]" : ""}
      `}
      >
        <VendorHeader />

        <main className="flex-1 p-6">
          <Outlet />
        </main>

        <footer className="px-6 pb-6">
          <Footer />
        </footer>
      </div>
    </div>
  );
}
