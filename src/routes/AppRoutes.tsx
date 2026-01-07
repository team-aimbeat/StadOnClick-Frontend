import { createBrowserRouter } from "react-router-dom"
import AppLayout from "@/components/Layout/AppLayout"
import Signup from "@/pages/user-onboarding/SignUp"
import SignIn from "@/pages/user-onboarding/SignIn"
import AdminDashboard from "@/pages/AdminDashboard"
import ErrorPage from "@/pages/ErrorPage"

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Signup />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/sign-in",
    element: <SignIn />,
    errorElement: <ErrorPage />,
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
])

export default appRouter
