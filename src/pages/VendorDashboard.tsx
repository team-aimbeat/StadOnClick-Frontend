import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  HiOutlineBanknotes,
  HiOutlineBolt,
  HiOutlineCalendarDays,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineCheckCircle,
  HiOutlineChevronRight,
  HiOutlineClipboardDocumentList,
  HiOutlineCog6Tooth,
  HiOutlineCurrencyRupee,
  HiOutlineEnvelopeOpen,
  HiOutlineExclamationTriangle,
  HiOutlineMegaphone,
  HiOutlinePhoto,
  HiOutlineRocketLaunch,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineTicket,
  HiOutlineWallet,
} from "react-icons/hi2";

import DashboardBanner from "@/components/vendor-dashboard/DashboardBanner";
import VendorStatCard from "@/components/vendor-dashboard/VendorStatCard";
import ProfileScoreCard from "@/components/vendor-dashboard/ProfileScoreCard";
import QuickActionTile from "@/components/vendor-dashboard/QuickActionTile";
import SectionHeader from "@/components/vendor-dashboard/SectionHeader";
import StatusPill from "@/components/vendor-dashboard/StatusPill";
import MyBusinessPanel from "@/components/vendor-dashboard/MyBusinessPanel";
import {
  DashboardContainer,
  DashboardGrid,
  DashboardCol,
} from "@/components/dashboard";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";

type VendorStatus = "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "REJECTED";
type KycStatus = "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";
type LeadStatus = "NEW" | "CONTACTED" | "CONVERTED" | "LOST";
type LeadSource =
  | "PROFILE"
  | "SERVICE"
  | "MAP"
  | "SEARCH"
  | "WHATSAPP"
  | "CALL";
type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUND_REQUESTED"
  | "REFUNDED";

type VendorProfile = {
  businessName: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  cityId: string;
  city: { name: string };
  status: VendorStatus;
  kycStatus: KycStatus;
  totalBookings: number;
  totalRevenue: number;
  ratingAvg: number;
  ratingCount: number;
  stripeAccountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  activeServices: number;
  serviceCategories: number;
};

type VendorLeadSubscription = {
  plan: { name: string; leadsPerDay: number };
  startsAt: string;
  endsAt: string;
  status: "ACTIVE" | "EXPIRED" | "PENDING";
  leadsToday: number;
  lastLeadReset: string;
  receiptNumber: string;
};

type VendorLead = {
  createdAt: string;
  status: LeadStatus;
  source: LeadSource;
};

type Booking = {
  status: BookingStatus;
  priceFinal: number;
  createdAt: string;
  startTime: string;
};

type VendorWallet = {
  balance: number;
  currency: string;
};

type Alert = {
  tone: "info" | "warning" | "danger";
  message: string;
  actionLabel: string;
  to: string;
};

const today = new Date();
const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const vendorProfile: VendorProfile = {
  businessName: "UrbanFix Plumbing & Heating",
  description: "Full-service plumbing & heating specialists with 24/7 support.",
  contactEmail: "hello@urbanfix.co",
  contactPhone: "+91 99230 44519",
  cityId: "mumbai",
  city: { name: "Mumbai" },
  status: "PENDING_REVIEW",
  kycStatus: "NOT_SUBMITTED",
  totalBookings: 284,
  totalRevenue: 812000,
  ratingAvg: 4.6,
  ratingCount: 188,
  stripeAccountId: null,
  chargesEnabled: false,
  payoutsEnabled: false,
  activeServices: 5,
  serviceCategories: 3,
};

const leadSubscription: VendorLeadSubscription = {
  plan: { name: "PRO", leadsPerDay: 25 },
  startsAt: daysAgo(22),
  endsAt: daysAgo(1),
  status: "EXPIRED",
  leadsToday: 18,
  lastLeadReset: daysAgo(1),
  receiptNumber: "JD-4823",
};

