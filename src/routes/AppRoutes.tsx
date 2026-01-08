import { createBrowserRouter } from "react-router-dom"
import AppLayout from "@/components/Layout/AppLayout"
import SiteLayout from "@/components/Layout/SiteLayout"
import Signup from "@/pages/user-onboarding/SignUp"
import SignIn from "@/pages/user-onboarding/SignIn"
import AdminDashboard from "@/pages/AdminDashboard"
import ErrorPage from "@/pages/ErrorPage"
import Marketplace from "@/pages/Marketplace"
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
    errorElement: <ErrorPage />,
  },
  {
    path: "/sign-in",
    element: <SignIn />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/marketplace",
    element: <Marketplace />,
    errorElement: <ErrorPage />,
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
    errorElement: <ErrorPage />,
        children: [
          {
            path: "/dashboard",
            element: <AdminDashboard />,
        errorElement: <ErrorPage />,
          },
        ],
      },
    ],
  },
])

export default appRouter
