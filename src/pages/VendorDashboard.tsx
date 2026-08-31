import { useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import {
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineCurrencyRupee,
  HiOutlineEnvelopeOpen,
  HiOutlineExclamationTriangle,
  HiOutlineMapPin,
  HiOutlineWallet,
} from "react-icons/hi2";
import {
  ArrowUpRight,
  BadgeCheck,
  CreditCard,
  Download,
  Image as LucideImage,
  Mail,
  Megaphone,
  MessageCircleMore,
  Rocket,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  TicketPercent,
  Wallet2,
} from "lucide-react";
import QuickActionTile from "@/components/vendor-dashboard/QuickActionTile";
import { DashboardContainer } from "@/components/dashboard";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { useGetVendorProfileQuery } from "@/features/vendorProfile/api/vendorProfileApi";
import { useGetLeadSubscriptionStatusQuery } from "@/features/vendorLeadSubscriptions/api/vendorLeadSubscriptions.api";
import { useGetVendorLeadsQuery } from "@/features/leads/api/leadsApi";
import { useGetBookingsQuery } from "@/services/bookingsApi";
import {
  useGetWalletSummaryQuery,
  useGetWalletTransactionsQuery,
} from "@/features/vendorWallet/api/walletApi";
import { useGetVendorServicesQuery } from "@/services/vendorServicesApi";

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
  ratingAvg: number;
  ratingCount: number;
  stripeAccountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  activeServices: number;
};

type VendorLeadSubscription = {
  plan: { name: string; leadsPerDay: number };
  endsAt: string;
  status: "ACTIVE" | "EXPIRED" | "PENDING";
  leadsToday: number;
  receiptNumber: string;
};

type VendorLead = { createdAt: string; status: LeadStatus; source: LeadSource };
type Booking = {
  status: BookingStatus;
  priceFinal: number;
  createdAt: string;
  startTime: string;
};

const today = new Date();
const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};
const toLeadSource = (source?: string | null): LeadSource => {
  const normalized = String(source ?? "").toUpperCase();
  if (normalized === "PROFILE") return "PROFILE";
  if (normalized === "SERVICE") return "SERVICE";
  if (normalized === "MAP") return "MAP";
  if (normalized === "WHATSAPP") return "WHATSAPP";
  if (normalized === "CALL") return "CALL";
  return "SEARCH";
};
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
const currencyFormatter = (value: number, currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const getProfileScore = (profile: VendorProfile) => {
  let score = 0;
  if (profile.businessName) score += 10;
  if (profile.description) score += 8;
  if (profile.contactEmail) score += 8;
  if (profile.contactPhone) score += 8;
  if (profile.cityId) score += 6;
  if (profile.kycStatus === "VERIFIED") score += 20;
  if (profile.stripeAccountId) score += 10;
  if (profile.payoutsEnabled) score += 10;
  if (profile.chargesEnabled) score += 5;
  if (profile.activeServices > 0) score += 10;
  if (profile.ratingCount > 0) score += 5;
  return Math.min(score, 100);
};

const barTone = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  slate: "bg-slate-400",
} as const;

