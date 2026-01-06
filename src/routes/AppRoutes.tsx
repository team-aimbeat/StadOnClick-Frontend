import { createBrowserRouter } from "react-router-dom"
import AppLayout from "@/components/Layout/AppLayout"
import Signup from "@/pages/user-onboarding/SignUp"
import AdminDashboard from "@/pages/AdminDashboard"

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
    ],
  },
])

export default appRouter
