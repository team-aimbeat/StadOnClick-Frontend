import { useEffect, useMemo, useState } from "react";
import { Eye, Mail, Phone } from "lucide-react";
import {
  HiOutlineBriefcase,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineCurrencyRupee,
  HiOutlineSparkles,
} from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import StatsCard from "@/components/shared/StatsCard";
import {
  ColumnConfig,
  DataTable,
  DataTableSortStatus,
  FilterConfig,
  RowData,
} from "@/components/shared/DataTable";
import { ActionConfig } from "@/types/Table/action";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";

type JobRow = RowData & {
  id: string;
  customer: string;
  city: string;
  service: string;
  status: string;
  channel: string;
  amount: number;
  submittedOn: string;
  rating?: number;
  email?: string;
  phone?: string;
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const jobRows: JobRow[] = [
  {
    id: "JOB-1042",
    customer: "Aarav Kulkarni",
    city: "Mumbai",
    service: "AC Repair & Gas Refill",
    status: "In Progress",
    channel: "Marketplace",
    amount: 7200,
    submittedOn: "2025-01-18T09:10:00Z",
    rating: 4.7,
    email: "aarav.k@example.com",
    phone: "+91 98111 22110",
  },
  {
    id: "JOB-1041",
    customer: "Meera Nair",
    city: "Bengaluru",
    service: "Deep Cleaning - 2BHK",
    status: "Completed",
    channel: "Organic",
    amount: 8200,
    submittedOn: "2025-01-17T17:45:00Z",
    rating: 5,
    email: "meera.n@example.com",
    phone: "+91 98765 00123",
  },
  {
    id: "JOB-1040",
    customer: "Prakash Sharma",
    city: "Pune",
    service: "Pest Control - Full Home",
    status: "Awaiting Payment",
    channel: "Phone",
    amount: 6400,
    submittedOn: "2025-01-16T12:30:00Z",
    rating: 4.2,
    email: "prakash.s@example.com",
    phone: "+91 97664 32001",
  },
  {
    id: "JOB-1039",
    customer: "Sakshi Rawat",
    city: "Delhi",
    service: "Sofa Shampoo & Fabric Guard",
    status: "New",
    channel: "Marketplace",
    amount: 4800,
    submittedOn: "2025-01-15T08:15:00Z",
    rating: 4.5,
    email: "sakshi.r@example.com",
    phone: "+91 98117 00456",
  },
  {
    id: "JOB-1038",
    customer: "Nikhil Shah",
    city: "Ahmedabad",
    service: "Car Detailing - Premium",
    status: "Completed",
    channel: "WhatsApp",
    amount: 5600,
    submittedOn: "2025-01-13T14:05:00Z",
    rating: 4.9,
    email: "nikhil.s@example.com",
    phone: "+91 98765 12003",
  },
  {
    id: "JOB-1037",
    customer: "Ananya Gupta",
    city: "Jaipur",
    service: "Home Painting - 2BHK",
    status: "In Progress",
    channel: "Referral",
    amount: 12600,
    submittedOn: "2025-01-12T10:00:00Z",
    rating: 4.4,
    email: "ananya.g@example.com",
    phone: "+91 98989 76007",
  },
  {
    id: "JOB-1036",
    customer: "Vishal Mehta",
    city: "Chennai",
    service: "RO Service & Filter Change",
    status: "New",
    channel: "Organic",
    amount: 3100,
    submittedOn: "2025-01-11T07:55:00Z",
    rating: 4,
    email: "vishal.m@example.com",
    phone: "+91 98202 11009",
  },
  {
    id: "JOB-1035",
    customer: "Mahesh Iyer",
    city: "Hyderabad",
    service: "Kitchen Deep Cleaning",
    status: "Awaiting Payment",
    channel: "Marketplace",
    amount: 6900,
    submittedOn: "2025-01-10T18:40:00Z",
    rating: 4.6,
    email: "mahesh.i@example.com",
    phone: "+91 97777 88991",
  },
  {
    id: "JOB-1034",
    customer: "Kiran Desai",
    city: "Surat",
    service: "Bathroom Deep Cleaning",
    status: "Completed",
    channel: "Referral",
    amount: 4300,
    submittedOn: "2025-01-09T15:25:00Z",
    rating: 5,
    email: "kiran.d@example.com",
    phone: "+91 96666 55001",
  },
  {
    id: "JOB-1033",
    customer: "Rohit Kulkarni",
    city: "Pune",
    service: "AC Service - Annual Plan",
    status: "In Progress",
    channel: "Phone",
    amount: 9800,
    submittedOn: "2025-01-08T11:20:00Z",
    rating: 4.3,
    email: "rohit.k@example.com",
    phone: "+91 95555 99002",
  },
];

const statusTone: Record<
  string,
  { bg: string; text: string; ring: string; label: string }
> = {
  New: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
    label: "New",
  },
  "In Progress": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-200",
    label: "In Progress",
  },
  "Awaiting Payment": {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    label: "Awaiting Payment",
  },
  Completed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    label: "Completed",
  },
};

