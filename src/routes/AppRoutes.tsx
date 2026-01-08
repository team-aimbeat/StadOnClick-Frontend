import { createBrowserRouter } from "react-router-dom"
import AppLayout from "@/components/Layout/AppLayout"
import Signup from "@/pages/user-onboarding/SignUp"
import AdminDashboard from "@/pages/AdminDashboard"
import Kyc from "@/pages/Kyc"
import ChatVendor from "@/pages/ChatVendor"
import NotFound from "@/pages/NotFound"

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Signup />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/dashboard",
        element: <AdminDashboard />,
      },
       {
        path: "/kyc",
        element: <Kyc />,
      },
      {
        path: "/chat",
        element: <ChatVendor />,
      },

    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
])

export default appRouter
