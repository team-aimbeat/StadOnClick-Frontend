import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { Eye, Phone, Mail, CalendarClock, Star } from "lucide-react";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineSparkles,
} from "react-icons/hi2";

import {
  ColumnConfig,
  DataTableSortStatus,
  FilterConfig,
  RowData,
} from "@/components/shared/DataTable";
import { ActionConfig } from "@/types/Table/action";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { ListingPage } from "@/components/shared/ListingPage";

// If you want live API data, uncomment these:
// import {
//   useListAllVendorsQuery,
// } from "@/modules/admin/vendors/api/adminVendor.api";

type VendorsPageProps = {
  defaultStatusFilter?: string;
  titleOverride?: string;
  breadcrumbOverride?: string;
};

export type VendorRow = RowData & {
  id: string; // vendorProfileId
  userId: string;

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
  totalRevenue: number; // number for UI, backend is Decimal
  ratingAvg: number;
  ratingCount: number;

  createdAt: string;
};

const money = new Intl.NumberFormat("en-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

const vendorsSeed: VendorRow[] = [
  {
    id: "vd_01",
    userId: "u_01",
    businessName: "Nordic Clean Co.",
    slug: "nordic-clean-co",
    status: "ACTIVE",
    kycStatus: "VERIFIED",
    city: "Stockholm",
    country: "SE",
    contactEmail: "support@nordicclean.se",
    contactPhone: "+46 70 123 45 67",
    payoutsEnabled: true,
    chargesEnabled: true,
    totalBookings: 214,
    totalRevenue: 188900,
    ratingAvg: 4.6,
    ratingCount: 129,
    createdAt: "2025-01-10T08:00:00Z",
  },
  {
    id: "vd_02",
    userId: "u_02",
    businessName: "Gothenburg Repairs",
    slug: "gothenburg-repairs",
    status: "PENDING_REVIEW",
    kycStatus: "PENDING",
    city: "Gothenburg",
    country: "SE",
    contactEmail: "owner@gorepairs.se",
    contactPhone: "+46 73 888 90 12",
    payoutsEnabled: false,
    chargesEnabled: false,
    totalBookings: 0,
    totalRevenue: 0,
    ratingAvg: 0,
    ratingCount: 0,
    createdAt: "2025-01-18T12:30:00Z",
  },
  {
    id: "vd_03",
    userId: "u_03",
    businessName: "Malmö Spa Studio",
    slug: "malmo-spa-studio",
    status: "SUSPENDED",
    kycStatus: "VERIFIED",
    city: "Malmö",
    country: "SE",
    contactEmail: "hello@malmospa.se",
    contactPhone: "+46 72 444 11 00",
    payoutsEnabled: true,
    chargesEnabled: true,
    totalBookings: 57,
    totalRevenue: 42200,
    ratingAvg: 4.2,
    ratingCount: 38,
    createdAt: "2024-12-12T10:00:00Z",
  },
  {
    id: "vd_04",
    userId: "u_04",
    businessName: "Uppsala Home Painting",
    slug: "uppsala-home-painting",
    status: "REJECTED",
    kycStatus: "REJECTED",
    city: "Uppsala",
    country: "SE",
    contactEmail: "admin@uppsalapaint.se",
    contactPhone: "+46 76 110 20 30",
    payoutsEnabled: false,
    chargesEnabled: false,
    totalBookings: 0,
    totalRevenue: 0,
    ratingAvg: 0,
    ratingCount: 0,
    createdAt: "2025-01-14T09:20:00Z",
  },
];

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

export default function VendorsPage({
  defaultStatusFilter,
  titleOverride,
  breadcrumbOverride,
}: VendorsPageProps = {}) {
  const dispatch = useAppDispatch();

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [dateRangeLabel, setDateRangeLabel] = useState<string>("");

  const [vendorRows, setVendorRows] = useState<VendorRow[]>(vendorsSeed);

  const defaultFilters = useMemo(
    () => (defaultStatusFilter ? { status: defaultStatusFilter } : undefined),
    [defaultStatusFilter]
  );

  const listingTitle = titleOverride ?? "Vendors";
  const breadcrumb = breadcrumbOverride ?? "Admin / Vendors";

  useEffect(() => {
    dispatch(setPageTitle(listingTitle));
  }, [dispatch, listingTitle]);

  /**
   * If you want live API data, do this:
   *
   * const { data, isLoading } = useListAllVendorsQuery();
   * useEffect(() => {
   *   if (data?.data?.length) {
   *     setVendorRows(data.data.map(mapApiVendorToRow));
   *   }
   * }, [data]);
   */

  const totals = useMemo(() => {
    const active = vendorRows.filter((v) => v.status === "ACTIVE").length;
    const pending = vendorRows.filter((v) => v.status === "PENDING_REVIEW").length;
    const suspended = vendorRows.filter((v) => v.status === "SUSPENDED").length;
    const rejected = vendorRows.filter((v) => v.status === "REJECTED").length;

    const grossRevenue = vendorRows.reduce((sum, v) => sum + (v.totalRevenue ?? 0), 0);

    return { active, pending, suspended, rejected, grossRevenue };
  }, [vendorRows]);

  const columns = useMemo<ColumnConfig[]>(() => [
  {
    key: "businessName",
    title: "Vendor",
    sortable: true,
    render: (value: any, row: RowData) => {
      const r = row as VendorRow;

      return (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">
            {String(value ?? r.businessName ?? "—")}
          </span>
          <span className="text-xs font-medium text-slate-500">
            {(r.city ?? "Unknown city") + " • " + (r.slug ?? "—")}
          </span>
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
    key: "totalBookings",
    title: "Bookings",
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
          {r.ratingCount > 0 ? r.ratingAvg.toFixed(1) : "—"}
          <span className="text-xs font-medium text-slate-500">
            ({r.ratingCount})
          </span>
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
          : "—"}
      </div>
    ),
  },
  {
    key: "actions",
    title: "Actions",
    render: (_: any, row: RowData) => {
      const r = row as VendorRow;

      return (
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
          <NavLink
            to={`/admin/vendors/${r.id}`}
            className="text-blue-600 hover:text-blue-500"
          >
            Details
          </NavLink>

          <NavLink
            to={`/admin/vendors/${r.id}/applications`}
            className="text-slate-700 hover:text-slate-900"
          >
            Applications
          </NavLink>
        </div>
      );
    },
  },
], []);


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
    []
  );

  const sortOptions = useMemo(
    () => [
      { key: "createdAt", label: "Created (Newest first desc)" },
      { key: "totalRevenue", label: "Revenue (High-Low desc)" },
      { key: "totalBookings", label: "Bookings (High-Low desc)" },
      { key: "ratingAvg", label: "Rating (High-Low desc)" },
      { key: "businessName", label: "Business name (A-Z)" },
    ],
    []
  );

  const actions = useMemo<ActionConfig<VendorRow>[]>(
    () => [
      {
        title: "View",
        icon: Eye,
        onClick: (row) => console.log("View vendor", row.id),
      },
      {
        title: "Call",
        icon: Phone,
        onClick: (row) => console.log("Call vendor", row.contactPhone ?? "N/A"),
      },
      {
        title: "Email",
        icon: Mail,
        onClick: (row) => console.log("Email vendor", row.contactEmail ?? "N/A"),
      },
    ],
    []
  );

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
        left: dateRangeLabel
          ? `Range: ${dateRangeLabel}`
          : "Use the quick date selector in the table header.",
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
        actions,
        onRowSelect: (ids) => setSelectedRows(ids),
        onDateRangeSelect: (range) => setDateRangeLabel(range),
        className: "border border-slate-200",
      }}
    />
  );
}
