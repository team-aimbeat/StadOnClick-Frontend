import { createBrowserRouter } from "react-router-dom"
import AppLayout from "@/components/Layout/AppLayout"
import SiteLayout from "@/components/Layout/SiteLayout"
import Signup from "@/pages/user-onboarding/SignUp"
import AdminDashboard from "@/pages/AdminDashboard"
import Home from "@/pages/Home"
import DealDetail from "@/pages/DealDetail"
import ServiceCategory from "@/pages/ServiceCategory"

const appRouter = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/services/:slug",
        element: <ServiceCategory />,
      },
      {
        path: "/deals/:slug",
        element: <DealDetail />,
      },
      {
        element: <AppLayout />,
        children: [
          {
            path: "/dashboard",
            element: <AdminDashboard />,
          },
        ],
      },
    ],
  },
])

export default appRouter