function StatCard({
  eyebrow,
  title,
  value,
  hint,
  meta,
  icon: Icon,
  iconClassName,
}: {
  eyebrow: string;
  title: string;
  value: string | number;
  hint: string;
  meta: string;
  icon: typeof HiOutlineEnvelopeOpen;
  iconClassName: string;
  }) {
  return (
    <div className="rounded-[28px] border border-slate-100 bg-white px-5 py-5 ">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-15 w-15 items-center justify-center rounded-2xl ${iconClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="pt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
          {eyebrow}
        </p>
      </div>

      <div className="mt-7">
        <div className="flex items-baseline gap-2">
          <p className="text-[28px] font-bold leading-none tracking-tight text-slate-900 sm:text-[31px]">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          <p className="text-[15px] font-bold text-slate-900">{title}</p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <p className="text-[13px] font-bold text-emerald-500">{hint}</p>
        <p className="text-xs font-semibold text-slate-400">{meta}</p>
      </div>
    </div>
  );
}

function Progress({
  value,
  tone,
}: {
  value: number;
  tone: keyof typeof barTone;
}) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full ${barTone[tone]}`}
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  );
}

export default function VendorDashboard() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setPageTitle("Vendor Dashboard"));
  }, [dispatch]);

  const { data: profileRes } = useGetVendorProfileQuery();
  const { data: subscriptionRes } = useGetLeadSubscriptionStatusQuery();
  const { data: leadsRes } = useGetVendorLeadsQuery({ page: 1, limit: 100 });
  const { data: bookingsRes } = useGetBookingsQuery();
  const { data: walletSummaryRes } = useGetWalletSummaryQuery();
  const { data: walletTransactionsRes } = useGetWalletTransactionsQuery({
    page: 1,
    limit: 20,
  });
  const { data: servicesRes } = useGetVendorServicesQuery();

  const vendorProfile: VendorProfile = useMemo(() => {
    const profile = profileRes?.data;
    return {
      businessName: profile?.businessName ?? "Vendor",
      description: profile?.description ?? "",
      contactEmail: profile?.contactEmail ?? "",
      contactPhone: profile?.contactPhone ?? "",
      cityId: profile?.city?.id ?? "",
      city: { name: profile?.city?.name ?? "Unknown city" },
      status:
        profile?.status === "SUSPENDED"
          ? "SUSPENDED"
          : profile?.status === "REJECTED"
            ? "REJECTED"
            : profile?.status === "ACTIVE" || profile?.status === "APPROVED"
              ? "ACTIVE"
              : "PENDING_REVIEW",
      kycStatus:
        profile?.kycStatus === "VERIFIED"
          ? "VERIFIED"
          : profile?.kycStatus === "REJECTED"
            ? "REJECTED"
            : profile?.kycStatus === "PENDING"
              ? "PENDING"
              : "NOT_SUBMITTED",
      ratingAvg: Number(profile?.ratingAvg ?? 0),
      ratingCount: profile?.ratingCount ?? 0,
      stripeAccountId: profile?.stripeAccountId ?? null,
      chargesEnabled: profile?.chargesEnabled ?? false,
      payoutsEnabled: profile?.payoutsEnabled ?? false,
      activeServices: (servicesRes ?? []).filter(
        (service) => service.status === "LIVE",
      ).length,
    };
  }, [profileRes, servicesRes]);

  const leadSubscription: VendorLeadSubscription = useMemo(() => {
    const endsAt = subscriptionRes?.expiresAt ?? daysAgo(1);
    return {
      plan: {
        name: subscriptionRes?.planName ?? "No Plan",
        leadsPerDay: subscriptionRes?.leadsPerDay ?? 0,
      },
      endsAt,
      status: subscriptionRes?.isActive
        ? "ACTIVE"
        : new Date(endsAt) < today
          ? "EXPIRED"
          : "PENDING",
      leadsToday: subscriptionRes?.leadsToday ?? 0,
      receiptNumber: subscriptionRes?.receiptNumber ?? "-",
    };
  }, [subscriptionRes]);

  const vendorLeads: VendorLead[] = useMemo(
    () =>
      (leadsRes?.data ?? []).map((lead) => ({
        createdAt: lead.createdAt,
        status: lead.status,
        source: toLeadSource(lead.lead.source),
      })),
    [leadsRes],
  );

  const bookings: Booking[] = useMemo(
    () =>
      (bookingsRes ?? []).map((booking) => ({
        status: booking.status as BookingStatus,
        priceFinal: Number(booking.amount ?? 0),
        createdAt: booking.startTime,
        startTime: booking.startTime,
      })),
    [bookingsRes],
  );

  const walletBalance = walletSummaryRes?.data.availableBalance ?? 0;
  const walletCurrency = walletSummaryRes?.data.currency ?? "INR";
  const pendingPayouts =
    (walletSummaryRes?.data.pendingPayoutBalance ?? 0) > 0 ? 1 : 0;
  const latestPayout = (walletTransactionsRes?.data ?? []).find(
    (tx) => tx.direction === "DEBIT" && tx.status === "CONFIRMED",
  );
  const lastPayoutDaysAgo = latestPayout
    ? Math.max(
        0,
        Math.floor(
          (today.getTime() - new Date(latestPayout.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  const planExpired =
    leadSubscription.status === "EXPIRED" ||
    new Date(leadSubscription.endsAt) < today;
  const leadsRemaining = Math.max(
    leadSubscription.plan.leadsPerDay - leadSubscription.leadsToday,
    0,
  );
  const leadUsagePercentage = leadSubscription.plan.leadsPerDay
    ? Math.round(
        (leadSubscription.leadsToday / leadSubscription.plan.leadsPerDay) * 100,
      )
    : 0;
  const bookingsToday = bookings.filter((booking) =>
    isSameDay(new Date(booking.createdAt), today),
  ).length;
  const pendingBookings = bookings.filter(
    (booking) => booking.status === "PENDING",
  ).length;
  const upcomingToday = bookings.filter(
    (booking) =>
      isSameDay(new Date(booking.startTime), today) &&
      (booking.status === "PENDING" || booking.status === "CONFIRMED"),
  ).length;
  const refundRisk = bookings.filter(
    (booking) => booking.status === "REFUND_REQUESTED",
  ).length;

  const revenueThisMonth = bookings
    .filter(
      (booking) =>
        booking.status !== "CANCELLED" && booking.status !== "REFUNDED",
    )
    .filter((booking) => isSameMonth(new Date(booking.createdAt), today))
    .reduce((sum, booking) => sum + booking.priceFinal, 0);
  const previousMonthDate = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1,
  );
  const revenueLastMonth = bookings
    .filter(
      (booking) =>
        booking.status !== "CANCELLED" && booking.status !== "REFUNDED",
    )
    .filter((booking) =>
      isSameMonth(new Date(booking.createdAt), previousMonthDate),
    )
    .reduce((sum, booking) => sum + booking.priceFinal, 0);
  const revenueVsLast = revenueLastMonth
    ? Math.round(
        ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100,
      )
    : 0;

  const leadsLast7 = vendorLeads.filter(
    (lead) =>
      (today.getTime() - new Date(lead.createdAt).getTime()) /
        (1000 * 60 * 60 * 24) <=
      7,
  );
  const convertedLast7 = leadsLast7.filter(
    (lead) => lead.status === "CONVERTED",
  ).length;
  const conversionRate = leadsLast7.length
    ? Math.round((convertedLast7 / leadsLast7.length) * 100)
    : 0;

  const pipelineCounts = vendorLeads.reduce<Record<LeadStatus, number>>(
    (acc, lead) => ({ ...acc, [lead.status]: acc[lead.status] + 1 }),
    { NEW: 0, CONTACTED: 0, CONVERTED: 0, LOST: 0 },
  );
  const profileScore = getProfileScore(vendorProfile);
  const currentDateLabel = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const alerts = [
    vendorProfile.status === "PENDING_REVIEW" && {
      tone: "danger",
      text: "Profile action required",
      cta: "Fix Now",
      to: "/vendor/profile",
    },
    vendorProfile.kycStatus === "NOT_SUBMITTED" && {
      tone: "warning",
      text: "Submit KYC to receive payouts",
      cta: "Upload",
      to: "/vendor/kyc",
    },
    (!vendorProfile.stripeAccountId || !vendorProfile.payoutsEnabled) && {
      tone: "warning",
      text: "Connect Stripe to enable payouts",
      cta: "Connect",
      to: "/vendor/stripe",
    },
    planExpired && {
      tone: "warning",
      text: "Lead plan expired",
      cta: "Upgrade",
      to: "/vendor/subscription",
    },
  ].filter(Boolean) as Array<{
    tone: "danger" | "warning";
    text: string;
    cta: string;
    to: string;
  }>;

  const quickActions = [
    {
      label: "Add Service",
      icon: Sparkles,
      to: "/vendor/services",
      tone: "violet" as const,
    },
    {
      label: "View Leads",
      icon: Mail,
      to: "/vendor/leads",
      tone: "blue" as const,
    },
    {
      label: "Reply Leads",
      icon: MessageCircleMore,
      to: "/vendor/leads/new",
      tone: "emerald" as const,
    },
    {
      label: "Upload Photos",
      icon: LucideImage,
      to: "/vendor/media",
      tone: "rose" as const,
    },
    {
      label: "Create Coupon",
      icon: TicketPercent,
      to: "/vendor/coupons",
      tone: "amber" as const,
    },
    {
      label: "Bookings",
      icon: Store,
      to: "/vendor/bookings/upcoming",
      tone: "slate" as const,
    },
    {
      label: "Request Payout",
      icon: Wallet2,
      to: "/vendor/payouts",
      tone: "emerald" as const,
    },
    {
      label: "Connect Stripe",
      icon: CreditCard,
      to: "/vendor/stripe",
      tone: "violet" as const,
      showDot: !vendorProfile.stripeAccountId,
    },
    {
      label: "KYC",
      icon: ShieldCheck,
      to: "/vendor/kyc",
      tone: "amber" as const,
      showDot: vendorProfile.kycStatus !== "VERIFIED",
    },
    {
      label: planExpired ? "Buy Plan" : "Upgrade Plan",
      icon: Megaphone,
      to: "/vendor/subscription",
      tone: "blue" as const,
      showDot: planExpired,
      badge: planExpired ? "Expired" : undefined,
    },
    {
      label: "Promote",
      icon: Rocket,
      to: "/vendor/promote",
      tone: "rose" as const,
    },
    {
      label: "Settings",
      icon: Settings,
      to: "/vendor/profile",
      tone: "slate" as const,
    },
  ];

  return (
    <DashboardContainer className="space-y-6 pb-10">
     
      <div className="rounded-[30px] bg-[#F3F7FF] p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-[family:'proxima-condensed-bold',sans-serif] text-[32px] font-bold tracking-tight text-slate-900">
              Welcome back, {vendorProfile.businessName}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm font-[family:'proxima-medium',sans-serif] text-slate-500">
              <span className="inline-flex items-center gap-2">
                <HiOutlineMapPin className="h-4 w-4 text-slate-500" />
                {vendorProfile.city.name}
              </span>
              <span className="hidden h-4 w-px bg-slate-300 sm:block" aria-hidden />
              <span>{currentDateLabel}</span>
            </div>
          </div>
        </div>

 

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_320px]">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                eyebrow="Today"
                title="Leads"
                value={leadSubscription.leadsToday}
                hint={`+${leadsRemaining} available`}
                meta="Resets at 00:00"
                icon={HiOutlineEnvelopeOpen}
                iconClassName="bg-blue-50 text-blue-600"
              />
              <StatCard
                eyebrow="Today"
                title="Bookings"
                value={bookingsToday}
                hint={`${pendingBookings} pending`}
                meta={`Upcoming ${upcomingToday}`}
                icon={HiOutlineCalendarDays}
                iconClassName="bg-indigo-50 text-indigo-600"
              />
              <StatCard
                eyebrow="MTD"
                title="Revenue"
                value={currencyFormatter(revenueThisMonth, walletCurrency)}
                hint={`${revenueVsLast >= 0 ? "+" : ""}${revenueVsLast}% vs last month`}
                meta="Updated live"
                icon={HiOutlineBanknotes}
                iconClassName="bg-emerald-50 text-emerald-600"
              />
            </div>

        

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
            <div className="rounded-[24px] border border-slate-100 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-white">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                      Manage Your Store
                    </p>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                      Analyze the Store
                    </h2>
                  </div>
                </div>
                <NavLink
                  to="/vendor/services"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-500"
                >
                  View store
                </NavLink>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-[18px] border border-slate-100 bg-slate-50 px-4 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Bookings
                  </p>
                  <p className="mt-3 text-[28px] font-bold leading-none tracking-tight text-blue-600">
                    {bookings.length.toLocaleString()}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {upcomingToday} upcoming today
                  </p>
                </div>
                <div className="rounded-[18px] border border-slate-100 bg-slate-50 px-4 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Offerings
                  </p>
                  <p className="mt-3 text-[28px] font-bold leading-none tracking-tight text-blue-600">
                    {vendorProfile.activeServices.toLocaleString()}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    Live services in your catalog
                  </p>
                </div>
                <div className="rounded-[18px] border border-slate-100 bg-slate-50 px-4 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Reviews
                  </p>
                  <p className="mt-3 text-[28px] font-bold leading-none tracking-tight text-blue-600">
                    {vendorProfile.ratingCount.toLocaleString()}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    Average {vendorProfile.ratingAvg.toFixed(1)} / 5
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <NavLink
                  to="/vendor/services"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Go to Store
                </NavLink>
                <NavLink
                  to="/vendor/profile"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Quick Edit
                </NavLink>
              </div>
            </div>

            {alerts.length > 0 ? (
              <div className="grid gap-3">
                {alerts.slice(0, 2).map((alert) => {
                  const isDanger = alert.tone === "danger";
                  const isStripeAlert = alert.to === "/vendor/stripe";
                  const title = isStripeAlert
                    ? "Critical Action Required"
                    : "Lead plan expired";
                  const description = isStripeAlert
                    ? "Connect Stripe to receive payouts for your recent bookings."
                    : "Your current lead generation quota has ended. Refill to continue.";
                  const ctaLabel = isStripeAlert ? "Fix Now" : "Upgrade";
                  return (
                    <div
                      key={alert.text}
                      className={`flex items-center justify-between gap-4 rounded-[18px] border px-4 py-3.5 ${
                        isDanger
                          ? "border-rose-200 bg-rose-50/90 text-rose-900"
                          : "border-amber-200 bg-amber-50/90 text-amber-900"
                      }`}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
                            isDanger
                              ? "bg-rose-100 text-rose-600"
                              : "bg-amber-100 text-amber-600"
                          }`}
                        >
                          <HiOutlineExclamationTriangle className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-[15px] font-bold leading-5 ${
                              isDanger ? "text-rose-800" : "text-amber-800"
                            }`}
                          >
                            {title}
                          </p>
                          <p
                            className={`mt-0.5 text-sm leading-5 ${
                              isDanger ? "text-rose-700/80" : "text-amber-700/80"
                            }`}
                          >
                            {description}
                          </p>
                        </div>
                      </div>
                      <NavLink
                        to={alert.to}
                        className={`shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] ${
                          isDanger ? "text-rose-600" : "text-amber-700"
                        }`}
                      >
                        {ctaLabel}
                      </NavLink>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
              <div className="rounded-[30px] border border-slate-200 bg-white p-5 ">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[18px] font-bold tracking-tight text-slate-900">
                    Lead Pipeline
                  </p>
                  <span className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600">
                    Last 30 Days
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {(
                    [
                      {
                        status: "NEW" as LeadStatus,
                        label: "NEW",
                        tone: "text-blue-500",
                        percentTone: "text-blue-500",
                        icon: Mail,
                      },
                      {
                        status: "CONTACTED" as LeadStatus,
                        label: "CONTACTED",
                        tone: "text-violet-400",
                        percentTone: "text-indigo-500",
                        icon: MessageCircleMore,
                      },
                      {
                        status: "CONVERTED" as LeadStatus,
                        label: "CONVERTED",
                        tone: "text-emerald-400",
                        percentTone: "text-emerald-500",
                        icon: ArrowUpRight,
                      },
                      {
                        status: "LOST" as LeadStatus,
                        label: "LOST",
                        tone: "text-slate-300",
                        percentTone: "text-rose-500",
                        icon: HiOutlineExclamationTriangle,
                      },
                    ] as const
                  ).map((item) => {
                    const Icon = item.icon;
                    const count = pipelineCounts[item.status];
                    const percent = Math.round(
                      (count / (vendorLeads.length || 1)) * 100,
                    );

                    return (
                      <div
                        key={item.status}
                        className="relative overflow-hidden rounded-[22px] bg-slate-50 px-4 py-5"
                      >
                        <Icon
                          className={`absolute bottom-3 right-3 h-12 w-12 opacity-20 ${item.tone}`}
                        />
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          {item.label}
                        </p>
                        <p className="mt-4 text-[42px] font-bold leading-none text-slate-900">
                          {count}
                        </p>
                        <p
                          className={`mt-4 text-xs font-bold ${item.percentTone}`}
                        >
                          {percent}% of total
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[30px] border border-slate-100 bg-white p-5 ">
                <p className="text-[20px] font-bold tracking-tight text-slate-900">
                  Performance Pulse
                </p>

                <div className="mt-5 space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-600">
                      <span>Leads remaining</span>
                      <span className="text-rose-500">
                        {leadsRemaining}/{leadSubscription.plan.leadsPerDay}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-slate-200"
                        style={{
                          width: `${leadSubscription.plan.leadsPerDay ? (leadsRemaining / leadSubscription.plan.leadsPerDay) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-[11px] italic text-slate-400">
                      Quota resets on 1st of next month
                    </p>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-600">
                      <span>Conversion Rate</span>
                      <span className="text-[#4d76ff]">
                        {conversionRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-[#335dff]"
                        style={{ width: `${Math.min(conversionRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-sm font-medium text-slate-400">
                      Wallet Balance
                    </p>
                    <div className="mt-2 flex items-end gap-2">
                      <p className="text-[32px] font-bold leading-none tracking-tight text-slate-900">
                        {currencyFormatter(walletBalance, walletCurrency)}
                      </p>
                      <span className="pb-1 text-sm font-bold text-emerald-500">
                        + Credits
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Last payout {lastPayoutDaysAgo} day(s) ago
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 ">
              <p className="text-lg font-bold text-slate-900">Quick Actions</p>
              <p className="text-xs text-slate-400">
                Jump into the most-used vendor tools
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                {quickActions.map((action) => (
                  <QuickActionTile
                    key={action.label}
                    icon={action.icon}
                    label={action.label}
                    to={action.to}
                    tone={action.tone}
                    badge={action.badge}
                    showDot={action.showDot}
                  />
                ))}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Upcoming Today",
                    value: String(upcomingToday).padStart(2, "0"),
                    meta: "",
                  },
                  {
                    label: "Active Services",
                    value: String(vendorProfile.activeServices),
                    meta: "",
                  },
                  {
                    label: "Avg Review",
                    value:
                      vendorProfile.ratingCount > 0
                        ? vendorProfile.ratingAvg.toFixed(1)
                        : "0.0",
                    meta:
                      vendorProfile.ratingCount > 0
                        ? `${vendorProfile.ratingCount} ratings`
                        : "No ratings",
                  },
                  {
                    label: "Pending Payout",
                    value: currencyFormatter(walletBalance, walletCurrency),
                    meta: `${pendingPayouts} request`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[28px] border border-slate-100 bg-white px-4 py-4 "
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-3 text-[32px] font-bold leading-none text-slate-900">
                      {item.value}
                    </p>
                    <div
                      className={`mt-4 h-1.5 w-14 rounded-full ${
                        item.label === "Avg Review"
                          ? "bg-amber-400"
                          : item.label === "Active Services"
                            ? "bg-indigo-500"
                            : item.label === "Pending Payout"
                              ? "bg-blue-500"
                              : "bg-indigo-600"
                      }`}
                    />
                    {item.meta ? (
                      <p className="mt-2 text-[11px] text-slate-500">
                        {item.meta}
                      </p>
                    ) : item.label === "Upcoming Today" ? (
                      <p className="mt-2 text-[11px] text-slate-500">
                        Active for today
                      </p>
                    ) : item.label === "Active Services" ? (
                      <p className="mt-2 text-[11px] text-slate-500">
                        Live catalog count
                      </p>
                    ) : item.label === "Pending Payout" ? (
                      <p className="mt-2 text-[11px] text-slate-500">
                        Awaiting release
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[24px] border border-slate-100 bg-white px-5 py-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.18)]">
              <p className="text-center text-[11px] font-bold uppercase tracking-[0.32em] text-slate-400">
                Profile Strength
              </p>

              <div className="mt-5 flex flex-col items-center">
                <div
                  className="grid h-38 w-38 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(#3554e0 0 ${profileScore}%, #e5e7eb ${profileScore}% 100%)`,
                  }}
                >
                  <div className="grid h-30 w-30 place-items-center rounded-full bg-white shadow-sm">
                    <div className="text-center leading-none">
                      <p className="text-3xl font-bold text-slate-900">{profileScore}%</p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        {profileScore >= 80 ? "Excellent" : profileScore >= 50 ? "Good" : "Needs work"}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-5 max-w-[220px] text-center text-sm leading-6 text-slate-500">
                  Add a "Portfolio Gallery" to reach 100% and get featured status.
                </p>

                <button
                  type="button"
                  className="mt-5 w-full rounded-xl bg-[#4F7DFF] px-4 py-3 text-sm font-semibold text-white hover:bg-slate-200"
                >
                  Complete Profile
                </button>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 ">
              <p className="text-lg font-bold text-slate-900">Account Status</p>
              <div className="mt-4 space-y-3">
                {[
                  {
                    label: "Vendor Status",
                    sub: "Current business account state",
                    value: vendorProfile.status.replaceAll("_", " "),
                    icon: BadgeCheck,
                    bg: "bg-indigo-50 text-indigo-600",
                  },
                  {
                    label: "KYC",
                    sub: "Verification and payouts",
                    value: vendorProfile.kycStatus.replaceAll("_", " "),
                    icon: ShieldCheck,
                    bg: "bg-amber-50 text-amber-600",
                  },
                  {
                    label: "Subscription",
                    sub: leadSubscription.plan.name,
                    value: planExpired ? "Expired" : "Active",
                    icon: Megaphone,
                    bg: "bg-rose-50 text-rose-600",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 rounded-[16px] border border-slate-100 bg-white px-4 py-3 "
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${item.bg}`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[15px] font-bold leading-5 text-slate-900">
                          {item.label}
                        </p>
                        <p className="text-[13px] font-medium leading-4 text-slate-500">
                          {item.sub}
                        </p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${
                      item.label === "KYC"
                        ? "bg-amber-100 text-amber-600"
                        : item.label === "Subscription"
                          ? "bg-rose-100 text-rose-600"
                          : "bg-indigo-100 text-indigo-600"
                    }`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] bg-gradient-to-b from-[#4F7DFF] to-[#2742be] p-5 text-white ">
              <p className="text-2xl font-bold leading-tight">
                {planExpired
                  ? "No Active Lead Plan"
                  : leadSubscription.plan.name}
              </p>
              <p className="mt-3 text-sm text-blue-100">
                {planExpired
                  ? "You're missing out on daily leads. Upgrade now to keep your pipeline moving."
                  : `Your current plan expires on ${formatDate(leadSubscription.endsAt)}. Upgrade for more daily leads.`}
              </p>
              <NavLink
                to="/vendor/subscription"
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-3 text-sm font-bold text-[#2742be]"
              >
                {planExpired ? "View All Plans" : "Manage Subscription"}
              </NavLink>
              <p className="mt-3 text-center text-xs text-blue-100">
                {planExpired
                  ? "Start receiving leads again"
                  : `Leads today: ${leadSubscription.leadsToday}/${leadSubscription.plan.leadsPerDay}`}
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 ">
              <p className="text-lg font-bold text-slate-900">
                Business Snapshot
              </p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-500">
                    <HiOutlineCheckCircle className="h-4 w-4 text-emerald-500" />
                    Active services
                  </span>
                  <span className="font-bold text-slate-900">
                    {vendorProfile.activeServices}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-500">
                    <Star className="h-4 w-4 text-amber-500" />
                    Average rating
                  </span>
                  <span className="font-bold text-slate-900">
                    {vendorProfile.ratingAvg.toFixed(1)} / 5
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-500">
                    <HiOutlineWallet className="h-4 w-4 text-blue-500" />
                    Pending payouts
                  </span>
                  <span className="font-bold text-slate-900">
                    {pendingPayouts}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-500">
                    <HiOutlineCurrencyRupee className="h-4 w-4 text-indigo-500" />
                    Refund risk
                  </span>
                  <span className="font-bold text-slate-900">{refundRisk}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
}
