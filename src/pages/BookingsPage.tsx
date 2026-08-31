import { useEffect, useMemo, useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { CalendarClock, Download, Plus } from "lucide-react";
import toast from "react-hot-toast";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineSparkles,
  HiOutlineCalendarDays,
} from "react-icons/hi2";

import { ColumnConfig, DataTableSortStatus, FilterConfig, RowData } from "@/components/shared/DataTable";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { DataTable } from "@/components/shared/DataTable";
import { cn } from "@/lib/utils";
import {
  useGetBookingsQuery,
  useUpdateBookingStatusMutation,
} from "@/services/bookingsApi";

type BookingsPageProps = {
  defaultStatusFilter?: string;
  titleOverride?: string;
  breadcrumbOverride?: string;
};

type BookingStatCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: typeof HiOutlineCalendarDays;
  accent: "blue" | "green" | "amber" | "purple";
};

const bookingAccentClass: Record<BookingStatCardProps["accent"], string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  purple: "bg-violet-50 text-violet-600",
};

const BookingStatCard = ({ title, value, subtitle, icon: Icon, accent }: BookingStatCardProps) => (
  <div className="rounded-[24px] border border-slate-100 bg-white p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-3">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            bookingAccentClass[accent]
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {subtitle}
        </span>
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {title}
        </p>
        <p className="text-[28px] font-bold tracking-tight text-slate-900">{value}</p>
      </div>
      <div className={cn("grid h-10 w-10 place-items-center rounded-full", bookingAccentClass[accent])}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

export type BookingRow = RowData & {
  bookingId: string;
  id: string;
  customer: string;
  service: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "COMPLETED"
    | "CANCELLED"
    | "REFUND_REQUESTED"
    | "REFUNDED";
  startTime: string;
  city: string;
  channel: string;
  amount: number;
  year: string;
  contact?: string;
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const statusTone: Record<
  BookingRow["status"],
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
    label: "Refund Requested",
  },
  REFUNDED: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    ring: "ring-purple-200",
    label: "Refunded",
  },
};

