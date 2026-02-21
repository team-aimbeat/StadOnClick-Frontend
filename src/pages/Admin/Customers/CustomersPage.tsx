import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Users } from "lucide-react";
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineCurrencyDollar } from "react-icons/hi2";

import type { ColumnConfig, DataTableSortStatus, FilterConfig, RowData } from "@/components/shared/DataTable";
import { ListingPage } from "@/components/shared/ListingPage";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import {
  type AdminCustomerStatus,
  useListCustomersQuery,
} from "@/features/admin/customers/api/customersApi";

type CustomerRow = RowData & {
  id: string;
  name: string;
  email: string;
  profileImageUrl?: string | null;
  phone: string;
  status: AdminCustomerStatus;
  city: string;
  totalOrders: number;
  totalBookings: number;
  totalLeads: number;
  walletBalance: number;
  createdAt: string;
  lastLoginAt: string | null;
};

const BACKEND_SORT_KEYS = new Set(["createdAt", "updatedAt", "firstName", "email", "lastLoginAt"]);

const STATUS_OPTIONS: Array<{ label: string; value: string; status?: AdminCustomerStatus }> = [
  { label: "All", value: "all" },
  { label: "Active", value: "active", status: "ACTIVE" },
  { label: "Pending", value: "pending", status: "PENDING_ONBOARDING" },
  { label: "Disabled", value: "disabled", status: "DISABLED" },
  { label: "Deleted", value: "deleted", status: "DELETED" },
];

