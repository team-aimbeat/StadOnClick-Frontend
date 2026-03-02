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
import ServiceDetail from "@/pages/ServiceDetail";
import Kyc from "@/pages/Kyc";
import About from "@/pages/About";
import BookingsPage from "@/pages/BookingsPage";
import VendorTableShowcase from "@/pages/VendorTableShowcase";
import VendorProfile from "@/pages/VendorProfile";
import VendorServices from "@/pages/VendorServices";
import VendorCategoryDetail from "@/pages/VendorCategoryDetail";
import VendorServiceOptions from "@/pages/VendorServiceOptions";
import VendorMedia from "@/pages/VendorMedia";
import VendorMenu from "@/pages/VendorMenu";
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
import OrdersPage from "@/pages/Orders";
import OrderConfirmationPage from "@/pages/OrderConfirmation";
import VendorPlaceholder from "@/pages/VendorPlaceholder";

import VendorAnalyticsDashboard from "@/pages/VendorAnalyticsDashboard";
import VendorNotifications from "@/pages/VendorNotifications";
import VendorsPage from "@/pages/Admin/Vendors/VendorsPage";
import AffiliatesPage from "@/pages/Admin/Affiliates/AffiliatesPage";
import CustomersPage from "@/pages/Admin/Customers/CustomersPage";
import VendorApplicationsPage from "@/pages/Admin/Vendors/VendorApplicationsPage";
import AdminBookingsPage from "@/pages/Admin/BookingsPage";

