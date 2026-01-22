import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { Eye, Phone, Mail, CalendarClock, RefreshCcw } from "lucide-react";
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
import type { ActionConfig } from "@/types/Table/action";

import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { ListingPage } from "@/components/shared/ListingPage";

import {
  useApproveVendorApplicationMutation,
  useListVendorApplicationsQuery,
  useRejectVendorApplicationMutation,
} from "@/features/admin/vendors/api/vendorsApi";

import type { VendorApplication } from "@/features/admin/vendors/types/vendor.types";

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

function toVendorApplicationRow(app: VendorApplication): VendorApplicationRow {
  const vendor = app.vendor;

  return {
    id: app.id,
    vendorId: vendor?.id ?? app.vendorId,
    businessName: vendor?.businessName ?? "—",
    slug: vendor?.slug ?? "—",
    vendorStatus: vendor?.status ?? "PENDING_REVIEW",
    kycStatus: vendor?.kycStatus ?? "NOT_SUBMITTED",
    city: vendor?.city?.name ?? undefined,
    contactEmail: vendor?.contactEmail ?? undefined,
    contactPhone: vendor?.contactPhone ?? undefined,
    status: app.status,
    submittedAt: app.submittedAt,
    reviewedAt: app.reviewedAt ?? null,
    adminComment: app.adminComment ?? null,
    reviewedBy: app.reviewedBy ?? null,
  };
}