export default function VendorTableShowcase() {
  const dispatch = useAppDispatch();
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "submittedOn",
    direction: "desc",
  });
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [dateRangeLabel, setDateRangeLabel] = useState<string>("");

  useEffect(() => {
    dispatch(setPageTitle("Jobs & Tasks"));
  }, [dispatch]);

  const totals = useMemo(() => {
    const completed = jobRows.filter((job) => job.status === "Completed").length;
    const open = jobRows.filter((job) => job.status === "In Progress" || job.status === "New").length;
    const awaiting = jobRows.filter((job) => job.status === "Awaiting Payment").length;
    const gross = jobRows.reduce((sum, job) => sum + job.amount, 0);

    return { completed, open, awaiting, gross };
  }, []);

  const columns = useMemo<ColumnConfig[]>(() => [
    {
      key: "id",
      title: "Job ID",
      sortable: true,
      render: (value: string) => (
        <span className="font-semibold text-slate-900">{value}</span>
      ),
    },
    {
      key: "customer",
      title: "Customer",
      sortable: true,
      render: (value: string, row: RowData) => (
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
      render: (_: string, row: RowData) => {
        const tone = statusTone[row.status] ?? statusTone.New;
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
      render: (value: number) => (
        <span className="font-semibold text-slate-900">{currency.format(value)}</span>
      ),
    },
    {
      key: "submittedOn",
      title: "Submitted",
      sortable: true,
      render: (value: string) => (
        <span className="text-sm font-medium text-slate-700">
          {new Date(value).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "rating",
      title: "Rating",
      sortable: true,
      render: (value?: number) => (
        <span className="text-sm font-semibold text-slate-800">{value ? value.toFixed(1) : "———"}</span>
      ),
    },
  ], []);

  const filters = useMemo<FilterConfig[]>(() => [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "All", value: "all" },
        { label: "New", value: "new" },
        { label: "In Progress", value: "in progress" },
        { label: "Awaiting Payment", value: "awaiting payment" },
        { label: "Completed", value: "completed" },
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

  const sortOptions = useMemo(() => [
    { key: "submittedOn", label: "Submitted (Newest first desc)" },
    { key: "amount", label: "Value (High-Low desc)" },
    { key: "customer", label: "Customer (A-Z)" },
  ], []);

  const actions = useMemo<ActionConfig<JobRow>[]>(() => [
    {
      title: "View",
      icon: Eye,
      onClick: (row) => console.log("View job", row.id),
    },
    {
      title: "Email",
      icon: Mail,
      onClick: (row) => console.log("Email", row.email ?? "N/A"),
    },
    {
      title: "Call",
      icon: Phone,
      onClick: (row) => console.log("Call", row.phone ?? "N/A"),
    },
  ], []);

  return (
    <DashboardContainer className="space-y-6 pb-10">
      <div className="space-y-2">
        <TitleBreadCrumbs title="Jobs & Tasks" breadCrumbTitle="Vendor / Jobs" />
        <p className="text-sm text-slate-600">
          Track live jobs, spot stuck payments, and action customer follow-ups from a single table.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Open Jobs"
          value={totals.open}
          subtitle="New + In Progress"
          icon={HiOutlineBriefcase}
          accentColor="blue"
        />
        <StatsCard
          title="Awaiting Payment"
          value={totals.awaiting}
          subtitle="Collect dues"
          icon={HiOutlineCurrencyRupee}
          accentColor="yellow"
        />
        <StatsCard
          title="Completed"
          value={totals.completed}
          subtitle="Closed in the last week"
          icon={HiOutlineCheckCircle}
          accentColor="green"
        />
        <StatsCard
          title="Gross Value"
          value={currency.format(totals.gross)}
          subtitle="All jobs in view"
          icon={HiOutlineSparkles}
          accentColor="purple"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
        <div className="inline-flex items-center gap-2">
          <HiOutlineCalendarDays className="h-5 w-5 text-slate-500" />
          <span>
            {dateRangeLabel ? `Range: ${dateRangeLabel}` : "Pick a quick date range from the table header."}
          </span>
        </div>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          Selected jobs: {selectedJobs.length}
        </span>
      </div>

      <DataTable
        title="Recent Jobs"
        breadCrumbTitle="Operations / Jobs Table"
        data={jobRows}
        columns={columns}
        filters={filters}
        sortOptions={sortOptions}
        searchable
        showSerialNumber
        initialHiddenColumns={[]}
        rowsPerPageOptions={[5, 8, 15]}
        defaultRowsPerPage={8}
        defaultSortColumn="submittedOn"
        sortStatus={sortStatus}
        onSort={setSortStatus}
        actions={actions}
        onRowSelect={(ids) => setSelectedJobs(ids)}
        onDateRangeSelect={(range) => setDateRangeLabel(range)}
        className="border border-slate-200"
      />
    </DashboardContainer>
  );
}

