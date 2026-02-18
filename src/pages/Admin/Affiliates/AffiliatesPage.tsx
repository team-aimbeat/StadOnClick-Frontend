import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Users } from "lucide-react";
import toast from "react-hot-toast";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
} from "react-icons/hi2";

import type {
  ColumnConfig,
  DataTableSortStatus,
  FilterConfig,
  RowData,
} from "@/components/shared/DataTable";
import { ListingPage } from "@/components/shared/ListingPage";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import {
  useListAllAffiliatesQuery,
  useUpdateAffiliateCommissionRateMutation,
  useUpdateAffiliateStatusMutation,
} from "@/features/admin/affiliates/api/affiliatesApi";

type AffiliateRow = RowData & {
  id: string;
  userId: string;
  name: string;
  email: string;
  profileImageUrl?: string | null;
  referralCode: string;
  status: "ACTIVE" | "INACTIVE";
  commissionRate: number;
  totalReferrals: number;
  totalCommissions: number;
  totalClicks: number;
  totalLinks: number;
  totalEarnings: number;
  totalPending: number;
  createdAt: string;
};

const money = new Intl.NumberFormat("en-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

const statusTone: Record<
  AffiliateRow["status"],
  { bg: string; text: string; ring: string; label: string }
> = {
  ACTIVE: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    label: "Active",
  },
  INACTIVE: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    ring: "ring-slate-200",
    label: "Inactive",
  },
};

