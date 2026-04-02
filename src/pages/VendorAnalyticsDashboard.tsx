import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  HiOutlineArrowTrendingUp,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineEnvelope,
  HiOutlineEye,
  HiOutlineMapPin,
  HiOutlinePaperAirplane,
  HiOutlinePhone,
  HiOutlineStar,
  HiOutlineUsers,
  HiOutlineWallet,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import { BsWhatsapp } from "react-icons/bs";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import SectionHeader from "@/components/vendor-dashboard/SectionHeader";
import StatusPill from "@/components/vendor-dashboard/StatusPill";
import ProfileScoreCard from "@/components/vendor-dashboard/ProfileScoreCard";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useGetVendorLeadsQuery, useUpdateVendorLeadStatusMutation } from "@/features/leads/api/leadsApi";
import { useGetVendorProfileQuery } from "@/features/vendorProfile/api/vendorProfileApi";
import { useGetBookingsQuery } from "@/services/bookingsApi";
import { useGetVendorServicesQuery } from "@/services/vendorServicesApi";
import { useLazyGetServiceOfferingsQuery, useLazyGetOfferingSlotsQuery } from "@/services/vendorOfferingsApi";
import { useLazyGetServiceMediaQuery } from "@/services/serviceMediaApi";
import { useLazyGetServiceReviewsQuery } from "@/services/serviceReviewsApi";
import { useGetVendorOrdersQuery } from "@/services/ordersApi";

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-md bg-slate-200/80", className)} />
);

type LeadStatus = "NEW" | "CONTACTED" | "CONVERTED" | "LOST";
type OrderStatus = "PAID" | "REFUNDED" | "PENDING";
type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUND_REQUESTED"
  | "REFUNDED";
type DateRange = "7d" | "30d" | "6m" | "1y";
type VendorStatus = "PENDING_REVIEW" | "APPROVED" | "SUSPENDED";

type AnalyticsKpiCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: IconType;
  accentColor?: "blue" | "green" | "red" | "yellow" | "purple" | "cyan";
  className?: string;
};

const analyticsKpiAccent: Record<NonNullable<AnalyticsKpiCardProps["accentColor"]>, string> = {
  blue: "bg-[#eaf2ff] text-[#3554e0]",
  green: "bg-[#eaf8ef] text-[#1fb56a]",
  red: "bg-[#fff0f0] text-[#e25353]",
  yellow: "bg-[#fff7e6] text-[#e0a100]",
  purple: "bg-[#f2efff] text-[#6f63ee]",
  cyan: "bg-[#eaf8ff] text-[#0f7ed2]",
};

const AnalyticsKpiCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = "blue",
  className,
}: AnalyticsKpiCardProps) => (
  <div
    className={cn(
      "min-h-[154px] rounded-[24px] border border-slate-100 bg-white p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.18)]",
      className
    )}
  >
    <div className="flex h-full flex-col justify-between gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {title}
        </p>
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-100", analyticsKpiAccent[accentColor])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-[30px] font-bold leading-none tracking-tight text-slate-900">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
      </div>
    </div>
  </div>
);

const StatsCard = AnalyticsKpiCard;

type VendorLead = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  serviceTitle: string;
  status: LeadStatus;
  createdAt: string;
};

type Order = {
  id: string;
  userId: string;
  totalFinal: number;
  totalDiscount: number;
  commissionAmount: number;
  vendorPayoutAmount: number;
  status: OrderStatus;
  createdAt: string;
};

type ServiceBooking = {
  id: string;
  serviceTitle: string;
  status: BookingStatus;
  startTime: string;
  createdAt: string;
};

type Review = {
  id: string;
  serviceTitle: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    nickName?: string | null;
  } | null;
};

type VendorProfile = {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  city: string;
  state: string;
  country: string;
  description?: string;
  organizationNumber?: string;
  vatNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  cityId?: string;
  cityRelation?: { id: string; name: string; state?: string; country?: string };
  status: VendorStatus;
  kycStatus: "NOT_SUBMITTED" | "PENDING" | "VERIFIED";
  approvedAt?: string;
  suspendedAt?: string;
  totalBookings: number;
  totalRevenue: number;
  ratingAvg: number;
  ratingCount: number;
  stripeAccountId?: string;
  payoutsEnabled?: boolean;
  chargesEnabled?: boolean;
  stripeOnboardedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  seoImageKey?: string;
  isIndexable?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type VendorService = { id: string; title: string; status: "LIVE" | "PAUSED" };
type ServiceOffering = { id: string; serviceId: string; title: string; isActive: boolean };
type OfferingSlot = { id: string; offeringId: string; startTime: string };
type ServiceMedia = { id: string; serviceId: string; type: "IMAGE" | "VIDEO"; url: string };

type VendorGalleryItem = {
  id: string;
  vendorId: string;
  type: "IMAGE" | "VIDEO";
  fileKey: string;
  thumbnailKey?: string;
  title?: string;
  description?: string;
  sortOrder: number;
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
  updatedAt: string;
};

type ChartSeries = {
  key: string;
  label: string;
  color: string;
  valueType?: "number" | "currency" | "percent";
};

type ChartDatum = {
  bucket: string;
  bucketStart: number;
  // Metrics are numeric; bucket labels remain strings for Recharts to render axes.
  [key: string]: number | string;
};

type TableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
};

const now = new Date();

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const startOfWeek = (date: Date) => {
  const day = date.getDay() === 0 ? 6 : date.getDay() - 1; // Monday as start
  const monday = new Date(date);
  monday.setDate(date.getDate() - day);
  return startOfDay(monday);
};

