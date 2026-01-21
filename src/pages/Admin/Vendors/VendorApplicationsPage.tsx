import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { Eye, Phone, Mail, CalendarClock } from "lucide-react";
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
import {
  useApproveVendorApplicationMutation,
  useListVendorApplicationsQuery,
  useRejectVendorApplicationMutation,
} from "@/features/admin/vendors/api/vendorsApi";

type VendorApplicationsPageProps = {
  defaultStatusFilter?: string;
  titleOverride?: string;
  breadcrumbOverride?: string;
};

export type VendorApplicationRow = RowData & {
  id: string;

  vendorId: string;
  businessName: string;
  slug: string;

  vendorStatus: "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "REJECTED";
  kycStatus: "NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";

  city?: string;

  contactEmail?: string;
  contactPhone?: string;

  status: "PENDING" | "APPROVED" | "REJECTED" | "MORE_INFO_REQUIRED";

  submittedAt: string;
  reviewedAt?: string | null;

  adminComment?: string | null;
  reviewedBy?: string | null;
};

const applicationSeed: VendorApplicationRow[] = [
  {
    id: "app_01",
    vendorId: "vd_02",
    businessName: "Gothenburg Repairs",
    slug: "gothenburg-repairs",
    vendorStatus: "PENDING_REVIEW",
    kycStatus: "PENDING",
    city: "Gothenburg",
    contactEmail: "owner@gorepairs.se",
    contactPhone: "+46 73 888 90 12",
    status: "PENDING",
    submittedAt: "2025-01-18T12:30:00Z",
    reviewedAt: null,
    adminComment: null,
    reviewedBy: null,
  },
  {
    id: "app_02",
    vendorId: "vd_04",
    businessName: "Uppsala Home Painting",
    slug: "uppsala-home-painting",
    vendorStatus: "REJECTED",
    kycStatus: "REJECTED",
    city: "Uppsala",
    contactEmail: "admin@uppsalapaint.se",
    contactPhone: "+46 76 110 20 30",
    status: "REJECTED",
    submittedAt: "2025-01-14T09:20:00Z",
    reviewedAt: "2025-01-15T10:00:00Z",
    adminComment: "Business license was missing and VAT number invalid.",
    reviewedBy: "admin_user_01",
  },
  {
    id: "app_03",
    vendorId: "vd_01",
    businessName: "Nordic Clean Co.",
    slug: "nordic-clean-co",
    vendorStatus: "ACTIVE",
    kycStatus: "VERIFIED",
    city: "Stockholm",
    contactEmail: "support@nordicclean.se",
    contactPhone: "+46 70 123 45 67",
    status: "APPROVED",
    submittedAt: "2025-01-10T08:00:00Z",
    reviewedAt: "2025-01-11T09:00:00Z",
    adminComment: "Looks good. Approved.",
    reviewedBy: "admin_user_02",
  },
];

const appStatusTone: Record<
  VendorApplicationRow["status"],
  { bg: string; text: string; ring: string; label: string }
> = {
  PENDING: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
    label: "Pending",
  },
  APPROVED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    label: "Approved",
  },
  REJECTED: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-200",
    label: "Rejected",
  },
  MORE_INFO_REQUIRED: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-200",
    label: "More info required",
  },
};

