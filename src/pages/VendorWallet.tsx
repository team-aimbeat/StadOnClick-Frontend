import { useEffect, useState } from "react";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { 
  useGetWalletSummaryQuery, 
  useGetWalletTransactionsQuery, 
  useRequestPayoutMutation 
} from "@/features/vendorWallet/api/walletApi";
import { toast } from "react-hot-toast";

const VendorWallet = () => {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");

  const { 
    data: summaryData, 
    isLoading: isSummaryLoading, 
    error: summaryError 
  } = useGetWalletSummaryQuery();

  const { 
    data: transactionsData, 
    isLoading: isTransactionsLoading 
  } = useGetWalletTransactionsQuery({ page, limit: 10 });

  const [requestPayout, { isLoading: isPayoutRequesting }] = useRequestPayoutMutation();

  useEffect(() => {
    dispatch(setPageTitle("Wallet"));
  }, [dispatch]);

  const summary = summaryData?.data;
  const transactions = transactionsData?.data || [];
  const meta = transactionsData?.meta;

  const handlePayoutRequest = async () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > (summary?.availableBalance || 0)) {
      toast.error("Insufficient available balance");
      return;
    }

    try {
      await requestPayout({ amount }).unwrap();
      toast.success("Payout request submitted successfully");
      setIsPayoutModalOpen(false);
      setPayoutAmount("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit payout request");
    }
  };

  if (isSummaryLoading || isTransactionsLoading) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <div className="h-8 w-1/3 animate-pulse rounded-full bg-slate-200" />
        <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4">
          <div className="h-8 w-20 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-3 space-y-2">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-6 rounded-lg bg-slate-200" />
            ))}
          </div>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-10">
      <TitleBreadCrumbs title="Wallet" breadCrumbTitle="Vendor / Wallet" />

      {summaryError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Error loading wallet data. Please try again later.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Available Balance</p>
          <p className="text-2xl font-bold text-slate-900">
            {summary?.currency || "SEK"} {summary?.availableBalance?.toLocaleString() || "0.00"}
          </p>
          <button 
            onClick={() => setIsPayoutModalOpen(true)}
            disabled={!summary?.availableBalance || summary.availableBalance <= 0}
            className="mt-3 w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Request Payout
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Locked (Pending Clear)</p>
          <p className="text-2xl font-bold text-slate-900">
            {summary?.currency || "SEK"} {summary?.lockedBalance?.toLocaleString() || "0.00"}
          </p>
          <p className="mt-2 text-[10px] text-slate-500">
            Funds from recent bookings being cleared.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Pending Payout</p>
          <p className="text-2xl font-bold text-slate-900">
            {summary?.currency || "SEK"} {summary?.pendingPayoutBalance?.toLocaleString() || "0.00"}
          </p>
          <p className="mt-2 text-[10px] text-slate-500">
            Withdrawals currently in process.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Lifetime Earnings</p>
          <p className="text-2xl font-bold text-emerald-600">
            {summary?.currency || "SEK"} {summary?.lifetimeEarnings?.toLocaleString() || "0.00"}
          </p>
          <p className="mt-2 text-[10px] text-slate-500">
            Total historical revenue from all sales.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="uppercase tracking-widest text-slate-400">Ledger</span>
          <div className="h-4 w-[1px] bg-slate-200" />
          <span className="text-slate-900">{meta?.total || 0} Total Transactions</span>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
             disabled={page === 1}
             onClick={() => setPage(p => Math.max(1, p - 1))}
             className="rounded-md border border-slate-200 px-2 py-1 text-[10px] hover:bg-slate-50 disabled:opacity-30"
           >
             Previous
           </button>
           <span className="text-[10px]">Page {page} of {meta?.totalPages || 1}</span>
           <button 
             disabled={page >= (meta?.totalPages || 1)}
             onClick={() => setPage(p => p + 1)}
             className="rounded-md border border-slate-200 px-2 py-1 text-[10px] hover:bg-slate-50 disabled:opacity-30"
           >
             Next
           </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="px-4 py-3 text-xs uppercase tracking-[0.3em] text-slate-400 font-bold bg-slate-50/50">
          Recent Activity
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50/80 text-[10px] uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Transaction ID</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{tx.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{tx.description || "No description"}</td>
                  <td className="px-4 py-3 text-[10px] text-slate-500">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 uppercase tracking-tighter font-bold">
                      {tx.type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-bold ${tx.direction === "CREDIT" ? "text-emerald-600" : "text-rose-600"}`}>
                    {tx.direction === "CREDIT" ? "+" : "-"}
                    {summary?.currency || "SEK"} {parseFloat(tx.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight ${
                        tx.status === "CONFIRMED"
                          ? "bg-emerald-50 text-emerald-700"
                          : tx.status === "PENDING"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!transactions.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-xs text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                       <p>No transaction history found for this wallet.</p>
                       <p className="text-[10px]">Your earnings and payouts will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Request Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">Request Payout</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Funds will be sent to your connected Stripe account. Usually takes 2-3 business days.
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Amount ({summary?.currency || "SEK"})</label>
                <div className="relative">
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="0.00"
                    className="block w-full rounded-2xl border border-slate-200 px-5 py-4 text-2xl font-bold focus:border-slate-900 focus:outline-none transition-colors"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                    MAX: {summary?.availableBalance?.toLocaleString() || "0.00"}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handlePayoutRequest}
                  disabled={isPayoutRequesting || !payoutAmount}
                  className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50 shadow-lg shadow-slate-200"
                >
                  {isPayoutRequesting ? "Processing..." : "Confirm Withdrawal"}
                </button>
                <button
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="w-full rounded-2xl bg-slate-100 py-4 font-bold text-slate-600 transition-all hover:bg-slate-200"
                >
                  Cancel
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
