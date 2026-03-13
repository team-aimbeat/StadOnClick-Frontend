import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Eye, ReceiptText } from "lucide-react";
import dayjs from "dayjs";
import {
  HiOutlineBanknotes,
  HiOutlineClipboardDocumentList,
  HiOutlineCube,
  HiOutlineUserGroup,
} from "react-icons/hi2";

import { useAppDispatch } from "@/app/hooks";
import { ListingPage } from "@/components/shared/ListingPage";
import type {
  ColumnConfig,
  DataTableSortStatus,
  FilterConfig,
  RowData,
} from "@/components/shared/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useLazyListAdminOrdersQuery } from "@/features/admin/orders/api/adminOrdersApi";
import type {
  AdminOrderItem,
  AdminOrderStatus,
} from "@/features/admin/orders/types/adminOrder.types";
import type { ActionConfig } from "@/types/Table/action";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const STATUS_FILTER_OPTIONS: FilterConfig["options"] = [
  { label: "All orders", value: "all" },
  { label: "Paid", value: "paid" },
  { label: "Pending", value: "pending" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

const STATUS_FILTER_MAP: Record<string, string> = {
  pending: "PENDING",
  paid: "PAID",
  cancelled: "CANCELLED",
  refunded: "REFUNDED",
};

const STATUS_TONE: Record<
  AdminOrderStatus,
  { bg: string; text: string; ring: string; label: string }
> = {
  PENDING: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
    label: "Pending",
  },
  PAID: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    label: "Paid",
  },
  CANCELLED: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    ring: "ring-slate-200",
    label: "Cancelled",
  },
  REFUNDED: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    ring: "ring-purple-200",
    label: "Refunded",
  },
};

const parseCalendarRange = (value: string): { from?: string; to?: string } => {
  const [fromText, toText] = value.split(" - ").map((segment) => segment.trim());
  const parsedFrom = dayjs(fromText, "YYYY/MM/DD");
  const parsedTo = dayjs(toText, "YYYY/MM/DD");

  return {
    from: parsedFrom.isValid() ? parsedFrom.format("YYYY-MM-DD") : undefined,
    to: parsedTo.isValid() ? parsedTo.format("YYYY-MM-DD") : undefined,
  };
};

type AdminOrderRow = RowData & {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerProfileImageUrl?: string | null;
  customerProfileImageKey?: string | null;
  vendorName: string;
  vendorLocation: string;
  status: AdminOrderStatus;
  totalFinal: number;
  totalOriginal: number;
  totalDiscount: number;
  commissionAmount: number;
  vendorPayoutAmount: number;
  createdAt: string;
  year: string;
  itemCount: number;
  offeringSummary: string;
  serviceSummary: string;
  raw: AdminOrderItem;
};

const defaultSort: DataTableSortStatus = {
  columnAccessor: "createdAt",
  direction: "desc",
};

