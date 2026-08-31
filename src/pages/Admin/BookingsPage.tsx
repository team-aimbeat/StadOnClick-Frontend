import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { CalendarClock, Eye, Phone } from "lucide-react";
import toast from "react-hot-toast";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ListingPage } from "@/components/shared/ListingPage";
import PortalStatCard from "@/components/shared/PortalStatCard";
import type {
  ColumnConfig,
  DataTableSortStatus,
  FilterConfig,
  RowData,
} from "@/components/shared/DataTable";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import {
  useDecideBookingRefundMutation,
  useLazyListAdminBookingsQuery,
  useGetBookingLogsQuery,
} from "@/features/admin/bookings/api/adminBookingsApi";
import type {
  AdminBookingItem,
  AdminBookingStatus,
  AdminBookingLog,
} from "@/features/admin/bookings/types/adminBooking.types";
import type { ActionConfig } from "@/types/Table/action";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const STATUS_FILTER_OPTIONS: FilterConfig["options"] = [
  { label: "All bookings", value: "all" },
  { label: "Upcoming (Pending + Confirmed)", value: "upcoming" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refund requests", value: "refund_requested" },
  { label: "Refunded", value: "refunded" },
];

const STATUS_FILTER_MAP: Record<string, string> = {
  pending: "PENDING",
  confirmed: "CONFIRMED",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
  refund_requested: "REFUND_REQUESTED",
  refunded: "REFUNDED",
};

const STATUS_TONE: Record<
  AdminBookingStatus,
  { bg: string; text: string; ring: string; label: string }
> = {
  PENDING: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
    label: "Pending",
  },
  CONFIRMED: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-200",
    label: "Confirmed",
  },
  COMPLETED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    label: "Completed",
  },
  CANCELLED: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    ring: "ring-slate-200",
    label: "Cancelled",
  },
  REFUND_REQUESTED: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-200",
    label: "Refund request",
  },
  REFUNDED: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    ring: "ring-purple-200",
    label: "Refunded",
  },
};

const ACTOR_TONE: Record<
  AdminBookingLog["actorType"],
  { bg: string; text: string }
> = {
  SYSTEM: { bg: "bg-slate-100", text: "text-slate-700" },
  ADMIN: { bg: "bg-violet-50", text: "text-violet-700" },
  SUPPORT: { bg: "bg-cyan-50", text: "text-cyan-700" },
  MODERATOR: { bg: "bg-amber-50", text: "text-amber-700" },
  VENDOR: { bg: "bg-emerald-50", text: "text-emerald-700" },
  CUSTOMER: { bg: "bg-blue-50", text: "text-blue-700" },
};

const parseCalendarRange = (
  value: string
): { from?: string; to?: string } => {
  const [fromText, toText] = value.split(" - ").map((segment) => segment.trim());
  const parsedFrom = dayjs(fromText, "YYYY/MM/DD");
  const parsedTo = dayjs(toText, "YYYY/MM/DD");

  return {
    from: parsedFrom.isValid() ? parsedFrom.format("YYYY-MM-DD") : undefined,
    to: parsedTo.isValid() ? parsedTo.format("YYYY-MM-DD") : undefined,
  };
};

type AdminBookingRow = RowData & {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerProfileImageUrl?: string | null;
  customerProfileImageKey?: string | null;
  vendorName: string;
  vendorStatus: string;
  serviceTitle: string;
  serviceCategory?: string;
  slotStart?: string;
  slotEnd?: string | null;
  status: AdminBookingStatus;
  amount: number;
  createdAt: string;
  year: string;
  reviewCount: number;
};

type AdminBookingsPageProps = {
  defaultStatusFilter?: string;
  titleOverride?: string;
  breadcrumbOverride?: string;
};

type BookingActionModalType = "view" | "email" | "approve" | "reject" | null;

const buildStatusParam = (filter?: string) => {
  if (!filter || filter === "all") {
    return undefined;
  }

  if (filter === "upcoming") {
    return "CONFIRMED,PENDING";
  }

  return STATUS_FILTER_MAP[filter] ?? filter.toUpperCase();
};

const defaultSort: DataTableSortStatus = {
  columnAccessor: "createdAt",
  direction: "desc",
};

