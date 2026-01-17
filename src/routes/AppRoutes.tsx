import { createBrowserRouter } from "react-router-dom";

import Signup from "@/pages/user-onboarding/SignUp";
import SignIn from "@/pages/user-onboarding/SignIn";
import AdminDashboard from "@/pages/AdminDashboard";
import VendorDashboard from "@/pages/VendorDashboard";
import ErrorPage from "@/pages/ErrorPage";
import Marketplace from "@/pages/Marketplace";
import Home from "@/pages/Home";
import DealDetail from "@/pages/DealDetail";
import Kyc from "@/pages/Kyc";
import ChatBox from "@/pages/ChatBox";
import NotFound from "@/pages/NotFound";
import About from "@/pages/About";
import Teams from "@/pages/Teams";
import Support from "@/pages/Support";
import UserAccount from "@/pages/UserAccount";
import Wishlist from "@/pages/Wishlist";
import VendorPlaceholder from "@/pages/VendorPlaceholder";
import AppLayout from "@/components/layout/AppLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import VendorLayout from "@/components/layout/VendorLayout";

const vendorPlaceholder = (title: string, description?: string) => (
  <VendorPlaceholder title={title} description={description} />
);


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
      { path: "dashboard", element: <VendorDashboard /> },
      {
        path: "leads",
        element: vendorPlaceholder("All Leads", "Track and respond to every incoming lead."),
      },
      {
        path: "leads/new",
        element: vendorPlaceholder("New Leads", "Reply fast to improve conversion."),
      },
      { path: "leads/contacted", element: vendorPlaceholder("Contacted Leads") },
      { path: "leads/converted", element: vendorPlaceholder("Converted Leads") },
      {
        path: "leads/lost",
        element: vendorPlaceholder("Lost Leads", "Diagnose why leads are dropping."),
      },
      {
        path: "leads/sources",
        element: vendorPlaceholder("Lead Sources", "See which channels drive volume."),
      },
      {
        path: "bookings",
        element: vendorPlaceholder("Bookings", "Manage upcoming and past jobs."),
      },
      { path: "bookings/upcoming", element: vendorPlaceholder("Upcoming Bookings") },
      { path: "bookings/completed", element: vendorPlaceholder("Completed Bookings") },
      { path: "bookings/refunds", element: vendorPlaceholder("Refund Requests") },
      { path: "profile", element: vendorPlaceholder("Business Profile") },
      { path: "services", element: vendorPlaceholder("Services") },
      { path: "media", element: vendorPlaceholder("Photos & Media") },
      { path: "coupons", element: vendorPlaceholder("Coupons") },
      { path: "wallet", element: vendorPlaceholder("Wallet") },
      { path: "payouts", element: vendorPlaceholder("Payouts") },
      { path: "subscription", element: vendorPlaceholder("Lead Plan Subscription") },
      { path: "promote", element: vendorPlaceholder("Promote / Sponsorships") },
      { path: "kyc", element: vendorPlaceholder("KYC Documents") },
      { path: "stripe", element: vendorPlaceholder("Stripe Connect") },
      { path: "support", element: vendorPlaceholder("Support Chat") },
      { path: "help", element: vendorPlaceholder("Help Center") },
      { path: "insights", element: vendorPlaceholder("Customer Insights") },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default appRouter;
