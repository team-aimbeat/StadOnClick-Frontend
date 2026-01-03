import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Footer from "./Footer"
import { useSelector } from "react-redux"
import { IRootState } from "@/app/store"
import Header from "./Header"

export default function AppLayout() {
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const isSidebarCollapsed = !themeConfig.sidebar;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area - Adjust width based on sidebar state */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${




        isSidebarCollapsed ? 'w-full' : 'lg:w-[calc(100%-260px)] lg:ml-[260px]'
      }`}>
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>

        {/* Footer - Fixed positioning issue */}
        <footer className="px-6 pb-6">
          <Footer />
        </footer>
      </div>
    </div>
  )
}