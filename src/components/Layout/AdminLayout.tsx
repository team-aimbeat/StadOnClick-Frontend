import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import Sidebar from "./Sidebar";
import AdminHeader from "./AdminHeader";
import Footer from "./Footer";

type AdminLayoutProps = {
  basePath?: string;
};

export default function AdminLayout({ basePath = "/admin" }: AdminLayoutProps) {
  const themeConfig = useSelector((state: RootState) => state.themeConfig);
  const isSidebarCollapsed = !themeConfig.sidebar;

  return (
    <div className="flex min-h-screen bg-[#f1f2f8]">
      <Sidebar basePath={basePath} />

      <div
        className={`
        flex flex-col flex-1
        transition-[margin] duration-300 ease-out
        lg:ml-17.5
        ${!isSidebarCollapsed ? "lg:ml-65" : ""}
      `}
      >
        <AdminHeader />

        <main className="flex-1 p-8">
          <Outlet />
        </main>

        <footer className="px-6 pb-6">
          <Footer />
        </footer>
      </div>
    </div>
  );
}