export default function VendorApplicationsPage({
  defaultStatusFilter,
  titleOverride,
  breadcrumbOverride,
}: VendorApplicationsPageProps = {}) {
  const dispatch = useAppDispatch();

  const listingTitle = titleOverride ?? "Vendor Applications";
  const breadcrumb = breadcrumbOverride ?? "Admin / Vendor Applications";

  useEffect(() => {
    dispatch(setPageTitle(listingTitle));
  }, [dispatch, listingTitle]);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "submittedAt",
    direction: "desc",
  });

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [dateRangeLabel, setDateRangeLabel] = useState<string>("");

  const defaultFilters = useMemo(
    () => (defaultStatusFilter ? { status: defaultStatusFilter } : undefined),
    [defaultStatusFilter]
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useListVendorApplicationsQuery();

  const [approveVendor, { isLoading: isApproving }] =
    useApproveVendorApplicationMutation();

  const [rejectVendor, { isLoading: isRejecting }] =
    useRejectVendorApplicationMutation();

  const applicationRows = useMemo<VendorApplicationRow[]>(() => {
    return (data?.data ?? []).map(toVendorApplicationRow);
  }, [data]);

  const totals = useMemo(() => {
    const pending = applicationRows.filter((a) => a.status === "PENDING").length;
    const approved = applicationRows.filter((a) => a.status === "APPROVED").length;
    const rejected = applicationRows.filter((a) => a.status === "REJECTED").length;
    const moreInfo = applicationRows.filter((a) => a.status === "MORE_INFO_REQUIRED").length;

    return { pending, approved, rejected, moreInfo };
  }, [applicationRows]);

  const handleApprove = async (id: string) => {
    try {
      await approveVendor({ id }).unwrap();
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectVendor({
        id,
        body: { reason: "Not enough documentation." },
      }).unwrap();
    } catch (err) {
      console.error("Reject failed:", err);
    }
  };

  const columns = useMemo<ColumnConfig[]>(
    () => [
      {
        key: "businessName",
        title: "Vendor",
        sortable: true,
        render: (_value: any, row: RowData) => {
          const r = row as VendorApplicationRow;
          return (
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-slate-900">{r.businessName}</span>
              <span className="text-xs text-slate-500">
                {r.city ?? "Unknown city"} • {r.slug}
              </span>
            </div>
          );
        },
      },
      {
        key: "status",
        title: "Application Status",
        sortable: true,
        render: (_: any, row: RowData) => {
          const r = row as VendorApplicationRow;
          const tone = appStatusTone[r.status];

          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}
            >
              <span className="size-2 rounded-full bg-current" />
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
          <div className="flex items-center gap-1.5 text-sm text-slate-700">
            <CalendarClock className="h-4 w-4 text-slate-500" />
            {value
              ? new Date(String(value)).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
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
          <span className="text-sm text-slate-700">
            {value
              ? new Date(String(value)).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
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
          <span className="line-clamp-2 max-w-xs text-sm text-slate-600">
            {value ? String(value) : "—"}
          </span>
        ),
      },
    ],
    []
  );

  const filters = useMemo<FilterConfig[]>(
    () => [
      {
        key: "status",
        label: "Application Status",
        options: [
          { label: "All", value: "all" },
          { label: "Pending", value: "PENDING" },
          { label: "Approved", value: "APPROVED" },
          { label: "Rejected", value: "REJECTED" },
          { label: "More Info Required", value: "MORE_INFO_REQUIRED" },
        ],
      },
    ],
    []
  );

  const sortOptions = useMemo(
    () => [
      { key: "submittedAt", label: "Submitted Date (Newest first)" },
      { key: "reviewedAt", label: "Reviewed Date (Newest first)" },
      { key: "businessName", label: "Business Name (A-Z)" },
    ],
    []
  );

  const actions = useMemo<ActionConfig[]>(
    () => [
      {
        title: "View Details",
        icon: Eye,
        onClick: (row) => {
          // TODO: implement proper navigation or modal
          console.log("View application:", (row as VendorApplicationRow).id);
          // Example: navigate(`/admin/applications/${row.id}`);
        },
      },
      {
        title: "Approve",
        icon: HiOutlineCheckCircle,
        onClick: (row) => {
          const r = row as VendorApplicationRow;
          if (window.confirm(`Approve application from ${r.businessName}?`)) {
            handleApprove(r.id);
          }
        },
      },
      {
        title: "Reject",
        icon: HiOutlineExclamationTriangle,
        onClick: (row) => {
          const r = row as VendorApplicationRow;
          const reason = prompt(
            `Reject reason for ${r.businessName}:`,
            "Insufficient documentation / incomplete KYC"
          );
          if (reason) {
            rejectVendor({ id: r.id, body: { reason } }).unwrap();
          }
        },
      },
      {
        title: "Email Vendor",
        icon: Mail,
        onClick: (row) => {
          const r = row as VendorApplicationRow;
          if (r.contactEmail) {
            window.location.href = `mailto:${r.contactEmail}?subject=Regarding your vendor application on StadonClick`;
          } else {
            alert("No contact email available for this vendor");
          }
        },
      },
    ],
    [handleApprove, rejectVendor]
  );

  const summaryLeft = useMemo(() => {
    if (isLoading) return "Loading vendor applications...";
    if (isFetching) return "Refreshing data...";
    if (isError) return "Failed to load applications — please try again";
    if (dateRangeLabel) return `Filtered: ${dateRangeLabel}`;
    return "Quick date filter available in header";
  }, [isLoading, isFetching, isError, dateRangeLabel]);

  useEffect(() => {
    if (isError) {
      console.error("Vendor Applications Query Error:", error);
    }
  }, [isError, error]);

  return (
    <ListingPage
      title={listingTitle}
      breadCrumbTitle={breadcrumb}
      description="Review, approve, reject or request more information from vendor applications."
      
      // ──── Actions are now passed directly (assuming ListingPage supports it) ────
      actions={actions}
      
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
        left: summaryLeft,
        right: selectedRows.length > 0 
          ? `Selected: ${selectedRows.length} application${selectedRows.length !== 1 ? 's' : ''}`
          : undefined,
      }}
      headerSlot={
        isError ? (
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#4F7DFF]/40"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </button>
        ) : null
      }
      tableProps={{
        title: "Vendor Applications",
        data: applicationRows,
        columns,
        filters,
        sortOptions,
        searchable: true,
        showSerialNumber: true,
        selectable: true,
        initialHiddenColumns: ["adminComment"],
        defaultActiveFilters: defaultFilters,
        rowsPerPageOptions: [5, 8, 10, 15, 25],
        defaultRowsPerPage: 8,
        sortStatus,
        onSort: setSortStatus,
        onRowSelect: setSelectedRows,
        onDateRangeSelect: setDateRangeLabel,
        loading: isLoading || isFetching,
        error: isError ? "Failed to load vendor applications" : null,
        className: "border border-slate-200 rounded-xl shadow-sm",
      }}
    />
  );
}