export default function VendorApplicationsPage({
  defaultStatusFilter,
  titleOverride,
  breadcrumbOverride,
}: VendorApplicationsPageProps = {}) {
  const dispatch = useAppDispatch();

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "submittedAt",
    direction: "desc",
  });

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [dateRangeLabel, setDateRangeLabel] = useState<string>("");

  // Live API
  const { data, isLoading } = useListVendorApplicationsQuery();

  const [approveVendor, { isLoading: isApproving }] =
    useApproveVendorApplicationMutation();
  const [rejectVendor, { isLoading: isRejecting }] =
    useRejectVendorApplicationMutation();

  // Use API data if available, else fallback seed
  const applicationRows: VendorApplicationRow[] = useMemo(() => {
    // If your backend response shape differs, adjust mapping here
    const apiRows = data?.data;
    if (!apiRows?.length) return applicationSeed;

    return apiRows.map((app: any) => {
      const vendor = app.vendor ?? {};
      return {
        id: app.id,
        vendorId: vendor.id ?? app.vendorId,
        businessName: vendor.businessName ?? "—",
        slug: vendor.slug ?? "—",
        vendorStatus: vendor.status ?? "PENDING_REVIEW",
        kycStatus: vendor.kycStatus ?? "NOT_SUBMITTED",
        city: vendor.city?.name ?? undefined,
        contactEmail: vendor.contactEmail ?? undefined,
        contactPhone: vendor.contactPhone ?? undefined,
        status: app.status,
        submittedAt: app.submittedAt,
        reviewedAt: app.reviewedAt ?? null,
        adminComment: app.adminComment ?? null,
        reviewedBy: app.reviewedBy ?? null,
      } as VendorApplicationRow;
    });
  }, [data]);

  const defaultFilters = useMemo(
    () => (defaultStatusFilter ? { status: defaultStatusFilter } : undefined),
    [defaultStatusFilter],
  );

  const listingTitle = titleOverride ?? "Vendor Applications";
  const breadcrumb = breadcrumbOverride ?? "Admin / Vendor Applications";

  useEffect(() => {
    dispatch(setPageTitle(listingTitle));
  }, [dispatch, listingTitle]);

  const totals = useMemo(() => {
    const pending = applicationRows.filter(
      (a) => a.status === "PENDING",
    ).length;
    const approved = applicationRows.filter(
      (a) => a.status === "APPROVED",
    ).length;
    const rejected = applicationRows.filter(
      (a) => a.status === "REJECTED",
    ).length;
    const moreInfo = applicationRows.filter(
      (a) => a.status === "MORE_INFO_REQUIRED",
    ).length;

    return { pending, approved, rejected, moreInfo };
  }, [applicationRows]);

  const handleApprove = async (id: string) => {
    try {
      await approveVendor({ id }).unwrap();
    } catch (err) {
      console.error("Approve failed", err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      // Your backend requires body { reason }
      await rejectVendor({
        id,
        body: { reason: "Not enough documentation." },
      }).unwrap();
    } catch (err) {
      console.error("Reject failed", err);
    }
  };

  const columns = useMemo<ColumnConfig[]>(
    () => [
      {
        key: "businessName",
        title: "Vendor",
        sortable: true,
        render: (value: any, row: RowData) => {
          const r = row as VendorApplicationRow;

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
        title: "Application",
        sortable: true,
        render: (_: any, row: RowData) => {
          const r = row as VendorApplicationRow;
          const tone = appStatusTone[r.status];

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
        key: "submittedAt",
        title: "Submitted",
        sortable: true,
        render: (value: any) => (
          <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
            <CalendarClock className="h-4 w-4 text-slate-500" />
            {value
              ? new Date(String(value)).toLocaleString("en-SE", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </div>
        ),
      },
      {
        key: "reviewedAt",
        title: "Reviewed",
        sortable: true,
        render: (value: any) => (
          <span className="text-sm font-medium text-slate-700">
            {value
              ? new Date(String(value)).toLocaleString("en-SE", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </span>
        ),
      },
      {
        key: "adminComment",
        title: "Admin Note",
        sortable: false,
        render: (value: any) => (
          <span className="text-sm text-slate-700">
            {value ? String(value) : "—"}
          </span>
        ),
      },
      {
        key: "actions",
        title: "Actions",
        render: (_: any, row: RowData) => {
          const r = row as VendorApplicationRow;

          const disabledApprove = r.status !== "PENDING" || isApproving;
          const disabledReject = r.status !== "PENDING" || isRejecting;

          return (
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => handleApprove(r.id)}
                disabled={disabledApprove}
                className="rounded-full border border-slate-200 px-2 py-1 text-slate-700 disabled:opacity-50"
              >
                Approve
              </button>

              <button
                type="button"
                onClick={() => handleReject(r.id)}
                disabled={disabledReject}
                className="rounded-full border border-slate-200 px-2 py-1 text-slate-700 disabled:opacity-50"
              >
                Reject
              </button>

              <NavLink
                to={`/admin/vendors/${r.vendorId}`}
                className="text-blue-600 hover:text-blue-500"
              >
                Vendor
              </NavLink>

              <NavLink
                to={`/admin/vendor-applications/${r.id}`}
                className="text-slate-700 hover:text-slate-900"
              >
                Details
              </NavLink>
            </div>
          );
        },
      },
    ],
    [isApproving, isRejecting],
  );

  const filters = useMemo<FilterConfig[]>(
    () => [
      {
        key: "status",
        label: "Application Status",
        options: [
          { label: "All", value: "all" },
          { label: "Pending", value: "pending" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
          { label: "More Info Required", value: "more_info_required" },
        ],
      },
    ],
    [],
  );

  const sortOptions = useMemo(
    () => [
      { key: "submittedAt", label: "Submitted (Newest first desc)" },
      { key: "reviewedAt", label: "Reviewed (Newest first desc)" },
      { key: "businessName", label: "Business name (A-Z)" },
    ],
    [],
  );

  const actions = useMemo<ActionConfig<VendorApplicationRow>[]>(
    () => [
      {
        title: "View",
        icon: Eye,
        onClick: (row) => console.log("View application", row.id),
      },
      {
        title: "Call",
        icon: Phone,
        onClick: (row) => console.log("Call vendor", row.contactPhone ?? "N/A"),
      },
      {
        title: "Email",
        icon: Mail,
        onClick: (row) =>
          console.log("Email vendor", row.contactEmail ?? "N/A"),
      },
    ],
    [],
  );

  return (
    <ListingPage
      title={listingTitle}
      breadCrumbTitle={breadcrumb}
      description="Approve strong vendors fast, reject low-quality submissions, and request more info when needed."
      stats={[
        {
          title: "Pending",
          value: totals.pending,
          subtitle: "Awaiting review",
          icon: HiOutlineClock,
          accentColor: "yellow",
        },
        {
          title: "Approved",
          value: totals.approved,
          subtitle: "Accepted vendors",
          icon: HiOutlineCheckCircle,
          accentColor: "green",
        },
        {
          title: "Rejected",
          value: totals.rejected,
          subtitle: "Not accepted",
          icon: HiOutlineExclamationTriangle,
          accentColor: "red",
        },
        {
          title: "More Info",
          value: totals.moreInfo,
          subtitle: "Needs follow-up",
          icon: HiOutlineSparkles,
          accentColor: "blue",
        },
      ]}
      summary={{
        left: isLoading
          ? "Loading applications..."
          : dateRangeLabel
            ? `Range: ${dateRangeLabel}`
            : "Use the quick date selector in the table header.",
        right: `Selected applications: ${selectedRows.length}`,
      }}
      tableProps={{
        title: "Vendor Applications",
        breadCrumbTitle: "Admin / Vendor Applications Table",
        data: applicationRows,
        columns,
        filters,
        sortOptions,
        searchable: true,
        showSerialNumber: true,
        initialHiddenColumns: [],
        defaultActiveFilters: defaultFilters,
        rowsPerPageOptions: [5, 8, 15],
        defaultRowsPerPage: 8,
        defaultSortColumn: "submittedAt",
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
