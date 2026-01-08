import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"
import Footer from "./Footer"
import { useSelector } from "react-redux"
import { RootState } from "@/app/store"
import Header from "./Header"
import { Suspense } from "react"
import AppLayoutSkeleton from "@/components/Layout/skeletons/AppLayoutSkeleton"

export default function AppLayout() {
  const { pathname } = useLocation()
  const themeConfig = useSelector((state: RootState) => state.themeConfig);
  const isSidebarCollapsed = !themeConfig.sidebar;
  const isFramedLayout =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/kyc")

  if (!isFramedLayout) {
    return (
      <div className="min-h-screen">
        <Suspense fallback={<AppLayoutSkeleton />}>
          <Outlet />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area - Adjust width based on sidebar state */}
    <div
      className={`
        flex flex-col flex-1
        transition-[margin] duration-500 ease-in-out
        lg:ml-[70px]
        ${!isSidebarCollapsed ? 'lg:ml-[260px]' : ''}
      `}
    >
      {/* Header */}
      <Header />

      {/* Page Content */}
      <main className="flex-1 p-6">
 <Suspense fallback={<AppLayoutSkeleton />}>
           <Outlet /></Suspense>
       
      </main>

      {/* Footer */}
      <footer className="px-6 pb-6">
        <Footer />
      </footer>
    </div>
    </div>
  )
}