const vendorLeads: VendorLead[] = [
  { createdAt: today.toISOString(), status: "NEW", source: "SEARCH" },
  { createdAt: today.toISOString(), status: "CONTACTED", source: "WHATSAPP" },
  { createdAt: daysAgo(1), status: "CONVERTED", source: "PROFILE" },
  { createdAt: daysAgo(2), status: "NEW", source: "MAP" },
  { createdAt: daysAgo(3), status: "CONTACTED", source: "SERVICE" },
  { createdAt: daysAgo(5), status: "LOST", source: "CALL" },
  { createdAt: daysAgo(6), status: "CONVERTED", source: "SEARCH" },
  { createdAt: daysAgo(8), status: "CONTACTED", source: "PROFILE" },
];

const bookings: Booking[] = [
  {
    status: "PENDING",
    priceFinal: 3200,
    createdAt: today.toISOString(),
    startTime: today.toISOString(),
  },
  {
    status: "CONFIRMED",
    priceFinal: 5800,
    createdAt: daysAgo(1),
    startTime: daysAgo(1),
  },
  {
    status: "COMPLETED",
    priceFinal: 12400,
    createdAt: daysAgo(3),
    startTime: daysAgo(2),
  },
  {
    status: "COMPLETED",
    priceFinal: 9300,
    createdAt: daysAgo(7),
    startTime: daysAgo(6),
  },
  {
    status: "REFUND_REQUESTED",
    priceFinal: 6100,
    createdAt: daysAgo(10),
    startTime: daysAgo(8),
  },
  {
    status: "REFUNDED",
    priceFinal: 4400,
    createdAt: daysAgo(25),
    startTime: daysAgo(24),
  },
];

const wallet: VendorWallet = {
  balance: 48200,
  currency: "INR",
};

const services = {
  active: 5,
  categories: 3,
};