const toNumberSafe = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export default function AffiliatesPage() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setPageTitle("Affiliates"));
  }, [dispatch]);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [dateRangeLabel, setDateRangeLabel] = useState<string>("");
  const [updatingAffiliateId, setUpdatingAffiliateId] = useState<string | null>(null);
  const [updatingCommissionAffiliateId, setUpdatingCommissionAffiliateId] = useState<string | null>(null);
  const [rateDrafts, setRateDrafts] = useState<Record<string, string>>({});
  const [updateAffiliateStatus] = useUpdateAffiliateStatusMutation();
  const [updateAffiliateCommissionRate] = useUpdateAffiliateCommissionRateMutation();

  const { data, isLoading, isFetching, isError } = useListAllAffiliatesQuery();

  const affiliateRows: AffiliateRow[] = useMemo(() => {
    const rows = data?.data ?? [];
    return rows.map((a: any) => ({
      id: String(a.id),
      userId: String(a.userId),
      name:
        a.user?.nickName?.trim() ||
        [a.user?.firstName?.trim(), a.user?.lastName?.trim()].filter(Boolean).join(" ") ||
        "Affiliate user",
      email: String(a.user?.email ?? "-"),
      profileImageUrl: a.user?.profileImageUrl ?? null,
      referralCode: String(a.referralCode ?? "-"),
      status: (a.status ?? "ACTIVE") as AffiliateRow["status"],
      commissionRate: Number(a.commissionRate ?? 0),
      totalReferrals: Number(a._count?.referrals ?? 0),
      totalCommissions: Number(a._count?.commissions ?? 0),
      totalClicks: Number(a._count?.clicks ?? 0),
      totalLinks: Number(a._count?.links ?? 0),
      totalEarnings: toNumberSafe(a.totalEarnings),
      totalPending: toNumberSafe(a.totalPending),
      createdAt: String(a.createdAt ?? new Date().toISOString()),
    }));
  }, [data]);

  const totals = useMemo(() => {
    const users = Number(data?.meta?.total ?? affiliateRows.length);
    const active = affiliateRows.filter((a) => a.status === "ACTIVE").length;
    const inactive = affiliateRows.filter((a) => a.status === "INACTIVE").length;
    const earnings = affiliateRows.reduce((sum, a) => sum + a.totalEarnings, 0);

    return { active, inactive, earnings, users };
  }, [affiliateRows, data?.meta?.total]);

  useEffect(() => {
    setRateDrafts((prev) => {
      const next = { ...prev };
      for (const row of affiliateRows) {
        if (next[row.id] === undefined) {
          next[row.id] = String((row.commissionRate * 100).toFixed(2));
        }
      }
      return next;
    });
  }, [affiliateRows]);

  const handleStatusChange = useCallback(
    async (affiliateId: string, status: AffiliateRow["status"]) => {
      try {
        setUpdatingAffiliateId(affiliateId);
        await updateAffiliateStatus({ id: affiliateId, status }).unwrap();
        toast.success(`Affiliate marked ${status.toLowerCase()}`);
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to update affiliate status");
      } finally {
        setUpdatingAffiliateId(null);
      }
    },
    [updateAffiliateStatus],
  );

  const handleRateSave = useCallback(
    async (affiliateId: string) => {
      const raw = rateDrafts[affiliateId] ?? "";
      const percent = Number(raw);

      if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
        toast.error("Commission rate must be between 0 and 100");
        return;
      }

      try {
        setUpdatingCommissionAffiliateId(affiliateId);
        await updateAffiliateCommissionRate({
          id: affiliateId,
          commissionRate: percent / 100,
        }).unwrap();
        toast.success("Commission rate updated");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to update commission rate");
      } finally {
        setUpdatingCommissionAffiliateId(null);
      }
    },
    [rateDrafts, updateAffiliateCommissionRate],
  );

  const columns = useMemo<ColumnConfig[]>(
    () => [
      {
        key: "name",
        title: "Affiliate",
        sortable: true,
        render: (_value: any, row: RowData) => {
          const r = row as AffiliateRow;
          const initials = r.name.slice(0, 1).toUpperCase();
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
        key: "referralCode",
        title: "Referral code",
        sortable: true,
        render: (value: any) => (
          <span className="font-semibold tracking-wide text-slate-900">{String(value ?? "-")}</span>
        ),
      },
      {
        key: "status",
        title: "Status",
        sortable: true,
        render: (_value: any, row: RowData) => {
          const r = row as AffiliateRow;
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
        key: "commissionRate",
        title: "Rate",
        sortable: true,
        render: (value: any) => (
          <span className="font-semibold text-slate-900">{(Number(value ?? 0) * 100).toFixed(2)}%</span>
        ),
      },
      {
        key: "totalReferrals",
        title: "Referrals",
        sortable: true,
      },
      {
        key: "totalCommissions",
        title: "Commissions",
        sortable: true,
      },

      {
        key: "totalEarnings",
        title: "Earnings",
        sortable: true,
        render: (value: any) => (
          <span className="font-semibold text-slate-900">{money.format(Number(value ?? 0))}</span>
        ),
      },
      {
        key: "createdAt",
        title: "Joined",
        sortable: true,
        render: (value: any) => (
          <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
            <CalendarClock className="h-4 w-4 text-slate-500" />
            {value
              ? new Date(String(value)).toLocaleString("en-SE", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "-"}
          </div>
        ),
      },
      {
        key: "actions",
        title: "Actions",
        render: (_value: any, row: RowData) => {
          const r = row as AffiliateRow;
          const isUpdating = updatingAffiliateId === r.id;
          const isRateUpdating = updatingCommissionAffiliateId === r.id;
          return (
            <div className="flex items-center gap-2">
              <select
                value={r.status}
                disabled={isUpdating}
                onChange={(event) =>
                  handleStatusChange(r.id, event.target.value as AffiliateRow["status"])
                }
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={rateDrafts[r.id] ?? ""}
                  onChange={(event) =>
                    setRateDrafts((prev) => ({
                      ...prev,
                      [r.id]: event.target.value,
                    }))
                  }
                  className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700"
                />
                <span className="text-[11px] text-slate-500">%</span>
                <button
                  type="button"
                  disabled={isRateUpdating}
                  onClick={() => handleRateSave(r.id)}
                  className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 disabled:opacity-50"
                >
                  {isRateUpdating ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          );
        },
      },
    ],
    [handleRateSave, handleStatusChange, rateDrafts, updatingAffiliateId, updatingCommissionAffiliateId],
  );

  const filters = useMemo<FilterConfig[]>(
    () => [
      {
        key: "status",
        label: "Status",
        options: [
          { label: "All", value: "all" },
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
      },
    ],
    [],
  );

  const sortOptions = useMemo(
    () => [
      { key: "createdAt", label: "Joined (Newest first desc)" },
      { key: "totalEarnings", label: "Earnings (High-Low desc)" },
      { key: "totalReferrals", label: "Referrals (High-Low desc)" },
      { key: "totalClicks", label: "Clicks (High-Low desc)" },
      { key: "name", label: "Name (A-Z)" },
    ],
    [],
  );

  const summaryLeft = useMemo(() => {
    if (isLoading) return "Loading affiliates...";
    if (isError) return "Failed to load affiliates. Please refresh.";
    if (isFetching) return "Refreshing affiliates...";
    if (dateRangeLabel) return `Range: ${dateRangeLabel}`;
    return "Use the quick date selector in the table header.";
  }, [dateRangeLabel, isError, isFetching, isLoading]);

  return (
    <ListingPage
      title="Affiliates"
      breadCrumbTitle="Admin / Affiliates"
      description="Review affiliate users, track referral performance, and manage account status."
      stats={[
        {
          title: "Total Users",
          value: totals.users,
          subtitle: "Registered affiliates",
          icon: Users,
          accentColor: "purple",
        },
        {
          title: "Active",
          value: totals.active,
          subtitle: "Currently earning",
          icon: HiOutlineCheckCircle,
          accentColor: "green",
        },
        {
          title: "Inactive",
          value: totals.inactive,
          subtitle: "Needs follow-up",
          icon: HiOutlineClock,
          accentColor: "yellow",
        },
        {
          title: "Total Earnings",
          value: money.format(totals.earnings),
          subtitle: "Across all affiliates",
          icon: HiOutlineCurrencyDollar,
          accentColor: "blue",
        },
      ]}
      summary={{
        left: summaryLeft,
        right: `Selected affiliates: ${selectedRows.length}`,
      }}
      tableProps={{
        title: "Affiliates",
        breadCrumbTitle: "Admin / Affiliates Table",
        data: affiliateRows,
        columns,
        filters,
        sortOptions,
        searchable: true,
        showSerialNumber: true,
        initialHiddenColumns: [],
        rowsPerPageOptions: [5, 8, 15],
        defaultRowsPerPage: 8,
        defaultSortColumn: "createdAt",
        sortStatus,
        onSort: setSortStatus,
        onRowSelect: (ids) => setSelectedRows(ids),
        onDateRangeSelect: (range) => setDateRangeLabel(range),
        className: "border border-slate-200",
      }}
    />
  );
}
