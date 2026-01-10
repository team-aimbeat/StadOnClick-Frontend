import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import VendorLayout from "@/components/layout/VendorLayout";
import Signup from "@/pages/user-onboarding/SignUp";
import SignIn from "@/pages/user-onboarding/SignIn";
import AdminDashboard from "@/pages/AdminDashboard";
import VendorDashboard from "@/pages/VendorDashboard";
import ErrorPage from "@/pages/ErrorPage";
import Marketplace from "@/pages/Marketplace";
import Home from "@/pages/Home";
import DealDetail from "@/pages/DealDetail";
import ServiceCategory from "@/pages/ServiceCategory";
import Kyc from "@/pages/Kyc"
import ChatVendor from "@/pages/ChatVendor"
import NotFound from "@/pages/NotFound"
import UserAccount from "@/pages/UserAccount";

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
        path: "/account",
        element: <UserAccount />,
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
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "dashboard",
        element: <AdminDashboard />,
        errorElement: <ErrorPage />,
      },
      {
        path: "kyc",
        element: <Kyc />,
      },
      {
        path: "chat",
        element: <ChatVendor />,
      },
    ],
  },
  {
    path: "/vendor",
    element: <VendorLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "dashboard",
        element: <VendorDashboard />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default appRouter;
