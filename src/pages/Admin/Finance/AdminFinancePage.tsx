import { useState } from "react";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { useGetVendorWalletQuery, useAdjustWalletMutation, useApprovePayoutMutation, useRejectPayoutMutation } from "@/features/admin/finance/api/adminFinanceApi";
import { toast } from "react-hot-toast";

const AdminFinancePage = () => {
  const [vendorId, setVendorId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustment, setAdjustment] = useState({
    amount: "",
    direction: "CREDIT" as "CREDIT" | "DEBIT",
    description: "",
  });
  const [reviewingPayout, setReviewingPayout] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: walletData, isLoading, error, refetch } = useGetVendorWalletQuery(vendorId, {
    skip: !vendorId || vendorId.length < 10, // Basic UUID length check
  });

  const [adjustWallet, { isLoading: isAdjustingWallet }] = useAdjustWalletMutation();
  const [approvePayout, { isLoading: isApproving }] = useApprovePayoutMutation();
  const [rejectPayout, { isLoading: isRejecting }] = useRejectPayoutMutation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setVendorId(searchTerm.trim());
    }
  };

  const handleAdjustmentSubmit = async () => {
    if (!vendorId) return;
    const amount = parseFloat(adjustment.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await adjustWallet({
        vendorId,
        amount,
        direction: adjustment.direction,
        description: adjustment.description || "Admin manual adjustment",
      }).unwrap();
      toast.success("Wallet adjusted successfully");
      setIsAdjusting(false);
      setAdjustment({ amount: "", direction: "CREDIT", description: "" });
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Adjustment failed");
    }
  };

  const handleApprovePayout = async (payoutId: string) => {
    try {
      await approvePayout(payoutId).unwrap();
      toast.success("Payout approved and transfer initiated");
      setReviewingPayout(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Approval failed");
    }
  };

  const handleRejectPayout = async () => {
    if (!reviewingPayout || !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await rejectPayout({ payoutId: reviewingPayout.sourceId, reason: rejectionReason }).unwrap();
      toast.success("Payout rejected and funds returned to wallet");
      setReviewingPayout(null);
      setRejectionReason("");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Rejection failed");
    }
  };

  const wallet = walletData?.data?.summary;
  const transactions = walletData?.data?.recentTransactions || [];

  return (
    <DashboardContainer className="space-y-6 pb-10">
      <TitleBreadCrumbs title="Finance Management" breadCrumbTitle="Admin / Finance" />

      {/* Search Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Enter Vendor ID to Manage Wallet</label>
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-8 py-3 font-bold text-white transition-all hover:bg-slate-800"
          >
            Load Wallet
          </button>
        </form>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-6 text-center text-red-600 border border-red-100">
          <p className="font-bold">Error Loading Wallet</p>
          <p className="text-xs mt-1">Make sure the Vendor ID is correct and you have permission.</p>
        </div>
      )}

      {walletData && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-slate-900">{wallet?.currency} {wallet?.availableBalance?.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Locked Funds</p>
              <p className="text-2xl font-bold text-slate-900">{wallet?.currency} {wallet?.lockedBalance?.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Pending Payouts</p>
              <p className="text-2xl font-bold text-slate-900">{wallet?.currency} {wallet?.pendingPayoutBalance?.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Lifetime Earnings</p>
              <p className="text-2xl font-bold text-emerald-600">{wallet?.currency} {wallet?.lifetimeEarnings?.toLocaleString()}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
             <button
               onClick={() => setIsAdjusting(true)}
               className="rounded-xl border border-slate-900 bg-slate-900 px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-800"
             >
               Manual Adjustment
             </button>
          </div>

          {/* Recent Ledger */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Recent Ledger Activity</span>
              <span className="text-[10px] text-slate-400">Showing last 10 transactions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-5 py-3 text-left">ID</th>
                    <th className="px-5 py-3 text-left">Type</th>
                    <th className="px-5 py-3 text-left">Amount</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {transactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4 font-mono text-slate-400">{tx.id.slice(0, 8)}...</td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-700">{tx.type}</span>
                        <p className="text-[10px] text-slate-500">{tx.description}</p>
                      </td>
                      <td className={`px-5 py-4 font-bold ${tx.direction === "CREDIT" ? "text-emerald-600" : "text-rose-600"}`}>
                        {tx.direction === "CREDIT" ? "+" : "-"} {wallet?.currency} {parseFloat(tx.amount).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            tx.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 
                            tx.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {tx.status}
                          </span>
                          {tx.type === 'PAYOUT' && tx.status === 'PENDING' && (
                            <button 
                              onClick={() => setReviewingPayout(tx)}
                              className="text-[10px] font-bold text-slate-900 border-b border-slate-900 leading-tight hover:text-slate-600 hover:border-slate-600"
                            >
                              Review
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Manual Adjustment Modal */}
      {isAdjusting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">Manual Adjustment</h3>
            <p className="mt-1 text-sm text-slate-500">Perform a direct debit or credit to this vendor's wallet.</p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Adjustment Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAdjustment(a => ({ ...a, direction: "CREDIT" }))}
                    className={`flex-1 rounded-xl py-3 text-xs font-bold transition-all ${adjustment.direction === "CREDIT" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}
                  >
                    Credit (+)
                  </button>
                  <button
                    onClick={() => setAdjustment(a => ({ ...a, direction: "DEBIT" }))}
                    className={`flex-1 rounded-xl py-3 text-xs font-bold transition-all ${adjustment.direction === "DEBIT" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600"}`}
                  >
                    Debit (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Amount ({wallet?.currency || "SEK"})</label>
                <input
                  type="number"
                  value={adjustment.amount}
                  onChange={(e) => setAdjustment(a => ({ ...a, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-2xl font-bold focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Internal Note / Description</label>
                <textarea
                  value={adjustment.description}
                  onChange={(e) => setAdjustment(a => ({ ...a, description: e.target.value }))}
                  rows={3}
                  placeholder="Reason for adjustment..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <button
                  onClick={handleAdjustmentSubmit}
                  disabled={isAdjustingWallet || !adjustment.amount}
                  className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50"
                >
                  {isAdjustingWallet ? "Processing..." : "Confirm Adjustment"}
                </button>
                <button
                  onClick={() => setIsAdjusting(false)}
                  className="w-full rounded-2xl bg-slate-100 py-4 font-bold text-slate-600 transition-all hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Payout Review Modal */}
      {reviewingPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">Review Payout Request</h3>
            <p className="mt-1 text-sm text-slate-500">Approve to trigger Stripe transfer or reject to return funds.</p>

            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-slate-900">{wallet?.currency} {parseFloat(reviewingPayout.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Request Date:</span>
                <span className="text-slate-900">{new Date(reviewingPayout.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Rejection Reason (Internal)</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                  placeholder="Only required if rejecting..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => handleApprovePayout(reviewingPayout.sourceId)}
                  disabled={isApproving || isRejecting}
                  className="w-full rounded-2xl bg-emerald-600 py-4 font-bold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isApproving ? "Processing Stripe Transfer..." : "Approve & Transfer"}
                </button>
                <button
                  onClick={handleRejectPayout}
                  disabled={isApproving || isRejecting || !rejectionReason.trim()}
                  className="w-full rounded-2xl bg-rose-600 py-4 font-bold text-white transition-all hover:bg-rose-700 disabled:opacity-50"
                >
                  {isRejecting ? "Rejecting..." : "Reject Payout"}
                </button>
                <button
                  onClick={() => {
                    setReviewingPayout(null);
                    setRejectionReason("");
                  }}
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

export default AdminFinancePage;