import AdminSignIn from "@/pages/Admin/AdminSignIn";
import AdminProtectedRoute from "./AdminProtectedRoute";
import ModeratorProtectedRoute from "./ModeratorProtectedRoute";
import VendorSignIn from "@/pages/vendor/VendorSignIn";
import VendorAutoLogin from "@/pages/vendor/VendorAutoLogin";
import VendorProtectedRoute from "./VendorProtectedRoute";
import AccessDenied from "@/components/shared/AccessDenied";
import AdminNotFound from "@/pages/Admin/AdminNotFound";
import VendorNotFound from "@/pages/Admin/Vendors/VendorNotFound";
import VendorProfileAdminPage from "@/pages/Admin/Vendors/VendorProfileAdminPage";
import LeadPlansPage from "@/pages/Admin/leads/LeadPlansPage";
import VendorSubscriptionsPage from "@/pages/Admin/leads/VendorSubscriptionsPage";
import AdminServicesPage from "@/pages/Admin/Services/AdminServicesPage";
import AdminOfferingsPage from "@/pages/Admin/Offerings/AdminOfferingsPage";
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
import HomeSectionsStudio from "@/pages/Admin/catalog/HomeSectionsStudio";
import HomeHeroStudio from "@/pages/Admin/catalog/HomeHeroStudio";
import HomeDealsStudio from "@/pages/Admin/catalog/HomeDealsStudio";
import HomeBestDealsStudio from "@/pages/Admin/catalog/HomeBestDealsStudio";
import HomeOtherSectionsStudio from "@/pages/Admin/catalog/HomeOtherSectionsStudio";
import HomeBlogsStudio from "@/pages/Admin/catalog/HomeBlogsStudio";
import HomeTrendingStudio from "@/pages/Admin/catalog/HomeTrendingStudio";
import HomeExtraDealsStudio from "@/pages/Admin/catalog/HomeExtraDealsStudio";
import FooterSectionsStudio from "@/pages/Admin/catalog/FooterSectionsStudio";
import HeaderSectionsStudio from "@/pages/Admin/catalog/HeaderSectionsStudio";
import HeaderDropdownStudio from "@/pages/Admin/catalog/HeaderDropdownStudio";
import SystemHealthPage from "@/pages/Admin/SystemHealth/SystemHealthPage";
import AdminKycDocumentsPage from "@/pages/Admin/kyc/AdminKycDocuments";
import AdminKycAuditLogsPage from "@/pages/Admin/kyc/AdminKycAuditLogsPage";
import AdminPayoutsPage from "@/pages/Admin/Finance/AdminPayoutsPage";
import AdminPlatformWalletPage from "@/pages/Admin/Finance/AdminPlatformWalletPage";
import AdminSponsorshipPlansPage from "@/pages/Admin/Finance/AdminSponsorshipPlansPage";
import AdminCouponsPage from "@/pages/Admin/Coupons/AdminCouponsPage";
import AdminSettings from "@/pages/Admin/AdminSettings";
import RestaurantMarketplace from "@/pages/RestaurantMarketplace";
import RestaurantServiceDetail from "@/pages/RestaurantServiceDetail";
import AffiliateMarketing from "@/pages/AffiliateMarketing";
import AffiliateDashboard from "@/pages/AffiliateDashboard";
import AffiliateReferrals from "@/pages/AffiliateReferrals";
import AffiliateVendorsReferred from "@/pages/AffiliateVendorsReferred";
import AffiliateCommission from "@/pages/AffiliateCommission";
import AffiliateWallet from "@/pages/AffiliateWallet";
import AffiliatePayouts from "@/pages/AffiliatePayouts";
import AffiliateStripe from "@/pages/AffiliateStripe";
import AppLayout from "@/components/layout/AppLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import VendorLayout from "@/components/layout/VendorLayout";
import AffiliateLayout from "@/components/layout/AffiliateLayout";


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
            path: "/orders",
            element: <OrdersPage />,
          },
          {
            path: "/orders/confirmation",
            element: <OrderConfirmationPage />,
          },
          {
            path: "/sign-up",
            element: <Signup />,
            errorElement: <ErrorPage />,
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
            path: "/business/onboarding",
            element: <VendorProfile />,
            errorElement: <ErrorPage />,
          },
          {
            path: "/marketplace",
            element: <Marketplace />,
            errorElement: <ErrorPage />,
          },
          {
            path: "/restaurants",
            element: <RestaurantMarketplace />,
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
            path: "/affiliate-marketing",
            element: <AffiliateMarketing />,
          },
          {
            path: "/service/:serviceSlug",
            element: <ServiceDetail />,
          },
          {
            path: "/services/:serviceSlug",
            element: <ServiceDetail />,
          },
          {
            path: "/restaurants/:restaurantSlug",
            element: <RestaurantServiceDetail />,
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
            path: "vendors/:vendorId/profile",
            element: <VendorProfileAdminPage />,
            errorElement: <ErrorPage />,
          },
          {
            path: "affiliates",
            element: <AffiliatesPage />,
            errorElement: <ErrorPage />,
          },
          {
            path: "customers",
            element: <CustomersPage />,
            errorElement: <ErrorPage />,
          },
          {
            path: "support",
            element: <Navigate to="/admin/support/inbox" replace />,
          },
           {
            path: "compliance/kyc",
            element: <AdminKycDocumentsPage />,
          },
             {
            path: "compliance/kyc/audit",
            element: <AdminKycAuditLogsPage />,
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
            path: "leads/subscriptions",
            element: <VendorSubscriptionsPage />,
            errorElement: <ErrorPage />,
          },
          {
            path: "coupons",
            element: <AdminCouponsPage />,
            errorElement: <ErrorPage />,
          },
          {
            path: "settings",
            element: <AdminSettings />,
            errorElement: <ErrorPage />,
          },
          {
            path: "bookings",
            element: <AdminBookingsPage defaultStatusFilter="all" />,
            errorElement: <ErrorPage />,
          },
          {
            path: "services",
            element: <AdminServicesPage />,
            errorElement: <ErrorPage />,
          },
          {
            path: "offerings",
            element: <AdminOfferingsPage />,
            errorElement: <ErrorPage />,
          },
          {
            path: "bookings/upcoming",
            element: (
              <AdminBookingsPage
                defaultStatusFilter="upcoming"
                titleOverride="Upcoming Bookings"
                breadcrumbOverride="Admin / Bookings / Upcoming"
              />
            ),
            errorElement: <ErrorPage />,
          },
          {
            path: "bookings/completed",
            element: (
              <AdminBookingsPage
                defaultStatusFilter="completed"
                titleOverride="Completed Bookings"
                breadcrumbOverride="Admin / Bookings / Completed"
              />
            ),
            errorElement: <ErrorPage />,
          },
          {
            path: "bookings/refunds",
            element: (
              <AdminBookingsPage
                defaultStatusFilter="refund_requested"
                titleOverride="Refund Requests"
                breadcrumbOverride="Admin / Bookings / Refunds"
              />
            ),
            errorElement: <ErrorPage />,
          },
          {
            path: "finance/payouts",
            element: <AdminPayoutsPage />,
            errorElement: <ErrorPage />,
          },
          {
            path: "finance/sponsorship-plans",
            element: <AdminSponsorshipPlansPage />,
            errorElement: <ErrorPage />,
          },
          {
            path: "finance/platform-wallet",
            element: <AdminPlatformWalletPage />,
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
            path: "catalog",
            element: <Navigate to="/admin/catalog/interests" replace />,
          },
          {
            path: "catalog/:tab",
            element: <PreferencesStudio />,
          },
          {
            path: "catalog/home-page",
            element: <Navigate to="/admin/layout-studio/home-sections" replace />,
          },
          {
            path: "layout-studio",
            element: <Navigate to="/admin/layout-studio/home-sections" replace />,
          },
          {
            path: "layout-studio/home-sections",
            element: <HomeSectionsStudio />,
          },
          {
            path: "layout-studio/home-sections/hero",
            element: <HomeHeroStudio />,
          },
          {
            path: "layout-studio/home-sections/deals",
            element: <HomeDealsStudio />,
          },
          {
            path: "layout-studio/home-sections/best-deals",
            element: <HomeBestDealsStudio />,
          },
          {
            path: "layout-studio/home-sections/extra-deals",
            element: <HomeExtraDealsStudio />,
          },
          {
            path: "layout-studio/home-sections/trending",
            element: <HomeTrendingStudio />,
          },
          {
            path: "layout-studio/home-sections/other",
            element: <HomeOtherSectionsStudio />,
          },
          {
            path: "layout-studio/home-sections/blogs",
            element: <HomeBlogsStudio />,
          },
          {
            path: "layout-studio/footer-sections",
            element: <FooterSectionsStudio />,
          },
          {
            path: "layout-studio/header-sections",
            element: <HeaderSectionsStudio />,
          },
          {
            path: "layout-studio/header-dropdown",
            element: <HeaderDropdownStudio />,
          },
          {
            path: "catalog/home-sections",
            element: <Navigate to="/admin/layout-studio/home-sections" replace />,
          },
          {
            path: "catalog/home-sections/hero",
            element: <Navigate to="/admin/layout-studio/home-sections/hero" replace />,
          },
          {
            path: "catalog/home-sections/deals",
            element: <Navigate to="/admin/layout-studio/home-sections/deals" replace />,
          },
          {
            path: "catalog/home-sections/best-deals",
            element: <Navigate to="/admin/layout-studio/home-sections/best-deals" replace />,
          },
          {
            path: "catalog/home-sections/extra-deals",
            element: <Navigate to="/admin/layout-studio/home-sections/extra-deals" replace />,
          },
          {
            path: "catalog/home-sections/trending",
            element: <Navigate to="/admin/layout-studio/home-sections/trending" replace />,
          },
          {
            path: "catalog/home-sections/other",
            element: <Navigate to="/admin/layout-studio/home-sections/other" replace />,
          },
          {
            path: "catalog/home-sections/blogs",
            element: <Navigate to="/admin/layout-studio/home-sections/blogs" replace />,
          },
          {
            path: "catalog/footer-sections",
            element: <Navigate to="/admin/layout-studio/footer-sections" replace />,
          },
          {
            path: "catalog/header-sections",
            element: <Navigate to="/admin/layout-studio/header-sections" replace />,
          },
          {
            path: "catalog/header-dropdown",
            element: <Navigate to="/admin/layout-studio/header-dropdown" replace />,
          },
          {
            path: "catalog/footer-sections/brand",
            element: <Navigate to="/admin/layout-studio/footer-sections" replace />,
          },
          {
            path: "catalog/footer-sections/links",
            element: <Navigate to="/admin/layout-studio/footer-sections" replace />,
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
        path: "/vendor/auto-login",
        element: <VendorAutoLogin />,
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
          {
            path: "leads/subscription",
            element: <VendorLeadSubscriptionPage />,
          },
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
            element: vendorPlaceholder(
              "Lead Sources",
              "See which channels drive volume.",
            ),
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
          { path: "business-profile/setup", element: <Navigate to="/business/onboarding" replace /> },
          { path: "services", element: <VendorServices /> },
          {
            path: "services/:serviceId/options",
            element: <VendorServiceOptions />,
          },
          { path: "media", element: <VendorMedia /> },
          { path: "menu", element: <VendorMenu /> },
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
          {
            path: "support/tickets/:ticketId",
            element: <VendorTicketDetails />,
          },
          { path: "help", element: <VendorHelp /> },
          { path: "insights", element: <VendorInsights /> },
        ],
      },
    ],
  },
    {
            path: "/affiliate",
            element: <AffiliateLayout />,
            children: [
              {
                index: true,
                element: <Navigate to="/affiliate/overview" replace />,
              },
              {
                path: "overview",
                element: <AffiliateDashboard />,
              },
              {
                path: "dashboard",
                element: <Navigate to="/affiliate/overview" replace />,
              },
              {
                path: "referrals",
                element: <AffiliateReferrals />,
              },
              {
                path: "vendors-referred",
                element: <AffiliateVendorsReferred />,
              },
              {
                path: "commission",
                element: <AffiliateCommission />,
              },
              {
                path: "wallet",
                element: <AffiliateWallet />,
              },
              {
                path: "payouts",
                element: <AffiliatePayouts />,
              },
              {
                path: "stripe",
                element: <AffiliateStripe />,
              },
            ],
          },
]);

export default appRouter;
