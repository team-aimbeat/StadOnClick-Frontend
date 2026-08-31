import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";

import { DashboardContainer } from "@/components/dashboard";
import InsightStatCard from "@/components/shared/InsightStatCard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { useListCustomersQuery } from "@/features/admin/customers/api/customersApi";
import { useListAllVendorsQuery } from "@/features/admin/vendors/api/vendorsApi";
import { useListAdminOrdersQuery } from "@/features/admin/orders/api/adminOrdersApi";
import { useListAdminBookingsQuery } from "@/features/admin/bookings/api/adminBookingsApi";
import { useListVendorSubscriptionsQuery } from "@/features/adminLeads/api/adminLeadPlans.api";
import { useGetSummaryQuery } from "@/features/admin/reports/api/adminReportsApi";
import {
  HiMiniArrowDown,
  HiMiniArrowUp,
  HiOutlineBanknotes,
  HiOutlineBuildingStorefront,
  HiOutlineArrowDownTray,
  HiOutlineShoppingBag,
  HiOutlineUserGroup,
} from "react-icons/hi2";

const metricTabs = [
  { key: "orders", label: "Orders" },
  { key: "customers", label: "Customers" },
  { key: "vendors", label: "Vendors" },
  { key: "bookings", label: "Bookings" },
] as const;

type MetricKey = (typeof metricTabs)[number]["key"];

