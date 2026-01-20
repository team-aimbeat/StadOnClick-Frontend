import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { Eye, Phone, CalendarClock } from "lucide-react";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineSparkles,
} from "react-icons/hi2";

import { ColumnConfig, DataTableSortStatus, FilterConfig, RowData } from "@/components/shared/DataTable";
import { ActionConfig } from "@/types/Table/action";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { ListingPage } from "@/components/shared/ListingPage";

type BookingsPageProps = {
  defaultStatusFilter?: string;
  titleOverride?: string;
  breadcrumbOverride?: string;
};

export type BookingRow = RowData & {
  id: string;
  customer: string;
  service: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REFUND_REQUESTED";
  startTime: string;
  city: string;
  channel: string;
  amount: number;
  contact?: string;
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const bookingsSeed: BookingRow[] = [
  {
    id: "BK-2401",
    customer: "Aarav Kulkarni",
    service: "AC Service & Gas Refill",
    status: "CONFIRMED",
    startTime: "2025-01-20T10:30:00Z",
    city: "Mumbai",
    channel: "Marketplace",
    amount: 7200,
    contact: "+91 98111 22110",
  },
  {
    id: "BK-2400",
    customer: "Meera Nair",
    service: "Deep Cleaning - 2BHK",
    status: "COMPLETED",
    startTime: "2025-01-18T14:00:00Z",
    city: "Bengaluru",
    channel: "Organic",
    amount: 8200,
    contact: "+91 98765 00123",
  },
  {
    id: "BK-2399",
    customer: "Prakash Sharma",
    service: "Pest Control - Full Home",
    status: "PENDING",
    startTime: "2025-01-21T08:00:00Z",
    city: "Pune",
    channel: "Phone",
    amount: 6400,
    contact: "+91 97664 32001",
  },
  {
    id: "BK-2398",
    customer: "Sakshi Rawat",
    service: "Sofa Shampoo",
    status: "CANCELLED",
    startTime: "2025-01-17T12:15:00Z",
    city: "Delhi",
    channel: "Marketplace",
    amount: 4800,
    contact: "+91 98117 00456",
  },
  {
    id: "BK-2397",
    customer: "Nikhil Shah",
    service: "Car Detailing - Premium",
    status: "COMPLETED",
    startTime: "2025-01-15T07:45:00Z",
    city: "Ahmedabad",
    channel: "WhatsApp",
    amount: 5600,
    contact: "+91 98765 12003",
  },
  {
    id: "BK-2396",
    customer: "Ananya Gupta",
    service: "Home Painting - 2BHK",
    status: "REFUND_REQUESTED",
    startTime: "2025-01-14T09:30:00Z",
    city: "Jaipur",
    channel: "Referral",
    amount: 12600,
    contact: "+91 98989 76007",
  },
  {
    id: "BK-2395",
    customer: "Vishal Mehta",
    service: "RO Service & Filter Change",
    status: "PENDING",
    startTime: "2025-01-22T16:20:00Z",
    city: "Chennai",
    channel: "Organic",
    amount: 3100,
    contact: "+91 98202 11009",
  },
  {
    id: "BK-2394",
    customer: "Mahesh Iyer",
    service: "Kitchen Deep Cleaning",
    status: "CONFIRMED",
    startTime: "2025-01-23T11:00:00Z",
    city: "Hyderabad",
    channel: "Marketplace",
    amount: 6900,
    contact: "+91 97777 88991",
  },
];

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
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [dateRangeLabel, setDateRangeLabel] = useState<string>("");
  const [bookingRows, setBookingRows] = useState<BookingRow[]>(bookingsSeed);
  const defaultFilters = useMemo(
    () => (defaultStatusFilter ? { status: defaultStatusFilter } : undefined),
    [defaultStatusFilter]
  );

  const updateBookingStatus = (id: string, nextStatus: BookingRow["status"]) => {
    setBookingRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status: nextStatus } : row))
    );
  };

  const listingTitle = titleOverride ?? "Bookings";
  const breadcrumb = breadcrumbOverride ?? "Vendor / Bookings";

  useEffect(() => {
    dispatch(setPageTitle(listingTitle));
  }, [dispatch, listingTitle]);

  const totals = useMemo(() => {
    const confirmed = bookingRows.filter((b) => b.status === "CONFIRMED").length;
    const pending = bookingRows.filter((b) => b.status === "PENDING").length;
    const refundRequested = bookingRows.filter((b) => b.status === "REFUND_REQUESTED").length;
    const completed = bookingRows.filter((b) => b.status === "COMPLETED").length;
    const gross = bookingRows.reduce((sum, b) => sum + b.amount, 0);

    return { confirmed, pending, refundRequested, completed, gross };
  }, [bookingRows]);

  const columns = useMemo<ColumnConfig[]>(() => [
    {
      key: "id",
      title: "Booking ID",
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
      title: "Service",
      sortable: true,
      render: (value: string) => <span className="text-sm text-slate-800">{value}</span>,
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
      render: (value: string) => (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
          {value}
        </span>
      ),
    },
    {
      key: "amount",
      title: "Value",
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
            onClick={() => updateBookingStatus(row.id, "CONFIRMED")}
            disabled={row.status === "CONFIRMED" || row.status === "COMPLETED"}
            className="rounded-full border border-slate-200 px-2 py-1 text-slate-600 disabled:opacity-50"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => updateBookingStatus(row.id, "CANCELLED")}
            disabled={row.status === "CANCELLED"}
            className="rounded-full border border-slate-200 px-2 py-1 text-slate-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => updateBookingStatus(row.id, "COMPLETED")}
            disabled={row.status === "COMPLETED"}
            className="rounded-full border border-slate-200 px-2 py-1 text-slate-600 disabled:opacity-50"
          >
            Mark completed
          </button>
          <NavLink
            to={`/vendor/bookings/${row.id}`}
            className="text-blue-600 hover:text-blue-500"
          >
            Details
          </NavLink>
        </div>
      ),
    },
  ], []);

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
  ], []);

  const sortOptions = useMemo(
    () => [
      { key: "startTime", label: "Schedule (Newest first desc)" },
      { key: "amount", label: "Value (High-Low desc)" },
      { key: "customer", label: "Customer (A-Z)" },
    ],
    []
  );

  const actions = useMemo<ActionConfig<BookingRow>[]>(
    () => [
      {
        title: "View",
        icon: Eye,
        onClick: (row) => console.log("View booking", row.id),
      },
      {
        title: "Call",
        icon: Phone,
        onClick: (row) => console.log("Call", row.contact ?? "N/A"),
      },
    ],
    []
  );

  return (
    <ListingPage
      title={listingTitle}
      breadCrumbTitle={breadcrumb}
      description="Monitor confirmed slots, unblock pending jobs, and resolve refunds faster."
      stats={[
        {
          title: "Confirmed",
          value: totals.confirmed,
          subtitle: "Scheduled and ready",
          icon: HiOutlineCheckCircle,
          accentColor: "blue",
        },
        {
          title: "Pending",
          value: totals.pending,
          subtitle: "Awaiting action",
          icon: HiOutlineClock,
          accentColor: "yellow",
        },
        {
          title: "Refund Requests",
          value: totals.refundRequested,
          subtitle: "Needs triage",
          icon: HiOutlineExclamationTriangle,
          accentColor: "red",
        },
        {
          title: "Completed",
          value: totals.completed,
          subtitle: "Closed in view",
          icon: HiOutlineSparkles,
          accentColor: "green",
        },
      ]}
      summary={{
        left: dateRangeLabel ? `Range: ${dateRangeLabel}` : "Use the quick date selector in the table header.",
        right: `Selected bookings: ${selectedRows.length}`,
      }}
        tableProps={{
          title: "Bookings",
          breadCrumbTitle: "Operations / Bookings Table",
          data: bookingRows,
        columns,
        filters,
        sortOptions,
        searchable: true,
        showSerialNumber: true,
        initialHiddenColumns: [],
        defaultActiveFilters: defaultFilters,
        rowsPerPageOptions: [5, 8, 15],
        defaultRowsPerPage: 8,
        defaultSortColumn: "startTime",
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
