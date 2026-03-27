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
} from "recharts";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { useListCustomersQuery } from "@/features/admin/customers/api/customersApi";
import { useListAllVendorsQuery } from "@/features/admin/vendors/api/vendorsApi";
import { useListAdminOrdersQuery } from "@/features/admin/orders/api/adminOrdersApi";
import { useListAdminBookingsQuery } from "@/features/admin/bookings/api/adminBookingsApi";
import { useListVendorSubscriptionsQuery } from "@/features/adminLeads/api/adminLeadPlans.api";

const metricTabs = [
  { key: "orders", label: "Orders" },
  { key: "customers", label: "Customers" },
  { key: "vendors", label: "Vendors" },
  { key: "bookings", label: "Bookings" },
] as const;

type MetricKey = (typeof metricTabs)[number]["key"];

const AdminReportsPage = () => {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("orders");

  const dateRange = useMemo(() => {
    const map: Record<typeof range, number> = { "7d": 7, "30d": 30, "90d": 90 };
    const end = dayjs();
    const start = end.subtract(map[range] - 1, "day").startOf("day");
    return { start, end };
  }, [range]);

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
  useListVendorSubscriptionsQuery({ page: 1, limit: 200 }); // warm cache for leads API

  const totalRevenue = useMemo(() => {
    const rows = ordersResult?.data ?? [];
    return rows.reduce((sum: number, row: any) => {
      const amount = parseFloat(row?.totalFinal ?? row?.total ?? "0");
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  }, [ordersResult?.data]);

  const summaryCards = useMemo(
    () => [
      { label: "Total Customers", value: customers?.meta?.total ?? "—" },
      { label: "Total Vendors", value: vendors?.meta?.total ?? "—" },
      { label: "Total Orders", value: ordersResult?.meta?.total ?? ordersResult?.data?.length ?? "—" },
      { label: "Total Revenue", value: ordersResult && !loadingOrders ? `$ ${totalRevenue.toLocaleString()}` : "—" },
      { label: "Total Bookings", value: bookingsResult?.meta?.total ?? bookingsResult?.data?.length ?? "—" },
    ],
    [customers?.meta?.total, vendors?.meta?.total, ordersResult?.meta?.total, ordersResult?.data?.length, loadingOrders, totalRevenue, bookingsResult?.meta?.total, bookingsResult?.data?.length],
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
            table { width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h3>${filename}</h3>
          <table>
            <thead>
              <tr>${headers.map((c) => `<th>${c}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (r) => `<tr>
                    ${headers
                      .map((h) => `<td>${(r as any)[h] ?? (r as any)[h.toLowerCase()] ?? ""}</td>`)
                      .join("")}
                  </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>`;
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {loadingCustomers || loadingVendors || loadingOrders || loadingBookings ? "…" : card.value}
            </p>
          </div>
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
                  formatter={(value: number, key) => {
                    if (key === "revenue") return [`$${value.toLocaleString()}`, "Revenue"];
                    if (key === "orders") return [value, "Orders"];
                    if (key === "customers") return [value, "Customers"];
                    if (key === "vendors") return [value, "Vendors"];
                    if (key === "bookings") return [value, "Bookings"];
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

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">Reports Table</p>
            <p className="text-xs text-slate-500">Latest orders for the selected period.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
              onClick={() => downloadCsv(orders, "orders-report")}
            >
              Orders CSV
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
              onClick={() => downloadPdf(orders, "orders-report", ["id", "status", "totalFinal", "createdAt"])}
            >
              Orders PDF
            </button>
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                {["Order", "Vendor", "Status", "Total", "Created"].map((col) => (
                  <th key={col} className="px-4 py-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loadingOrders && (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={5}>
                    Loading report…
                  </td>
                </tr>
              )}
              {!loadingOrders &&
                (orders.length ? (
                  orders.map((row: any) => {
                    const created = row?.createdAt ? dayjs(row.createdAt).format("DD MMM YYYY, HH:mm") : "—";
                    const total = parseFloat(row?.totalFinal ?? row?.total ?? "0");
                    return (
                      <tr key={row?.id ?? row?.orderNumber}>
                        <td className="px-4 py-3 text-slate-700">{row?.orderNumber ?? row?.id ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-700">{row?.vendor?.businessName ?? "—"}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{row?.status ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-700">{Number.isFinite(total) ? `$${total.toLocaleString()}` : "—"}</td>
                        <td className="px-4 py-3 text-slate-500">{created}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={5}>
                      No rows yet. Try adjusting the filters.
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default AdminReportsPage;