const orderStatusTone = (status?: string) => {
  switch ((status ?? "").toUpperCase()) {
    case "PAID":
    case "COMPLETED":
    case "SUCCESS":
      return "bg-emerald-100 text-emerald-700";
    case "REFUNDED":
    case "REFUND_REQUESTED":
      return "bg-rose-100 text-rose-700";
    case "PENDING":
    case "PROCESSING":
      return "bg-amber-100 text-amber-700";
    case "CANCELLED":
    case "FAILED":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const AdminReportsPage = () => {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("orders");

  const dateRange = useMemo(() => {
    const map: Record<typeof range, number> = { "7d": 7, "30d": 30, "90d": 90 };
    const end = dayjs();
    const start = end.subtract(map[range] - 1, "day").startOf("day");
    return { start, end };
  }, [range]);

  const previousRange = useMemo(() => {
    const map: Record<typeof range, number> = { "7d": 7, "30d": 30, "90d": 90 };
    const days = map[range];
    const end = dateRange.start.subtract(1, "day").endOf("day");
    const start = end.subtract(days - 1, "day").startOf("day");
    return { start, end };
  }, [dateRange.start, range]);

  const { data: customers, isFetching: loadingCustomers } = useListCustomersQuery({ page: 1, limit: 500 });
  const { data: vendors, isFetching: loadingVendors } = useListAllVendorsQuery({ page: 1, limit: 500 });
  const { data: ordersResult, isFetching: loadingOrders } = useListAdminOrdersQuery({
    page: 1,
    limit: 200,
    fromDate: dateRange.start.toISOString(),
    toDate: dateRange.end.endOf("day").toISOString(),
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const { data: bookingsResult, isFetching: loadingBookings } = useListAdminBookingsQuery({
    page: 1,
    limit: 200,
    fromDate: dateRange.start.toISOString(),
    toDate: dateRange.end.endOf("day").toISOString(),
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const { data: summary, isFetching: loadingSummary } = useGetSummaryQuery({
    from: dateRange.start.toISOString(),
    to: dateRange.end.endOf("day").toISOString(),
  });
  const { data: previousSummary, isFetching: loadingPreviousSummary } = useGetSummaryQuery({
    from: previousRange.start.toISOString(),
    to: previousRange.end.toISOString(),
  });
  useListVendorSubscriptionsQuery({ page: 1, limit: 200 }); // warm cache for leads API

  const totalRevenue = useMemo(() => {
    const rows = ordersResult?.data ?? [];
    return rows.reduce((sum: number, row: any) => {
      const amount = parseFloat(row?.totalFinal ?? row?.total ?? "0");
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  }, [ordersResult?.data]);

  const compareGrowth = (current?: number, previous?: number) => {
    if (!Number.isFinite(current ?? NaN)) {
      return { text: "—", tone: "slate" as const, icon: HiMiniArrowUp };
    }

    if (!Number.isFinite(previous ?? NaN) || (previous ?? 0) <= 0) {
      return current && current > 0
        ? { text: "+100%", tone: "green" as const, icon: HiMiniArrowUp }
        : { text: "0%", tone: "slate" as const, icon: HiMiniArrowUp };
    }

    const delta = (((current ?? 0) - (previous ?? 0)) / (previous ?? 0)) * 100;
    const rounded = Math.abs(delta) >= 10 ? Math.round(Math.abs(delta)) : Math.round(Math.abs(delta) * 10) / 10;

    return {
      text: `${delta >= 0 ? "+" : "-"}${rounded}%`,
      tone: delta > 0 ? ("green" as const) : delta < 0 ? ("red" as const) : ("slate" as const),
      icon: delta >= 0 ? HiMiniArrowUp : HiMiniArrowDown,
    };
  };

  const reportCards = useMemo(
    () => [
      {
        title: "Total Customers",
        value: summary?.totalCustomers ?? customers?.meta?.total ?? "—",
        subtitle: "Registered users",
        icon: HiOutlineUserGroup,
        iconTone: "blue" as const,
        trend: compareGrowth(summary?.totalCustomers, previousSummary?.totalCustomers),
      },
      {
        title: "Total Vendors",
        value: summary?.totalVendors ?? vendors?.meta?.total ?? "—",
        subtitle: "Active marketplace vendors",
        icon: HiOutlineBuildingStorefront,
        iconTone: "green" as const,
        trend: compareGrowth(summary?.totalVendors, previousSummary?.totalVendors),
      },
      {
        title: "Total Orders",
        value: summary?.totalOrders ?? ordersResult?.meta?.total ?? ordersResult?.data?.length ?? "—",
        subtitle: "Orders in the selected period",
        icon: HiOutlineShoppingBag,
        iconTone: "amber" as const,
        trend: compareGrowth(summary?.totalOrders, previousSummary?.totalOrders),
      },
      {
        title: "Total Revenue",
        value: summary && !loadingSummary
          ? `${Math.round(summary.totalRevenue).toLocaleString()} kr`
          : ordersResult && !loadingOrders
            ? `${Math.round(totalRevenue).toLocaleString()} kr`
            : "—",
        subtitle: "Gross value for the selected period",
        icon: HiOutlineBanknotes,
        iconTone: "violet" as const,
        trend: compareGrowth(summary?.totalRevenue, previousSummary?.totalRevenue),
      },
    ],
    [
      customers?.meta?.total,
      loadingOrders,
      loadingPreviousSummary,
      loadingSummary,
      ordersResult?.data?.length,
      ordersResult?.meta?.total,
      previousSummary?.totalCustomers,
      previousSummary?.totalOrders,
      previousSummary?.totalRevenue,
      previousSummary?.totalVendors,
      summary,
      totalRevenue,
      vendors?.meta?.total,
    ],
  );

  const downloadCsv = (rows: any[], filename: string) => {
    if (!rows?.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => {
            const v = (r as any)[h];
            if (v == null) return "";
            const s = String(v).replace(/"/g, '""');
            return `"${s}"`;
          })
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = (rows: any[], filename: string, columns?: string[]) => {
    if (!rows?.length) return;
    const headers = columns ?? Object.keys(rows[0] ?? {});
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h3 { margin: 0 0 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
            th { background: #f8fafc; text-transform: uppercase; letter-spacing: 0.08em; font-size: 10px; }
          </style>
        </head>
        <body>
          <h3>${filename}</h3>
          <table>
            <thead>
              <tr>${headers.map((col) => `<th>${col}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (row) => `<tr>
                    ${headers
                      .map((key) => `<td>${(row as any)[key] ?? (row as any)[key.toLowerCase()] ?? ""}</td>`)
                      .join("")}
                  </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>`;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const orders = ordersResult?.data ?? [];
  const customerRows =
    customers?.data?.map((c: any) => ({
      Id: c.id,
      Name: `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim(),
      Email: c.email,
      Status: c.status,
      Orders: c._count?.orders ?? 0,
      Leads: c._count?.leads ?? 0,
      Created: c.createdAt,
    })) ?? [];
  const vendorRows =
    vendors?.data?.map((v: any) => ({
      Id: v.id,
      Business: v.businessName ?? "—",
      Status: v.status ?? "—",
      Kyc: v.kycStatus ?? "—",
      City: v.city?.name ?? "—",
      Email: v.contactEmail ?? v.user?.email ?? "—",
      Created: v.createdAt,
    })) ?? [];
  const bookingRows = bookingsResult?.data ?? [];

  const chartData = useMemo(() => {
    const days: Record<string, { date: string; revenue: number; orders: number; customers: number; vendors: number; bookings: number }> = {};
    const cursorDays = dateRange.end.diff(dateRange.start, "day") + 1;
    for (let i = 0; i < cursorDays; i += 1) {
      const day = dateRange.start.add(i, "day");
      const key = day.format("YYYY-MM-DD");
      days[key] = { date: day.format("MMM D"), revenue: 0, orders: 0, customers: 0, vendors: 0, bookings: 0 };
    }
    orders.forEach((order: any) => {
      const key = dayjs(order?.createdAt).format("YYYY-MM-DD");
      if (!days[key]) return;
      const amount = parseFloat(order?.totalFinal ?? order?.total ?? order?.totalOriginal ?? "0");
      days[key].revenue += Number.isFinite(amount) ? amount : 0;
      days[key].orders += 1;
    });
    (customers?.data ?? []).forEach((c: any) => {
      const key = dayjs(c?.createdAt).format("YYYY-MM-DD");
      if (days[key]) days[key].customers += 1;
    });
    (vendors?.data ?? []).forEach((v: any) => {
      const key = dayjs(v?.createdAt).format("YYYY-MM-DD");
      if (days[key]) days[key].vendors += 1;
    });
    (bookingRows ?? []).forEach((b: any) => {
      const key = dayjs(b?.createdAt).format("YYYY-MM-DD");
      if (days[key]) days[key].bookings += 1;
    });
    return Object.values(days);
  }, [orders, customers?.data, vendors?.data, bookingRows, dateRange.end, dateRange.start]);

  const downloadSource =
    selectedMetric === "orders"
      ? orders
      : selectedMetric === "customers"
      ? customerRows
      : selectedMetric === "vendors"
      ? vendorRows
      : bookingRows;

  return (
    <DashboardContainer className="space-y-6">
      <TitleBreadCrumbs title="Reports" breadCrumbTitle="Admin / Reports" className="w-full" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {reportCards.map((card) => (
          <InsightStatCard
            key={card.title}
            title={card.title}
            value={
              loadingCustomers || loadingVendors || loadingOrders || loadingBookings || loadingSummary
                ? "…"
                : card.value
            }
            subtitle={card.subtitle}
            icon={card.icon}
            iconTone={card.iconTone}
            badgeText={card.trend.text}
            badgeTone={card.trend.tone}
            badgeIcon={card.trend.icon}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {metricTabs.find((t) => t.key === selectedMetric)?.label} Over Time
            </p>
            <p className="text-xs text-slate-500">Trend for the selected period.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {metricTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedMetric(tab.key)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  selectedMetric === tab.key
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
            {["7d", "30d", "90d"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRange(option as typeof range)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  range === option
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {option === "7d" && "Last 7d"}
                {option === "30d" && "Last 30d"}
                {option === "90d" && "Last 90d"}
              </button>
            ))}
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
              onClick={() => downloadCsv(downloadSource, `${selectedMetric}-report`)}
            >
              Download CSV
            </button>
          </div>
        </div>

        <div className="mt-4 h-64 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
          {loadingOrders ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading chart…</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: 12, right: 12, top: 14, bottom: 8 }}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="ordGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="left"
                  hide={selectedMetric !== "orders"}
                  tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v) => `${v}`}
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ stroke: "#CBD5E1", strokeWidth: 1 }}
                  formatter={(value: number | string | undefined, key: string | undefined) => {
                    const numericValue = Number(value ?? 0);
                    if (key === "revenue") return [`$${numericValue.toLocaleString()}`, "Revenue"];
                    if (key === "orders") return [numericValue, "Orders"];
                    if (key === "customers") return [numericValue, "Customers"];
                    if (key === "vendors") return [numericValue, "Vendors"];
                    if (key === "bookings") return [numericValue, "Bookings"];
                    return [value, key];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {selectedMetric === "orders" && (
                  <>
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} name="Revenue" fill="url(#revGradient)" />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#F97316" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} name="Orders" fill="url(#ordGradient)" />
                  </>
                )}
                {selectedMetric === "customers" && (
                  <Line yAxisId="right" type="monotone" dataKey="customers" stroke="#10B981" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} name="Customers" />
                )}
                {selectedMetric === "vendors" && (
                  <Line yAxisId="right" type="monotone" dataKey="vendors" stroke="#8B5CF6" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} name="Vendors" />
                )}
                {selectedMetric === "bookings" && (
                  <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#0EA5E9" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} name="Bookings" />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Recent Reports</p>
            <p className="mt-1 text-sm text-slate-500">Latest orders for the selected period.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-[#3554e0] transition hover:bg-[#edf2ff]"
              onClick={() => downloadCsv(orders, "orders-report")}
            >
              Export CSV
              <HiOutlineArrowDownTray className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              onClick={() =>
                downloadPdf(orders, "orders-report", ["orderNumber", "vendor", "status", "totalFinal", "createdAt"])
              }
            >
              Export PDF
              <HiOutlineArrowDownTray className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead className="bg-[#f5f6f8] text-left text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {loadingOrders ? (
                <tr>
                  <td className="px-6 py-8 text-slate-500" colSpan={5}>
                    Loading report...
                  </td>
                </tr>
              ) : orders.length ? (
                orders.map((row: any, index: number) => {
                  const created = row?.createdAt ? dayjs(row.createdAt).format("MMM DD, YYYY hh:mm A") : "—";
                  const total = parseFloat(row?.totalFinal ?? row?.total ?? "0");
                  const orderId = row?.orderNumber ?? row?.id ?? "—";
                  const vendorName = row?.vendor?.businessName ?? row?.vendorName ?? "—";

                  return (
                    <tr
                      key={row?.id ?? row?.orderNumber ?? index}
                      className="border-b border-slate-100 last:border-b-0 transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-5">
                        <span className="font-semibold text-[#3554e0]">{orderId}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-semibold text-slate-800">{vendorName}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[15px] font-semibold tracking-[-0.02em] text-slate-900">
                          {Number.isFinite(total) ? `$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${orderStatusTone(row?.status)}`}
                        >
                          {row?.status ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-slate-500">{created}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-6 py-8 text-slate-500" colSpan={5}>
                    No rows yet. Try adjusting the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default AdminReportsPage;
