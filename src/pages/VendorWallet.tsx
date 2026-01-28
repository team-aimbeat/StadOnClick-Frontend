import { useEffect, useState } from "react";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { 
  HiOutlineArrowTrendingUp,
  HiOutlineBanknotes,
  HiOutlineClock,
  HiOutlineArrowDownCircle,
  HiOutlineArrowUpCircle,
  HiOutlineReceiptPercent,
  HiOutlineInformationCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineWallet
} from "react-icons/hi2";
import { 
  useGetWalletSummaryQuery, 
  useGetWalletTransactionsQuery, 
  useRequestPayoutMutation 
} from "@/features/vendorWallet/api/walletApi";
import { toast } from "react-hot-toast";
import { DataTable, ColumnConfig } from "@/components/shared/DataTable";
import dayjs from "dayjs";
import VendorWalletSkeleton from "@/components/skeletons/VendorWalletSkeleton";

const VendorWallet = () => {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");

  const { data: summaryData, isLoading: isSummaryLoading, error: summaryError } = useGetWalletSummaryQuery();
  const { data: transactionsData, isLoading: isTransactionsLoading } = useGetWalletTransactionsQuery({ page, limit: 12 });
  const [requestPayout, { isLoading: isPayoutRequesting }] = useRequestPayoutMutation();

  useEffect(() => {
    dispatch(setPageTitle("Treasury"));
  }, [dispatch]);

  const summary = summaryData?.data;
  const transactions = transactionsData?.data || [];
  const meta = transactionsData?.meta;

  const handlePayoutRequest = async () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount sequence");
      return;
    }
    try {
      await requestPayout({ amount }).unwrap();
      toast.success("Settlement request dispatched");
      setIsPayoutModalOpen(false);
      setPayoutAmount("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Protocol rejection");
    }
  };

  const getTransactionIcon = (type: string, direction: string) => {
    if (type === 'PAYOUT') return <HiOutlineArrowUpCircle className="w-5 h-5 text-rose-500" />;
    if (type === 'PLATFORM_FEE') return <HiOutlineReceiptPercent className="w-5 h-5 text-amber-500" />;
    if (direction === 'CREDIT') return <HiOutlineArrowDownCircle className="w-5 h-5 text-emerald-500" />;
    return <HiOutlineArrowTrendingUp className="w-5 h-5 text-indigo-500" />;
  };

  if (isSummaryLoading || isTransactionsLoading) {
    return (
      <DashboardContainer className="space-y-8 pb-12">
        {/* Header Skeleton */}
        <div className="flex items-end justify-between">
          <div className="space-y-2">
             <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
             <div className="h-8 w-48 bg-slate-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-8 w-32 bg-slate-100 rounded-lg animate-pulse" />
        </div>

        {/* Metric Tiles Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="finance-card rounded-2xl p-6 border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                 <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                 <div className="h-4 w-4 rounded-full bg-slate-100 animate-pulse" />
              </div>
              <div className="h-10 w-32 bg-slate-100 rounded-lg animate-pulse mb-3" />
              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Ledger Skeleton */}
        <div className="space-y-4">
           <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-slate-100 rounded-full animate-pulse" />
                 <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
           </div>

           <div className="finance-card rounded-2xl overflow-hidden border-slate-100">
             <div className="bg-slate-50/50 border-b border-slate-100 h-12 w-full" />
             <div className="p-0">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="flex items-center justify-between px-6 py-5 border-b border-slate-50 last:border-0">
                    <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 animate-pulse" />
                       <div className="space-y-1">
                          <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                          <div className="h-2 w-16 bg-slate-100 rounded animate-pulse" />
                       </div>
                    </div>
                    <div className="h-5 w-24 bg-slate-100 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                    <div className="h-5 w-20 rounded-full bg-slate-100 animate-pulse" />
                 </div>
               ))}
             </div>
           </div>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-8 pb-12">
      <div className="flex items-end justify-between gap-4">
        <TitleBreadCrumbs title="Treasury Management" breadCrumbTitle="Finance / Wallet" className="flex-1" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
           Status: Operational
        </div>
      </div>

      {summaryError && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-[11px] font-bold text-rose-600">
          <HiOutlineInformationCircle className="w-5 h-5" />
          Data synchronization failure. Please re-authenticate or refresh.
        </div>
      )}

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="finance-card rounded-2xl p-6 relative group overflow-hidden">
          <p className="text-sm font-semibold text-slate-500 mb-1">Liquidity Available</p>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-sm font-medium text-slate-400 mr-1.5">{summary?.currency}</span>
            <p className="text-metric text-4xl tracking-tighter">
              {summary?.availableBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <button 
            onClick={() => setIsPayoutModalOpen(true)}
            disabled={!summary?.availableBalance || summary.availableBalance <= 0}
            className="w-full rounded-xl bg-slate-950 py-3.5 text-[10px] font-black text-white uppercase tracking-widest transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-10"
          >
            Initiate Settlement
          </button>
        </div>

        {[
          { label: "Locked Funds", value: summary?.lockedBalance, color: "text-slate-900", icon: <HiOutlineClock className="w-3 h-3"/>, sub: "Awaiting clearing cycle" },
          { label: "Pending Payout", value: summary?.pendingPayoutBalance, color: "text-slate-900", icon: <HiOutlineBanknotes className="w-3 h-3"/>, sub: "Currently being audited" },
          { label: "Historical Volume", value: summary?.lifetimeEarnings, color: "text-emerald-600", icon: <HiOutlineArrowTrendingUp className="w-3 h-3"/>, sub: "Total revenue yield" }
        ].map((item, i) => (
          <div key={i} className="finance-card rounded-2xl p-6">
            <p className="text-sm font-semibold text-slate-500 mb-1 flex items-center gap-2">
              {item.label}
              {item.icon}
            </p>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-xs font-medium text-slate-300 mr-1">{summary?.currency}</span>
              <p className={`${item.color} text-metric text-3xl tracking-tighter`}>
                {item.value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Ledger Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">Transaction Ledger</h2>
           </div>
        </div>

        <DataTable
          title="Transaction Ledger"
          breadCrumbTitle="Finance / Ledger"
          data={transactions}
          loading={isTransactionsLoading}
          columns={[
            {
              key: "id",
              title: "Reference",
              render: (value: string) => (
                <span className="font-mono text-mono-finance text-[11px] text-slate-400">
                  #{value.slice(0, 10).toUpperCase()}
                </span>
              ),
            },
            {
              key: "description",
              title: "Activity",
              render: (_: any, tx: any) => (
                <div className="flex items-center gap-3 py-1">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm shrink-0">
                    {getTransactionIcon(tx.type, tx.direction)}
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-slate-900 tracking-tight leading-none mb-1">{tx.description || "System Managed Event"}</p>
                    <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{tx.type.replace(/_/g, " ")}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "amount",
              title: "Settlement",
              render: (value: any, tx: any) => (
                <div className="text-right font-black text-base text-mono-finance tracking-tighter">
                  <span className={`${tx.direction === "CREDIT" ? "text-emerald-600" : "text-rose-600"}`}>
                    {tx.direction === "CREDIT" ? "+" : "-"}
                    <span className="text-[10px] font-medium mr-0.5 opacity-40">{summary?.currency}</span>
                    {parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ),
            },
            {
              key: "createdAt",
              title: "Timestamp",
              render: (value: string) => (
                <div>
                  <p className="text-[10px] font-bold text-slate-600">{dayjs(value).format('DD MMM, YYYY')}</p>
                  <p className="text-[9px] font-medium text-slate-400">{dayjs(value).format('hh:mm A')}</p>
                </div>
              ),
            },
            {
              key: "status",
              title: "Status",
              render: (value: string) => (
                <div className="flex justify-center">
                  <span className={`status-indicator ${
                    value === "CONFIRMED" ? "bg-emerald-50 text-emerald-700" : 
                    value === "PENDING" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${
                       value === "CONFIRMED" ? "bg-emerald-500" : value === "PENDING" ? "bg-amber-500" : "bg-rose-500"
                    }`} />
                    {value}
                  </span>
                </div>
              ),
            },
          ]}
          controlledPagination={{
            page: page,
            pageSize: 12,
            totalPages: meta?.totalPages || 1,
            totalRecords: meta?.total || 0,
          }}
          onPaginationChange={({ page: newPage }) => setPage(newPage)}
          selectable={false}
          showSerialNumber={false}
          initialHiddenColumns={[]}
          className="finance-card rounded-2xl overflow-hidden shadow-none border-slate-100"
          noRecordText="Zero ledger records registered"
        />
      </div>

      {/* Settlement Interface */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-950 tracking-tighter">Request Settlement</h3>
            <p className="mt-2 text-[11px] text-slate-500 font-medium leading-relaxed mb-8">
              Initiate an external fund transfer to your registered Stripe infrastructure. Verified within 24-48 business hours.
            </p>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2 px-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Withdrawal Amount</label>
                   <button 
                     onClick={() => setPayoutAmount(summary?.availableBalance?.toString() || "0")}
                     className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800"
                   >
                     Max Limit
                   </button>
                </div>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-300">{summary?.currency}</span>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="0.00"
                    className="block w-full finance-input-professional text-3xl text-metric pl-14"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={handlePayoutRequest}
                  disabled={isPayoutRequesting || !payoutAmount}
                  className="w-full rounded-2xl bg-slate-950 py-5 text-xs font-black text-white uppercase tracking-[0.2em] transition-all hover:bg-slate-800 shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-20 flex items-center justify-center gap-2"
                >
                  {isPayoutRequesting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Authorize Transfer"}
                </button>
                <button
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="w-full rounded-2xl bg-slate-50 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                >
                  Cancel Protocol
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

export default VendorWallet;
