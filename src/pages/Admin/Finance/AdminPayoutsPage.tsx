import { useEffect, useState } from "react";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { 
  useGetPayoutsQuery, 
  useApprovePayoutMutation, 
  useRejectPayoutMutation,
  useGetPlatformStatsQuery,
  useGetPlatformStripeBalanceQuery
} from "@/features/admin/finance/api/adminFinanceApi";
import { toast } from "react-hot-toast";
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineArrowPath,
  HiOutlineClock,
  HiOutlineBanknotes,
  HiOutlineArrowTrendingUp,
  HiOutlineExclamationTriangle,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCalendarDays,
} from "react-icons/hi2";
import { DataTable } from "@/components/shared/DataTable";
import dayjs from "dayjs";
import AdminPayoutsSkeleton from "@/components/skeletons/AdminPayoutsSkeleton";

const parseCalendarRange = (value: string): { fromDate?: string; toDate?: string } => {
  const [fromText, toText] = value.split(" - ").map((segment) => segment.trim());
  const parsedFrom = dayjs(fromText, "YYYY/MM/DD");
  const parsedTo = dayjs(toText, "YYYY/MM/DD");

  return {
    fromDate: parsedFrom.isValid() ? parsedFrom.format("YYYY-MM-DD") : undefined,
    toDate: parsedTo.isValid() ? parsedTo.format("YYYY-MM-DD") : undefined,
  };
};

