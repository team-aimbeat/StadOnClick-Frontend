import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { CalendarClock, Star } from "lucide-react";
import toast from "react-hot-toast";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineSparkles,
} from "react-icons/hi2";

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
  useUpdateVendorStatusMutation,
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
  const [updatingVendorId, setUpdatingVendorId] = useState<string | null>(null);
  const [requestingLinkVendorId, setRequestingLinkVendorId] = useState<string | null>(null);
  const [updateVendorStatus] = useUpdateVendorStatusMutation();
  const [requestVendorLoginLink] = useRequestVendorLoginLinkMutation();

  const defaultFilters = useMemo(
    () => (defaultStatusFilter ? { status: defaultStatusFilter } : undefined),
    [defaultStatusFilter],
  );

  const { data, isLoading, isFetching, isError } = useListAllVendorsQuery({
    page: 1,
    limit: 200,
    status:
      defaultStatusFilter &&
      ["PENDING_REVIEW", "ACTIVE", "SUSPENDED", "REJECTED"].includes(defaultStatusFilter.toUpperCase())
        ? defaultStatusFilter.toUpperCase()
        : undefined,
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

  const handleVendorStatusChange = useCallback(
    async (vendorId: string, status: VendorRow["status"]) => {
      try {
        setUpdatingVendorId(vendorId);
        await updateVendorStatus({ id: vendorId, status }).unwrap();
        toast.success(`Vendor status updated to ${status.replace("_", " ")}`);
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to update vendor status");
      } finally {
        setUpdatingVendorId(null);
      }
    },
    [updateVendorStatus],
  );

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
        title: "Visitors",
        sortable: true,
        render: (value: any) => (
          <span className="font-semibold text-slate-900">{Number(value ?? 0)}</span>
        ),
      },
      {
        key: "totalRevenue",
        title: "Revenue",
        sortable: true,
        render: (value: any) => (
          <span className="font-semibold text-slate-900">
            {money.format(Number(value ?? 0))}
          </span>
        ),
      },
      {
        key: "ratingAvg",
        title: "Rating",
        sortable: true,
        render: (_: any, row: RowData) => {
          const r = row as VendorRow;

          return (
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-800">
              <Star className="h-4 w-4 text-slate-500" />
              {r.ratingCount > 0 ? r.ratingAvg.toFixed(1) : "-"}
              <span className="text-xs font-medium text-slate-500">({r.ratingCount})</span>
            </div>
          );
        },
      },
      {
        key: "createdAt",
        title: "Created",
        sortable: true,
        render: (value: any) => (
          <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
            <CalendarClock className="h-4 w-4 text-slate-500" />
            {value
              ? new Date(String(value)).toLocaleString("en-SE", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "-"}
          </div>
        ),
      },
      {
        key: "actions",
        title: "Actions",
        render: (_: any, row: RowData) => {
          const r = row as VendorRow;
          const isUpdating = updatingVendorId === r.id;
          const isRequestingLink = requestingLinkVendorId === r.id;

          return (
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
              <select
                value={r.status}
                disabled={isUpdating}
                onChange={(event) =>
                  handleVendorStatusChange(
                    r.id,
                    event.target.value as VendorRow["status"],
                  )
                }
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700"
              >
                <option value="PENDING_REVIEW">PENDING_REVIEW</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="REJECTED">REJECTED</option>
              </select>

              <NavLink
                to={`/admin/vendors/${r.id}/profile`}
                className="text-blue-600 hover:text-blue-500"
              >
                Profile
              </NavLink>

              {r.loginEmail ? (
                <button
                  type="button"
                  onClick={() => handleOpenVendorDashboard(r.id, r.loginEmail)}
                  disabled={isRequestingLink}
                  className="text-emerald-700 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRequestingLink ? "Opening..." : "Vendor Dashboard"}
                </button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [handleOpenVendorDashboard, handleVendorStatusChange, requestingLinkVendorId, updatingVendorId],
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

  return (
    <ListingPage
      title={listingTitle}
      breadCrumbTitle={breadcrumb}
      description="Review vendors, track KYC status, and monitor revenue performance."
      stats={[
        {
          title: "Active",
          value: totals.active,
          subtitle: "Live on marketplace",
          icon: HiOutlineCheckCircle,
          accentColor: "green",
        },
        {
          title: "Pending",
          value: totals.pending,
          subtitle: "Awaiting approval",
          icon: HiOutlineClock,
          accentColor: "yellow",
        },
        {
          title: "Suspended",
          value: totals.suspended,
          subtitle: "Requires attention",
          icon: HiOutlineExclamationTriangle,
          accentColor: "red",
        },
        {
          title: "Revenue",
          value: money.format(totals.grossRevenue),
          subtitle: "Gross vendor revenue",
          icon: HiOutlineSparkles,
          accentColor: "blue",
        },
      ]}
      summary={{
        left: summaryLeft,
        right: `Selected vendors: ${selectedRows.length}`,
      }}
      tableProps={{
        title: "Vendors",
        breadCrumbTitle: "Admin / Vendors Table",
        data: vendorRows,
        columns,
        filters,
        sortOptions,
        searchable: true,
        showSerialNumber: true,
        initialHiddenColumns: [],
        defaultActiveFilters: defaultFilters,
        rowsPerPageOptions: [5, 8, 15],
        defaultRowsPerPage: 8,
        defaultSortColumn: "createdAt",
        sortStatus,
        onSort: setSortStatus,
        onRowSelect: (ids) => setSelectedRows(ids),
        onDateRangeSelect: (range) => setDateRangeLabel(range),
        className: "border border-slate-200",
      }}
    />
  );
}