const daysAgo = (days: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const monthsAgo = (months: number, day = 8) => {
  const d = new Date(now);
  d.setMonth(d.getMonth() - months);
  d.setDate(day);
  return d.toISOString();
};

const currencyFormatter = (value: number, currency: string) =>
  new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

const numberFormatter = (value: number) =>
  value.toLocaleString("sv-SE", { maximumFractionDigits: 1 });

const getWeekNumber = (date: Date) => {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const days =
    (startOfDay(date).getTime() - startOfDay(firstJan).getTime()) / (1000 * 60 * 60 * 24);
  return Math.floor((days + firstJan.getDay()) / 7) + 1;
};

const getRangeStart = (range: DateRange) => {
  if (range === "7d") {
    const d = startOfDay(new Date(now));
    d.setDate(d.getDate() - 6);
    return d;
  }
  if (range === "30d") {
    const d = startOfDay(new Date(now));
    d.setDate(d.getDate() - 29);
    return d;
  }
  if (range === "6m") {
    const d = startOfMonth(new Date(now));
    d.setMonth(d.getMonth() - 5);
    return d;
  }
  const d = startOfMonth(new Date(now));
  d.setMonth(d.getMonth() - 11);
  return d;
};

const formatRangeLabel = (start: Date, end: Date) =>
  `${start.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })} - ${end.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;

const getBucketStart = (date: Date, range: DateRange) => {
  if (range === "7d") return startOfDay(date);
  if (range === "30d") return startOfWeek(date);
  return startOfMonth(date);
};

const getBucketLabel = (bucketStart: Date, range: DateRange) => {
  if (range === "7d") {
    return bucketStart.toLocaleDateString("en-IN", { weekday: "short" });
  }
  if (range === "30d") {
    return `Wk ${getWeekNumber(bucketStart)}`;
  }
  return bucketStart.toLocaleDateString("en-IN", { month: "short" });
};

const bucketize = <T,>(
  items: T[],
  range: DateRange,
  getDate: (item: T) => Date,
  reducers: Record<string, (acc: number, item: T) => number>
): ChartDatum[] => {
  const start = getRangeStart(range);
  const buckets = new Map<number, ChartDatum>();

  items.forEach((item) => {
    const date = getDate(item);
    if (date < start) return;
    const bucketStart = getBucketStart(date, range);
    const key = bucketStart.getTime();
    const existing =
      buckets.get(key) ??
      ({
        bucket: getBucketLabel(bucketStart, range),
        bucketStart: key,
      } as ChartDatum);

    Object.entries(reducers).forEach(([field, reducer]) => {
      const previousValue = typeof existing[field] === "number" ? existing[field] : 0;
      existing[field] = reducer(previousValue as number, item);
    });

    buckets.set(key, existing);
  });

  return Array.from(buckets.values()).sort((a, b) => a.bucketStart - b.bucketStart);
};

const rangeOptions: { value: DateRange; label: string; helper: string }[] = [
  { value: "7d", label: "Last 7 days", helper: "Daily buckets" },
  { value: "30d", label: "Last 30 days", helper: "Weekly buckets" },
  { value: "6m", label: "Last 6 months", helper: "Monthly buckets" },
  { value: "1y", label: "Last 1 year", helper: "Monthly buckets" },
];

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "leads", label: "Leads" },
  { key: "orders", label: "Orders" },
  { key: "bookings", label: "Bookings" },
  { key: "reviews", label: "Reviews" },
  { key: "profile", label: "Profile Score" },
];

const services: VendorService[] = [
  { id: "svc-1", title: "AC Repair & Gas Refill", status: "LIVE" },
  { id: "svc-2", title: "Deep Cleaning - 2BHK", status: "LIVE" },
];

const serviceOfferings: ServiceOffering[] = [
  { id: "off-1", serviceId: "svc-1", title: "Repair Visit", isActive: true },
  { id: "off-2", serviceId: "svc-2", title: "Full Deep Clean", isActive: true },
];

const offeringSlots: OfferingSlot[] = [
  { id: "slot-1", offeringId: "off-1", startTime: daysAgo(1) },
  { id: "slot-2", offeringId: "off-1", startTime: daysAgo(3) },
  { id: "slot-3", offeringId: "off-2", startTime: monthsAgo(1, 4) },
];

const serviceMedia: ServiceMedia[] = [
  { id: "media-1", serviceId: "svc-1", type: "IMAGE", url: "/media/ac-1.jpg" },
  { id: "media-2", serviceId: "svc-1", type: "IMAGE", url: "/media/ac-2.jpg" },
  { id: "media-3", serviceId: "svc-2", type: "IMAGE", url: "/media/clean-1.jpg" },
];

const leadsSeed: VendorLead[] = [
  {
    id: "L-301",
    name: "Rohit Kulkarni",
    email: "rohit@example.com",
    phone: "+91 90011 22233",
    serviceTitle: "AC Repair & Gas Refill",
    status: "NEW",
    createdAt: daysAgo(1),
  },
  {
    id: "L-302",
    name: "Sneha Patel",
    email: "sneha@example.com",
    phone: "+91 90022 33444",
    serviceTitle: "Deep Cleaning - 2BHK",
    status: "CONTACTED",
    createdAt: daysAgo(4),
  },
  {
    id: "L-303",
    name: "Vishal Mehta",
    email: "vishal@example.com",
    phone: "+91 98989 77788",
    serviceTitle: "AC Repair & Gas Refill",
    status: "CONVERTED",
    createdAt: daysAgo(9),
  },
  {
    id: "L-304",
    name: "Ananya Gupta",
    email: "ananya@example.com",
    phone: "+91 91111 44477",
    serviceTitle: "Deep Cleaning - 2BHK",
    status: "LOST",
    createdAt: daysAgo(18),
  },
  {
    id: "L-305",
    name: "Mahesh Iyer",
    email: "mahesh@example.com",
    phone: "+91 93333 11122",
    serviceTitle: "AC Repair & Gas Refill",
    status: "CONTACTED",
    createdAt: daysAgo(28),
  },
  {
    id: "L-306",
    name: "Kiran Desai",
    email: "kiran@example.com",
    phone: "+91 97777 88866",
    serviceTitle: "Deep Cleaning - 2BHK",
    status: "CONVERTED",
    createdAt: monthsAgo(2, 12),
  },
  {
    id: "L-307",
    name: "Prakash Sharma",
    email: "prakash@example.com",
    phone: "+91 93330 77700",
    serviceTitle: "AC Repair & Gas Refill",
    status: "NEW",
    createdAt: monthsAgo(3, 9),
  },
  {
    id: "L-308",
    name: "Meera Nair",
    email: "meera@example.com",
    phone: "+91 91212 55544",
    serviceTitle: "Deep Cleaning - 2BHK",
    status: "CONVERTED",
    createdAt: monthsAgo(5, 7),
  },
  {
    id: "L-309",
    name: "Sakshi Rawat",
    email: "sakshi@example.com",
    phone: "+91 98080 12121",
    serviceTitle: "AC Repair & Gas Refill",
    status: "CONTACTED",
    createdAt: monthsAgo(7, 12),
  },
  {
    id: "L-310",
    name: "Nikhil Shah",
    email: "nikhil@example.com",
    phone: "+91 93030 21212",
    serviceTitle: "AC Repair & Gas Refill",
    status: "CONVERTED",
    createdAt: monthsAgo(10, 6),
  },
];

const ordersSeed: Order[] = [
  {
    id: "ORD-2311",
    userId: "U-991",
    totalFinal: 7200,
    totalDiscount: 500,
    commissionAmount: 720,
    vendorPayoutAmount: 5980,
    status: "PAID",
    createdAt: daysAgo(2),
  },
  {
    id: "ORD-2310",
    userId: "U-322",
    totalFinal: 9800,
    totalDiscount: 800,
    commissionAmount: 980,
    vendorPayoutAmount: 8020,
    status: "PAID",
    createdAt: daysAgo(8),
  },
  {
    id: "ORD-2309",
    userId: "U-871",
    totalFinal: 12000,
    totalDiscount: 1000,
    commissionAmount: 1200,
    vendorPayoutAmount: 9800,
    status: "REFUNDED",
    createdAt: daysAgo(17),
  },
  {
    id: "ORD-2308",
    userId: "U-771",
    totalFinal: 6400,
    totalDiscount: 400,
    commissionAmount: 640,
    vendorPayoutAmount: 5360,
    status: "PAID",
    createdAt: daysAgo(27),
  },
  {
    id: "ORD-2307",
    userId: "U-663",
    totalFinal: 8200,
    totalDiscount: 200,
    commissionAmount: 820,
    vendorPayoutAmount: 7180,
    status: "PAID",
    createdAt: monthsAgo(2, 6),
  },
  {
    id: "ORD-2306",
    userId: "U-223",
    totalFinal: 9300,
    totalDiscount: 300,
    commissionAmount: 930,
    vendorPayoutAmount: 8070,
    status: "PAID",
    createdAt: monthsAgo(4, 18),
  },
  {
    id: "ORD-2305",
    userId: "U-901",
    totalFinal: 7600,
    totalDiscount: 0,
    commissionAmount: 760,
    vendorPayoutAmount: 6840,
    status: "PAID",
    createdAt: monthsAgo(7, 10),
  },
  {
    id: "ORD-2304",
    userId: "U-520",
    totalFinal: 8400,
    totalDiscount: 600,
    commissionAmount: 840,
    vendorPayoutAmount: 6960,
    status: "PAID",
    createdAt: monthsAgo(11, 4),
  },
];

const bookingsSeed: ServiceBooking[] = [
  {
    id: "BK-1901",
    serviceTitle: "AC Repair & Gas Refill",
    status: "CONFIRMED",
    startTime: daysAgo(2),
    createdAt: daysAgo(3),
  },
  {
    id: "BK-1902",
    serviceTitle: "Deep Cleaning - 2BHK",
    status: "PENDING",
    startTime: daysAgo(1),
    createdAt: daysAgo(1),
  },
  {
    id: "BK-1903",
    serviceTitle: "AC Repair & Gas Refill",
    status: "COMPLETED",
    startTime: daysAgo(7),
    createdAt: daysAgo(7),
  },
  {
    id: "BK-1904",
    serviceTitle: "Deep Cleaning - 2BHK",
    status: "CANCELLED",
    startTime: daysAgo(12),
    createdAt: daysAgo(12),
  },
  {
    id: "BK-1905",
    serviceTitle: "AC Repair & Gas Refill",
    status: "REFUND_REQUESTED",
    startTime: daysAgo(18),
    createdAt: daysAgo(18),
  },
  {
    id: "BK-1906",
    serviceTitle: "AC Repair & Gas Refill",
    status: "COMPLETED",
    startTime: monthsAgo(2, 12),
    createdAt: monthsAgo(2, 12),
  },
  {
    id: "BK-1907",
    serviceTitle: "Deep Cleaning - 2BHK",
    status: "REFUNDED",
    startTime: monthsAgo(4, 9),
    createdAt: monthsAgo(4, 9),
  },
  {
    id: "BK-1908",
    serviceTitle: "AC Repair & Gas Refill",
    status: "COMPLETED",
    startTime: monthsAgo(7, 11),
    createdAt: monthsAgo(7, 11),
  },
];

const reviewsSeed: Review[] = [
  {
    id: "REV-01",
    serviceTitle: "AC Repair & Gas Refill",
    rating: 5,
    comment: "Technician arrived on time and fixed the issue quickly.",
    verified: true,
    createdAt: daysAgo(3),
  },
  {
    id: "REV-02",
    serviceTitle: "Deep Cleaning - 2BHK",
    rating: 4,
    comment: "House looks spotless. Good attention to detail.",
    verified: true,
    createdAt: daysAgo(11),
  },
  {
    id: "REV-03",
    serviceTitle: "AC Repair & Gas Refill",
    rating: 3,
    comment: "Cooling is better but follow-up took time.",
    verified: false,
    createdAt: daysAgo(24),
  },
  {
    id: "REV-04",
    serviceTitle: "Deep Cleaning - 2BHK",
    rating: 1,
    comment: "Team arrived late and missed windows.",
    verified: true,
    createdAt: monthsAgo(2, 14),
  },
  {
    id: "REV-05",
    serviceTitle: "AC Repair & Gas Refill",
    rating: 4,
    comment: "Good but pricing felt high.",
    verified: false,
    createdAt: monthsAgo(4, 6),
  },
  {
    id: "REV-06",
    serviceTitle: "Deep Cleaning - 2BHK",
    rating: 5,
    comment: "Sparkling clean, courteous staff.",
    verified: true,
    createdAt: monthsAgo(7, 8),
  },
];

const vendorProfile: VendorProfile = {
  id: "vendor-aimbeat-001",
  userId: "user-aimbeat-001",
  businessName: "Aimbeat",
  slug: "aimbeat",
  city: "Mumbai",
  state: "Maharashtra",
  country: "SE",
  description: "Full-service growth partner for local service providers.",
  organizationNumber: "559123-4567",
  vatNumber: "SE559123456701",
  contactEmail: "founder@aimbeat.in",
  contactPhone: "+91 98200 11111",
  cityId: "mumbai",
  cityRelation: { id: "mumbai", name: "Mumbai", state: "Maharashtra", country: "IN" },
  status: "PENDING_REVIEW",
  kycStatus: "PENDING",
  payoutsEnabled: false,
  chargesEnabled: true,
  stripeAccountId: "acct_1NcDemoStripe",
  stripeOnboardedAt: monthsAgo(6),
  seoTitle: "Aimbeat | Home services partner",
  seoDescription: "Booking-ready profile with AC repair and deep cleaning services.",
  seoKeywords: ["ac repair", "deep cleaning", "mumbai services"],
  seoImageKey: "aimbeat-cover.png",
  isIndexable: true,
  approvedAt: monthsAgo(5),
  suspendedAt: undefined,
  totalBookings: bookingsSeed.length,
  totalRevenue: ordersSeed.reduce((sum, order) => sum + order.totalFinal, 0),
  ratingAvg:
    reviewsSeed.length === 0
      ? 0
      : Math.round(
          (reviewsSeed.reduce((sum, review) => sum + review.rating, 0) / reviewsSeed.length) * 10
        ) / 10,
  ratingCount: reviewsSeed.length,
  createdAt: monthsAgo(11),
  updatedAt: daysAgo(2),
};

const vendorGallery: VendorGalleryItem[] = [
  {
    id: "gal-1",
    vendorId: vendorProfile.id,
    type: "IMAGE",
    fileKey: "gallery/aimbeat/workshop.jpg",
    thumbnailKey: "gallery/aimbeat/workshop-thumb.jpg",
    title: "Workshop team",
    description: "Field crew ready for deployment",
    sortOrder: 0,
    status: "ACTIVE",
    createdAt: monthsAgo(5),
    updatedAt: monthsAgo(1),
  },
  {
    id: "gal-2",
    vendorId: vendorProfile.id,
    type: "IMAGE",
    fileKey: "gallery/aimbeat/cleaning.jpg",
    title: "Deep cleaning in progress",
    description: "2BHK full-service deep clean",
    sortOrder: 1,
    status: "ACTIVE",
    createdAt: monthsAgo(4),
    updatedAt: monthsAgo(1),
  },
  {
    id: "gal-3",
    vendorId: vendorProfile.id,
    type: "VIDEO",
    fileKey: "gallery/aimbeat/promo.mp4",
    thumbnailKey: "gallery/aimbeat/promo-thumb.jpg",
    title: "Promo reel",
    description: "Quick showcase of core services",
    sortOrder: 2,
    status: "ACTIVE",
    createdAt: monthsAgo(3),
    updatedAt: monthsAgo(1),
  },
];

const legendDot = (color: string) => (
  <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
);

const DataTableCard = <T,>({
  title,
  subtitle,
  rows,
  columns,
  emptyLabel,
}: {
  title: string;
  subtitle?: string;
  rows: T[];
  columns: TableColumn<T>[];
  emptyLabel: string;
}) => (
  <div className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.18)]">
    <div className="flex items-center justify-between gap-3 pb-3">
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead>
          <tr className="text-left text-[12px] uppercase tracking-[0.12em] text-slate-500">
            {columns.map((column) => (
              <th key={column.key} className={cn("px-2 py-2 font-semibold", column.className)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length ? (
            rows.map((row, idx) => (
              <tr key={idx} className="text-sm text-slate-800">
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-2 py-2", column.className)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-2 py-4 text-center text-sm font-semibold text-slate-500"
              >
                {emptyLabel}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const AnalyticsBarChart = ({
  title,
  subtitle,
  data,
  series,
  height = 240,
  currency = "INR",
}: {
  title: string;
  subtitle?: string;
  data: ChartDatum[];
  series: ChartSeries[];
  height?: number;
  currency?: string;
}) => {
  const tooltipFormatter = (value: number | string | undefined, name?: string) => {
    const meta = name ? series.find((s) => s.key === name) : undefined;
    const numeric = typeof value === "number" ? value : Number(value ?? 0);
    if (!meta) return [numeric, name ?? ""];
    if (meta.valueType === "currency") {
      return [currencyFormatter(numeric, currency), meta.label];
    }
    if (meta.valueType === "percent") {
      return [`${numeric.toFixed(1)}%`, meta.label];
    }
    return [numberFormatter(numeric), meta.label];
  };

  return (
    <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">{title}</p>
          {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
          {series.map((item) => (
            <span key={item.key} className="inline-flex items-center gap-1">
              {legendDot(item.color)}
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <div style={{ height }} className="mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="bucket"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#6B7280" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#6B7280" }}
              tickFormatter={(value: number) =>
                Math.abs(value) >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`
              }
            />
            <Tooltip
              cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #E5E7EB",
                fontSize: 12,
              }}
              formatter={tooltipFormatter}
              labelFormatter={(label) => `Period: ${label}`}
            />
            {series.map((item) => (
              <Line
                key={item.key}
                dataKey={item.key}
                type="monotone"
                stroke={item.color}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-center text-xs font-semibold text-slate-500">
        Data shown for the selected range
      </p>
    </div>
  );
};

const DateRangeSelector = ({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (value: DateRange) => void;
}) => (
  <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
    {rangeOptions.map((option) => {
      const isActive = value === option.value;
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={isActive}
          className={cn(
            "flex min-w-[120px] flex-col items-start rounded-md border px-3 py-2 text-left transition-colors",
            isActive
              ? "border-blue-500 bg-white text-blue-700"
              : "border-transparent bg-transparent text-slate-700 hover:border-slate-200"
          )}
        >
          <span className="text-[10px] font-semibold tracking-[0.06em] text-slate-500">
            {option.helper}
          </span>
          <span className="text-sm font-semibold leading-tight">{option.label}</span>
        </button>
      );
    })}
  </div>
);