export default function AdminOrdersPage() {
  const dispatch = useAppDispatch();
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>(defaultSort);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRangeLabel, setDateRangeLabel] = useState("");
  const [dateRangeQuery, setDateRangeQuery] = useState<{ from?: string; to?: string }>({});
  const [totalInputs, setTotalInputs] = useState({ min: "", max: "" });
  const [activeTotalFilter, setActiveTotalFilter] = useState<{ min?: string; max?: string }>({});
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [activeOrder, setActiveOrder] = useState<AdminOrderRow | null>(null);

  const hasTotalFilter = Boolean(activeTotalFilter.min || activeTotalFilter.max);
  const [fetchOrders, { data, isFetching, isError }] = useLazyListAdminOrdersQuery();

  useEffect(() => {
    fetchOrders({
      page,
      limit: rowsPerPage,
      sortBy: sortStatus.columnAccessor,
      sortOrder: sortStatus.direction,
      search: searchTerm || undefined,
      statuses: statusFilter === "all" ? undefined : STATUS_FILTER_MAP[statusFilter],
      fromDate: dateRangeQuery.from,
      toDate: dateRangeQuery.to,
      year: yearFilter === "all" ? undefined : yearFilter,
      minTotal: activeTotalFilter.min,
      maxTotal: activeTotalFilter.max,
    });
  }, [
    activeTotalFilter.max,
    activeTotalFilter.min,
    dateRangeQuery.from,
    dateRangeQuery.to,
    fetchOrders,
    page,
    rowsPerPage,
    searchTerm,
    sortStatus,
    statusFilter,
    yearFilter,
  ]);

  useEffect(() => {
    dispatch(setPageTitle("Admin orders"));
  }, [dispatch]);

  const orderRows = useMemo<AdminOrderRow[]>(() => {
    return (data?.data || []).map((order) => {
      const customerName = [order.user?.firstName, order.user?.lastName].filter(Boolean).join(" ") || "-";
      const uniqueOfferings = Array.from(
        new Set(order.items.map((item) => item.offering?.name).filter(Boolean))
      );
      const uniqueServices = Array.from(
        new Set(order.items.map((item) => item.offering?.service?.title).filter(Boolean))
      );

      return {
        id: order.id,
        orderId: order.id,
        customerName,
        customerEmail: order.user?.email ?? "-",
        customerProfileImageUrl: order.user?.profileImageUrl ?? null,
        customerProfileImageKey: order.user?.profileImageKey ?? null,
        vendorName: order.vendor?.businessName ?? "-",
        vendorLocation: order.vendor?.city?.name || order.vendor?.country || "-",
        status: order.status,
        totalFinal: Number(order.totalFinal ?? 0),
        totalOriginal: Number(order.totalOriginal ?? 0),
        totalDiscount: Number(order.totalDiscount ?? 0),
        commissionAmount: Number(order.commissionAmount ?? 0),
        vendorPayoutAmount: Number(order.vendorPayoutAmount ?? 0),
        createdAt: order.createdAt,
        year: String(dayjs(order.createdAt).year()),
        itemCount: order.items.length,
        offeringSummary: uniqueOfferings.join(", ") || "-",
        serviceSummary: uniqueServices.join(", ") || "-",
        raw: order,
      };
    });
  }, [data?.data]);

  const totals = useMemo(
    () =>
      orderRows.reduce(
        (acc, row) => {
          acc.orderCount += 1;
          acc.totalValue += row.totalFinal;
          acc.totalCommission += row.commissionAmount;
          acc.totalVendorPayout += row.vendorPayoutAmount;
          return acc;
        },
        {
          orderCount: 0,
          totalValue: 0,
          totalCommission: 0,
          totalVendorPayout: 0,
        }
      ),
    [orderRows]
  );

  const controlledPagination = useMemo(
    () => ({
      page,
      pageSize: rowsPerPage,
      totalPages: data?.meta?.totalPages ?? 1,
      totalRecords: data?.meta?.total ?? 0,
    }),
    [data?.meta?.total, data?.meta?.totalPages, page, rowsPerPage]
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
          ...Array.from(new Set(orderRows.map((row) => row.year)))
            .sort((a, b) => Number(b) - Number(a))
            .map((year) => ({ label: year, value: year })),
        ],
      },
    ],
    [orderRows]
  );

  const columns = useMemo<ColumnConfig[]>(
    () => [
      {
        key: "orderId",
        title: "Order",
        sortable: true,
        render: (_: string, row: RowData) => {
          const order = row as AdminOrderRow;
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900">{order.orderId.slice(0, 8)}...</span>
              <span className="text-xs font-medium text-slate-500">{order.itemCount} items</span>
            </div>
          );
        },
      },
      {
        key: "customerName",
        title: "Customer",
        sortable: true,
        render: (_: string, row: RowData) => {
          const order = row as AdminOrderRow;
          return (
            <div className="flex items-center gap-3">
              <img
                src={order.customerProfileImageUrl || order.customerProfileImageKey || "/avatar-placeholder.png"}
                alt={order.customerName}
                className="h-10 w-10 rounded-full border object-cover"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900">{order.customerName}</span>
                <span className="text-xs font-medium text-slate-500">{order.customerEmail}</span>
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
          const order = row as AdminOrderRow;
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900">{order.vendorName}</span>
              <span className="text-xs font-medium text-slate-500">{order.vendorLocation}</span>
            </div>
          );
        },
      },
      {
        key: "offeringSummary",
        title: "Offerings",
        sortable: true,
        render: (_: string, row: RowData) => {
          const order = row as AdminOrderRow;
          return (
            <div className="flex max-w-[280px] flex-col">
              <span className="truncate text-sm font-medium text-slate-800">{order.offeringSummary}</span>
              <span className="truncate text-xs text-slate-500">{order.serviceSummary}</span>
            </div>
          );
        },
      },
      {
        key: "status",
        title: "Status",
        sortable: true,
        render: (_: string, row: RowData) => {
          const order = row as AdminOrderRow;
          const tone = STATUS_TONE[order.status];
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
        key: "commissionAmount",
        title: "Commission",
        sortable: true,
        render: (value: number) => (
          <span className="font-semibold text-slate-900">{currencyFormatter.format(value)}</span>
        ),
      },
      {
        key: "totalFinal",
        title: "Total",
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
          <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
            <CalendarClock className="h-4 w-4 text-slate-500" />
            <span>{dayjs(value).format("DD MMM YYYY")}</span>
          </div>
        ),
      },
    ],
    []
  );

  const sortOptions = useMemo(
    () => [
      { key: "createdAt", label: "Created (Newest first desc)" },
      { key: "totalFinal", label: "Total (High-Low desc)" },
      { key: "commissionAmount", label: "Commission (High-Low desc)" },
      { key: "vendorName", label: "Vendor (A-Z asc)" },
      { key: "customerFirstName", label: "Customer (A-Z asc)" },
    ],
    []
  );

  const actions = useMemo<ActionConfig<AdminOrderRow>[]>(
    () => [
      {
        title: "View order",
        icon: Eye,
        onClick: (row) => setActiveOrder(row),
      },
    ],
    []
  );

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

  const handleFilter = useCallback((filters: Record<string, string>) => {
    setStatusFilter(filters?.status ?? "all");
    setYearFilter(filters?.year ?? "all");
    setPage(1);
  }, []);

  const handleTotalInputChange = useCallback(
    (field: "min" | "max") => (event: ChangeEvent<HTMLInputElement>) => {
      setTotalInputs((prev) => ({ ...prev, [field]: event.target.value }));
    },
    []
  );

  const applyTotalFilter = useCallback(() => {
    const nextMin = totalInputs.min.trim();
    const nextMax = totalInputs.max.trim();
    setActiveTotalFilter({
      min: nextMin || undefined,
      max: nextMax || undefined,
    });
    setPage(1);
  }, [totalInputs]);

  const clearTotalFilter = useCallback(() => {
    setTotalInputs({ min: "", max: "" });
    setActiveTotalFilter({});
    setPage(1);
  }, []);

  const handleTotalKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyTotalFilter();
      }
    },
    [applyTotalFilter]
  );

  const totalFilterLabel = useMemo(() => {
    if (!hasTotalFilter) return "";

    const valueParts: string[] = [];
    if (activeTotalFilter.min) {
      valueParts.push(`from ${currencyFormatter.format(Number(activeTotalFilter.min))}`);
    }
    if (activeTotalFilter.max) {
      valueParts.push(`up to ${currencyFormatter.format(Number(activeTotalFilter.max))}`);
    }

    return `Total ${valueParts.join(" & ")}`;
  }, [activeTotalFilter, hasTotalFilter]);

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
        {totalFilterLabel && <div>{totalFilterLabel}</div>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          min="0"
          placeholder="Min total"
          className="h-10 rounded-md border bg-white border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
          value={totalInputs.min}
          onChange={handleTotalInputChange("min")}
          onKeyDown={handleTotalKeyDown}
        />
        <input
          type="number"
          min="0"
          placeholder="Max total"
          className="h-10 rounded-md border bg-white border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
          value={totalInputs.max}
          onChange={handleTotalInputChange("max")}
          onKeyDown={handleTotalKeyDown}
        />
        <button
          type="button"
          onClick={applyTotalFilter}
          className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Apply total filter
        </button>
        {hasTotalFilter && (
          <button
            type="button"
            onClick={clearTotalFilter}
            className="h-10 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            Clear total
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <ListingPage
        title="Admin orders"
        breadCrumbTitle="Admin / Orders"
        description="View every order with its customer, vendor, offerings, totals, and booking-level details."
        stats={[
          {
            title: "Orders",
            value: totals.orderCount,
            subtitle: "Records in current page",
            icon: HiOutlineClipboardDocumentList,
            accentColor: "blue",
          },
          {
            title: "Gross value",
            value: currencyFormatter.format(totals.totalValue),
            subtitle: "Paid + pending totals",
            icon: HiOutlineBanknotes,
            accentColor: "green",
          },
          {
            title: "Commission",
            value: currencyFormatter.format(totals.totalCommission),
            subtitle: "Platform share",
            icon: HiOutlineCube,
            accentColor: "yellow",
          },
          {
            title: "Vendor payout",
            value: currencyFormatter.format(totals.totalVendorPayout),
            subtitle: "Net vendor earnings",
            icon: HiOutlineUserGroup,
            accentColor: "purple",
          },
        ]}
        summary={{
          left: dateRangeLabel ? `Range: ${dateRangeLabel}` : "Review order-level activity across vendors and offerings.",
          right: `Selected orders: ${selectedRows.length}`,
        }}
        headerSlot={headerSlot}
        tableProps={{
          title: "Orders",
          breadCrumbTitle: "Commerce / Admin Orders",
          data: orderRows,
          columns,
          filters,
          sortOptions,
          searchable: true,
          searchPlaceholder: "Search orders, customers, vendors, services, offerings...",
          searchValue: searchTerm,
          showSerialNumber: true,
          defaultActiveFilters: { status: "all", year: "all" },
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
          loading: isFetching,
          error: isError ? "Unable to load orders right now." : null,
          noRecordText: "No orders match the selected filters.",
          minHeight: 320,
          className: "border border-slate-200",
        }}
      />

      <Dialog open={Boolean(activeOrder)} onOpenChange={(open) => !open && setActiveOrder(null)}>
        <DialogContent className="w-[min(1100px,96vw)] max-w-[1100px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order details</DialogTitle>
            <DialogDescription>
              Customer, vendor, offerings, bookings, and money breakdown for this order.
            </DialogDescription>
          </DialogHeader>

          {activeOrder && (
            <div className="space-y-6 text-sm">
              <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="font-semibold text-slate-900">Order</p>
                      <p className="mt-2 break-all text-slate-700">{activeOrder.orderId}</p>
                      <p className="mt-2 text-slate-500">
                        {dayjs(activeOrder.createdAt).format("DD MMM YYYY, h:mm A")}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="font-semibold text-slate-900">Customer</p>
                      <p className="mt-2 text-slate-700">{activeOrder.customerName}</p>
                      <p className="mt-2 break-all text-slate-500">{activeOrder.customerEmail}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="font-semibold text-slate-900">Vendor</p>
                      <p className="mt-2 text-slate-700">{activeOrder.vendorName}</p>
                      <p className="mt-2 text-slate-500">{activeOrder.vendorLocation}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200">
                    <div className="border-b border-slate-200 px-5 py-4">
                      <h3 className="font-semibold text-slate-900">Order items</h3>
                    </div>
                    <div className="divide-y divide-slate-200">
                      {activeOrder.raw.items.map((item) => (
                        <div key={item.id} className="space-y-4 px-5 py-5">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-900">
                                {item.offering?.name || "Offering"}
                              </p>
                              <p className="mt-1 text-slate-500">
                                {item.offering?.service?.title || "Service"} -{" "}
                                {item.offering?.service?.category?.name || "Uncategorized"}
                              </p>
                              <p className="mt-2 text-xs font-medium text-slate-500">
                                Order no: {item.orderNumber} - Qty: {item.quantity}
                              </p>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-4 py-3 text-right">
                              <p className="font-semibold text-slate-900">
                                {currencyFormatter.format(Number(item.priceFinal))}
                              </p>
                              <p className="text-xs text-slate-500">
                                Original {currencyFormatter.format(Number(item.priceOriginal))}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            {item.bookings.length > 0 ? (
                              item.bookings.map((booking) => (
                                <div
                                  key={booking.id}
                                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                >
                                  <p className="font-semibold text-slate-800">{booking.status}</p>
                                  <p className="mt-2 break-all text-xs text-slate-500">
                                    Booking ID: {booking.id}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {booking.slot?.startTime
                                      ? `${dayjs(booking.slot.startTime).format("DD MMM YYYY, h:mm A")}${
                                          booking.slot?.endTime
                                            ? ` - ${dayjs(booking.slot.endTime).format("h:mm A")}`
                                            : ""
                                        }`
                                      : "No slot assigned"}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-slate-500">
                                No booking rows linked to this item.
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-slate-500">Original</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {currencyFormatter.format(activeOrder.totalOriginal)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-slate-500">Discount</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {currencyFormatter.format(activeOrder.totalDiscount)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-slate-500">Commission</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {currencyFormatter.format(activeOrder.commissionAmount)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-slate-500">Vendor payout</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {currencyFormatter.format(activeOrder.vendorPayoutAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-5">
                    <p className="flex items-center gap-2 font-semibold text-slate-900">
                      <ReceiptText className="h-4 w-4" />
                      Coupon redemptions
                    </p>
                    <div className="mt-4 space-y-2">
                      {activeOrder.raw.coupons.length > 0 ? (
                        activeOrder.raw.coupons.map((coupon) => (
                          <div key={coupon.id} className="rounded-xl bg-slate-50 px-4 py-3">
                            <p className="font-medium text-slate-800">{coupon.coupon.title}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {coupon.coupon.code} - {dayjs(coupon.redeemedAt).format("DD MMM YYYY")}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500">No coupons were used on this order.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-5">
                    <p className="font-semibold text-slate-900">Refund details</p>
                    <div className="mt-4 space-y-3 text-slate-600">
                      <p>Status: {activeOrder.status}</p>
                      <p>
                        Refunded at:{" "}
                        {activeOrder.raw.refundedAt
                          ? dayjs(activeOrder.raw.refundedAt).format("DD MMM YYYY, h:mm A")
                          : "-"}
                      </p>
                      <p>Reason: {activeOrder.raw.refundReason || "-"}</p>
                      <p>Total final: {currencyFormatter.format(activeOrder.totalFinal)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setActiveOrder(null)}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
