import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { Banknote, Ban, ClipboardList, Eye, PencilLine, Users2 } from "lucide-react";
import toast from "react-hot-toast";
import type { LucideIcon } from "lucide-react";

import type {
  ColumnConfig,
  DataTableSortStatus,
  FilterConfig,
  RowData,
} from "@/components/shared/DataTable";

import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { ListingPage } from "@/components/shared/ListingPage";

import {
  useListAllVendorsQuery,
} from "@/features/admin/vendors/api/vendorsApi";
import { useRequestVendorLoginLinkMutation } from "@/features/auth/api/authApi";

type VendorsPageProps = {
  defaultStatusFilter?: string;
  titleOverride?: string;
  breadcrumbOverride?: string;
};

export type VendorRow = RowData & {
  id: string;
  userId: string;
  loginEmail?: string;
  profileImageUrl?: string | null;
  businessName: string;
  slug: string;
  status: "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "REJECTED";
  kycStatus: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";
  city?: string;
  country?: string;
  contactEmail?: string;
  contactPhone?: string;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  totalBookings: number;
  visitorCount: number;
  totalRevenue: number;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
};

const money = new Intl.NumberFormat("en-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

const compactNumber = new Intl.NumberFormat("en-SE", {
  maximumFractionDigits: 0,
});

type VendorMetricTone = "green" | "amber" | "slate" | "blue";

type VendorMetricCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  tone: VendorMetricTone;
  badge?: string;
  badgePlacement?: "inline" | "top-right";
};

const vendorMetricStyles: Record<
  VendorMetricTone,
  {
    card: string;
    icon: string;
    badge: string;
  }
> = {
  green: {
    card: "border-slate-100 bg-white",
    icon: "bg-[#eef3ff] text-[#3554e0]",
    badge: "bg-emerald-50 text-emerald-600",
  },
  amber: {
    card: "border-slate-100 bg-white",
    icon: "bg-[#fff3f1] text-[#e25353]",
    badge: "bg-[#f7e0de] text-[#d84c48]",
  },
  slate: {
    card: "border-slate-100 bg-white",
    icon: "bg-slate-100 text-slate-500",
    badge: "bg-slate-100 text-slate-500",
  },
  blue: {
    card: "border-slate-100 bg-white",
    icon: "bg-[#eef0ff] text-[#5a57e8]",
    badge: "bg-slate-100 text-slate-500",
  },
};

const VendorMetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  tone,
  badge,
  badgePlacement = "top-right",
}: VendorMetricCardProps) => {
  const styles = vendorMetricStyles[tone];
  const displayValue = typeof value === "number" ? compactNumber.format(value) : value;

  return (
    <div className="min-h-[176px] rounded-[24px] border border-slate-100 bg-white p-5 ">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${styles.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
        {badge && badgePlacement === "top-right" ? (
          <span className={`inline-flex min-h-8 items-center rounded-md px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${styles.badge}`}>
            {badge}
          </span>
        ) : null}
      </div>

      {badge && badgePlacement === "inline" ? (
        <div className="mt-1">
          <span className={`inline-flex min-h-8 items-center rounded-md px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${styles.badge}`}>
            {badge}
          </span>
        </div>
      ) : null}

      <div className="mt-5 space-y-2">
        <p className="text-[15px] font-semibold tracking-[-0.02em] text-slate-600">{title}</p>
        <p className="text-[34px] font-semibold leading-none tracking-[-0.07em] text-slate-950">
          {displayValue}
        </p>
        <p className="text-xs font-medium text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
};

const vendorStatusTone: Record<
  VendorRow["status"],
  { bg: string; text: string; ring: string; label: string }
> = {
  PENDING_REVIEW: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
    label: "Pending review",
  },
  ACTIVE: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    label: "Active",
  },
  SUSPENDED: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    ring: "ring-slate-200",
    label: "Suspended",
  },
  REJECTED: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-200",
    label: "Rejected",
  },
};

const kycTone: Record<
  VendorRow["kycStatus"],
  { bg: string; text: string; ring: string; label: string }
> = {
  NOT_SUBMITTED: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    ring: "ring-slate-200",
    label: "Not submitted",
  },
  PENDING: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
    label: "Pending",
  },
  VERIFIED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    label: "Verified",
  },
  REJECTED: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-200",
    label: "Rejected",
  },
};