const payoutsMeta = {
  pendingRequests: 1,
  lastPayoutDaysAgo: 12,
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const isSameDay = (dateA: Date, dateB: Date) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

const isSameMonth = (dateA: Date, dateB: Date) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth();

const currencyFormatter = (value: number, currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

const calculateProfileScore = (
  profile: VendorProfile
): { score: number; missing: string[] } => {
  const checks = [
    { label: "Add business name", score: 10, passed: !!profile.businessName },
    {
      label: "Add business description",
      score: 8,
      passed: !!profile.description,
    },
    { label: "Add contact email", score: 8, passed: !!profile.contactEmail },
    { label: "Add contact phone", score: 8, passed: !!profile.contactPhone },
    { label: "Add city", score: 6, passed: !!profile.cityId },
    {
      label: "Upload KYC documents",
      score: 20,
      passed: profile.kycStatus === "VERIFIED",
    },
    {
      label: "Connect Stripe payouts",
      score: 10,
      passed: !!profile.stripeAccountId,
    },
    { label: "Enable payouts", score: 10, passed: profile.payoutsEnabled },
    { label: "Enable charges", score: 5, passed: profile.chargesEnabled },
    {
      label: "Add at least 1 service",
      score: 10,
      passed: profile.activeServices > 0,
    },
    { label: "Get first review", score: 5, passed: profile.ratingCount > 0 },
  ];

  const achieved = checks
    .filter((check) => check.passed)
    .reduce((sum, check) => sum + check.score, 0);

  const score = Math.min(achieved, 100);
  const missing = checks
    .filter((check) => !check.passed)
    .map((check) => check.label);

  return { score, missing };
};

const VendorDashboard = () => {
  const dispatch = useAppDispatch();
  const [compact, setCompact] = useState(true);
  const sectionSpacing = compact
    ? "space-y-4 sm:space-y-5 lg:space-y-6"
    : "space-y-6 sm:space-y-7 lg:space-y-8";
  const cardPadding = compact ? "p-4" : "p-5";
  const densePadding = compact ? "p-3" : "p-4";

  useEffect(() => {
    dispatch(setPageTitle("Vendor Dashboard"));
  }, [dispatch]);

  const planExpired =
    !leadSubscription ||
    leadSubscription.status === "EXPIRED" ||
    new Date(leadSubscription.endsAt) < today;

  const leadsRemaining = Math.max(
    (leadSubscription?.plan.leadsPerDay || 0) -
      (leadSubscription?.leadsToday || 0),
    0
  );

  const bookingsToday = bookings.filter((booking) =>
    isSameDay(new Date(booking.createdAt), today)
  ).length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "PENDING"
  ).length;

  const revenueThisMonth = bookings
    .filter((booking) => {
      const created = new Date(booking.createdAt);
      const validStatus =
        booking.status !== "CANCELLED" && booking.status !== "REFUNDED";
      return validStatus && isSameMonth(created, today);
    })
    .reduce((sum, booking) => sum + booking.priceFinal, 0);

  const revenueLastMonth = 42000;
  const revenueVsLast =
    revenueLastMonth > 0
      ? Math.round(
          ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
        )
      : 0;

  const leadsLast7 = vendorLeads.filter((lead) => {
    const created = new Date(lead.createdAt);
    return (today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) <= 7;
  });
  const convertedLast7 = leadsLast7.filter(
    (lead) => lead.status === "CONVERTED"
  ).length;
  const conversionRate = leadsLast7.length
    ? Math.round((convertedLast7 / leadsLast7.length) * 100)
    : 0;

  const profileScore = useMemo(() => calculateProfileScore(vendorProfile), []);

  const pipelineCounts = vendorLeads.reduce<Record<LeadStatus, number>>(
    (acc, lead) => {
      acc[lead.status] += 1;
      return acc;
    },
    { NEW: 0, CONTACTED: 0, CONVERTED: 0, LOST: 0 }
  );

  const bookingCounts = useMemo(
    () => ({
      pending: bookings.filter((b) => b.status === "PENDING").length,
      confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
      completed: bookings.filter((b) => b.status === "COMPLETED").length,
      refundRequested: bookings.filter((b) => b.status === "REFUND_REQUESTED")
        .length,
    }),
    []
  );

  const alerts: Alert[] = [];
  if (vendorProfile.status === "PENDING_REVIEW") {
    alerts.push({
      tone: "warning",
      message: "Your profile is under review",
      actionLabel: "View status",
      to: "/vendor/profile",
    });
  }
  if (vendorProfile.kycStatus === "NOT_SUBMITTED") {
    alerts.push({
      tone: "danger",
      message: "Submit KYC to activate payouts",
      actionLabel: "Upload KYC",
      to: "/vendor/kyc",
    });
  }
  if (!vendorProfile.stripeAccountId || !vendorProfile.payoutsEnabled) {
    alerts.push({
      tone: "info",
      message: "Connect Stripe to receive payouts",
      actionLabel: "Connect Stripe",
      to: "/vendor/stripe",
    });
  }
  if (planExpired) {
    alerts.push({
      tone: "danger",
      message: "Lead plan expired. Renew to receive leads",
      actionLabel: "Renew plan",
      to: "/vendor/subscription",
    });
  }

  const upcomingToday = bookings.filter(
    (booking) =>
      isSameDay(new Date(booking.startTime), today) &&
      (booking.status === "PENDING" || booking.status === "CONFIRMED")
  ).length;

  return (
    <DashboardContainer className={`max-w-[1500px] ${sectionSpacing}`}>
      <TitleBreadCrumbs
        title="Vendor Dashboard"
        breadCrumbTitle="Vendor / Dashboard"
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {vendorProfile.businessName}
          </h1>
          <p className="text-sm text-slate-600">
            {vendorProfile.city.name} | {vendorProfile.contactPhone}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={vendorProfile.status} />
          <StatusPill status={vendorProfile.kycStatus} />
          <button
            type="button"
            onClick={() => setCompact((prev) => !prev)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            {compact ? "Compact" : "Comfortable"}
          </button>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-800">
          <div className="flex items-center gap-2">
            <HiOutlineExclamationTriangle className="h-4 w-4" />
            <span>{alerts[0].message}</span>
          </div>
          <NavLink
            to={alerts[0].to}
            className="rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100"
          >
            Fix now
          </NavLink>
        </div>
      )}

      <DashboardBanner
        title="Showcase your services to get more customers"
        subtitle="Improve your profile score and respond faster to leads"
        primaryAction={{
          label: planExpired ? "Buy Leads Plan" : "Upgrade Plan",
          to: "/vendor/subscription",
        }}
        pills={
          planExpired
            ? [{ label: "Your lead plan is inactive", tone: "danger" }]
            : []
        }
      />

      <DashboardGrid columns="grid-cols-1 lg:grid-cols-12">
        <DashboardCol span={8} className="space-y-3">
          <div
            className={`rounded-lg border border-slate-200 bg-white ${cardPadding}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                  Business Overview
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  Today + month-to-date
                </p>
              </div>
              <NavLink
                to="/vendor/insights"
                className="text-xs font-semibold text-blue-600 hover:text-blue-500"
              >
                View reports
              </NavLink>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-2 min-h-38 xl:grid-cols-3">
              <VendorStatCard
                title="Leads today"
                value={leadSubscription?.leadsToday ?? 0}
                subtitle={`Remaining today: ${leadsRemaining}`}
                trend={leadsRemaining > 0 ? "up" : "down"}
                percentage={leadsRemaining > 0 ? 12 : -5}
                icon={HiOutlineEnvelopeOpen}
                accentColor="blue"
                meta="Resets at 00:00"
              />
              <VendorStatCard
                title="Bookings today"
                value={bookingsToday}
                subtitle={`Pending: ${pendingBookings}`}
                trend="neutral"
                percentage={0}
                icon={HiOutlineCalendarDays}
                accentColor="yellow"
                meta={`Upcoming today: ${upcomingToday}`}
              />
              <VendorStatCard
                title="Revenue (MTD)"
                value={currencyFormatter(revenueThisMonth, wallet.currency)}
                subtitle={`vs last month ${
                  revenueVsLast > 0 ? "+" : ""
                }${revenueVsLast}%`}
                trend={revenueVsLast >= 0 ? "up" : "down"}
                percentage={Math.abs(revenueVsLast)}
                icon={HiOutlineBanknotes}
                accentColor="green"
                meta="Updated 2 min ago"
              />
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-sm font-semibold text-slate-800">
                  Lead pipeline
                </p>
                <p className="text-[11px] text-slate-500">Last 7 days</p>
                <div className="mt-2 space-y-1.5">
                  {(
                    ["NEW", "CONTACTED", "CONVERTED", "LOST"] as LeadStatus[]
                  ).map((status) => {
                    const count = pipelineCounts[status];
                    const total = vendorLeads.length || 1;
                    const width = Math.max((count / total) * 100, 8);
                    const colorMap: Record<LeadStatus, string> = {
                      NEW: "bg-blue-500",
                      CONTACTED: "bg-amber-500",
                      CONVERTED: "bg-emerald-500",
                      LOST: "bg-slate-400",
                    };
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                          <span>{status}</span>
                          <span>{count}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white">
                          <div
                            className={`h-1.5 rounded-full ${colorMap[status]}`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-sm font-semibold text-slate-800">
                  Operations
                </p>
                <p className="text-[11px] text-slate-500">
                  Conversion: {conversionRate}% | Refund risk:{" "}
                  {bookingCounts.refundRequested}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                  <span className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    Upcoming today: {upcomingToday}
                  </span>
                  <span className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    Avg review: {vendorProfile.ratingAvg} (
                    {vendorProfile.ratingCount})
                  </span>
                  <span className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    Active services: {services.active}
                  </span>
                  <span className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    Pending payout: {payoutsMeta.pendingRequests}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DashboardCol>

        <DashboardCol span={4} className="space-y-2.5">
          <ProfileScoreCard
            variant="compact"
            score={profileScore.score}
            missingTasks={profileScore.missing}
            supportingText=""
            ctaLabel="Increase Score"
            ctaTo="/vendor/profile"
          />
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">
                Subscription Status
              </p>
              <StatusPill
                status={planExpired ? "Expired" : "Active"}
                tone={planExpired ? "danger" : "success"}
                size="sm"
              />
            </div>
            <p className="text-xs text-slate-500">
              Plan: {leadSubscription.plan.name} | Expires:{" "}
              {formatDate(leadSubscription.endsAt)}
            </p>
            <p className="text-xs text-slate-500">
              Leads today: {leadSubscription.leadsToday} /{" "}
              {leadSubscription.plan.leadsPerDay}
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">
                Resets: 00:00 daily
              </span>
              <NavLink
                to="/vendor/subscription"
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
              >
                Manage
              </NavLink>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">
                Critical Alerts
              </p>
              <span className="text-[11px] text-slate-500">
                {alerts.length} open
              </span>
            </div>
            <div className="space-y-1">
              {(alerts.length
                ? alerts
                : [
                    {
                      message: "No critical alerts",
                      tone: "info",
                      actionLabel: "",
                      to: "#",
                    },
                  ]
              ).map((alert) => (
                <div
                  key={alert.message}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <HiOutlineExclamationTriangle className="h-4 w-4 text-amber-500" />
                    {alert.message}
                  </span>
                  {alert.actionLabel ? (
                    <NavLink
                      to={alert.to}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-500"
                    >
                      {alert.actionLabel}
                    </NavLink>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </DashboardCol>
      </DashboardGrid>

      <MyBusinessPanel className={cardPadding} />

      <DashboardGrid columns="grid-cols-1 lg:grid-cols-12">
        <DashboardCol span={8} className="space-y-3">
          <div
            className={`rounded-lg border border-slate-200 bg-white ${cardPadding}`}
          >
            <div className="flex items-center justify-between">
              <SectionHeader title="Quick actions" />
              <NavLink
                to="/vendor/dashboard"
                className="text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Customize
              </NavLink>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {[
                {
                  label: "Add Service",
                  icon: HiOutlineSparkles,
                  to: "/vendor/services",
                },
                {
                  label: "View Leads",
                  icon: HiOutlineEnvelopeOpen,
                  to: "/vendor/leads",
                },
                {
                  label: "Reply Leads",
                  icon: HiOutlineChatBubbleBottomCenterText,
                  to: "/vendor/leads/new",
                },
                {
                  label: "Upload Photos",
                  icon: HiOutlinePhoto,
                  to: "/vendor/media",
                },
                {
                  label: "Create Coupon",
                  icon: HiOutlineTicket,
                  to: "/vendor/coupons",
                },
                {
                  label: "Bookings",
                  icon: HiOutlineClipboardDocumentList,
                  to: "/vendor/bookings/upcoming",
                },
                {
                  label: "Request Payout",
                  icon: HiOutlineWallet,
                  to: "/vendor/payouts",
                },
                {
                  label: "Connect Stripe",
                  icon: HiOutlineCurrencyRupee,
                  to: "/vendor/stripe",
                  showDot: !vendorProfile.stripeAccountId,
                },
                {
                  label: "KYC",
                  icon: HiOutlineShieldCheck,
                  to: "/vendor/kyc",
                  showDot: vendorProfile.kycStatus !== "VERIFIED",
                },
                {
                  label: planExpired ? "Buy Plan" : "Upgrade Plan",
                  icon: HiOutlineMegaphone,
                  to: "/vendor/subscription",
                  badge: planExpired ? "Expired" : undefined,
                  showDot: planExpired,
                },
                {
                  label: "Promote",
                  icon: HiOutlineRocketLaunch,
                  to: "/vendor/promote",
                },
                {
                  label: "Profile Settings",
                  icon: HiOutlineCog6Tooth,
                  to: "/vendor/profile",
                },
              ].map((action) => (
                <QuickActionTile
                  key={action.label}
                  icon={action.icon}
                  label={action.label}
                  to={action.to}
                  badge={
                    "badge" in action
                      ? (action as { badge?: string }).badge
                      : undefined
                  }
                  showDot={
                    "showDot" in action
                      ? (action as { showDot?: boolean }).showDot
                      : undefined
                  }
                />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 space-y-2.5">
            <SectionHeader title="Today's Focus" />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                { label: "Reply to new leads", to: "/vendor/leads/new" },
                {
                  label: "Confirm upcoming bookings",
                  to: "/vendor/bookings/upcoming",
                },
                { label: "Complete KYC", to: "/vendor/kyc" },
              ].map((task) => (
                <NavLink
                  key={task.label}
                  to={task.to}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    <span className="grid h-4 w-4 place-items-center rounded-[4px] border border-slate-300 bg-white" />
                    {task.label}
                  </span>
                  <HiOutlineChevronRight className="h-4 w-4 text-slate-400" />
                </NavLink>
              ))}
            </div>
          </div>
        </DashboardCol>

        <DashboardCol span={4} className="space-y-2.5">
          <div
            className={`rounded-lg border min-h-36 border-slate-200 bg-white ${cardPadding} space-y-2.5`}
          >
            <SectionHeader title="Performance Pulse" />
            <p className="text-xs text-slate-500">
              Live health of leads, conversion, and cash.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                Leads remaining: {leadsRemaining}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                Conversion: {conversionRate}%
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                Wallet: {currencyFormatter(wallet.balance, wallet.currency)}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${
                  planExpired
                    ? "bg-rose-50 text-rose-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                Plan {planExpired ? "expired" : "active"}
              </span>
            </div>
            <div className="h-px w-full bg-slate-100" />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                <p className="text-sm font-semibold text-slate-900">
                  Pipeline & quota
                </p>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <HiOutlineEnvelopeOpen className="mt-0.5 h-4 w-4 text-blue-500" />
                      Leads today
                    </span>
                    <span className="font-semibold text-slate-900">
                      {leadSubscription.leadsToday}/
                      {leadSubscription.plan.leadsPerDay}
                    </span>
                  </li>
                  <li>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>Usage</span>
                      <span>
                        {Math.round(
                          (leadSubscription.leadsToday /
                            leadSubscription.plan.leadsPerDay) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white">
                      <div
                        className="h-1.5 rounded-full bg-blue-500"
                        style={{
                          width: `${Math.min(
                            (leadSubscription.leadsToday /
                              leadSubscription.plan.leadsPerDay) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </li>
                  <li className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <HiOutlineCheckCircle className="mt-0.5 h-4 w-4 text-emerald-500" />
                      Conversion (7d)
                    </span>
                    <span className="font-semibold text-slate-900">
                      {conversionRate}%
                    </span>
                  </li>
                  <li className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <HiOutlineCalendarDays className="mt-0.5 h-4 w-4 text-amber-500" />
                      Next reset
                    </span>
                    <span className="text-xs text-slate-600">00:00 daily</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                <p className="text-sm font-semibold text-slate-900">
                  Money & payouts
                </p>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <HiOutlineBanknotes className="mt-0.5 h-4 w-4 text-emerald-500" />
                      Revenue (MTD)
                    </span>
                    <span className="font-semibold text-slate-900">
                      {currencyFormatter(revenueThisMonth, wallet.currency)}
                    </span>
                  </li>
                  <li className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <HiOutlineWallet className="mt-0.5 h-4 w-4 text-blue-500" />
                      Wallet balance
                    </span>
                    <span className="font-semibold text-slate-900">
                      {currencyFormatter(wallet.balance, wallet.currency)}
                    </span>
                  </li>
                  <li className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <HiOutlineCurrencyRupee className="mt-0.5 h-4 w-4 text-amber-500" />
                      Pending payouts
                    </span>
                    <span className="font-semibold text-slate-900">
                      {payoutsMeta.pendingRequests}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </DashboardCol>
      </DashboardGrid>
    </DashboardContainer>
  );
};

export default VendorDashboard;
