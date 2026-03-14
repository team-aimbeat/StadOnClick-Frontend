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
  HiOutlineArrowTrendingUp
} from "react-icons/hi2";
import { DataTable } from "@/components/shared/DataTable";
import dayjs from "dayjs";
import AdminPayoutsSkeleton from "@/components/skeletons/AdminPayoutsSkeleton";

const AdminPayoutsPage = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [limit] = useState(20);

  const [reviewingPayout, setReviewingPayout] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isReviewModalOpening, setIsReviewModalOpening] = useState(false);

  const { data: statsResponse, isLoading: isStatsLoading } = useGetPlatformStatsQuery();
  const { data: response, isLoading: isPayoutsLoading, refetch } = useGetPayoutsQuery({ 
    page, 
    limit, 
    status: statusFilter === "ALL" ? undefined : statusFilter 
  });
  const { data: pendingPayoutsResponse, isLoading: isPendingPayoutsLoading } = useGetPayoutsQuery({
    page: 1,
    limit: 100,
    status: "PENDING",
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

  if (
    isStatsLoading ||
    isPlatformStripeBalanceLoading ||
    isPendingPayoutsLoading ||
    (isPayoutsLoading && !response)
  ) {
    return <AdminPayoutsSkeleton />;
  }

  return (
    <DashboardContainer className="space-y-8 pb-12">
      <div className="space-y-4">
        <TitleBreadCrumbs title="Payout Review" breadCrumbTitle="Finance / Payouts" className="w-full" />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={handleOpenAvailability}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
          >
            Check availability
          </button>
          <button 
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-600 hover:text-slate-900 transition-all active:scale-95 shrink-0"
          >
            <HiOutlineArrowPath className={`w-3.5 h-3.5 ${isPayoutsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
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
          <div key={i} className="finance-card rounded-lg border border-slate-100 p-6 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</span>
              <div className="text-slate-300">{item.icon}</div>
            </div>
            {item.isCount ? (
              <div className="mb-1">
                <p className={`text-3xl font-black tracking-tighter text-mono-finance ${item.color}`}>
                  {Number(item.value ?? 0).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-xs font-bold text-slate-300">{stats?.currency}</span>
                <p className={`text-3xl font-black tracking-tighter text-mono-finance ${item.color}`}>
                  {Number(item.value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
            <p className="text-[10px] text-slate-400 font-medium">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="finance-card relative overflow-hidden rounded-lg border border-slate-200 bg-white p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Platform Stripe (SEK)
            </span>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
              <HiOutlineBanknotes className="w-4 h-4 text-slate-600" />
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Available for transfer</p>
          <p className="mt-1 text-4xl font-black tracking-tight text-slate-900">
            SEK {(platformBalance?.available ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-slate-500">Incoming</p>
              <p className="text-base text-slate-900 font-bold mt-1 leading-tight">
                SEK {platformBalance?.incoming?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-slate-500">Pending</p>
              <p className="text-base text-slate-900 font-bold mt-1 leading-tight">
                SEK {platformBalance?.pending?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] ${
                isPlatformBalanceHealthy
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
              }`}
            >
              {isPlatformBalanceHealthy ? 'Sufficient liquidity' : 'Liquidity warning'}
            </span>
            {!hasPlatformBalance && (
              <span className="text-[10px] text-slate-500">Live balance fetch failed.</span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-1">
        <div className="flex gap-8">
          {['ALL', 'PENDING', 'PAID', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`relative pb-3 text-[11px] font-black uppercase tracking-widest transition-all ${
                statusFilter === status 
                  ? 'text-slate-900' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {status}
              {statusFilter === status && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
              )}
            </button>
          ))}
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Showing {payouts.length} entries
        </div>
      </div>

        <DataTable
          title="Settlement Ledger"
          breadCrumbTitle="Finance / Payouts"
          data={ledgerRows}
        loading={isPayoutsLoading}
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
              <p className="text-sm font-semibold text-slate-700">{payout.createdLabel}</p>
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
            key: "actions",
            title: "Action",
            align: "right",
            cellClassName: "w-[220px]",
            render: (_: any, payout: any) => (
              <div className="w-full flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenAvailability()}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
                  title="Open Stripe dashboard to see fund availability"
                >
                  Check availability
                </button>
                {payout.status === 'PENDING' && (
                  <button
                    onClick={() => setReviewingPayout(payout)}
                    className="px-4 py-2 rounded-lg bg-emerald-700 text-[11px] font-semibold text-white hover:bg-emerald-800 transition-all active:scale-95"
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
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
                      <HiOutlineXCircle className="w-4 h-4" />
                      Rejected
                    </span>
                    {payout.rejectionReason && (
                      <p className="text-[9px] text-rose-400 mt-0.5 max-w-[120px] truncate italic" title={payout.rejectionReason}>
                        {payout.rejectionReason}
                      </p>
                    )}
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
        className="border border-slate-100 rounded-lg overflow-hidden shadow-none"
        noRecordText="No historical transfer events registered"
      />

      {/* Adjudication Modal */}
      {reviewingPayout && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/25 backdrop-blur-[2px] transition-opacity duration-250 ease-out ${
            isReviewModalOpening ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div
            className={`w-full max-w-lg bg-primary-white rounded-[2rem] p-7 shadow-2xl border border-slate-100 transition-all duration-250 ease-out ${
              isReviewModalOpening ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'
            }`}
          >
            <h3 className="text-2xl font-black text-primary-black tracking-tighter">Settlement Adjudication</h3>
            <p className="text-sm text-slate-500 font-medium mt-2 mb-6 leading-relaxed">
              Authorize or decline the fund transfer protocol for <span className="font-semibold text-primary-black">{reviewingPayout.vendor?.businessName}</span>.
            </p>
            
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 mb-7 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Amount</span>
                <p className="text-4xl font-black text-primary-black text-mono-finance tracking-tight">
                  <span className="text-sm text-slate-300 mr-1.5">{reviewingPayout.currency}</span>
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

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleApprovePayout(reviewingPayout.id)}
                  disabled={isApproving || isRejecting || isPayoutBlocked}
                  className="w-full rounded-[1.2rem]  bg-secondary-blue py-4 text-[11px] font-extrabold text-primary-white uppercase tracking-[0.14em] hover:bg-secondary-blue/95 transition-all active:scale-95 flex items-center justify-center gap-2"
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
                  className="w-full rounded-[1.2rem] border-2 border-primary-red bg-primary-red py-4 text-[11px] font-extrabold text-primary-white uppercase tracking-[0.14em] hover:bg-primary-red/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  className="w-full rounded-[1.2rem] border-2 border-slate-900/10 bg-slate-950/0 py-4 text-[11px] font-extrabold text-slate-700 uppercase tracking-[0.14em] hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95"
                >
                  Cancel
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

export default AdminPayoutsPage;
