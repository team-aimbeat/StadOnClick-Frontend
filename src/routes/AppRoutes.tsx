import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import Signup from "@/pages/user-onboarding/SignUp";
import SignIn from "@/pages/user-onboarding/SignIn";
import AdminDashboard from "@/pages/AdminDashboard";
import VendorDashboard from "@/pages/VendorDashboard";
import VendorLeads from "@/pages/VendorLeads";
import ErrorPage from "@/pages/ErrorPage";
import Marketplace from "@/pages/Marketplace";
import Home from "@/pages/Home";
import DealDetail from "@/pages/DealDetail";
import PlaceDetail from "@/pages/PlaceDetail";
import Kyc from "@/pages/Kyc";
import About from "@/pages/About";
import BookingsPage from "@/pages/BookingsPage";
import VendorTableShowcase from "@/pages/VendorTableShowcase";
import VendorProfile from "@/pages/VendorProfile";
import VendorServices from "@/pages/VendorServices";
import VendorCategoryDetail from "@/pages/VendorCategoryDetail";
import VendorServiceOptions from "@/pages/VendorServiceOptions";
import VendorMedia from "@/pages/VendorMedia";
import VendorCoupons from "@/pages/VendorCoupons";
import VendorWallet from "@/pages/VendorWallet";
import VendorPayouts from "@/pages/VendorPayouts";
import VendorPromote from "@/pages/VendorPromote";
import VendorKyc from "@/pages/VendorKyc";
import VendorStripe from "@/pages/VendorStripe";
import VendorSupport from "@/pages/VendorSupport";
import VendorTicketDetails from "@/pages/VendorTicketDetails";
import VendorHelp from "@/pages/VendorHelp";
import VendorInsights from "@/pages/VendorInsights";
import VendorBookingDetail from "@/pages/VendorBookingDetail";
import Teams from "@/pages/Teams";
import Support from "@/pages/Support";
import UserAccount from "@/pages/UserAccount";
import Wishlist from "@/pages/Wishlist";
import VendorPlaceholder from "@/pages/VendorPlaceholder";
import AppLayout from "@/components/layout/AppLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import VendorLayout from "@/components/layout/VendorLayout";
import VendorAnalyticsDashboard from "@/pages/VendorAnalyticsDashboard";
import VendorNotifications from "@/pages/VendorNotifications";
import VendorsPage from "@/pages/Admin/Vendors/VendorsPage";
import VendorApplicationsPage from "@/pages/Admin/Vendors/VendorApplicationsPage";

import AdminSignIn from "@/pages/Admin/AdminSignIn";
import AdminProtectedRoute from "./AdminProtectedRoute";
import ModeratorProtectedRoute from "./ModeratorProtectedRoute";
import VendorSignIn from "@/pages/vendor/VendorSignIn";
import VendorProtectedRoute from "./VendorProtectedRoute";
import AccessDenied from "@/components/shared/AccessDenied";
import AdminNotFound from "@/pages/Admin/AdminNotFound";
import VendorNotFound from "@/pages/Admin/Vendors/VendorNotFound";
import LeadPlansPage from "@/pages/Admin/leads/LeadPlansPage";
import VendorLeadSubscriptionPage from "@/pages/VendorLeadSubscription/VendorLeadSubscriptionPage";
import SubscriptionSuccessPage from "@/pages/VendorLeadSubscription/SubscriptionSuccessPage";
import AdminStaffPage from "@/pages/Admin/staff/AdminStaffPage";
import AdminSupportInbox from "@/pages/Admin/AdminSupportInbox";
import AdminSupportChatConsole from "@/pages/Admin/SupportChat/AdminSupportChatConsole";
import SupportAdminDashboard from "@/pages/Admin/SupportAdminDashboard";
import ModeratorDashboard from "@/pages/Moderator/ModeratorDashboard";
import ModeratorEscalationsInbox from "@/pages/Moderator/Escalations/ModeratorEscalationsInbox";
import ModeratorEscalationDetails from "@/pages/Moderator/Escalations/ModeratorEscalationDetails";
import ModeratorNotifications from "@/pages/Moderator/ModeratorNotifications";
import { AuthBootstrap } from "@/AuthBootstrap";
import PreferencesStudio from "@/pages/Admin/catalog/PreferencesStudio";
import SystemHealthPage from "@/pages/Admin/SystemHealth/SystemHealthPage";
import AdminKycDocumentsPage from "@/pages/Admin/kyc/AdminKycDocuments";

const vendorPlaceholder = (title: string, description?: string) => (
  <VendorPlaceholder title={title} description={description} />
);

