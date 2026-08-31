import { useMemo, useState } from "react";
import { Clock3, ReceiptText, UserCheck, Users2 } from "lucide-react";
import type { ColumnConfig, DataTableSortStatus, FilterConfig, RowData } from "@/components/shared/DataTable";
import { ListingPage } from "@/components/shared/ListingPage";
import PortalStatCard from "@/components/shared/PortalStatCard";
import { useListVendorSubscriptionsQuery } from "@/features/adminLeads/api/adminLeadPlans.api";

type SubscriptionTableRow = RowData & {
  id: string;
  vendor: string;
  email: string;
  plan: string;
  leadsPerDay: number;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "SUSPENDED";
  startsAt: string;
  endsAt: string;
  leadsToday: number;
  receiptNumber: string;
};

const statusTone: Record<
  SubscriptionTableRow["status"],
  { bg: string; text: string; ring: string; label: string }
> = {
  ACTIVE: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    label: "Active",
  },
  EXPIRED: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
    label: "Expired",
  },
  CANCELLED: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    ring: "ring-slate-200",
    label: "Cancelled",
  },
  SUSPENDED: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-200",
    label: "Suspended",
  },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function VendorSubscriptionsPage() {
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "startsAt",
    direction: "desc",
  });

  const { data, isLoading, isFetching } = useListVendorSubscriptionsQuery({
    page: 1,
    limit: 100,
    sortOrder: "desc",
  });

  const rows = useMemo<SubscriptionTableRow[]>(
    () =>
      (data?.data ?? []).map((subscription) => ({
        id: subscription.id,
        vendor: subscription.vendor.businessName,
        email: subscription.vendor.user.email,
        plan: subscription.plan.name,
        leadsPerDay: Number(subscription.plan.leadsPerDay ?? 0),
        status: subscription.status,
        startsAt: subscription.startsAt,
        endsAt: subscription.endsAt,
        leadsToday: Number(subscription.leadsToday ?? 0),
        receiptNumber: subscription.receiptNumber ?? "-",
      })),
    [data]
  );

  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((row) => row.status === "ACTIVE").length;
    const expired = rows.filter((row) => row.status === "EXPIRED").length;
    const totalLeadsPerDay = rows.reduce((sum, row) => sum + row.leadsPerDay, 0);
    return [
      { title: "Total Subscriptions", value: total, subtitle: "All vendors", icon: Users2, tone: "blue" as const },
      { title: "Active", value: active, subtitle: "Currently running", icon: UserCheck, tone: "green" as const },
      { title: "Expired", value: expired, subtitle: "Need renewal", icon: Clock3, tone: "amber" as const },
      { title: "Leads / Day", value: totalLeadsPerDay, subtitle: "Across active plans", icon: ReceiptText, tone: "purple" as const },
    ];
  }, [rows]);

  const columns = useMemo<ColumnConfig[]>(
    () => [
      {
        key: "vendor",
        title: "Vendor",
        sortable: true,
        render: (value: string, row: SubscriptionTableRow) => (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">{value}</span>
            <span className="text-xs text-slate-500">{row.email}</span>
          </div>
        ),
      },
      {
        key: "plan",
        title: "Plan",
        sortable: true,
      },
      {
        key: "leadsPerDay",
        title: "Leads / Day",
        sortable: true,
      },
      {
        key: "status",
        title: "Status",
        sortable: true,
        render: (_: string, row: SubscriptionTableRow) => {
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
        key: "startsAt",
        title: "Start Date",
        sortable: true,
        render: (value: string) => <span>{formatDate(value)}</span>,
      },
      {
        key: "endsAt",
        title: "End Date",
        sortable: true,
        render: (value: string) => <span>{formatDate(value)}</span>,
      },
      {
        key: "leadsToday",
        title: "Leads Used Today",
        sortable: true,
      },
      {
        key: "receiptNumber",
        title: "Receipt",
      },
    ],
    []
  );

  const filters = useMemo<FilterConfig[]>(
    () => [
      {
        key: "status",
        label: "Status",
        options: [
          { label: "All", value: "all" },
          { label: "Active", value: "active" },
          { label: "Expired", value: "expired" },
          { label: "Cancelled", value: "cancelled" },
          { label: "Suspended", value: "suspended" },
        ],
      },
    ],
    []
  );

  return (
      <ListingPage
        title="Vendor Subscriptions"
        breadCrumbTitle="Admin / Leads & Monetization / Vendor Subscriptions"
        description="List of vendors who purchased lead subscription plans."
        stats={[]}
        statsSlot={
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <PortalStatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
                icon={stat.icon}
                tone={stat.tone}
              />
            ))}
          </div>
        }
        summary={{
        left: "Track plan adoption and renewal status.",
        right: `Showing ${rows.length} subscriptions${isLoading || isFetching ? " | syncing..." : ""}`,
      }}
      tableProps={{
        title: "Vendor Subscriptions",
        breadCrumbTitle: "Leads & Monetization / Vendor Subscriptions",
        data: rows,
        columns,
        filters,
        searchable: true,
        showSerialNumber: true,
        rowsPerPageOptions: [10, 20, 50],
        defaultRowsPerPage: 10,
        defaultSortColumn: "startsAt",
        sortStatus,
        onSort: setSortStatus,
        className: "border border-slate-200",
      }}
    />
  );
}
