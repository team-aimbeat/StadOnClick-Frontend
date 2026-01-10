import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/components/Layout/AppLayout";
import Signup from "@/pages/user-onboarding/SignUp";
import SignIn from "@/pages/user-onboarding/SignIn";
import AdminDashboard from "@/pages/AdminDashboard";
import ErrorPage from "@/pages/ErrorPage";
import Marketplace from "@/pages/Marketplace";
import Home from "@/pages/Home";
import DealDetail from "@/pages/DealDetail";
import Kyc from "@/pages/Kyc"
import ChatVendor from "@/pages/ChatVendor"
import NotFound from "@/pages/NotFound"
import About from "@/pages/About"
import Teams from "@/pages/Teams"
import Support from "@/pages/Support"

const appRouter = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <ErrorPage />,
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
        path: "/about",
        element: <About />,
      },
      {
        path: "/teams",
        element: <Teams />,
      },
      {
        path: "/support",
        element: <Support />,
      },
      {
        path: "/deals/:slug",
        element: <DealDetail />,
      },
      {
        path: "/dashboard",
        element: <AdminDashboard />,
        errorElement: <ErrorPage />,
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
]);

export default appRouter;
