import { createBrowserRouter } from "react-router-dom"
import AppLayout from "@/components/Layout/AppLayout"
import Signup from "@/pages/user-onboarding/SignUp"
import AdminDashboard from "@/pages/AdminDashboard"
import Kyc from "@/pages/Kyc"

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
    ],
  },
])

export default appRouter