export default function AdminBookingsPage({
  defaultStatusFilter = "all",
  titleOverride,
  breadcrumbOverride,
}: AdminBookingsPageProps) {
  const dispatch = useAppDispatch();
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>(defaultSort);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [statusFilter, setStatusFilter] = useState(defaultStatusFilter);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRangeLabel, setDateRangeLabel] = useState("");
  const [dateRangeQuery, setDateRangeQuery] = useState<{ from?: string; to?: string }>({});
  const [priceInputs, setPriceInputs] = useState({ min: "", max: "" });
  const [activePriceFilter, setActivePriceFilter] = useState<{ min?: string; max?: string }>({});
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [activeBooking, setActiveBooking] = useState<AdminBookingRow | null>(null);
  const [actionModal, setActionModal] = useState<BookingActionModalType>(null);
  const [refundDecisionReason, setRefundDecisionReason] = useState("");
  const hasPriceFilter = Boolean(activePriceFilter.min || activePriceFilter.max);

  const [fetchBookings, { data, isFetching, isError }] =
    useLazyListAdminBookingsQuery();
  const [decideBookingRefund, { isLoading: isUpdatingRefund }] =
    useDecideBookingRefundMutation();
  const navigate = useNavigate();
  const bookingLogBookingId =
    actionModal === "view" && activeBooking?.id ? activeBooking.id : skipToken;
  const {
    data: bookingLogs = [],
    isFetching: isFetchingLogs,
    isError: isLogsError,
    error: logsError,
  } = useGetBookingLogsQuery(bookingLogBookingId);
  const logsStatusCode =
    logsError && typeof logsError === "object" && "status" in logsError
      ? (logsError as { status?: number }).status
      : undefined;
  const showLogsError = isLogsError && logsStatusCode !== 404;

  const listingTitle = titleOverride ?? "Admin bookings";
  const breadcrumbTitle = breadcrumbOverride ?? "Admin / Bookings";

  useEffect(() => {
    fetchBookings({
      page,
      limit: rowsPerPage,
      sortBy: sortStatus.columnAccessor,
      sortOrder: sortStatus.direction,
      search: searchTerm || undefined,
      statuses: buildStatusParam(statusFilter),
      fromDate: dateRangeQuery.from,
      toDate: dateRangeQuery.to,
    });
  }, [
    fetchBookings,
    page,
    rowsPerPage,
    sortStatus,
    searchTerm,
    statusFilter,
    dateRangeQuery.from,
    dateRangeQuery.to,
    activePriceFilter.min,
    activePriceFilter.max,
  ]);

  useEffect(() => {
    dispatch(setPageTitle(listingTitle));
  }, [dispatch, listingTitle]);

  useEffect(() => {
    setStatusFilter(defaultStatusFilter);
    setPage(1);
  }, [defaultStatusFilter]);

  const bookingRows = useMemo<AdminBookingRow[]>(() => {
    const items = data?.data || [];
    return items.map((item) => {
      const nameParts = [item.user?.firstName, item.user?.lastName]
        .filter(Boolean)
        .join(" ");

      const amount = Number(item.orderItem?.priceFinal ?? item.orderItem?.priceOriginal ?? 0);

      return {
        id: item.id,
        orderNumber: item.orderItem?.orderNumber ?? item.id,
        customerName: nameParts || "—",
        customerEmail: item.user?.email ?? "—",
        customerProfileImageUrl: item.user?.profileImageUrl ?? null,
        customerProfileImageKey: item.user?.profileImageKey ?? null,
        vendorName: item.vendorProfile?.businessName ?? "—",
        vendorStatus: item.vendorProfile?.status ?? "—",
        serviceTitle: item.vendorService?.title ?? "—",
        serviceCategory: item.vendorService?.category?.name,
        slotStart: item.slot?.startTime,
        slotEnd: item.slot?.endTime,
        status: item.status,
        amount: Number.isFinite(amount) ? amount : 0,
        year: String(dayjs(item.slot?.startTime ?? item.createdAt).year()),
        reviewCount: item.vendorService?._count?.reviews ?? 0,
        createdAt: item.createdAt,
      };
    });
  }, [data?.data]);

  const totals = useMemo(() => {
    const bucket = {
      confirmed: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
      refundRequests: 0,
      totalValue: 0,
    };

    for (const row of bookingRows) {
      if (row.status === "CONFIRMED") bucket.confirmed += 1;
      if (row.status === "PENDING") bucket.pending += 1;
      if (row.status === "COMPLETED") bucket.completed += 1;
      if (row.status === "CANCELLED") bucket.cancelled += 1;
      if (row.status === "REFUND_REQUESTED") bucket.refundRequests += 1;
      bucket.totalValue += row.amount;
    }

    return bucket;
  }, [bookingRows]);

  const totalMeta = data?.meta;
  const controlledPagination = useMemo(
    () => ({
      page,
      pageSize: rowsPerPage,
      totalPages: totalMeta?.totalPages ?? 1,
      totalRecords: totalMeta?.total ?? 0,
    }),
    [page, rowsPerPage, totalMeta?.total, totalMeta?.totalPages]
  );

  const filters = useMemo<FilterConfig[]>(
    () => [
      {
        key: "status",
        label: "Status",
        options: STATUS_FILTER_OPTIONS,
      },
      {
        key: "year",
        label: "Year",
        options: [
          { label: "All years", value: "all" },
          ...Array.from(new Set(bookingRows.map((row) => row.year)))
            .sort((a, b) => Number(b) - Number(a))
            .map((year) => ({ label: year, value: year })),
        ],
      },
    ],
    [bookingRows]
  );

  const initialActiveFilters = useMemo(
    () =>
      typeof defaultStatusFilter === "string" && defaultStatusFilter !== ""
        ? { status: defaultStatusFilter }
        : undefined,
    [defaultStatusFilter]
  );

  const columns = useMemo<ColumnConfig[]>(() => {
    return [
      {
        key: "orderNumber",
        title: "Order #",
        sortable: true,
        render: (value: string) => (
          <span className="font-semibold text-slate-900">{value}</span>
        ),
      },
      {
        key: "customerName",
        title: "Customer",
        sortable: true,
        render: (_: string, row: RowData) => {
          const booking = row as AdminBookingRow;
          return (
            <div className="flex items-center gap-3">
              <img
                src={booking.customerProfileImageUrl || booking.customerProfileImageKey || "/avatar-placeholder.png"}
                alt={booking.customerName}
                className="h-10 w-10 rounded-full border object-cover"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900">{booking.customerName}</span>
                <span className="text-xs font-medium text-slate-500">{booking.customerEmail}</span>
              </div>
            </div>
          );
        },
      },
      {
        key: "vendorName",
        title: "Vendor",
        sortable: true,
        render: (_: string, row: RowData) => {
          const booking = row as AdminBookingRow;
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900">{booking.vendorName}</span>
              <span className="text-xs font-medium text-slate-500">{booking.vendorStatus}</span>
            </div>
          );
        },
      },
      {
        key: "serviceTitle",
        title: "Service",
        sortable: true,
        render: (_: string, row: RowData) => {
          const booking = row as AdminBookingRow;
          return (
            <div className="flex flex-col">
              <span className="text-sm text-slate-800">{booking.serviceTitle}</span>
              {booking.serviceCategory && (
                <span className="text-xs font-medium text-slate-500">{booking.serviceCategory}</span>
              )}
            </div>
          );
        },
      },
      {
        key: "slotStart",
        title: "Schedule",
        sortable: true,
        render: (_: string, row: RowData) => {
          const booking = row as AdminBookingRow;
          const date = booking.slotStart ?? booking.createdAt;
          return (
            <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
              <CalendarClock className="h-4 w-4 text-slate-500" />
              <span>{date ? dayjs(date).format("MMM D, YYYY • h:mm A") : "TBD"}</span>
            </div>
          );
        },
      },
      {
        key: "status",
        title: "Status",
        sortable: true,
        render: (_: string, row: RowData) => {
          const booking = row as AdminBookingRow;
          const tone = STATUS_TONE[booking.status];
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
        key: "reviewCount",
        title: "Reviews",
        sortable: true,
        render: (value: number) => (
          <span className="text-sm font-semibold text-slate-900">{value}</span>
        ),
      },
      {
        key: "amount",
        title: "Value",
        sortable: true,
        render: (value: number) => (
          <span className="font-semibold text-slate-900">{currencyFormatter.format(value)}</span>
        ),
      },
      {
        key: "createdAt",
        title: "Created",
        sortable: true,
        render: (value: string) => (
          <span className="text-sm text-slate-700">{dayjs(value).format("DD MMM YYYY")}</span>
        ),
      },
    ];
  }, []);

  const sortOptions = useMemo(
    () => [
      { key: "createdAt", label: "Created (Newest first desc)" },
      { key: "slotStart", label: "Schedule (Earliest first asc)" },
      { key: "amount", label: "Value (High-Low desc)" },
      { key: "vendorName", label: "Vendor (A-Z asc)" },
      { key: "reviewCount", label: "Reviews (High-Low desc)" },
    ],
    []
  );

  const openActionModal = useCallback(
    (type: Exclude<BookingActionModalType, null>, row: AdminBookingRow) => {
      if ((type === "approve" || type === "reject") && row.status !== "REFUND_REQUESTED") {
        toast.error("Only refund-requested bookings can be actioned.");
        return;
      }
      setActiveBooking(row);
      setRefundDecisionReason("");
      setActionModal(type);
    },
    []
  );

  const closeActionModal = useCallback(() => {
    setActionModal(null);
    setActiveBooking(null);
    setRefundDecisionReason("");
  }, []);

  const submitRefundDecision = useCallback(
    async (action: "APPROVE" | "REJECT") => {
      if (!activeBooking) return;
      if (action === "REJECT" && !refundDecisionReason.trim()) {
        toast.error("Rejection reason is required.");
        return;
      }
      try {
        await decideBookingRefund({
          id: activeBooking.id,
          action,
          reason: refundDecisionReason.trim() || undefined,
        }).unwrap();
        toast.success(action === "APPROVE" ? "Refund approved." : "Refund request rejected.");
        closeActionModal();
      } catch (error) {
        console.error(`Failed to ${action.toLowerCase()} refund`, error);
        toast.error(`Could not ${action === "APPROVE" ? "approve" : "reject"} refund.`);
      }
    },
    [activeBooking, closeActionModal, decideBookingRefund, refundDecisionReason]
  );

  const actions = useMemo<ActionConfig<AdminBookingRow>[]>(() => {
    return [
      {
        title: "View booking",
        icon: Eye,
        onClick: (row) => {
          navigate(`/admin/bookings/${row.id}`);
        },
      },
      {
        title: "View logs (page)",
        icon: HiOutlineClock,
        onClick: (row) => {
          navigate(`/admin/bookings/${row.id}/logs`);
        },
      },
      {
        title: "Email customer",
        icon: Phone,
        onClick: (row) => {
          openActionModal("email", row);
        },
      },
      {
        title: "Approve refund",
        icon: HiOutlineCheckCircle,
        onClick: (row) => {
          openActionModal("approve", row);
        },
      },
      {
        title: "Reject refund",
        icon: HiOutlineExclamationTriangle,
        onClick: (row) => {
          openActionModal("reject", row);
        },
      },
    ];
  }, [navigate, openActionModal]);

  const clearDateRange = useCallback(() => {
    setDateRangeLabel("");
    setDateRangeQuery({});
    setPage(1);
  }, []);

  const handleDateRangeSelect = useCallback(
    (range: string) => {
      if (!range) {
        clearDateRange();
        return;
      }
      setDateRangeLabel(range);
      setDateRangeQuery(parseCalendarRange(range));
      setPage(1);
    },
    [clearDateRange]
  );

  const handleFilter = useCallback(
    (filters: Record<string, string>) => {
      const nextStatus = filters?.status ?? "all";
      setStatusFilter(nextStatus);
      setPage(1);
    },
    [setStatusFilter, setPage]
  );

  const handlePriceInputChange = useCallback(
    (field: "min" | "max") => (event: ChangeEvent<HTMLInputElement>) => {
      setPriceInputs((prev) => ({ ...prev, [field]: event.target.value }));
    },
    []
  );

  const applyPriceFilter = useCallback(() => {
    const nextMin = priceInputs.min.trim();
    const nextMax = priceInputs.max.trim();
    setActivePriceFilter({
      min: nextMin || undefined,
      max: nextMax || undefined,
    });
    setPage(1);
  }, [priceInputs]);

  const clearPriceFilter = useCallback(() => {
    setPriceInputs({ min: "", max: "" });
    setActivePriceFilter({});
    setPage(1);
  }, []);

  const handlePriceKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyPriceFilter();
      }
    },
    [applyPriceFilter]
  );

  const priceFilterLabel = useMemo(() => {
    if (!hasPriceFilter) return "";
    const valueParts: string[] = [];

    if (activePriceFilter.min) {
      const parsed = Number(activePriceFilter.min);
      valueParts.push(
        `from ${Number.isFinite(parsed) ? currencyFormatter.format(parsed) : activePriceFilter.min}`
      );
    }

    if (activePriceFilter.max) {
      const parsed = Number(activePriceFilter.max);
      valueParts.push(
        `up to ${Number.isFinite(parsed) ? currencyFormatter.format(parsed) : activePriceFilter.max}`
      );
    }

    return `Price ${valueParts.join(" & ")}`;
  }, [activePriceFilter, hasPriceFilter]);

  const headerSlot = (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-1 text-sm text-slate-500">
        {dateRangeLabel && (
          <div className="flex items-center gap-2">
            <span>Filtered by: {dateRangeLabel}</span>
            <button
              type="button"
              onClick={clearDateRange}
              className="text-slate-600 underline-offset-2 hover:text-slate-900"
            >
              Clear range
            </button>
          </div>
        )}
        {priceFilterLabel && <div>{priceFilterLabel}</div>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="admin-booking-price-min">
          Min price
        </label>
        <input
          id="admin-booking-price-min"
          type="number"
          min="0"
          placeholder="Min price"
          className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
          value={priceInputs.min}
          onChange={handlePriceInputChange("min")}
          onKeyDown={handlePriceKeyDown}
        />

        <label className="sr-only" htmlFor="admin-booking-price-max">
          Max price
        </label>
        <input
          id="admin-booking-price-max"
          type="number"
          min="0"
          placeholder="Max price"
          className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
          value={priceInputs.max}
          onChange={handlePriceInputChange("max")}
          onKeyDown={handlePriceKeyDown}
        />

        <button
          type="button"
          onClick={applyPriceFilter}
          className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Apply price filter
        </button>

        {hasPriceFilter && (
          <button
            type="button"
            onClick={clearPriceFilter}
            className="h-10 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            Clear price
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <ListingPage
        title={listingTitle}
        breadCrumbTitle={breadcrumbTitle}
        description="Review vendor bookings, keep an eye on refunds, and drill into pending confirmations."
        stats={[]}
        statsSlot={
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <PortalStatCard
              title="Confirmed"
              value={totals.confirmed}
              subtitle="Scheduled & ready"
              icon={HiOutlineCheckCircle}
              tone="blue"
            />
            <PortalStatCard
              title="Pending"
              value={totals.pending}
              subtitle="Awaiting action"
              icon={HiOutlineClock}
              tone="amber"
            />
            <PortalStatCard
              title="Refund requests"
              value={totals.refundRequests}
              subtitle="Needs triage"
              icon={HiOutlineExclamationTriangle}
              tone="red"
            />
            <PortalStatCard
              title="Completed"
              value={totals.completed}
              subtitle="Closed in view"
              icon={HiOutlineSparkles}
              tone="green"
            />
          </div>
        }
        summary={{
          left: dateRangeLabel
            ? `Range: ${dateRangeLabel}`
            : "Select a quick range in the table header.",
          right: `Selected bookings: ${selectedRows.length}`,
        }}
        headerSlot={headerSlot}
        tableProps={{
          title: "Bookings",
          breadCrumbTitle: "Operations / Admin Bookings",
          data: bookingRows,
          columns,
          filters,
          sortOptions,
          searchable: true,
          searchPlaceholder: "Search bookings, customers, vendors, or orders...",
          searchValue: searchTerm,
          showSerialNumber: true,
          defaultActiveFilters: initialActiveFilters,
          rowsPerPageOptions: [10, 20, 40],
          defaultRowsPerPage: rowsPerPage,
          controlledPagination,
          sortStatus,
          onSort: (status) => {
            setSortStatus(status);
            setPage(1);
          },
          onSearch: (value) => {
            setSearchTerm(value ?? "");
            setPage(1);
          },
          onFilter: handleFilter,
          onRowSelect: (ids) => setSelectedRows(ids),
          onPaginationChange: ({ page: newPage, pageSize }) => {
            setRowsPerPage(pageSize);
            setPage(newPage);
          },
          onDateRangeSelect: handleDateRangeSelect,
          actions,
          loading: isFetching || isUpdatingRefund,
          error: isError ? "Unable to load bookings right now." : null,
          noRecordText: "No bookings match the selected filters.",
          minHeight: 320,
          className: "border border-slate-200",
        }}
      />
      <Dialog open={Boolean(actionModal && activeBooking)} onOpenChange={(open) => !open && closeActionModal()}>
        <DialogContent className="max-h-[88vh] max-w-[420px] overflow-hidden rounded-[32px] border-slate-200 bg-white p-0 shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
          <div className="px-5 pt-5">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="text-[24px] font-black tracking-tight text-slate-950">
                {actionModal === "view" && "Booking Details"}
                {actionModal === "email" && "Contact Customer"}
                {actionModal === "approve" && "Approve Refund"}
                {actionModal === "reject" && "Reject Refund"}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                {actionModal === "view" && "Review booking summary information."}
                {actionModal === "email" && "You can email the customer from here."}
                {actionModal === "approve" && "Add an optional note before approving this refund."}
                {actionModal === "reject" && "Add a reason before rejecting this refund request."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="max-h-[calc(88vh-112px)] overflow-y-auto px-5 pb-5 pt-4">
            {activeBooking && (
              <div className="space-y-5 text-sm">
                {(actionModal === "view" || actionModal === "email") && (
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <div className="space-y-2 text-[15px] leading-7 text-slate-900">
                      <p>
                        <span className="font-semibold text-slate-800">Order:</span>{" "}
                        {activeBooking.orderNumber}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">Customer:</span>{" "}
                        {activeBooking.customerName}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">Email:</span>{" "}
                        {activeBooking.customerEmail}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">Vendor:</span>{" "}
                        {activeBooking.vendorName}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">Service:</span>{" "}
                        {activeBooking.serviceTitle}
                      </p>
                    </div>
                  </div>
                )}

                {actionModal === "view" && (
                  <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Activity log</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Recent booking actions and system updates.
                        </p>
                      </div>
                      {isFetchingLogs && <span className="text-xs text-slate-500">Loading...</span>}
                    </div>
                    {showLogsError && (
                      <p className="mt-3 text-xs text-rose-600">Unable to load booking logs right now.</p>
                    )}
                    {!isFetchingLogs &&
                      (bookingLogs.length === 0 || logsStatusCode === 404) &&
                      !showLogsError && (
                        <p className="mt-3 text-xs text-slate-500">
                          No log entries for this booking yet. (Log feed not available)
                        </p>
                      )}
                    <ol className="mt-4 space-y-4">
                      {bookingLogs.map((log: AdminBookingLog) => {
                        const actorTone = ACTOR_TONE[log.actorType];

                        return (
                          <li
                            key={log.id}
                            className="rounded-[20px] border border-slate-100 bg-slate-50 p-5"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-3">
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${actorTone.bg} ${actorTone.text}`}
                                  >
                                    {log.actorType}
                                  </span>
                                  <span className="text-sm font-black uppercase tracking-tight text-slate-900">
                                    {log.action}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                  {dayjs(log.createdAt).format("DD MMM YYYY, HH:mm")}
                                </p>
                              </div>
                            </div>
                            {log.description ? (
                              <p className="mt-2 text-xs leading-6 text-slate-600">{log.description}</p>
                            ) : null}
                            {log.actorName ? (
                              <p className="mt-1 text-[11px] font-medium text-slate-500">
                                By {log.actorName}
                              </p>
                            ) : null}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                )}

                {(actionModal === "approve" || actionModal === "reject") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700" htmlFor="refund-decision-reason">
                      {actionModal === "approve" ? "Approval note (optional)" : "Rejection reason"}
                    </label>
                    <textarea
                      id="refund-decision-reason"
                      rows={4}
                      value={refundDecisionReason}
                      onChange={(event) => setRefundDecisionReason(event.target.value)}
                      placeholder={
                        actionModal === "approve"
                          ? "Refund approved after policy check."
                          : "Refund not eligible as per policy."
                      }
                      className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-slate-200 px-5 py-4">
            <div className="flex w-full flex-wrap items-center justify-end gap-3">
              {actionModal === "email" && activeBooking && (
                <button
                  type="button"
                  onClick={() => {
                    window.open(`mailto:${activeBooking.customerEmail}`);
                    closeActionModal();
                  }}
                  className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Open Email
                </button>
              )}
              {actionModal === "approve" && (
                <button
                  type="button"
                  onClick={() => void submitRefundDecision("APPROVE")}
                  disabled={isUpdatingRefund}
                  className="inline-flex items-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Approve
                </button>
              )}
              {actionModal === "reject" && (
                <button
                  type="button"
                  onClick={() => void submitRefundDecision("REJECT")}
                  disabled={isUpdatingRefund}
                  className="inline-flex items-center rounded-2xl bg-rose-600 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reject
                </button>
              )}
              <button
                type="button"
                onClick={closeActionModal}
                className="inline-flex items-center rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-800 transition-colors hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}