export default function BookingsPage({
  defaultStatusFilter,
  titleOverride,
  breadcrumbOverride,
}: BookingsPageProps = {}) {
  const dispatch = useAppDispatch();
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "startTime",
    direction: "desc",
  });
  const [dateRangeLabel, setDateRangeLabel] = useState<string>("");
  const [bookingRows, setBookingRows] = useState<BookingRow[]>([]);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const { data: backendBookings, isFetching, isError } = useGetBookingsQuery();
  const [updateBookingStatusMutation] = useUpdateBookingStatusMutation();
  const defaultFilters = useMemo(
    () => (defaultStatusFilter ? { status: defaultStatusFilter } : undefined),
    [defaultStatusFilter]
  );

  useEffect(() => {
    if (backendBookings !== undefined) {
      setBookingRows(backendBookings);
    }
  }, [backendBookings]);

  const updateBookingStatus = async (
    bookingId: string,
    nextStatus: BookingRow["status"]
  ) => {
    try {
      setStatusUpdatingId(bookingId);
      await updateBookingStatusMutation({ id: bookingId, status: nextStatus }).unwrap();
      setBookingRows((prev) =>
        prev.map((row) =>
          row.bookingId === bookingId ? { ...row, status: nextStatus } : row
        )
      );
      toast.success(
        nextStatus === "COMPLETED"
          ? "Booking marked as completed."
          : `Booking updated to ${nextStatus.toLowerCase()}.`
      );
    } catch (error) {
      console.error("Failed to update booking status", error);
      toast.error("Could not update booking status. Please try again.");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const backendStatusMessage = useMemo(() => {
    if (isError) return "Failed to load latest bookings";
    if (isFetching) return "Syncing latest bookings";
    return "";
  }, [isError, isFetching]);

  const listingTitle = titleOverride ?? "Bookings";
  const breadcrumb = breadcrumbOverride ?? "Vendor / Bookings";
  const isRefundView = useMemo(
    () =>
      defaultStatusFilter === "refund" ||
      defaultStatusFilter === "refunded" ||
      listingTitle.toLowerCase().includes("refund"),
    [defaultStatusFilter, listingTitle]
  );

  useEffect(() => {
    dispatch(setPageTitle(listingTitle));
  }, [dispatch, listingTitle]);

  const totals = useMemo(() => {
    const confirmed = bookingRows.filter((b) => b.status === "CONFIRMED").length;
    const pending = bookingRows.filter((b) => b.status === "PENDING").length;
    const refunded = bookingRows.filter((b) => b.status === "REFUNDED").length;
    const refundRequested = bookingRows.filter((b) => b.status === "REFUND_REQUESTED").length;
    const completed = bookingRows.filter((b) => b.status === "COMPLETED").length;
    const gross = bookingRows.reduce((sum, b) => sum + b.amount, 0);

    return { confirmed, pending, refunded, refundRequested, completed, gross };
  }, [bookingRows]);

  const bookingYearOptions = useMemo(() => {
    const years = Array.from(
      new Set(
        bookingRows
          .map((booking) => new Date(booking.startTime).getFullYear())
          .filter((year) => Number.isFinite(year))
          .map((year) => String(year))
      )
    ).sort((a, b) => Number(b) - Number(a));

    return [
      { label: "All", value: "all" },
      ...years.map((year) => ({ label: year, value: year })),
    ];
  }, [bookingRows]);

  const columns = useMemo<ColumnConfig[]>(() => [
    {
      key: "id",
      title: "Reference",
      sortable: true,
      render: (value: string) => <span className="font-semibold text-slate-900">{value}</span>,
    },
    {
      key: "customer",
      title: "Customer",
      sortable: true,
      render: (value: string, row: BookingRow) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{value}</span>
          <span className="text-xs font-medium text-slate-500">{row.city}</span>
        </div>
      ),
    },
    {
      key: "service",
      title: "Service Name",
      sortable: true,
      render: (value: string, row: BookingRow) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">#{row.id}</p>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      sortable: true,
      render: (_: string, row: BookingRow) => {
        const tone = statusTone[row.status];
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
      key: "channel",
      title: "Channel",
      sortable: true,
      render: (value: string) => <span className="text-sm text-slate-700">{value}</span>,
    },
    {
      key: "amount",
      title: "Value (KR)",
      sortable: true,
      render: (value: number) => <span className="font-semibold text-slate-900">{currency.format(value)}</span>,
    },
    {
      key: "startTime",
      title: "Schedule",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
          <CalendarClock className="h-4 w-4 text-slate-500" />
          {new Date(value).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_: string, row: BookingRow) => (
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => void updateBookingStatus(row.bookingId, "CONFIRMED")}
            disabled={
              row.status === "CONFIRMED" ||
              row.status === "COMPLETED" ||
              row.status === "REFUNDED" ||
              statusUpdatingId === row.bookingId
            }
            className="rounded-full border border-slate-200 px-2 py-1 text-slate-600 disabled:opacity-50"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => void updateBookingStatus(row.bookingId, "CANCELLED")}
            disabled={
              row.status === "CANCELLED" ||
              row.status === "REFUNDED" ||
              statusUpdatingId === row.bookingId
            }
            className="rounded-full border border-slate-200 px-2 py-1 text-slate-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void updateBookingStatus(row.bookingId, "COMPLETED")}
            disabled={
              row.status === "COMPLETED" ||
              row.status === "REFUNDED" ||
              statusUpdatingId === row.bookingId
            }
            className="rounded-full border border-slate-200 px-2 py-1 text-slate-600 disabled:opacity-50"
          >
            Mark completed
          </button>
          <NavLink
            to={`/vendor/bookings/${row.bookingId}`}
            className="text-blue-600 hover:text-blue-500"
          >
            Details
          </NavLink>
        </div>
      ),
    },
  ], [statusUpdatingId, updateBookingStatus]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part.trim()[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const renderBookingRow = (row: BookingRow, index: number) => {
    const tone = statusTone[row.status];
    const customerInitials = getInitials(row.customer || "BK");

    return (
      <tr key={row.bookingId} className="rounded-2xl bg-slate-50/70">
        <td className="rounded-l-2xl px-2 py-4">
          <span className="font-semibold text-slate-700">{String(index + 1).padStart(2, "0")}</span>
        </td>
        <td className="px-2 py-4">
          <span className="font-semibold text-[#3554e0]">#{row.id}</span>
        </td>
        <td className="px-2 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {customerInitials}
            </span>
            <div>
              <p className="font-semibold text-slate-900">{row.customer}</p>
              <p className="text-xs text-slate-500">{row.city}</p>
            </div>
          </div>
        </td>
        <td className="px-2 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#3554e0] shadow-sm">
              <CalendarClock className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-slate-900">{row.service}</p>
              <p className="text-xs text-slate-500">{row.city}</p>
            </div>
          </div>
        </td>
        <td className="px-2 py-4">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            {tone.label}
          </span>
        </td>
        <td className="px-2 py-4">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {row.channel}
          </span>
        </td>
        <td className="px-2 py-4">
          <span className="font-semibold text-slate-900">{currency.format(row.amount)}</span>
        </td>
        <td className="px-2 py-4">
          <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
            <CalendarClock className="h-4 w-4 text-slate-500" />
            {new Date(row.startTime).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </td>
        <td className="rounded-r-2xl px-2 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void updateBookingStatus(row.bookingId, "CONFIRMED")}
              disabled={
                row.status === "CONFIRMED" ||
                row.status === "COMPLETED" ||
                row.status === "REFUNDED" ||
                statusUpdatingId === row.bookingId
              }
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm disabled:opacity-50"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => void updateBookingStatus(row.bookingId, "CANCELLED")}
              disabled={
                row.status === "CANCELLED" ||
                row.status === "REFUNDED" ||
                statusUpdatingId === row.bookingId
              }
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void updateBookingStatus(row.bookingId, "COMPLETED")}
              disabled={
                row.status === "COMPLETED" ||
                row.status === "REFUNDED" ||
                statusUpdatingId === row.bookingId
              }
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm disabled:opacity-50"
            >
              Mark completed
            </button>
          </div>
          <div className="mt-2 flex flex-col items-start gap-1">
            <NavLink
              to={`/vendor/bookings/${row.bookingId}`}
              className="text-sm font-semibold text-[#3554e0] hover:text-[#2843b8]"
            >
              Details
            </NavLink>
          </div>
        </td>
      </tr>
    );
  };

  const filters = useMemo<FilterConfig[]>(() => [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "All", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Refund Requested", value: "refund" },
        { label: "Refunded", value: "refunded" },
      ],
    },
    {
      key: "channel",
      label: "Channel",
      options: [
        { label: "All", value: "all" },
        { label: "Marketplace", value: "marketplace" },
        { label: "Organic", value: "organic" },
        { label: "Referral", value: "referral" },
        { label: "Phone", value: "phone" },
        { label: "WhatsApp", value: "whatsapp" },
      ],
    },
    {
      key: "year",
      label: "Year",
      options: bookingYearOptions,
    },
  ], [bookingYearOptions]);

  const sortOptions = useMemo(
    () => [
      { key: "startTime", label: "Schedule (Newest first desc)" },
      { key: "amount", label: "Value (High-Low desc)" },
      { key: "customer", label: "Customer (A-Z)" },
    ],
    []
  );

  return (
    <DashboardContainer className="space-y-6 pb-10">
      <TitleBreadCrumbs
        title={listingTitle}
        breadCrumbTitle={breadcrumb}
        subtitle="Monitor and manage your service schedules"
      />

     

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <BookingStatCard
          title="Total Bookings"
          value={bookingRows.length}
          subtitle="+12% vs last month"
          icon={HiOutlineCalendarDays}
          accent="blue"
        />
        <BookingStatCard
          title="Confirmed"
          value={totals.confirmed}
          subtitle="66% of total"
          icon={HiOutlineCheckCircle}
          accent="green"
        />
        <BookingStatCard
          title="Pending Action"
          value={totals.pending + totals.refundRequested}
          subtitle="Requires action"
          icon={HiOutlineClock}
          accent="amber"
        />
        <BookingStatCard
          title="Completed"
          value={totals.completed}
          subtitle="31% of total"
          icon={HiOutlineSparkles}
          accent="purple"
        />
      </div>

      <DataTable
        title={listingTitle}
        breadCrumbTitle={breadcrumb}
        data={bookingRows}
        columns={columns}
        filters={filters}
        sortOptions={sortOptions}
        searchable
        searchPlaceholder="Search order ID or customer..."
        showSerialNumber
        selectable={false}
        initialHiddenColumns={[]}
        defaultActiveFilters={defaultFilters}
        rowsPerPageOptions={[5, 8, 15]}
        defaultRowsPerPage={8}
        defaultSortColumn="startTime"
        sortStatus={sortStatus}
        onSort={setSortStatus}
        onDateRangeSelect={(range) => setDateRangeLabel(range)}
        className="border border-slate-200"
        showHeaderTitle={false}
        customRowRenderer={(row, index) => renderBookingRow(row as BookingRow, index)}
      />
    </DashboardContainer>
  );
}
