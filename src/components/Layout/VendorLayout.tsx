import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import VendorSidebar from "./VendorSidebar";
import VendorHeader from "./VendorHeader";
import Footer from "./Footer";
import StatusPill from "../vendor-dashboard/StatusPill";
import { HiOutlineBell, HiOutlineChevronDown } from "react-icons/hi2";

export default function VendorLayout() {
  const themeConfig = useSelector((state: RootState) => state.themeConfig);
  const isSidebarCollapsed = !themeConfig.sidebar;

  return (
    <div className="flex min-h-screen bg-[#F3F7FF] ">
      <VendorSidebar />

      <div
        className={`
        flex flex-col flex-1
        transition-[margin] duration-300 ease-out
        lg:ml-17.5
        ${!isSidebarCollapsed ? "lg:ml-65" : ""}
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