const currencyFormatter = (currency: string, value: number) =>
  `${currency} ${Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const statusButtonClass = (active: boolean) =>
  active
    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900";

const payoutStatusBadgeClass = (status?: string) => {
  const normalized = String(status ?? "").toUpperCase();
  if (normalized === "PAID") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (normalized === "REJECTED") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
};

const summaryCardStyles = [
  {
    shell: "border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_48%,#eef2ff_100%)]",
    iconWrap: "bg-slate-900 text-white",
  },
  {
    shell: "border-cyan-100 bg-[linear-gradient(135deg,#f8fdff_0%,#ecfeff_45%,#e0f2fe_100%)]",
    iconWrap: "bg-cyan-600 text-white",
  },
  {
    shell: "border-emerald-100 bg-[linear-gradient(135deg,#f7fff9_0%,#ecfdf5_46%,#dcfce7_100%)]",
    iconWrap: "bg-emerald-600 text-white",
  },
  {
    shell: "border-amber-100 bg-[linear-gradient(135deg,#fffdf7_0%,#fffbeb_46%,#fef3c7_100%)]",
    iconWrap: "bg-amber-500 text-slate-950",
  },
];

const AdminPayoutsPage = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [limit] = useState(20);
  const [dateRangeLabel, setDateRangeLabel] = useState("");
  const [dateRangeQuery, setDateRangeQuery] = useState<{ fromDate?: string; toDate?: string }>({});

  const [reviewingPayout, setReviewingPayout] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isReviewModalOpening, setIsReviewModalOpening] = useState(false);

  const { data: statsResponse, isLoading: isStatsLoading } = useGetPlatformStatsQuery();
  const { data: response, isLoading: isPayoutsLoading, refetch } = useGetPayoutsQuery({ 
    page, 
    limit, 
    status: statusFilter === "ALL" ? undefined : statusFilter,
    fromDate: dateRangeQuery.fromDate,
    toDate: dateRangeQuery.toDate,
  });
  const { data: pendingPayoutsResponse, isLoading: isPendingPayoutsLoading } = useGetPayoutsQuery({
    page: 1,
    limit: 100,
    status: "PENDING",
    fromDate: dateRangeQuery.fromDate,
    toDate: dateRangeQuery.toDate,
  });

  useEffect(() => {
    if (!reviewingPayout) {
      setIsReviewModalOpening(false);
      return;
    }

    const tick = window.requestAnimationFrame(() => setIsReviewModalOpening(true));
    return () => window.cancelAnimationFrame(tick);
  }, [reviewingPayout]);

  const [approvePayout, { isLoading: isApproving }] = useApprovePayoutMutation();
  const [rejectPayout, { isLoading: isRejecting }] = useRejectPayoutMutation();
  const {
    data: platformStripeBalanceResponse,
    isLoading: isPlatformStripeBalanceLoading,
  } = useGetPlatformStripeBalanceQuery({ currency: "SEK" });

  const handleApprovePayout = async (payoutId: string) => {
    try {
      await approvePayout(payoutId).unwrap();
      toast.success("Settlement authorized & transfer initiated");
      setReviewingPayout(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Authorization failed");
    }
  };

  const handleRejectPayout = async () => {
    if (!reviewingPayout || !rejectionReason.trim()) {
      toast.error("Adjudication reason required for rejection");
      return;
    }

    try {
      await rejectPayout({ payoutId: reviewingPayout.id, reason: rejectionReason }).unwrap();
      toast.success("Settlement rejected. Funds reverted.");
      setReviewingPayout(null);
      setRejectionReason("");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Rejection protocol error");
    }
  };

  const stats = statsResponse?.data;
  const payouts = response?.data?.data || [];
  const meta = response?.data?.meta;
  const pendingPayoutMeta = pendingPayoutsResponse?.data?.meta;
  const platformBalance = platformStripeBalanceResponse?.data?.balances?.find(
    (entry: any) => entry.currency.toLowerCase() === "sek",
  );
  const pendingPayoutRequestCount = pendingPayoutMeta?.total ?? 0;

  const requestedAmount = Number(reviewingPayout?.amount || 0);
  const availableAmount = Number(platformBalance?.available || 0);
  const payoutShortfall = Math.max(0, requestedAmount - availableAmount);
  const isPayoutBlocked = !!reviewingPayout && platformBalance != null && payoutShortfall > 0;
  const hasPlatformBalance = Boolean(platformBalance);
  const isPlatformBalanceHealthy = (platformBalance?.available ?? 0) >= 0;
  const ledgerRows = payouts.map((payout: any, idx: number) => {
    const amount = Number(payout.amount || 0);
    const fees = Number(payout.fees || payout.fee || 0);
    const total = amount - fees;
    const processedDate = payout.processedAt || payout.reviewedAt || payout.updatedAt || payout.createdAt;
    const pageOffset = (page - 1) * limit;
    const rowNumber = idx + 1 + pageOffset;
    const fallbackLabel = `Request ${String(rowNumber).padStart(4, "0")}`;
    const hasChargeId = Boolean(payout.stripeChargeId);
    const hasTransferId = Boolean(payout.stripeTransferId);
    const referenceSource = hasTransferId
      ? payout.stripeTransferId
      : hasChargeId
        ? payout.stripeChargeId
        : payout.vendor?.id;

    return {
      ...payout,
      ledgerAmount: amount,
      ledgerFees: fees,
      ledgerTotal: total,
      ledgerType: "Charge",
      ledgerDescription: payout.vendor?.businessName || payout.vendor?.contactEmail || "Vendor settlement",
      ledgerReference: fallbackLabel,
      ledgerComment:
        payout.rejectionReason?.trim() ||
        payout.reviewNote?.trim() ||
        (payout.status === "PAID" ? "Approved and settled" : payout.status === "PENDING" ? "Awaiting review" : "—"),
      ledgerMeta:
        payout.vendor?.contactEmail ||
        payout.vendor?.businessName ||
        (referenceSource ? `${String(referenceSource).slice(0, 14)}…` : "Settlement request"),
      createdLabel: payout.createdAt ? dayjs(payout.createdAt).format("MMM D") : "—",
      availableOnLabel: payout.status === "PENDING" || payout.status === "APPROVED"
        ? "Pending bank cycle"
        : processedDate
          ? dayjs(processedDate).format("MMM D")
          : "—",
    };
  });

  const highlightedPendingPayouts = ledgerRows
    .filter((payout: any) => payout.status === "PENDING")
    .slice(0, 3);

  const formatLedgerAmount = (value: number, options?: { sign?: boolean; negative?: boolean }) => {
    const sign = options?.sign && value > 0 ? "+" : "";
    const prefix = options?.negative && value > 0 ? "-" : "";
    return `${sign}${prefix}SEK ${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const handleOpenAvailability = () => {
    const dashboardLink =
      import.meta.env.VITE_ADMIN_STRIPE_DASHBOARD_URL?.trim() ||
      "https://dashboard.stripe.com/test/balance";

    window.open(dashboardLink, "_blank", "noopener,noreferrer");
  };

  const clearDateRange = () => {
    setDateRangeLabel("");
    setDateRangeQuery({});
    setPage(1);
  };

  const handleDateRangeSelect = (range: string) => {
    if (!range) {
      clearDateRange();
      return;
    }

    setDateRangeLabel(range);
    setDateRangeQuery(parseCalendarRange(range));
    setPage(1);
  };

  if (
    isStatsLoading ||
    isPlatformStripeBalanceLoading ||
    isPendingPayoutsLoading ||
    (isPayoutsLoading && !response)
  ) {
    return <AdminPayoutsSkeleton />;
  }

  return (
    <DashboardContainer
      className="space-y-8 pb-12"
      style={{ fontFamily: "var(--font-primary)" }}
    >
      <div className="space-y-5">
        <TitleBreadCrumbs title="Payout Review" breadCrumbTitle="Finance / Payouts" className="w-full" />
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.12),_transparent_34%),linear-gradient(135deg,#ffffff_0%,#f8fafc_55%,#eff6ff_100%)] p-6 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Payout operations desk
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                  Review, approve, or reject vendor settlement requests.
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                  Monitor platform liquidity, keep pending payout risk visible, and move payout decisions
                  through a cleaner approval workflow.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <HeaderMetric label="Pending queue" value={String(pendingPayoutRequestCount)} tone="amber" />
                <HeaderMetric
                  label="Available balance"
                  value={currencyFormatter("SEK", platformBalance?.available ?? 0)}
                  tone={isPlatformBalanceHealthy ? "emerald" : "rose"}
                />
                <HeaderMetric label="Selected filter" value={dateRangeLabel || "All dates"} tone="slate" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleOpenAvailability}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              >
                <HiOutlineArrowTopRightOnSquare className="h-4 w-4" />
                Open Stripe balance
              </button>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <HiOutlineArrowPath className={`h-4 w-4 ${isPayoutsLoading ? "animate-spin" : ""}`} />
                Refresh payouts
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: "Outstanding Amount", 
            value: stats?.pendingLiability, 
            icon: <HiOutlineClock className="w-4 h-4" />, 
            sub: "Awaiting payout approval",
            color: "text-slate-900"
          },
          { 
            label: "Settled Volume", 
            value: stats?.totalPayouts, 
            icon: <HiOutlineBanknotes className="w-4 h-4" />, 
            sub: "Completed transfers",
            color: "text-slate-900"
          },
          { 
            label: "Revenue Yield", 
            value: stats?.totalRevenue, 
            icon: <HiOutlineArrowTrendingUp className="w-4 h-4" />, 
            sub: "Platform commission earned",
            color: "text-emerald-600"
          },
          {
            label: "Pending Requests",
            value: pendingPayoutRequestCount,
            icon: <HiOutlineBanknotes className="w-4 h-4" />,
            sub: `${stats?.currency ?? "SEK"} ${(stats?.pendingLiability ?? 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })} awaiting review`,
            color: "text-amber-600",
            isCount: true,
          }
        ].map((item, i) => (
          <div
            key={i}
            className={`rounded-[24px] border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${summaryCardStyles[i].shell}`}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {item.label}
              </span>
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${summaryCardStyles[i].iconWrap}`}>
                {item.icon}
              </div>
            </div>
            {item.isCount ? (
              <p className={`mb-2 text-3xl font-black tracking-tight text-mono-finance ${item.color}`}>
                {Number(item.value ?? 0).toLocaleString()}
              </p>
            ) : (
              <div className="mb-2 flex items-baseline gap-1.5">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{stats?.currency}</span>
                <p className={`text-3xl font-black tracking-tight text-mono-finance ${item.color}`}>
                  {Number(item.value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
            <p className="text-xs leading-5 text-slate-500">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(15,23,42,0.03),transparent)]" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Platform Stripe balance
                </p>
                <h3 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  {currencyFormatter("SEK", platformBalance?.available ?? 0)}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Balance available to cover vendor payout approvals and outgoing transfer cycles.
                </p>
              </div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <HiOutlineBanknotes className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <BalanceTile label="Available" value={currencyFormatter("SEK", platformBalance?.available ?? 0)} />
              <BalanceTile label="Incoming" value={currencyFormatter("SEK", platformBalance?.incoming ?? 0)} />
              <BalanceTile label="Pending" value={currencyFormatter("SEK", platformBalance?.pending ?? 0)} />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                  isPlatformBalanceHealthy
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {isPlatformBalanceHealthy ? "Sufficient liquidity" : "Liquidity warning"}
              </span>
              {!hasPlatformBalance && (
                <span className="text-xs text-slate-500">Live balance fetch failed.</span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Review queue
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">Priority payout requests</h3>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
              {highlightedPendingPayouts.length} shown
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {highlightedPendingPayouts.length ? (
              highlightedPendingPayouts.map((payout: any) => (
                <div key={payout.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">{payout.ledgerDescription}</p>
                      <p className="text-xs text-slate-500">{payout.ledgerMeta}</p>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${payoutStatusBadgeClass(
                        payout.status,
                      )}`}
                    >
                      {payout.status}
                    </span>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Amount</p>
                      <p className="mt-1 text-lg font-semibold text-slate-950">
                        {currencyFormatter(payout.currency ?? "SEK", Number(payout.amount ?? 0))}
                      </p>
                    </div>
                    <button
                      onClick={() => setReviewingPayout(payout)}
                      className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      Review request
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No pending payout requests in the current filter window.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Review filters</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950">Settlement ledger</h3>
            <p className="mt-1 text-sm text-slate-500">
              Filter by payout state and date range before opening the review modal.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {["ALL", "PENDING", "PAID", "REJECTED"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${statusButtonClass(
                  statusFilter === status,
                )}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <HiOutlineCalendarDays className="h-4 w-4" />
            {dateRangeLabel || "All dates"}
          </div>
          {dateRangeLabel && (
            <button
              type="button"
              onClick={clearDateRange}
              className="text-sm font-medium text-slate-600 underline-offset-2 transition hover:text-slate-900 hover:underline"
            >
              Clear range
            </button>
          )}
          <div className="ml-auto text-xs font-medium text-slate-500">
            Showing {payouts.length} entries
          </div>
        </div>
      </div>

        <DataTable
          key={`${statusFilter}-${dateRangeLabel || "all-dates"}`}
          title="Settlement Ledger"
          breadCrumbTitle="Finance / Payouts"
          data={ledgerRows}
          loading={isPayoutsLoading}
          onDateRangeSelect={handleDateRangeSelect}
          columns={[
          {
            key: "ledgerAmount",
            title: "Amount",
            align: "right",
            render: (_: any, payout: any) => (
              <p className="text-sm font-black text-slate-900 text-right text-mono-finance tracking-tight">
                {formatLedgerAmount(payout.ledgerAmount)}
              </p>
            ),
          },
          {
            key: "ledgerFees",
            title: "Fees",
            align: "right",
            render: (_: any, payout: any) => (
              <p className="text-sm font-black text-rose-600 text-right text-mono-finance tracking-tight">
                {formatLedgerAmount(payout.ledgerFees, { negative: true })}
              </p>
            ),
          },
          {
            key: "ledgerTotal",
            title: "Total",
            align: "right",
            render: (_: any, payout: any) => (
              <p className="text-sm font-black text-slate-900 text-right text-mono-finance tracking-tight">
                {formatLedgerAmount(payout.ledgerTotal)}
              </p>
            ),
          },
          {
            key: "ledgerType",
            title: "Type",
            render: (value: string) => (
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                {value || "Charge"}
              </span>
            ),
          },
          {
            key: "createdLabel",
            title: "Description",
            render: (_: any, payout: any) => (
              <div>
                <p className="text-sm text-slate-900 font-medium">{payout.ledgerDescription}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {payout.ledgerMeta}
                </p>
              </div>
            ),
          },
          {
            key: "createdAt",
            title: "Created",
            render: (_: any, payout: any) => (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">{payout.createdLabel}</p>
                <p className="text-[11px] text-slate-500">
                  {payout.createdAt ? dayjs(payout.createdAt).format("HH:mm") : "-"}
                </p>
              </div>
            ),
          },
          {
            key: "availableOnLabel",
            title: "Available on",
            render: (value: string) => (
              <p className="text-sm font-semibold text-slate-700">{value}</p>
            ),
          },
          {
            key: "ledgerComment",
            title: "Comments",
            render: (value: string, payout: any) => {
              const isRejected = payout.status === "REJECTED";
              const isPaid = payout.status === "PAID";

              return (
                <p
                  className={`text-sm font-medium ${
                    isRejected ? "text-rose-600" : isPaid ? "text-emerald-700" : "text-slate-600"
                  }`}
                  title={value}
                >
                  {value || "—"}
                </p>
              );
            },
          },
          {
            key: "actions",
            title: "Action",
            align: "right",
            cellClassName: "w-[220px]",
            render: (_: any, payout: any) => (
              <div className="w-full flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenAvailability()}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50"
                  title="Open Stripe dashboard to see fund availability"
                >
                  Check availability
                </button>
                {payout.status === 'PENDING' && (
                  <button
                    onClick={() => setReviewingPayout(payout)}
                    className="rounded-2xl bg-slate-900 px-4 py-2 text-[11px] font-semibold text-white transition hover:bg-slate-800"
                  >
                    Review
                  </button>
                )}
                {payout.status === 'PAID' && (
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center justify-end gap-1.5">
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    Settled
                  </span>
                )}
                {payout.status === 'REJECTED' && (
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
                      <HiOutlineXCircle className="w-4 h-4" />
                      Rejected
                    </span>
                  </div>
                )}
              </div>
            ),
          },
        ]}
          controlledPagination={{
            page: page,
            pageSize: limit,
            totalPages: meta?.totalPages || 1,
            totalRecords: meta?.total || 0,
          }}
          onPaginationChange={({ page: newPage }) => setPage(newPage)}
          selectable={false}
          showSerialNumber={false}
          className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
          noRecordText="No historical transfer events registered"
        />

      {/* Adjudication Modal */}
      {reviewingPayout && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm transition-opacity duration-250 ease-out ${
            isReviewModalOpening ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div
            className={`w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-7 shadow-2xl transition-all duration-250 ease-out ${
              isReviewModalOpening ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Settlement review
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {reviewingPayout.vendor?.businessName}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Approve this payout if platform liquidity is sufficient and reject it only with a clear reason.
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${payoutStatusBadgeClass(
                  reviewingPayout.status,
                )}`}
              >
                {reviewingPayout.status}
              </span>
            </div>
            
            <div className="mt-6 rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_56%,#eef2ff_100%)] p-6 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Payout amount</span>
                <p className="text-4xl font-black text-slate-950 text-mono-finance tracking-tight">
                  <span className="mr-1.5 text-sm text-slate-300">{reviewingPayout.currency}</span>
                  {parseFloat(reviewingPayout.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 uppercase tracking-wider text-[10px]">Reference</p>
                  <p className="text-slate-700 font-semibold mt-1">{reviewingPayout.ledgerReference}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-wider text-[10px]">Submitted</p>
                  <p className="text-slate-700 font-medium mt-1">
                    {dayjs(reviewingPayout.createdAt).format("DD MMM, YYYY • HH:mm")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-1 block mb-2">
                  Rejection reason
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                  placeholder="Optional for approval. Required if you reject this payout."
                  className="w-full finance-input-professional text-xs font-bold bg-white"
                />
              </div>

              <div
                className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                  isPayoutBlocked
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                <HiOutlineExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">
                    {isPayoutBlocked ? "Approval blocked by liquidity" : "Funds available for approval"}
                  </p>
                  <p className="mt-1 text-xs">
                    Available {currencyFormatter("SEK", platformBalance?.available ?? 0)} | Pending{" "}
                    {currencyFormatter("SEK", platformBalance?.pending ?? 0)} | Incoming{" "}
                    {currencyFormatter("SEK", platformBalance?.incoming ?? 0)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleApprovePayout(reviewingPayout.id)}
                  disabled={isApproving || isRejecting || isPayoutBlocked}
                  className="flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-slate-900 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white transition-all hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isApproving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (
                    <>
                      <HiOutlineCheckCircle className="w-4 h-4" />
                      Approve transfer
                    </>
                  )}
                </button>
                <button
                  onClick={handleRejectPayout}
                  disabled={isApproving || isRejecting || !rejectionReason.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-[1.2rem] border border-rose-200 bg-rose-50 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-rose-700 transition-all hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isRejecting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (
                    <>
                      <HiOutlineXCircle className="w-4 h-4" />
                      Reject transfer
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setReviewingPayout(null);
                    setRejectionReason("");
                  }}
                  className="w-full rounded-[1.2rem] border border-slate-200 bg-white py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95"
                >
                  Close review
                </button>
              </div>
              <div className="mt-4 text-[10px] rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-slate-500">
                <p>
                  Platform transfer snapshot: available SEK{" "}
                  {(platformBalance?.available ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                  , pending SEK {(platformBalance?.pending ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                  , incoming SEK {(platformBalance?.incoming ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
                {isPayoutBlocked && (
                  <p className="mt-2 text-rose-600 font-semibold">
                    Approve blocked: shortfall SEK {payoutShortfall.toFixed(2)} (use top-up or smaller payout).
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

function HeaderMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "amber" | "emerald" | "rose" | "slate";
}) {
  const toneClass =
    tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : tone === "emerald"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : tone === "rose"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-slate-200 bg-white text-slate-700";

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClass}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-80">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function BalanceTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export default AdminPayoutsPage;
