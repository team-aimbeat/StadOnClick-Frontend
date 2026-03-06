import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { HiOutlineExclamationTriangle, HiOutlineArrowDownTray, HiOutlineArrowUpTray, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { 
  useGetWalletSummaryQuery, 
  useGetWalletTransactionsQuery, 
  useRequestPayoutMutation 
} from "@/features/vendorWallet/api/walletApi";
import { useGetStripeStatusQuery } from "@/features/vendorStripe/api/vendorStripeApi";
import { toast } from "react-hot-toast";
import { DataTable } from "@/components/shared/DataTable";
import dayjs from "dayjs";

const VendorPayouts = () => {
  const dispatch = useAppDispatch();
  const [requestAmount, setRequestAmount] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateRangeLabel, setDateRangeLabel] = useState("");
  const [dateRangeQuery, setDateRangeQuery] = useState<{ fromDate?: string; toDate?: string }>({});

  const { data: summaryData, isLoading: isSummaryLoading } = useGetWalletSummaryQuery();
  const { data: stripeData, isLoading: isStripeLoading } = useGetStripeStatusQuery();
  const { data: transactionsData, isLoading: isTransactionsLoading } = useGetWalletTransactionsQuery({
    page: 1,
    limit: 50,
    fromDate: dateRangeQuery.fromDate,
    toDate: dateRangeQuery.toDate,
  });
  const [requestPayout, { isLoading: isPayoutRequesting }] = useRequestPayoutMutation();

  useEffect(() => {
    dispatch(setPageTitle("Settlements"));
  }, [dispatch]);

  const summary = summaryData?.data;
  const stripe = stripeData?.data;
  const payoutHistory = (transactionsData?.data || []).filter(tx => tx.type === 'PAYOUT' || tx.type === 'REFUND');
  const readablePayoutRows = payoutHistory.map((tx: any, idx: number) => {
    const sanitizePayoutText = (value: string) => {
      if (!value) return value;

      return value
        .replace(/ch_[A-Za-z0-9]+/g, (match) => `${match.slice(0, 8)}…`)
        .replace(
          /[0-9a-fA-F]{8,}-[0-9a-fA-F-]{27,}/g,
          (match) => `${match.slice(0, 6)}…${match.slice(-4)}`,
        );
    };

    return {
      ...tx,
      displayReference: `Txn ${String(idx + 1).padStart(4, "0")}`,
      displayAmount: Number(tx.amount || 0),
      displayDescription: tx.description ? sanitizePayoutText(tx.description) : "Payout adjustment",
    };
  });
  const filteredPayoutRows = readablePayoutRows.filter((tx: any) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "PAID") return tx.status === "CONFIRMED";
    return tx.status === statusFilter;
  });
  const handleDateRangeSelect = (range: string) => {
    const [fromText, toText] = range.split(" - ").map((segment) => segment.trim());
    const parsedFrom = dayjs(fromText, "YYYY/MM/DD");
    const parsedTo = dayjs(toText, "YYYY/MM/DD");

    setDateRangeLabel(range);
    setDateRangeQuery({
      fromDate: parsedFrom.isValid() ? parsedFrom.format("YYYY-MM-DD") : undefined,
      toDate: parsedTo.isValid() ? parsedTo.format("YYYY-MM-DD") : undefined,
    });
  };

  const stripeConnected = stripe?.payoutsEnabled;

  const handleConfirm = async () => {
    const amount = parseFloat(requestAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid settlement amount");
      return;
    }

    try {
      await requestPayout({ amount }).unwrap();
      toast.success("Settlement request acknowledged");
      setModalOpen(false);
      setRequestAmount("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Transfer protocols failed");
    }
  };

  if (isSummaryLoading || isStripeLoading || isTransactionsLoading) {
    return (
      <DashboardContainer className="space-y-8 pb-12">
        {/* Header Skeleton */}
        <div className="space-y-2">
           <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
           <div className="h-8 w-48 bg-slate-100 rounded-lg animate-pulse" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Panel Skeleton */}
          <div className="finance-card rounded-2xl p-8 space-y-8 border border-slate-100">
             <div>
                <div className="h-3 w-32 bg-slate-100 rounded animate-pulse mb-3" />
                <div className="h-10 w-40 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-3 w-32 bg-slate-100 rounded animate-pulse mt-3" />
             </div>
             <div className="space-y-3">
                <div className="h-12 w-full bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-10 w-full bg-slate-50 rounded-lg animate-pulse" />
             </div>
          </div>

          {/* Right Panel Skeleton */}
          <div className="lg:col-span-2 space-y-6">
             <div className="finance-card rounded-2xl p-8 border border-slate-100">
                <div className="flex justify-between mb-8">
                   <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
                   <div className="h-6 w-24 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="flex gap-4">
                   <div className="flex-1 h-16 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
                   <div className="w-40 h-16 bg-slate-100 rounded-2xl animate-pulse" />
                </div>
             </div>

             <div className="finance-card rounded-2xl overflow-hidden border-slate-100">
                <div className="h-12 bg-slate-50/50 border-b border-slate-100 w-full" />
                <div className="p-0">
                   {[...Array(5)].map((_, i) => (
                     <div key={i} className="flex justify-between px-6 py-5 border-b border-slate-50">
                        <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                        <div className="h-5 w-20 rounded-full bg-slate-100 animate-pulse" />
                        <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-8 pb-12">
      <TitleBreadCrumbs title="Settlement Control" breadCrumbTitle="Finance / Payouts" />
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Control Panel */}
        <div className="finance-card rounded-2xl p-8 space-y-8">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Awaiting Release</p>
            <p className="text-metric text-4xl tracking-tighter">
              <span className="text-sm font-medium opacity-30 mr-1.5">{summary?.currency}</span>
              {summary?.pendingPayoutBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-2">Held balance awaiting manual release</p>
          </div>
          
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              disabled={!stripeConnected || !summary?.availableBalance}
              className="w-full rounded-xl bg-slate-950 py-4 text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all hover:bg-slate-800 disabled:opacity-10 active:scale-95 flex items-center justify-center gap-2"
            >
              <HiOutlineArrowUpTray className="w-4 h-4" />
              Request Transfer
            </button>
            <NavLink to="/vendor/wallet" className="flex items-center justify-center gap-2 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
              <HiOutlineArrowDownTray className="w-4 h-4" />
              View Full Ledger
            </NavLink>
          </div>

          {!stripeConnected && (
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-[10px] font-bold text-amber-700 leading-relaxed">
              <div className="flex items-center gap-2 mb-2">
                 <HiOutlineExclamationTriangle className="w-4 h-4" />
                 Compliance Required
              </div>
              Stripe payout infrastructure is not yet active. Complete onboarding to enable transfers.
              <div className="mt-3">
                <NavLink to="/vendor/stripe" className="inline-flex items-center gap-1 text-slate-950 font-black hover:underline uppercase tracking-tighter">
                  Sync Stripe Console &rarr;
                </NavLink>
              </div>
            </div>
          )}
        </div>

        {/* Right Action Hub */}
        <div className="lg:col-span-2 space-y-6">
          <div className="finance-card rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-bold text-slate-900">Manual release for held funds</h3>
               <div className="px-3 py-1 rounded bg-slate-950 text-[10px] font-bold text-white uppercase tracking-wider leading-none">
                  Manual Entry
               </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-300 group-focus-within:text-slate-950 transition-colors">{summary?.currency}</span>
                <input
                  type="number"
                  value={requestAmount}
                  placeholder="0.00"
                  onChange={(event) => setRequestAmount(event.target.value)}
                  className="w-full finance-input-professional text-3xl text-metric pl-14"
                />
              </div>
              <button
                type="button"
                disabled={!stripeConnected || !requestAmount}
                onClick={() => setModalOpen(true)}
                className="rounded-2xl bg-slate-950 px-10 py-5 text-[11px] font-black text-white uppercase tracking-[0.2em] transition-all hover:bg-slate-800 disabled:opacity-10 active:scale-95 shadow-lg shadow-slate-100"
              >
                Submit Protocol
              </button>
            </div>
            <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-between">
              <span>Transferable Volume: {summary?.currency} {summary?.availableBalance?.toLocaleString() || "0.00"}</span>
              <button onClick={() => setRequestAmount(summary?.availableBalance?.toString() || "")} className="text-indigo-600 hover:text-indigo-800 transition-colors">Apply Max</button>
            </p>
          </div>

          <div className="finance-card rounded-2xl overflow-hidden border-slate-100">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Settlement Audit Log</span>
              <span className="text-xs text-slate-500 font-medium">
                {dateRangeLabel ? `Range: ${dateRangeLabel}` : "Recent 50 Events"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-6 pt-4">
              <div className="flex gap-6">
                {["ALL", "PENDING", "PAID", "REJECTED"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`relative pb-3 text-[11px] font-black uppercase tracking-widest transition-all ${
                      statusFilter === status
                        ? "text-slate-900"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {status}
                    {statusFilter === status && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-slate-900" />
                    )}
                  </button>
                ))}
              </div>
              <span className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Showing {filteredPayoutRows.length} entries
              </span>
            </div>
            <DataTable
              title="Settlement Audit Log"
              breadCrumbTitle="Finance / History"
              data={filteredPayoutRows}
              loading={isTransactionsLoading}
              onDateRangeSelect={handleDateRangeSelect}
              columns={[
                {
                  key: "id",
                  title: "Reference",
                  render: (_: any, tx: any) => (
                    <span className="font-mono text-mono-finance text-[10px] text-slate-400">
                      {tx.displayReference}
                    </span>
                  ),
                },
                {
                  key: "amount",
                  title: "Volume",
                  render: (value: any) => (
                    <div className="font-black text-slate-950 text-mono-finance text-sm tracking-tight text-right pr-12">
                      {summary?.currency} {Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  ),
                },
                {
                  key: "status",
                  title: "State",
                  render: (value: string) => (
                    <span className={`status-indicator ${
                      value === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' : 
                      value === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${
                         value === "CONFIRMED" ? "bg-emerald-500" : value === "PENDING" ? "bg-amber-500" : "bg-rose-500"
                      }`} />
                      {value}
                    </span>
                  ),
                },
                {
                  key: "createdAt",
                  title: "Logged",
                  render: (value: string) => (
                    <span className="text-slate-500 font-medium">
                      {dayjs(value).format('DD MMM')}
                    </span>
                  ),
                },
                {
                  key: "description",
                  title: "Adjudication",
                  render: (_: any, tx: any) => (
                    <span className="text-slate-400 font-medium italic truncate max-w-[120px]" title={tx.displayDescription || "System Automated"}>
                      {tx.displayDescription || "System Automated"}
                    </span>
                  ),
                },
              ]}
              selectable={false}
              showSerialNumber={false}
              className="finance-card rounded-2xl overflow-hidden border-slate-100"
              noRecordText="No historical transfer events registered"
            />
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-950 tracking-tighter">Authorize Transfer</h3>
            <div className="mt-6 flex items-baseline gap-2 mb-2">
               <span className="text-sm font-medium text-slate-400">{summary?.currency}</span>
               <p className="text-4xl font-metric text-metric tracking-tighter">
                 {parseFloat(requestAmount).toLocaleString() || "0.00"}
               </p>
            </div>
            <p className="mt-4 text-[11px] text-slate-500 font-medium leading-relaxed mb-8">
              Use this only for held funds that were not automatically routed at payment time. The transfer will be sent to your connected Stripe payout account after review.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={isPayoutRequesting}
                onClick={handleConfirm}
                className="w-full rounded-2xl bg-slate-950 py-5 text-[11px] font-black text-white uppercase tracking-[0.2em] transition-all hover:bg-slate-800 active:scale-95 shadow-xl shadow-slate-100 flex items-center justify-center gap-2"
              >
                {isPayoutRequesting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (
                  <>
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    Commit Transfer
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-full rounded-2xl bg-slate-50 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
              >
                 Abort Request
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

export default VendorPayouts;