const TabButton = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-3 py-2 text-sm font-semibold transition border-b-2",
      active
        ? "border-blue-600 text-blue-700"
        : "border-transparent text-slate-600 hover:text-slate-900"
    )}
  >
    {label}
  </button>
);

const conversionRate = (numerator: number, denominator: number) =>
  denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;

const VendorAnalyticsDashboard = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["key"]>("overview");
  const [range, setRange] = useState<DateRange>("1y");
  const [leads, setLeads] = useState<VendorLead[]>([]);
  const [derivedOfferings, setDerivedOfferings] = useState<ServiceOffering[]>([]);
  const [derivedSlots, setDerivedSlots] = useState<OfferingSlot[]>([]);
  const [derivedMedia, setDerivedMedia] = useState<ServiceMedia[]>([]);
  const [derivedReviews, setDerivedReviews] = useState<Review[]>([]);
  const [serviceInsightsLoading, setServiceInsightsLoading] = useState(false);

  const { data: vendorProfileResponse, isFetching: isProfileFetching } = useGetVendorProfileQuery();
  const { data: vendorLeadsResponse, isFetching: isLeadsFetching } = useGetVendorLeadsQuery({
    page: 1,
    limit: 100,
  });
  const { data: bookingsResponse, isFetching: isBookingsFetching } = useGetBookingsQuery();
  const { data: vendorOrdersResponse, isFetching: isOrdersFetching } = useGetVendorOrdersQuery();
  const { data: vendorServicesResponse, isFetching: isServicesFetching } = useGetVendorServicesQuery();
  const [updateVendorLeadStatus] = useUpdateVendorLeadStatusMutation();

  const [fetchServiceOfferings] = useLazyGetServiceOfferingsQuery();
  const [fetchOfferingSlots] = useLazyGetOfferingSlotsQuery();
  const [fetchServiceMedia] = useLazyGetServiceMediaQuery();
  const [fetchServiceReviews] = useLazyGetServiceReviewsQuery();

  const services = useMemo<VendorService[]>(
    () =>
      (vendorServicesResponse ?? []).map((service) => ({
        id: service.id,
        title: service.title,
        status: service.status === "LIVE" ? "LIVE" : "PAUSED",
      })),
    [vendorServicesResponse]
  );

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    (vendorServicesResponse ?? []).forEach((service) => {
      const category = service.category as { id?: string; name?: string } | undefined;
      if (category?.id && category.name) {
        map.set(category.id, category.name);
      }
    });
    return map;
  }, [vendorServicesResponse]);

  useEffect(() => {
    dispatch(setPageTitle("Vendor Analytics"));
  }, [dispatch]);

  useEffect(() => {
    const rows = vendorLeadsResponse?.data ?? [];
    setLeads(
      rows.map((item) => ({
        id: item.id,
        name: item.lead.name,
        email: item.lead.email ?? undefined,
        phone: item.lead.phone ?? undefined,
        serviceTitle: categoryNameById.get(item.lead.categoryId) ?? "Service enquiry",
        status: item.status,
        createdAt: item.createdAt,
      }))
    );
  }, [vendorLeadsResponse, categoryNameById]);

  useEffect(() => {
    let cancelled = false;

    const loadServiceInsights = async () => {
      if (!services.length) {
        setDerivedOfferings([]);
        setDerivedSlots([]);
        setDerivedMedia([]);
        setDerivedReviews([]);
        setServiceInsightsLoading(false);
        return;
      }

      setServiceInsightsLoading(true);

      const offeringsOut: ServiceOffering[] = [];
      const slotsOut: OfferingSlot[] = [];
      const mediaOut: ServiceMedia[] = [];
      const reviewsOut: Review[] = [];

      for (const service of services) {
        const [offeringsResult, mediaResult, reviewsResult] = await Promise.allSettled([
          fetchServiceOfferings(service.id).unwrap(),
          fetchServiceMedia(service.id).unwrap(),
          fetchServiceReviews(service.id).unwrap(),
        ]);

        if (offeringsResult.status === "fulfilled") {
          const offerings = offeringsResult.value;
          offerings.forEach((offering) => {
            offeringsOut.push({
              id: offering.id,
              serviceId: offering.serviceId,
              title: offering.name,
              isActive: true,
            });
          });

          const slotResults = await Promise.allSettled(
            offerings.map((offering) => fetchOfferingSlots({ offeringId: offering.id }).unwrap())
          );

          slotResults.forEach((slotResult, idx) => {
            if (slotResult.status !== "fulfilled") return;
            const offeringId = offerings[idx]?.id;
            if (!offeringId) return;
            slotResult.value.forEach((slot) => {
              slotsOut.push({
                id: slot.id,
                offeringId,
                startTime: slot.startTime,
              });
            });
          });
        }

        if (mediaResult.status === "fulfilled") {
          mediaResult.value.forEach((item: any) => {
            mediaOut.push({
              id: item.id,
              serviceId: item.serviceId ?? service.id,
              type: item.type,
              url: item.signedUrl ?? item.url ?? "",
            });
          });
        }

        if (reviewsResult.status === "fulfilled") {
          reviewsResult.value.forEach((review: any) => {
            reviewsOut.push({
              id: review.id,
              serviceTitle: service.title,
              rating: Number(review.rating ?? 0),
              comment: review.comment ?? "",
              verified: true,
              createdAt: review.createdAt,
              user: review.user
                ? {
                    firstName: review.user.firstName ?? null,
                    lastName: review.user.lastName ?? null,
                    nickName: review.user.nickName ?? null,
                  }
                : null,
            });
          });
        }
      }

      if (!cancelled) {
        setDerivedOfferings(offeringsOut);
        setDerivedSlots(slotsOut);
        setDerivedMedia(mediaOut);
        setDerivedReviews(reviewsOut);
        setServiceInsightsLoading(false);
      }
    };

    loadServiceInsights().catch(() => {
      if (!cancelled) {
        setServiceInsightsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [services, fetchServiceMedia, fetchServiceOfferings, fetchServiceReviews, fetchOfferingSlots]);

  const bookingsSeed = useMemo<ServiceBooking[]>(
    () =>
      (bookingsResponse ?? []).map((booking) => ({
        id: String(booking.id),
        serviceTitle: booking.service ?? "Service",
        status: booking.status as BookingStatus,
        startTime: booking.startTime,
        createdAt: booking.startTime,
      })),
    [bookingsResponse]
  );

  const ordersSeed = useMemo<Order[]>(
    () =>
      (vendorOrdersResponse?.data ?? []).map((order) => {
        return {
          id: String(order.id),
          userId: order.userId || "Guest",
          totalFinal: Number(order.totalFinal ?? 0),
          totalDiscount: Number(order.totalDiscount ?? 0),
          commissionAmount: Number(order.commissionAmount ?? 0),
          vendorPayoutAmount: Number(order.vendorPayoutAmount ?? 0),
          status: (order.status as OrderStatus) ?? "PENDING",
          createdAt: order.createdAt,
        };
      }),
    [vendorOrdersResponse]
  );

  const serviceOfferings = derivedOfferings;
  const offeringSlots = derivedSlots;
  const serviceMedia = derivedMedia;
  const reviewsSeed = derivedReviews;

  const vendorProfile = useMemo<VendorProfile>(() => {
    const profile = vendorProfileResponse?.data;

    const normalizedStatus: VendorStatus =
      profile?.status === "SUSPENDED"
        ? "SUSPENDED"
        : profile?.status === "APPROVED" || profile?.status === "ACTIVE"
        ? "APPROVED"
        : "PENDING_REVIEW";

    const kycStatus =
      profile?.kycStatus === "VERIFIED"
        ? "VERIFIED"
        : profile?.kycStatus === "PENDING"
        ? "PENDING"
        : "NOT_SUBMITTED";

    return {
      id: profile?.id ?? "",
      userId: "",
      businessName: profile?.businessName ?? "Vendor",
      slug: profile?.slug ?? "vendor",
      city: profile?.city?.name ?? "",
      state: profile?.city?.county ?? profile?.city?.municipality ?? "",
      country: profile?.city?.countryCode ?? "SE",
      description: profile?.description ?? undefined,
      organizationNumber: undefined,
      vatNumber: undefined,
      contactEmail: profile?.contactEmail ?? undefined,
      contactPhone: profile?.contactPhone ?? undefined,
      cityId: profile?.city?.id ?? undefined,
      cityRelation: profile?.city
        ? {
            id: profile.city.id,
            name: profile.city.name,
            state: profile.city.county ?? profile.city.municipality ?? undefined,
            country: profile.city.countryCode,
          }
        : undefined,
      status: normalizedStatus,
      kycStatus,
      approvedAt: undefined,
      suspendedAt: undefined,
      totalBookings: profile?.totalBookings ?? bookingsSeed.length,
      totalRevenue: Number(profile?.totalRevenue ?? 0),
      ratingAvg: Number(profile?.ratingAvg ?? 0),
      ratingCount: profile?.ratingCount ?? reviewsSeed.length,
      stripeAccountId: profile?.stripeAccountId ?? undefined,
      payoutsEnabled: profile?.payoutsEnabled ?? false,
      chargesEnabled: profile?.chargesEnabled ?? false,
      stripeOnboardedAt: undefined,
      seoTitle: profile?.seoTitle ?? undefined,
      seoDescription: profile?.seoDescription ?? undefined,
      seoKeywords: profile?.seoKeywords ?? [],
      seoImageKey: profile?.seoImageKey ?? undefined,
      isIndexable: profile?.isIndexable ?? false,
      createdAt: profile?.createdAt ?? undefined,
      updatedAt: profile?.updatedAt ?? undefined,
    };
  }, [vendorProfileResponse, bookingsSeed.length, reviewsSeed.length]);

  const vendorGallery = useMemo<VendorGalleryItem[]>(
    () =>
      serviceMedia.map((item, idx) => ({
        id: item.id,
        vendorId: vendorProfile.id,
        type: item.type,
        fileKey: item.url,
        title: services.find((service) => service.id === item.serviceId)?.title ?? "Service media",
        description: undefined,
        sortOrder: idx,
        status: "ACTIVE",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      })),
    [serviceMedia, services, vendorProfile.id]
  );

  const loading =
    isProfileFetching ||
    isLeadsFetching ||
    isBookingsFetching ||
    isOrdersFetching ||
    isServicesFetching ||
    serviceInsightsLoading;

  const currency = "SEK";
  const rangeStart = getRangeStart(range);
  const rangeLabel = formatRangeLabel(rangeStart, now);

  const filteredLeads = useMemo(
    () => leads.filter((lead) => new Date(lead.createdAt) >= getRangeStart(range)),
    [leads, range]
  );

  const filteredOrders = useMemo(
    () => ordersSeed.filter((order) => new Date(order.createdAt) >= getRangeStart(range)),
    [ordersSeed, range]
  );
  const filteredPaidOrders = useMemo(
    () => filteredOrders.filter((order) => order.status === "PAID"),
    [filteredOrders]
  );
  const filteredPaidAndRefundedOrders = useMemo(
    () => filteredOrders.filter((order) => order.status === "PAID" || order.status === "REFUNDED"),
    [filteredOrders]
  );

  const filteredBookings = useMemo(
    () =>
      bookingsSeed.filter((booking) => new Date(booking.createdAt) >= getRangeStart(range)),
    [bookingsSeed, range]
  );

  const filteredReviews = useMemo(
    () => reviewsSeed.filter((review) => new Date(review.createdAt) >= getRangeStart(range)),
    [reviewsSeed, range]
  );

  const leadCounts = useMemo(() => {
    const total = filteredLeads.length;
    const pipeline = filteredLeads.reduce<Record<LeadStatus, number>>(
      (acc, lead) => {
        acc[lead.status] += 1;
        return acc;
      },
      { NEW: 0, CONTACTED: 0, CONVERTED: 0, LOST: 0 }
    );
    const conversion = conversionRate(pipeline.CONVERTED, total);
    return { total, pipeline, conversion };
  }, [filteredLeads]);

  const orderMetrics = useMemo(() => {
    const paidOrders = filteredOrders.filter((order) => order.status === "PAID");
    const refundedOrders = filteredOrders.filter((order) => order.status === "REFUNDED");
    const grossRevenue = paidOrders.reduce((sum, order) => sum + order.totalFinal, 0);
    const totalDiscount = paidOrders.reduce((sum, order) => sum + order.totalDiscount, 0);
    const commission = paidOrders.reduce((sum, order) => sum + order.commissionAmount, 0);
    const vendorPayout = paidOrders.reduce(
      (sum, order) => sum + order.vendorPayoutAmount,
      0
    );
    return {
      paidCount: paidOrders.length,
      refundedCount: refundedOrders.length,
      grossRevenue,
      totalDiscount,
      commission,
      vendorPayout,
    };
  }, [filteredOrders]);

  const bookingMetrics = useMemo(() => {
    const total = filteredBookings.length;
    const confirmed = filteredBookings.filter((b) => b.status === "CONFIRMED").length;
    const cancelled = filteredBookings.filter((b) => b.status === "CANCELLED").length;
    const completed = filteredBookings.filter((b) => b.status === "COMPLETED").length;
    const refundRequested = filteredBookings.filter(
      (b) => b.status === "REFUND_REQUESTED"
    ).length;
    const refundCompleted = filteredBookings.filter((b) => b.status === "REFUNDED").length;
    const activeBookings = filteredBookings.filter(
      (b) => b.status !== "CANCELLED"
    ).length;
    return {
      total,
      confirmed,
      cancelled,
      completed,
      refundRequested,
      refundCompleted,
      activeBookings,
    };
  }, [filteredBookings]);

  const reviewsMetrics = useMemo(() => {
    const total = filteredReviews.length;
    const avgRating =
      total === 0
        ? 0
        : Math.round(
            (filteredReviews.reduce((sum, review) => sum + review.rating, 0) / total) * 10
          ) / 10;
    const verifiedCount = filteredReviews.filter((r) => r.verified).length;
    const fiveStar = filteredReviews.filter((r) => r.rating === 5).length;
    const oneStar = filteredReviews.filter((r) => r.rating === 1).length;
    return { total, avgRating, verifiedCount, fiveStar, oneStar };
  }, [filteredReviews]);

  const overviewChart = useMemo(
    () =>
      bucketize(
        [...filteredLeads, ...filteredOrders, ...filteredBookings],
        range,
        (item) => new Date((item as { createdAt: string }).createdAt),
        {
          leads: (acc, item) => ("status" in item ? acc + 1 : acc),
          orders: (acc, item) =>
            "status" in item && (item as Order).status === "PAID" ? acc + 1 : acc,
          bookings: (acc, item) =>
            "status" in item && (item as ServiceBooking).status !== "CANCELLED"
              ? acc + 1
              : acc,
        }
      ),
    [filteredBookings, filteredLeads, filteredOrders, range]
  );

  const leadsChart = useMemo(
    () =>
      bucketize(filteredLeads, range, (lead) => new Date(lead.createdAt), {
        leads: (acc) => acc + 1,
        converted: (acc, lead) => (lead.status === "CONVERTED" ? acc + 1 : acc),
      }),
    [filteredLeads, range]
  );

  const ordersRevenueChart = useMemo(
    () =>
      bucketize(filteredPaidOrders, range, (order) => new Date(order.createdAt), {
        revenue: (acc, order) => acc + order.totalFinal,
      }),
    [filteredPaidOrders, range]
  );

  const ordersSplitChart = useMemo(
    () =>
      bucketize(filteredPaidOrders, range, (order) => new Date(order.createdAt), {
        commission: (acc, order) => acc + order.commissionAmount,
        payout: (acc, order) => acc + order.vendorPayoutAmount,
      }),
    [filteredPaidOrders, range]
  );

  const bookingsChart = useMemo(
    () =>
      bucketize(filteredBookings, range, (booking) => new Date(booking.createdAt), {
        bookings: (acc) => acc + 1,
      }),
    [filteredBookings, range]
  );

  const topServicesByBookings = useMemo(() => {
    const counts = filteredBookings.reduce<Record<string, number>>((acc, booking) => {
      if (booking.status === "CANCELLED") return acc;
      acc[booking.serviceTitle] = (acc[booking.serviceTitle] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([serviceTitle, count]) => ({ serviceTitle, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredBookings]);

  const reviewsDistribution = useMemo(() => {
    const buckets: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filteredReviews.forEach((review) => {
      buckets[review.rating] = (buckets[review.rating] ?? 0) + 1;
    });
    return Object.keys(buckets)
      .map(Number)
      .map((rating) => ({
        bucket: `${rating} star`,
        bucketStart: rating,
        count: buckets[rating],
    }));
  }, [filteredReviews]);

  const profileScore = useMemo(() => {
    const checks = [
      { label: "Business name", score: 10, passed: !!vendorProfile.businessName },
      { label: "Description", score: 10, passed: !!vendorProfile.description },
      {
        label: "Contact details",
        score: 10,
        passed: !!vendorProfile.contactEmail || !!vendorProfile.contactPhone,
      },
      { label: "City added", score: 10, passed: !!vendorProfile.cityId },
      {
        label: "Live services",
        score: 15,
        passed: services.some((service) => service.status === "LIVE"),
      },
      {
        label: "Service offerings",
        score: 10,
        passed: serviceOfferings.length > 0,
      },
      { label: "Slots published", score: 10, passed: offeringSlots.length > 0 },
      { label: "Media uploaded", score: 10, passed: serviceMedia.length >= 3 },
      { label: "5+ reviews", score: 10, passed: reviewsSeed.length >= 5 },
      {
        label: "KYC verified",
        score: 5,
        passed: vendorProfile.kycStatus === "VERIFIED",
      },
    ];

    const achieved = checks
      .filter((check) => check.passed)
      .reduce((sum, check) => sum + check.score, 0);

    const score = Math.min(achieved, 100);
    const missing = checks.filter((check) => !check.passed).map((check) => check.label);

    return { score, missing };
  }, [offeringSlots.length, reviewsSeed.length, serviceMedia.length, serviceOfferings.length, services, vendorProfile.businessName, vendorProfile.cityId, vendorProfile.contactEmail, vendorProfile.contactPhone, vendorProfile.description, vendorProfile.kycStatus]);

  const latestLeadsColumns: TableColumn<VendorLead>[] = [
    {
      key: "name",
      header: "Lead",
      render: (lead) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900">{lead.name}</p>
          <p className="text-xs text-slate-500">{lead.email ?? "No email"}</p>
        </div>
      ),
    },
    {
      key: "service",
      header: "Service",
      render: (lead) => <span className="text-sm font-semibold">{lead.serviceTitle}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (lead) => (
        <div className="flex items-center gap-2">
          <StatusPill
            status={lead.status}
            tone={
              lead.status === "CONVERTED"
                ? "success"
                : lead.status === "CONTACTED"
                ? "warning"
                : lead.status === "LOST"
                ? "danger"
                : "info"
            }
            size="sm"
          />
          <select
            value={lead.status}
            onChange={(event) => {
              const nextStatus = event.target.value as LeadStatus;
              const previousStatus = lead.status;

              setLeads((prev) =>
                prev.map((item) => (item.id === lead.id ? { ...item, status: nextStatus } : item))
              );

              void updateVendorLeadStatus({ id: lead.id, status: nextStatus })
                .unwrap()
                .catch(() => {
                  setLeads((prev) =>
                    prev.map((item) =>
                      item.id === lead.id ? { ...item, status: previousStatus } : item
                    )
                  );
                });
            }}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700"
          >
            {(["NEW", "CONTACTED", "CONVERTED", "LOST"] as LeadStatus[]).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Received",
      render: (lead) => (
        <span className="text-sm text-slate-700">
          {new Date(lead.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (lead) => (
        <div className="flex items-center justify-end gap-1 text-slate-600">
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-md bg-blue-50 text-blue-700"
            aria-label={`Call ${lead.name}`}
          >
            <HiOutlinePhone className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-md bg-emerald-50 text-emerald-700"
            aria-label={`WhatsApp ${lead.name}`}
          >
            <BsWhatsapp className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-md bg-slate-100 text-slate-700"
            aria-label={`Email ${lead.name}`}
          >
            <HiOutlineEnvelope className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const formatShortOrderId = (orderId: string) =>
    orderId.length > 14 ? `${orderId.slice(0, 8)}...${orderId.slice(-6)}` : orderId;

  const overviewKpis = [
    {
      title: "Leads Received",
      value: leadCounts.total,
      subtitle: `${leadCounts.pipeline.NEW} new`,
      icon: HiOutlineUsers,
      accentColor: "blue" as const,
    },
    {
      title: "Orders Paid",
      value: orderMetrics.paidCount,
      subtitle: `${orderMetrics.refundedCount} refunded`,
      icon: HiOutlineWallet,
      accentColor: "green" as const,
    },
    {
      title: "Revenue",
      value: currencyFormatter(orderMetrics.grossRevenue, currency),
      subtitle: "Paid orders only",
      icon: HiOutlineArrowTrendingUp,
      accentColor: "purple" as const,
    },
    {
      title: "Bookings",
      value: bookingMetrics.activeBookings,
      subtitle: `${bookingMetrics.confirmed} confirmed`,
      icon: HiOutlineCalendarDays,
      accentColor: "cyan" as const,
    },
    {
      title: "Conversion Rate",
      value: `${leadCounts.conversion}%`,
      subtitle: "Paid orders / leads",
      icon: HiOutlineCheckCircle,
      accentColor: "green" as const,
    },
    {
      title: "Avg Rating",
      value: reviewsMetrics.avgRating || "N/A",
      subtitle: `${reviewsMetrics.total} reviews`,
      icon: HiOutlineStar,
      accentColor: "yellow" as const,
    },
  ];

  const renderOverviewTab = () => (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-bold tracking-tight text-slate-900">Vendor Analytics</h2>
          <p className="mt-1 text-sm text-slate-500">
            {vendorProfile.businessName} • {vendorProfile.city}, {vendorProfile.state}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DateRangeSelector value={range} onChange={setRange} />
       
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.18)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Store</span>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{vendorProfile.businessName}</p>
              <p className="flex items-center gap-1 text-sm font-semibold text-slate-500">
                <HiOutlineMapPin className="h-4 w-4" />
                {vendorProfile.city}, {vendorProfile.state}
                <span className="mx-1">•</span>
                {rangeLabel}
              </p>
            </div>
          </div>
   
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {overviewKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="min-h-[154px] rounded-[24px] border border-slate-100 bg-white p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.18)]"
            >
              <div className="flex h-full flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {kpi.title}
                  </p>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-100 bg-slate-50 text-slate-500">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[30px] font-bold leading-none tracking-tight text-slate-900">
                    {kpi.value}
                  </p>
                  <p className="text-xs text-slate-500">{kpi.subtitle}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.45fr_0.95fr]">
        <AnalyticsBarChart
          title="Interactions Overview"
          subtitle="Customer journey lifecycle metrics over the last 30 days"
          data={overviewChart}
          series={[
            { key: "leads", label: "Leads", color: "#2563EB" },
            { key: "orders", label: "Orders", color: "#8B5CF6" },
            { key: "bookings", label: "Bookings", color: "#14B8A6" },
          ]}
          height={320}
        />
        <div className="grid gap-5">
          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900">Latest Leads</h3>
              <button type="button" className="text-sm font-semibold text-[#3554e0]">View All</button>
            </div>
            <div className="mt-4 space-y-4">
              {filteredLeads.slice(0, 3).map((lead) => (
                <div key={lead.id} className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
                    <HiOutlineUsers className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">{lead.name}</p>
                    <p className="text-xs text-slate-500">{lead.serviceTitle}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900">Latest Orders</h3>
              <button type="button" className="text-sm font-semibold text-[#3554e0]">View All</button>
            </div>
            <div className="mt-4 space-y-4">
              {filteredPaidAndRefundedOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{order.id}</p>
                    <p className="text-xs text-slate-500">
                      {currencyFormatter(order.totalFinal, currency)} • Card Payment
                    </p>
                  </div>
                  <StatusPill
                    status={order.status}
                    tone={order.status === "PAID" ? "success" : order.status === "REFUNDED" ? "warning" : "neutral"}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900">Latest Reviews</h3>
              <button type="button" className="text-sm font-semibold text-[#3554e0]">View All</button>
            </div>
            <div className="mt-4 space-y-4">
              {filteredReviews.slice(0, 3).map((review) => (
                <div key={`${review.id}-${review.createdAt}`} className="rounded-2xl bg-slate-50 p-4">
                  {(() => {
                    const reviewerName =
                      [review.user?.nickName, review.user?.firstName, review.user?.lastName]
                        .filter(Boolean)
                        .join(" ")
                        .trim() || "Verified customer";
                    return (
                      <>
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <HiOutlineStar
                              key={idx}
                              className={cn(
                                "h-4 w-4",
                                idx < Math.round(review.rating) ? "text-amber-400" : "text-slate-300",
                              )}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{reviewerName}</p>
                        <p className="mt-1 text-sm italic leading-6 text-slate-700">"{review.comment}"</p>
                        <p className="mt-2 text-xs font-semibold text-slate-500">
                          - {review.verified ?  review.user?.firstName : "Customer"} 
                        </p>
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLeadsTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatsCard
          title="Total Leads"
          value={leadCounts.total}
          subtitle="In selected range"
          icon={HiOutlineUsers}
          accentColor="blue"
        />
        <StatsCard
          title="New Leads"
          value={leadCounts.pipeline.NEW}
          subtitle="Fresh enquiries"
          icon={HiOutlinePaperAirplane}
          accentColor="cyan"
        />
        <StatsCard
          title="Contacted"
          value={leadCounts.pipeline.CONTACTED}
          subtitle="Moved out of NEW"
          icon={HiOutlinePhone}
          accentColor="yellow"
        />
        <StatsCard
          title="Converted"
          value={leadCounts.pipeline.CONVERTED}
          subtitle="Paying customers"
          icon={HiOutlineCheckCircle}
          accentColor="green"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${leadCounts.conversion}%`}
          subtitle="Converted / total"
          icon={HiOutlineArrowTrendingUp}
          accentColor="purple"
        />
      </div>

      <AnalyticsBarChart
        title="Leads Received vs Converted"
        subtitle="Per selected time bucket"
        data={leadsChart}
        series={[
          { key: "leads", label: "Leads", color: "#2563EB" },
          { key: "converted", label: "Converted", color: "#22C55E" },
        ]}
      />

      <DataTableCard
        title="Latest Leads"
        subtitle="Status, service, and quick reach-out"
        rows={filteredLeads.slice(0, 8)}
        columns={latestLeadsColumns}
        emptyLabel="No leads in this range."
      />
    </div>
  );

  const renderOrdersTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatsCard
          title="Paid Orders"
          value={orderMetrics.paidCount}
          subtitle="Status = PAID"
          icon={HiOutlineWallet}
          accentColor="green"
        />
        <StatsCard
          title="Gross Revenue"
          value={currencyFormatter(orderMetrics.grossRevenue, currency)}
          subtitle="Sum of totalFinal"
          icon={HiOutlineArrowTrendingUp}
          accentColor="blue"
        />
        <StatsCard
          title="Discount Given"
          value={currencyFormatter(orderMetrics.totalDiscount, currency)}
          subtitle="Sum of totalDiscount"
          icon={HiOutlineMapPin}
          accentColor="yellow"
        />
        <StatsCard
          title="Vendor Payout"
          value={currencyFormatter(orderMetrics.vendorPayout, currency)}
          subtitle="Post commission"
          icon={HiOutlineCheckCircle}
          accentColor="cyan"
        />
        <StatsCard
          title="Refunded Orders"
          value={orderMetrics.refundedCount}
          subtitle="Status = REFUNDED"
          icon={HiOutlineEnvelope}
          accentColor="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnalyticsBarChart
          title="Revenue Trend"
          subtitle="Sum of totalFinal (PAID)"
          data={ordersRevenueChart}
          series={[
            { key: "revenue", label: "Gross Revenue", color: "#2563EB", valueType: "currency" },
          ]}
          currency={currency}
        />
        <AnalyticsBarChart
          title="Payout to Wallet"
          subtitle="Net amount after platform commission (PAID orders)"
          data={ordersSplitChart}
          series={[
            { key: "payout", label: "Vendor Payout", color: "#0EA5E9", valueType: "currency" },
          ]}
          currency={currency}
        />
      </div>

      <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.18)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Latest Paid Orders</h3>
            <p className="text-sm text-slate-500">Real-time update of your merchant transactions</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              Export CSV
            </button>
            <button
              type="button"
              className="rounded-xl bg-[#3554e0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
            >
              View All Orders
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-sm">
            <thead>
              <tr className="text-left text-[12px] uppercase tracking-[0.12em] text-slate-500">
                <th className="px-4 py-3 font-semibold">Order ID</th>
                <th className="px-4 py-3 font-semibold">Created Date</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Commission</th>
                <th className="px-4 py-3 font-semibold">Vendor Payout</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPaidOrders.slice(0, 8).map((order) => (
                <tr key={order.id} className="rounded-2xl bg-slate-50/70">
                  <td className="rounded-l-2xl px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-slate-400 shadow-sm">
                        <HiOutlineWallet className="h-4 w-4" />
                      </span>
                      <p className="font-semibold text-slate-900">{formatShortOrderId(order.id)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-slate-700">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-slate-900">
                      {currencyFormatter(order.totalFinal, currency)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-rose-500">
                      {currencyFormatter(order.commissionAmount, currency)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-[#3554e0]">
                      {currencyFormatter(order.vendorPayoutAmount, currency)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill status={order.status} tone="success" size="sm" />
                  </td>
                  <td className="rounded-r-2xl px-4 py-4">
                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#3554e0] shadow-sm"
                      aria-label={`View order ${order.id}`}
                    >
                      <HiOutlineEye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBookingsTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatsCard
          title="Total Bookings"
          value={bookingMetrics.total}
          subtitle="All statuses"
          icon={HiOutlineCalendarDays}
          accentColor="blue"
        />
        <StatsCard
          title="Confirmed"
          value={bookingMetrics.confirmed}
          subtitle="Ready to service"
          icon={HiOutlineCheckCircle}
          accentColor="green"
        />
        <StatsCard
          title="Cancelled"
          value={bookingMetrics.cancelled}
          subtitle="Includes customer cancellations"
          icon={HiOutlineEnvelope}
          accentColor="red"
        />
        <StatsCard
          title="Completed"
          value={bookingMetrics.completed}
          subtitle="Closed jobs"
          icon={HiOutlineUsers}
          accentColor="cyan"
        />
        <StatsCard
          title="Refund Requested"
          value={bookingMetrics.refundRequested}
          subtitle="Pending resolution"
          icon={HiOutlinePaperAirplane}
          accentColor="yellow"
        />
        <StatsCard
          title="Refund Completed"
          value={bookingMetrics.refundCompleted}
          subtitle="Refunded bookings"
          icon={HiOutlineWallet}
          accentColor="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnalyticsBarChart
          title="Bookings Trend"
          subtitle="Counts per time bucket"
          data={bookingsChart}
          series={[{ key: "bookings", label: "Bookings", color: "#2563EB" }]}
        />
        <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.18)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Top Services</h3>
              <p className="mt-1 text-sm text-slate-500">Most booked services in the selected range</p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {topServicesByBookings.length ? (
              topServicesByBookings.map((item, index) => {
                const maxCount = topServicesByBookings[0]?.count || 1;
                const width = Math.max(18, Math.round((item.count / maxCount) * 100));
                const colors = ["#3554e0", "#6f63ee", "#0ea5e9", "#14b8a6", "#f59e0b"];
                const barColor = colors[index % colors.length];

                return (
                  <div key={item.serviceTitle} className="space-y-2">
                    <div className="flex items-end justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{item.serviceTitle}</p>
                      <p className="text-sm font-semibold text-slate-500">
                        <span className="text-[#3554e0]">{item.count}</span>{" "}
                        <span className="text-slate-400">units</span>
                      </p>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100">
                      <div
                        className="h-2.5 rounded-full"
                        style={{ width: `${width}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500">No bookings in this range.</p>
            )}
          </div>

          <button
            type="button"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#3554e0]"
          >
            View Detailed Category Insights
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.18)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Latest Bookings</h3>
            <p className="text-sm text-slate-500">Recent transaction activity across all storefronts</p>
          </div>
         
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-sm">
            <thead>
              <tr className="text-left text-[12px] uppercase tracking-[0.12em] text-slate-500">
                <th className="px-2 py-3 font-semibold">Service</th>
                <th className="px-2 py-3 font-semibold">Reference</th>
                <th className="px-2 py-3 font-semibold">Created</th>
                <th className="px-2 py-3 font-semibold">Amount</th>
                <th className="px-2 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.slice(0, 4).map((booking) => {
                const bookingAmount =
                  booking.status === "CONFIRMED"
                    ? 124
                    : booking.status === "PENDING"
                    ? 85
                    : booking.status === "CANCELLED"
                    ? 210.5
                    : booking.status === "COMPLETED"
                    ? 42
                    : booking.status === "REFUND_REQUESTED"
                    ? 65
                    : 95;

                const statusTone =
                  booking.status === "CONFIRMED" || booking.status === "COMPLETED"
                    ? "success"
                    : booking.status === "CANCELLED"
                    ? "danger"
                    : booking.status === "REFUND_REQUESTED" || booking.status === "REFUNDED"
                    ? "warning"
                    : "info";

                return (
                  <tr key={booking.id} className="rounded-2xl bg-slate-50/70">
                    <td className="rounded-l-2xl px-2 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#3554e0] shadow-sm">
                          <HiOutlineCalendarDays className="h-5 w-5" />
                        </span>
                        <p className="font-semibold text-slate-900">{booking.serviceTitle}</p>
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      <span className="font-semibold text-slate-700">{booking.id}</span>
                    </td>
                    <td className="px-2 py-4">
                      <span className="font-semibold text-slate-700">
                        {new Date(booking.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-2 py-4">
                      <span className="font-semibold text-slate-900">${bookingAmount.toFixed(2)}</span>
                    </td>
                    <td className="rounded-r-2xl px-2 py-4">
                      <StatusPill status={booking.status} tone={statusTone} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

       
      </div>
    </div>
  );

  const renderReviewsTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatsCard
          title="Avg Rating"
          value={reviewsMetrics.avgRating || "N/A"}
          subtitle={`${reviewsMetrics.total} reviews`}
          icon={HiOutlineStar}
          accentColor="yellow"
        />
        <StatsCard
          title="Total Reviews"
          value={reviewsMetrics.total}
          subtitle="All ratings"
          icon={HiOutlineUsers}
          accentColor="blue"
        />
        <StatsCard
          title="Verified Reviews"
          value={reviewsMetrics.verifiedCount}
          subtitle="Platform verified"
          icon={HiOutlineCheckCircle}
          accentColor="green"
        />
        <StatsCard
          title="5-star Reviews"
          value={reviewsMetrics.fiveStar}
          subtitle="Promoters"
          icon={HiOutlineArrowTrendingUp}
          accentColor="purple"
        />
        <StatsCard
          title="1-star Reviews"
          value={reviewsMetrics.oneStar}
          subtitle="Need attention"
          icon={HiOutlineEnvelope}
          accentColor="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnalyticsBarChart
          title="Rating Distribution"
          subtitle="1 to 5 star spread"
          data={reviewsDistribution}
          series={[{ key: "count", label: "Reviews", color: "#2563EB" }]}
        />
        <AnalyticsBarChart
          title="Reviews Over Time"
          subtitle="Volume across the selected period"
          data={bucketize(filteredReviews, range, (review) => new Date(review.createdAt), {
            reviews: (acc) => acc + 1,
          })}
          series={[{ key: "reviews", label: "Reviews", color: "#22C55E" }]}
        />
      </div>

      <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Feedbacks</h3>
            <p className="text-sm text-slate-500">Real-time monitoring of client experiences</p>
          </div>
          <button type="button" className="text-sm font-semibold text-[#3554e0]">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-sm">
            <thead>
              <tr className="text-left text-[12px] uppercase tracking-[0.12em] text-slate-500">
                <th className="px-2 py-3 font-semibold">Service Name</th>
                <th className="px-2 py-3 font-semibold">Rating</th>
                <th className="px-2 py-3 font-semibold">Comment</th>
                <th className="px-2 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.slice(0, 6).map((review) => {
                const reviewerName =
                  [review.user?.nickName, review.user?.firstName, review.user?.lastName]
                    .filter(Boolean)
                    .join(" ")
                    .trim() || "Verified customer";

                const dateLabel = new Date(review.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });

                const timeLabel = new Date(review.createdAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr key={`${review.id}-${review.createdAt}`} className="rounded-2xl bg-slate-50/70">
                    <td className="rounded-l-2xl px-2 py-4">
                      <div className="flex items-start gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#3554e0] shadow-sm">
                          <HiOutlineStar className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">{review.serviceTitle}</p>
                          <p className="text-xs text-slate-500">{reviewerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <HiOutlineStar
                            key={idx}
                            className={cn(
                              "h-4 w-4",
                              idx < Math.round(review.rating) ? "text-amber-400" : "text-slate-300",
                            )}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      <p className="max-w-sm truncate text-sm text-slate-700">"{review.comment}"</p>
                    </td>
                    <td className="rounded-r-2xl px-2 py-4">
                      <div className="font-semibold text-slate-700">
                        <p>{dateLabel}</p>
                        <p className="text-xs font-medium text-slate-400">{timeLabel}</p>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProfileTab = () => {
    const badgeTone = (tone: "success" | "warning" | "danger" | "info") =>
      cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        tone === "success" && "bg-emerald-50 text-emerald-700",
        tone === "warning" && "bg-amber-50 text-amber-700",
        tone === "danger" && "bg-rose-50 text-rose-700",
        tone === "info" && "bg-blue-50 text-blue-700"
      );

    const statusBadges: { label: string; tone: "success" | "warning" | "danger" | "info" }[] = [
      {
        label: vendorProfile.status.replace("_", " "),
        tone:
          vendorProfile.status === "APPROVED"
            ? "success"
            : vendorProfile.status === "SUSPENDED"
            ? "danger"
            : "warning",
      },
      {
        label:
          vendorProfile.kycStatus === "VERIFIED"
            ? "KYC verified"
            : vendorProfile.kycStatus === "PENDING"
            ? "KYC pending"
            : "KYC not submitted",
        tone: vendorProfile.kycStatus === "VERIFIED" ? "success" : "warning",
      },
      {
        label: vendorProfile.payoutsEnabled ? "Payouts enabled" : "Payouts blocked",
        tone: vendorProfile.payoutsEnabled ? "success" : "warning",
      },
      {
        label: vendorProfile.chargesEnabled ? "Charges on" : "Charges off",
        tone: vendorProfile.chargesEnabled ? "info" : "danger",
      },
      {
        label: vendorProfile.isIndexable ? "Indexable" : "Hidden",
        tone: vendorProfile.isIndexable ? "info" : "warning",
      },
    ];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
            <SectionHeader title="Vendor profile" />
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {statusBadges.map((badge) => (
                  <span key={badge.label} className={badgeTone(badge.tone)}>
                    {badge.label}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-slate-900">{vendorProfile.businessName}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {vendorProfile.description ??
                      "Add a short description to help customers know you better."}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
                    <span className="inline-flex items-center gap-1">
                      <HiOutlineMapPin className="h-4 w-4" />
                      {vendorProfile.city}, {vendorProfile.state}
                      {vendorProfile.country ? ` | ${vendorProfile.country}` : ""}
                    </span>
                    {vendorProfile.contactPhone ? (
                      <span className="inline-flex items-center gap-1">
                        <HiOutlinePhone className="h-4 w-4" />
                        {vendorProfile.contactPhone}
                      </span>
                    ) : null}
                    {vendorProfile.contactEmail ? (
                      <span className="inline-flex items-center gap-1">
                        <HiOutlineEnvelope className="h-4 w-4" />
                        {vendorProfile.contactEmail}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="w-full max-w-xs space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Public slug
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    /vendors/{vendorProfile.slug ?? "not-set"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {vendorProfile.isIndexable ? "Indexable in search" : "Hidden from search"}
                  </p>
                  {vendorProfile.approvedAt ? (
                    <p className="text-[11px] text-slate-500">
                      Since{" "}
                      {new Date(vendorProfile.approvedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <SectionHeader title="Business Profile Score" />
            <div className="mt-3 space-y-3">
              <ProfileScoreCard
                score={profileScore.score}
                missingTasks={profileScore.missing}
                supportingText=""
                ctaLabel="Improve profile"
                ctaTo="/vendor/profile"
                variant="compact"
              />
              <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                  <span>Status</span>
                  <span>
                    {profileScore.score >= 80
                      ? "Good"
                      : profileScore.score >= 50
                      ? "Okay"
                      : "Needs work"}
                  </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
                    style={{ width: `${profileScore.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Complete the checklist to unlock more visibility and better lead quality.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Bookings"
            value={vendorProfile.totalBookings}
            subtitle="Cached total bookings"
            icon={HiOutlineCalendarDays}
            accentColor="blue"
          />
          <StatsCard
            title="Gross Revenue"
            value={currencyFormatter(vendorProfile.totalRevenue, currency)}
            subtitle="Cached total revenue"
            icon={HiOutlineWallet}
            accentColor="green"
          />
          <StatsCard
            title="Avg Rating"
            value={vendorProfile.ratingAvg || "N/A"}
            subtitle={`${vendorProfile.ratingCount} reviews`}
            icon={HiOutlineStar}
            accentColor="yellow"
          />
          <StatsCard
            title="Payout readiness"
            value={vendorProfile.payoutsEnabled ? "Ready" : "Action needed"}
            subtitle={
              vendorProfile.payoutsEnabled
                ? "Stripe connected"
                : "Connect Stripe + verify KYC"
            }
            icon={HiOutlineWallet}
            accentColor={vendorProfile.payoutsEnabled ? "cyan" : "red"}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <SectionHeader title="Lifecycle & metadata" />
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { label: "Created at", value: vendorProfile.createdAt, asDate: true },
                { label: "Updated at", value: vendorProfile.updatedAt, asDate: true },
                { label: "Stripe onboarded", value: vendorProfile.stripeOnboardedAt, asDate: true },
                { label: "Approved at", value: vendorProfile.approvedAt, asDate: true },
                { label: "Suspended at", value: vendorProfile.suspendedAt, asDate: true, fallback: "Never" },
                { label: "City (relation)", value: vendorProfile.cityRelation?.name ?? "Not linked" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.asDate && item.value
                      ? new Date(item.value).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : item.value ?? item.fallback ?? "Not set"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <SectionHeader title="Business identity" />
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { label: "Organization number", value: vendorProfile.organizationNumber ?? "Not provided" },
                { label: "VAT number", value: vendorProfile.vatNumber ?? "Not provided" },
                { label: "Country", value: vendorProfile.country ?? "SE" },
                { label: "Status", value: vendorProfile.status.replace("_", " ") },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <SectionHeader title="Compliance & payouts" />
            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  KYC status
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {vendorProfile.kycStatus === "VERIFIED"
                    ? "Verified"
                    : vendorProfile.kycStatus === "PENDING"
                    ? "Pending review"
                    : "Not submitted"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Payouts
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {vendorProfile.payoutsEnabled ? "Enabled" : "Blocked"}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Charges
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {vendorProfile.chargesEnabled ? "Live" : "Off"}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Stripe account
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {vendorProfile.stripeAccountId ?? "Connect to start payouts"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <SectionHeader title="Contact, SEO & reachability" />
            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Contacts
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {vendorProfile.contactPhone ?? "No phone"} / {vendorProfile.contactEmail ?? "No email"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  SEO title
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {vendorProfile.seoTitle ?? "Add a catchy page title"}
                </p>
                <p className="text-xs text-slate-500">
                  {vendorProfile.seoDescription ??
                    "Meta description helps with rankings and click-throughs."}
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Keywords & media
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {(vendorProfile.seoKeywords?.length ?? 0) > 0
                    ? `${vendorProfile.seoKeywords?.length} keywords / ${vendorProfile.seoImageKey ?? "No cover image"}`
                    : "No keywords yet"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <SectionHeader title="Gallery" />
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-8">
            {vendorGallery.length ? (
              vendorGallery
                .slice()
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            item.type === "VIDEO"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-cyan-50 text-cyan-700"
                          )}
                        >
                          {item.type}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            item.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          )}
                        >
                          {item.status}
                        </span>
                      </span>
                      <span className="text-[11px] text-slate-500">#{item.sortOrder}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{item.title ?? "Untitled"}</p>
                    <p className="text-xs text-slate-500">
                      {item.description ?? "No description provided."}
                    </p>
                    <div className="mt-2 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                      {item.type === "VIDEO" ? (
                        <video
                          src={item.fileKey}
                          controls
                          className="h-40 w-full object-cover"
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={item.fileKey}
                          alt={item.title ?? "Gallery image"}
                          className="h-40 w-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(event) => {
                            const target = event.currentTarget;
                            target.style.display = "none";
                            if (target.parentElement) {
                              target.parentElement.innerHTML =
                                '<div class="flex h-40 items-center justify-center text-xs text-slate-500">Image unavailable</div>';
                            }
                          }}
                        />
                      )}
                    </div>
                    {item.thumbnailKey ? (
                      <p className="text-[11px] text-slate-500">Thumb: {item.thumbnailKey}</p>
                    ) : null}
                  </div>
                ))
            ) : (
              <p className="text-sm text-slate-500">No gallery items added yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <SectionHeader title="Profile completeness checklist" />
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {[
              {
                label: "Add description",
                passed: !!vendorProfile.description,
                to: "/vendor/profile",
              },
              {
                label: "Add contact details",
                passed: !!vendorProfile.contactEmail || !!vendorProfile.contactPhone,
                to: "/vendor/profile",
              },
              {
                label: "Upload media",
                passed: serviceMedia.length >= 3,
                to: "/vendor/media",
              },
              {
                label: "Create offerings",
                passed: serviceOfferings.length > 0,
                to: "/vendor/services",
              },
              {
                label: "Add slots",
                passed: offeringSlots.length > 0,
                to: "/vendor/services",
              },
              {
                label: "Get 5 reviews",
                passed: reviewsSeed.length >= 5,
                to: "/vendor/reviews",
              },
              {
                label: "Submit KYC",
                passed: vendorProfile.kycStatus === "VERIFIED",
                to: "/vendor/kyc",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "grid h-6 w-6 place-items-center rounded-full text-white",
                      item.passed ? "bg-emerald-500" : "bg-slate-300"
                    )}
                  >
                    {item.passed ? (
                      <HiOutlineCheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-bold text-slate-700">!</span>
                    )}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                </div>
                <a
                  href={item.to}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-500"
                >
                  Fix
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const skeletonStatCard = (key: string | number) => (
    <div
      key={key}
      className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  );

  const skeletonHeader = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-32 rounded-full" />
          <Skeleton className="h-8 w-40 rounded-full" />
        </div>
      </div>
      <div className="flex items-center gap-4 border-b border-slate-200">
        {tabs.map((tab) => (
          <Skeleton key={tab.key} className="h-9 w-20 rounded-md" />
        ))}
      </div>
    </div>
  );

  const skeletonChart = (label: string) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="mt-4 h-56 rounded-xl" />
      <div className="mt-3 flex items-center gap-3">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-3 w-14 rounded-full" />
      </div>
    </div>
  );

  const skeletonGallery = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-14 rounded-full" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-44" />
          </div>
        ))}
      </div>
    </div>
  );

  const skeletonTable = (cols = 4, rows = 4) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="space-y-3">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((_, idx) => (
            <Skeleton key={idx} className="h-3 w-full rounded-sm" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: cols }).map((_, cIdx) => (
              <Skeleton key={cIdx} className="h-3 w-full rounded-sm" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkeletonTab = () => {
    if (activeTab === "profile") {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-3 w-64" />
                <div className="flex flex-wrap gap-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              <div className="w-full max-w-xs space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => skeletonStatCard(idx))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {skeletonChart("Lifecycle")}
            {skeletonChart("Identity")}
            {skeletonChart("Compliance")}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-10 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {Array.from({ length: 7 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-3 w-10" />
                </div>
              ))}
            </div>
          </div>

          {skeletonGallery()}
        </div>
      );
    }

    if (activeTab === "overview") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => skeletonStatCard(idx))}
          </div>
          {skeletonChart("Interactions overview")}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {skeletonTable(4, 4)}
            {skeletonTable(4, 4)}
          </div>
          {skeletonTable(4, 5)}
        </div>
      );
    }

    if (activeTab === "leads") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, idx) => skeletonStatCard(idx))}
          </div>
          {skeletonChart("Leads vs converted")}
          {skeletonTable(4, 6)}
        </div>
      );
    }

    if (activeTab === "orders") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {Array.from({ length: 5 }).map((_, idx) => skeletonStatCard(idx))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {skeletonChart("Revenue trend")}
            {skeletonChart("Payout split")}
          </div>
          {skeletonTable(5, 6)}
        </div>
      );
    }

    if (activeTab === "bookings") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, idx) => skeletonStatCard(idx))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {skeletonChart("Bookings trend")}
            {skeletonChart("Top services")}
          </div>
          {skeletonTable(4, 6)}
        </div>
      );
    }

    if (activeTab === "reviews") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, idx) => skeletonStatCard(idx))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {skeletonChart("Rating distribution")}
            {skeletonChart("Reviews over time")}
          </div>
          {skeletonTable(4, 7)}
        </div>
      );
    }

    return null;
  };

  return (
    <DashboardContainer className="space-y-4 lg:space-y-5">
      {loading ? (
        skeletonHeader()
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">

          <div className="flex items-center gap-4 border-b border-slate-200">
            {tabs.map((tab) => (
              <TabButton
                key={tab.key}
                label={tab.label}
                active={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          renderSkeletonTab()
        ) : (
          <>
            {activeTab === "overview" && renderOverviewTab()}
            {activeTab === "leads" && renderLeadsTab()}
            {activeTab === "orders" && renderOrdersTab()}
            {activeTab === "bookings" && renderBookingsTab()}
            {activeTab === "reviews" && renderReviewsTab()}
            {activeTab === "profile" && renderProfileTab()}
          </>
        )}
      </div>
    </DashboardContainer>
  );
};

export default VendorAnalyticsDashboard;
