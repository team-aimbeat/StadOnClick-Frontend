import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

export default function AdminLayout() {
  const themeConfig = useSelector((state: RootState) => state.themeConfig);
  const isSidebarCollapsed = !themeConfig.sidebar;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar basePath="/admin" />

      <div
        className={`
        flex flex-col flex-1
        transition-[margin] duration-500 ease-in-out
        lg:ml-[70px]
        ${!isSidebarCollapsed ? "lg:ml-[260px]" : ""}
      `}
      >
        <Header />

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
