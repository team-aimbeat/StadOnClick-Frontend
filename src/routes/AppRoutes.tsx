import { createBrowserRouter } from "react-router-dom";

import Signup from "@/pages/user-onboarding/SignUp";
import SignIn from "@/pages/user-onboarding/SignIn";
import AdminDashboard from "@/pages/AdminDashboard";
import VendorDashboard from "@/pages/VendorDashboard";
import ErrorPage from "@/pages/ErrorPage";
import Marketplace from "@/pages/Marketplace";
import Home from "@/pages/Home";
import DealDetail from "@/pages/DealDetail";
import Kyc from "@/pages/Kyc"
import ChatBox from "@/pages/ChatBox"
import NotFound from "@/pages/NotFound"
import About from "@/pages/About"
import Teams from "@/pages/Teams"
import Support from "@/pages/Support"
import UserAccount from "@/pages/UserAccount";
import Wishlist from "@/pages/Wishlist";
import AppLayout from "@/components/layout/AppLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import VendorLayout from "@/components/layout/VendorLayout";


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
        path: "/sign-up",
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
        path: "/wishlist",
        element: <Wishlist />,
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
        element: <ChatBox />,
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