function toNumberSafe(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export default function VendorsPage({
  defaultStatusFilter,
  titleOverride,
  breadcrumbOverride,
}: VendorsPageProps = {}) {
  const dispatch = useAppDispatch();

  const listingTitle = titleOverride ?? "Vendors";
  const breadcrumb = breadcrumbOverride ?? "Admin / Vendors";

  useEffect(() => {
    dispatch(setPageTitle(listingTitle));
  }, [dispatch, listingTitle]);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [dateRangeLabel, setDateRangeLabel] = useState<string>("");
  const [requestingLinkVendorId, setRequestingLinkVendorId] = useState<string | null>(null);
  const [requestVendorLoginLink] = useRequestVendorLoginLinkMutation();

  const defaultFilters = useMemo(
    () => (defaultStatusFilter ? { status: defaultStatusFilter } : undefined),
    [defaultStatusFilter],
  );

  const { data, isLoading, isFetching, isError } = useListAllVendorsQuery({
    page: 1,
    limit: 200,
    status: (() => {
      const normalized = defaultStatusFilter?.toUpperCase();
      return normalized &&
        ["PENDING_REVIEW", "ACTIVE", "SUSPENDED", "REJECTED"].includes(normalized)
        ? (normalized as VendorRow["status"])
        : undefined;
    })(),
  });

  const vendorRows: VendorRow[] = useMemo(() => {
    const apiRows = data?.data ?? [];
    if (!apiRows.length) return [];

    return apiRows.map((v: any) => {
      return {
        id: String(v.id),
        userId: String(v.userId),
        loginEmail: v.user?.email ?? v.contactEmail ?? undefined,
        profileImageUrl: v.user?.profileImageUrl ?? null,
        businessName: String(v.businessName ?? "-"),
        slug: String(v.slug ?? "-"),
        status: (v.status ?? "PENDING_REVIEW") as VendorRow["status"],
        kycStatus: (v.kycStatus ?? "NOT_SUBMITTED") as VendorRow["kycStatus"],
        city: v.city?.name ?? undefined,
        country: v.country ?? "SE",
        contactEmail: v.contactEmail ?? undefined,
        contactPhone: v.contactPhone ?? undefined,
        payoutsEnabled: Boolean(v.payoutsEnabled),
        chargesEnabled: Boolean(v.chargesEnabled),
        totalBookings: Number(v.totalBookings ?? 0),
        visitorCount: Number(v.visitorCount ?? 0),
        totalRevenue: toNumberSafe(v.totalRevenue),
        ratingAvg: Number(v.ratingAvg ?? 0),
        ratingCount: Number(v.ratingCount ?? 0),
        createdAt: String(v.createdAt ?? new Date().toISOString()),
      } satisfies VendorRow;
    });
  }, [data]);

  const totals = useMemo(() => {
    const active = vendorRows.filter((v) => v.status === "ACTIVE").length;
    const pending = vendorRows.filter((v) => v.status === "PENDING_REVIEW").length;
    const suspended = vendorRows.filter((v) => v.status === "SUSPENDED").length;
    const rejected = vendorRows.filter((v) => v.status === "REJECTED").length;

    const grossRevenue = vendorRows.reduce((sum, v) => sum + (v.totalRevenue ?? 0), 0);

    return { active, pending, suspended, rejected, grossRevenue };
  }, [vendorRows]);

  const handleOpenVendorDashboard = useCallback(
    async (vendorId: string, email?: string) => {
      if (!email) {
        toast.error("Vendor email is missing");
        return;
      }

      try {
        setRequestingLinkVendorId(vendorId);
        const response = await requestVendorLoginLink({ email }).unwrap();
        window.location.assign(response.loginUrl);
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to create secure login link");
      } finally {
        setRequestingLinkVendorId(null);
      }
    },
    [requestVendorLoginLink],
  );

  const columns = useMemo<ColumnConfig[]>(
    () => [
      {
        key: "businessName",
        title: "Vendor",
        sortable: true,
        render: (value: any, row: RowData) => {
          const r = row as VendorRow;
          const initials = String(value ?? r.businessName ?? "V")
            .trim()
            .slice(0, 1)
            .toUpperCase();

          return (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700">
                {r.profileImageUrl ? (
                  <img
                    src={r.profileImageUrl}
                    alt={String(value ?? r.businessName ?? "Vendor")}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-semibold text-slate-900">
                  {String(value ?? r.businessName ?? "-")}
                </span>
                <span className="truncate text-xs font-medium text-slate-500">
                  {(r.city ?? "Unknown city") + " | " + (r.slug ?? "-")}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: "status",
        title: "Status",
        sortable: true,
        render: (_: any, row: RowData) => {
          const r = row as VendorRow;
          const tone = vendorStatusTone[r.status];

          return (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {tone.label}
            </span>
          );
        },
      },
      {
        key: "kycStatus",
        title: "KYC",
        sortable: true,
        render: (_: any, row: RowData) => {
          const r = row as VendorRow;
          const tone = kycTone[r.kycStatus];

          return (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {tone.label}
            </span>
          );
        },
      },
      {
        key: "payoutsEnabled",
        title: "Payouts",
        sortable: true,
        render: (value: any) => {
          const enabled = Boolean(value);

          return (
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ${
                enabled
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-slate-100 text-slate-700 ring-slate-200"
              }`}
            >
              {enabled ? "Enabled" : "Disabled"}
            </span>
          );
        },
      },
 
      {
        key: "visitorCount",
        title: "Visitors (7D)",
        sortable: true,
        render: (value: any) => {
          const visitors = Number(value ?? 0);

          return (
            <div className="space-y-1">
              <span className="block font-semibold text-slate-900">{compactNumber.format(visitors)}</span>
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[#3554e0]"
                  style={{ width: `${Math.min(100, Math.max(18, visitors / 45))}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        key: "totalRevenue",
        title: "Revenue",
        sortable: true,
        render: (value: any) => {
          const revenue = Number(value ?? 0);

          return (
            <div className="space-y-1">
              <span className="block font-semibold text-slate-900">{compactNumber.format(revenue)}</span>
              <span className="block text-xs font-medium text-slate-500">kr</span>
            </div>
          );
        },
      },
      {
        key: "actions",
        title: "Actions",
        render: (_: any, row: RowData) => {
          const r = row as VendorRow;
          const isRequestingLink = requestingLinkVendorId === r.id;

          return (
            <div className="flex items-center gap-2">
        

              {r.loginEmail ? (
                <button
                  type="button"
                  onClick={() => handleOpenVendorDashboard(r.id, r.loginEmail)}
                  disabled={isRequestingLink}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Open vendor dashboard"
                >
                  <PencilLine className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [handleOpenVendorDashboard, requestingLinkVendorId],
  );

  const filters = useMemo<FilterConfig[]>(
    () => [
      {
        key: "status",
        label: "Status",
        options: [
          { label: "All", value: "all" },
          { label: "Pending review", value: "pending_review" },
          { label: "Active", value: "active" },
          { label: "Suspended", value: "suspended" },
          { label: "Rejected", value: "rejected" },
        ],
      },
      {
        key: "kycStatus",
        label: "KYC",
        options: [
          { label: "All", value: "all" },
          { label: "Not submitted", value: "not_submitted" },
          { label: "Pending", value: "pending" },
          { label: "Verified", value: "verified" },
          { label: "Rejected", value: "rejected" },
        ],
      },
      {
        key: "payoutsEnabled",
        label: "Payouts",
        options: [
          { label: "All", value: "all" },
          { label: "Enabled", value: "enabled" },
          { label: "Disabled", value: "disabled" },
        ],
      },
    ],
    [],
  );

  const sortOptions = useMemo(
    () => [
      { key: "createdAt", label: "Created (Newest first desc)" },
      { key: "totalRevenue", label: "Revenue (High-Low desc)" },
      { key: "totalBookings", label: "Bookings (High-Low desc)" },
      { key: "ratingAvg", label: "Rating (High-Low desc)" },
      { key: "businessName", label: "Business name (A-Z)" },
    ],
    [],
  );

  const summaryLeft = useMemo(() => {
    if (isLoading) return "Loading vendors...";
    if (isError) return "Failed to load vendors. Please refresh.";
    if (isFetching) return "Refreshing vendors...";
    if (dateRangeLabel) return `Range: ${dateRangeLabel}`;
    return "Use the quick date selector in the table header.";
  }, [isLoading, isError, isFetching, dateRangeLabel]);

  const metricCards = useMemo(
    () => [
      {
        title: "Active Vendors",
        value: totals.active,
        subtitle: "Live on marketplace",
        icon: Users2,
        tone: "green" as const,
        badge: "+12%",
        badgePlacement: "top-right" as const,
      },
      {
        title: "Pending Approval",
        value: totals.pending,
        subtitle: "Awaiting review",
        icon: ClipboardList,
        tone: "amber" as const,
        badge: "Attention Required",
        badgePlacement: "inline" as const,
      },
      {
        title: "Suspended",
        value: totals.suspended,
        subtitle: "Requires attention",
        icon: Ban,
        tone: "slate" as const,
      },
      {
        title: "Total Revenue",
        value: `${compactNumber.format(Math.round(totals.grossRevenue))} kr`,
        subtitle: "Gross vendor revenue",
        icon: Banknote,
        tone: "blue" as const,
        badge: "MTD",
        badgePlacement: "top-right" as const,
      },
    ],
    [totals.active, totals.grossRevenue, totals.pending, totals.suspended],
  );

  return (
    <ListingPage
      title={listingTitle}
      breadCrumbTitle={breadcrumb}
      description="Review vendors, track KYC status, and monitor revenue performance."
      stats={[]}
      headerSlot={
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <VendorMetricCard key={card.title} {...card} />
          ))}
        </div>
      }
      summarySlot={
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <span className="font-semibold text-slate-700">{summaryLeft}</span>
          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            Selected vendors: {selectedRows.length}
          </span>
        </div>
      }
      tableProps={{
        title: "Vendors",
        breadCrumbTitle: "Manage and review your partner ecosystem.",
        data: vendorRows,
        columns,
        filters,
        sortOptions,
        searchable: true,
        variant: "vendor",
        showSerialNumber: false,
        selectable: false,
        showDefaultDateControl: false,
        showFilterButton: false,
        initialHiddenColumns: [],
        defaultActiveFilters: defaultFilters,
        rowsPerPageOptions: [5, 8, 15],
        defaultRowsPerPage: 8,
        defaultSortColumn: "createdAt",
        sortStatus,
        onSort: setSortStatus,
        onRowSelect: (ids) => setSelectedRows(ids),
        onDateRangeSelect: (range) => setDateRangeLabel(range),
        className: "border border-slate-200 rounded-[24px] shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]",
      }}
    />
  );
}