const money = new Intl.NumberFormat("en-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

const statusTone: Record<AdminCustomerStatus, { bg: string; text: string; ring: string; label: string }> = {
  ACTIVE: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", label: "Active" },
  PENDING_ONBOARDING: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
    label: "Pending",
  },
  DISABLED: { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200", label: "Disabled" },
  DELETED: { bg: "bg-slate-100", text: "text-slate-700", ring: "ring-slate-200", label: "Deleted" },
};

export default function CustomersPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setPageTitle("Customers"));
  }, [dispatch]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });
  const [dateRangeLabel, setDateRangeLabel] = useState<string>("");

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchTerm), 450);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const statusQuery = STATUS_OPTIONS.find((option) => option.value === statusFilter)?.status;
  const sortByQuery = BACKEND_SORT_KEYS.has(sortStatus.columnAccessor)
    ? (sortStatus.columnAccessor as "createdAt" | "updatedAt" | "firstName" | "email" | "lastLoginAt")
    : "createdAt";

  const { data, isLoading, isFetching, isError } = useListCustomersQuery(
    {
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      status: statusQuery,
      sortBy: sortByQuery,
      sortOrder: sortStatus.direction,
    },
    { refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const customers = useMemo<CustomerRow[]>(() => {
    const rows = data?.data ?? [];
    return rows.map((customer) => ({
      id: customer.id,
      name:
        customer.nickName?.trim() ||
        `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
        "Customer",
      email: customer.email,
      profileImageUrl: customer.profileImageUrl ?? null,
      phone: customer.phone ?? "-",
      status: customer.status,
      city: customer.city?.name ? `${customer.city.name} (${customer.city.countryCode})` : "-",
      totalOrders: Number(customer._count?.orders ?? 0),
      totalBookings: Number(customer._count?.serviceBookings ?? 0),
      totalLeads: Number(customer._count?.leads ?? 0),
      walletBalance: Number(customer.walletBalance ?? 0),
      createdAt: customer.createdAt,
      lastLoginAt: customer.lastLoginAt ?? null,
    }));
  }, [data]);

  const totals = useMemo(() => {
    const totalCustomers = Number(data?.meta?.total ?? 0);
    const activeCustomers = customers.filter((customer) => customer.status === "ACTIVE").length;
    const pendingCustomers = customers.filter((customer) => customer.status === "PENDING_ONBOARDING").length;
    const totalWallet = customers.reduce((sum, customer) => sum + customer.walletBalance, 0);

    return { totalCustomers, activeCustomers, pendingCustomers, totalWallet };
  }, [customers, data?.meta?.total]);

  const columns = useMemo<ColumnConfig[]>(
    () => [
      {
        key: "name",
        title: "Customer",
        sortable: true,
        render: (_value, row) => {
          const r = row as CustomerRow;
          const initials = (r.name?.trim()?.charAt(0) || "C").toUpperCase();
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700">
                {r.profileImageUrl ? (
                  <img
                    src={r.profileImageUrl}
                    alt={r.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-semibold text-slate-900">{r.name}</span>
                <span className="truncate text-xs font-medium text-slate-500">{r.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        key: "status",
        title: "Status",
        sortable: true,
        render: (_value, row) => {
          const r = row as CustomerRow;
          const tone = statusTone[r.status];
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
        key: "phone",
        title: "Phone",
        sortable: false,
      },
      {
        key: "city",
        title: "City",
        sortable: false,
      },
      {
        key: "totalOrders",
        title: "Orders",
        sortable: true,
      },
      {
        key: "totalBookings",
        title: "Bookings",
        sortable: true,
      },
      {
        key: "walletBalance",
        title: "Wallet",
        sortable: true,
        render: (value) => <span className="font-semibold text-slate-900">{money.format(Number(value ?? 0))}</span>,
      },
      {
        key: "lastLoginAt",
        title: "Last Login",
        sortable: true,
        render: (value) =>
          value ? (
            <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
              <CalendarClock className="h-4 w-4 text-slate-500" />
              {new Date(String(value)).toLocaleDateString("en-SE", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          ) : (
            "-"
          ),
      },
      {
        key: "createdAt",
        title: "Joined",
        sortable: true,
        render: (value) =>
          value
            ? new Date(String(value)).toLocaleDateString("en-SE", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-",
      },
    ],
    [],
  );

  const filters = useMemo<FilterConfig[]>(
    () => [
      {
        key: "status",
        label: "Status",
        options: STATUS_OPTIONS.map((option) => ({ label: option.label, value: option.value })),
      },
    ],
    [],
  );

  const sortOptions = useMemo(
    () => [
      { key: "createdAt", label: "Joined (Newest first desc)" },
      { key: "lastLoginAt", label: "Last login (Recent first desc)" },
      { key: "email", label: "Email (A-Z)" },
      { key: "firstName", label: "Name (A-Z)" },
    ],
    [],
  );

  const summaryLeft = useMemo(() => {
    if (isLoading) return "Loading customers...";
    if (isError) return "Failed to load customers. Please refresh.";
    if (isFetching) return "Refreshing customers...";
    if (dateRangeLabel) return `Range: ${dateRangeLabel}`;
    return "Use search and filters to find customers quickly.";
  }, [dateRangeLabel, isError, isFetching, isLoading]);

  return (
    <ListingPage
      title="Customers"
      breadCrumbTitle="Admin / Customers"
      description="View all marketplace customers, status, activity, and wallet snapshot."
      stats={[
        {
          title: "Total Customers",
          value: totals.totalCustomers,
          subtitle: "Registered users",
          icon: Users,
          accentColor: "purple",
        },
        {
          title: "Active",
          value: totals.activeCustomers,
          subtitle: "Ready to book",
          icon: HiOutlineCheckCircle,
          accentColor: "green",
        },
        {
          title: "Pending",
          value: totals.pendingCustomers,
          subtitle: "Onboarding in progress",
          icon: HiOutlineClock,
          accentColor: "yellow",
        },
        {
          title: "Wallet Total",
          value: money.format(totals.totalWallet),
          subtitle: "Visible page sum",
          icon: HiOutlineCurrencyDollar,
          accentColor: "blue",
        },
      ]}
      summary={{
        left: summaryLeft,
        right: `Selected customers: ${selectedRows.length}`,
      }}
      tableProps={{
        title: "Customers",
        breadCrumbTitle: "Admin / Customers Table",
        data: customers,
        columns,
        filters,
        sortOptions,
        searchable: true,
        searchValue: searchTerm,
        onSearch: (value) => setSearchTerm(value),
        showSerialNumber: true,
        initialHiddenColumns: [],
        rowsPerPageOptions: [10, 20, 50],
        defaultRowsPerPage: limit,
        defaultSortColumn: "createdAt",
        sortStatus,
        onSort: setSortStatus,
        onRowSelect: (ids) => setSelectedRows(ids),
        onDateRangeSelect: (range) => setDateRangeLabel(range),
        onFilter: (filters) => {
          setStatusFilter(filters.status ?? "all");
        },
        loading: isLoading || isFetching,
        error: isError ? "Could not load customers." : null,
        onDismissError: () => {},
        controlledPagination: {
          page: data?.meta?.page ?? page,
          pageSize: data?.meta?.limit ?? limit,
          totalPages: data?.meta?.totalPages ?? 1,
          totalRecords: data?.meta?.total ?? 0,
        },
        onPaginationChange: ({ page: nextPage, pageSize }) => {
          setPage(nextPage);
          setLimit(pageSize);
        },
        className: "border border-slate-200",
      }}
    />
  );
}