const appRouter = createBrowserRouter([
  {
    element: (
      <AuthBootstrap>
        <Outlet />
      </AuthBootstrap>
    ),
    errorElement: <ErrorPage />,
    children: [
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
          {
            path: "/place/:slug",
            element: <PlaceDetail />,
          },
          {
            path: "/access-denied",
            element: <AccessDenied />,
          },
        ],
      },
      {
        path: "/admin/sign-in",
        element: <AdminSignIn />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/admin/access-denied",
        element: <AccessDenied />,
        errorElement: <ErrorPage />,
      },

      {
        path: "/admin",
        element: (
          <AdminProtectedRoute>
            <AdminLayout basePath="/admin" />
          </AdminProtectedRoute>
        ),
        errorElement: <ErrorPage />,

        children: [
          {
            path: "vendors",
            element: <VendorsPage />,
            errorElement: <ErrorPage />,
          },
          {
            path: "support",
            element: <Navigate to="/admin/support/inbox" replace />,
          },
          {
            path: "support/dashboard",
            element: <SupportAdminDashboard />,
            errorElement: <ErrorPage />,
          },
          {
            path: "support/inbox",
            element: <AdminSupportInbox />,
            errorElement: <ErrorPage />,
          },
          {
            path: "chat",
            element: <AdminSupportChatConsole />,
            errorElement: <ErrorPage />,
          },
          {
            path: "staff",
            element: <AdminStaffPage />,
            errorElement: <ErrorPage />,
          },
          {
            path: "leads/plans",
            element: <LeadPlansPage />,
            errorElement: <ErrorPage />,
          },
          {
            path: "*",
            element: <AdminNotFound />,
          },
          {
            path: "vendors/applications",
            element: <VendorApplicationsPage />,
            errorElement: <ErrorPage />,
          },
          {
            path: "dashboard",
            element: <AdminDashboard />,
            errorElement: <ErrorPage />,
          },
          {
            path: "compliance/kyc",
            element: <AdminKycDocumentsPage />,
          },
          {
            path: "catalog",
            element: <Navigate to="/admin/catalog/interests" replace />,
          },
          {
            path: "catalog/:tab",
            element: <PreferencesStudio />,
          },
          {
            path: "system/health",
            element: <SystemHealthPage />,
          },
          {
            path: "moderator",
            element: (
              <ModeratorProtectedRoute>
                <Outlet />
              </ModeratorProtectedRoute>
            ),
            children: [
              {
                path: "",
                element: <Navigate to="/admin/moderator/dashboard" replace />,
              },
              {
                path: "dashboard",
                element: <ModeratorDashboard />,
              },
              {
                path: "escalations",
                element: <ModeratorEscalationsInbox />,
              },
              {
                path: "escalations/:id",
                element: <ModeratorEscalationDetails />,
              },
              {
                path: "notifications",
                element: <ModeratorNotifications />,
              },
            ],
          },
        ],
      },
      {
        path: "/vendor/sign-in",
        element: <VendorSignIn />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/vendor",
        element: (
          <VendorProtectedRoute>
            <VendorLayout />
          </VendorProtectedRoute>
        ),
        errorElement: <ErrorPage />,
        children: [
          { path: "dashboard", element: <VendorDashboard /> },
          { path: "notifications", element: <VendorNotifications /> },
          { path: "leads", element: <VendorLeads /> },
          { path: "leads/subscription", element: <VendorLeadSubscriptionPage /> },
          {
            path: "lead-subscriptions/success",
            element: <SubscriptionSuccessPage />,
          },
          {
            path: "leads/new",
            element: <Navigate to="/vendor/leads?status=NEW" replace />,
          },
          { path: "analytics", element: <VendorAnalyticsDashboard /> },
          { path: "jobs", element: <VendorTableShowcase /> },
          {
            path: "leads/contacted",
            element: <Navigate to="/vendor/leads?status=CONTACTED" replace />,
          },
          {
            path: "leads/converted",
            element: <Navigate to="/vendor/leads?status=CONVERTED" replace />,
          },
          {
            path: "leads/lost",
            element: <Navigate to="/vendor/leads?status=LOST" replace />,
          },
          {
            path: "*",
            element: <VendorNotFound />,
          },
          {
            path: "leads/sources",
            element: vendorPlaceholder("Lead Sources", "See which channels drive volume."),
          },
          {
            path: "bookings",
            element: <BookingsPage />,
          },
          {
            path: "bookings/upcoming",
            element: (
              <BookingsPage
                defaultStatusFilter="confirmed"
                titleOverride="Upcoming Bookings"
                breadcrumbOverride="Vendor / Bookings / Upcoming"
              />
            ),
          },
          {
            path: "bookings/completed",
            element: (
              <BookingsPage
                defaultStatusFilter="completed"
                titleOverride="Completed Bookings"
                breadcrumbOverride="Vendor / Bookings / Completed"
              />
            ),
          },
          {
            path: "bookings/refunds",
            element: (
              <BookingsPage
                defaultStatusFilter="refund"
                titleOverride="Refund Requests"
                breadcrumbOverride="Vendor / Bookings / Refunds"
              />
            ),
          },
          { path: "bookings/:bookingId", element: <VendorBookingDetail /> },
          { path: "profile", element: <VendorProfile /> },
          { path: "services", element: <VendorServices /> },
          {
            path: "services/:serviceId/options",
            element: <VendorServiceOptions />,
          },
          { path: "media", element: <VendorMedia /> },
          { path: "coupons", element: <VendorCoupons /> },
          { path: "wallet", element: <VendorWallet /> },
          { path: "payouts", element: <VendorPayouts /> },
          {
            path: "subscription",
            element: <Navigate to="/vendor/leads/subscription" replace />,
          },
          { path: "promote", element: <VendorPromote /> },
          { path: "kyc", element: <VendorKyc /> },
          { path: "stripe", element: <VendorStripe /> },
          { path: "support", element: <VendorSupport /> },
          { path: "support/tickets/:ticketId", element: <VendorTicketDetails /> },
          { path: "help", element: <VendorHelp /> },
          { path: "insights", element: <VendorInsights /> },
        ],
      },
    ],
  },
]);

export default appRouter;
