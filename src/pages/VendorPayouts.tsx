import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

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

// Mock data removed in favor of real API integration

const VendorPayouts = () => {
  const dispatch = useAppDispatch();
  const [requestAmount, setRequestAmount] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { data: summaryData, isLoading: isSummaryLoading } = useGetWalletSummaryQuery();
  const { data: stripeData, isLoading: isStripeLoading } = useGetStripeStatusQuery();
  const { data: transactionsData, isLoading: isTransactionsLoading } = useGetWalletTransactionsQuery({ page: 1, limit: 50 });
  const [requestPayout, { isLoading: isPayoutRequesting }] = useRequestPayoutMutation();

  useEffect(() => {
    dispatch(setPageTitle("Payouts"));
  }, [dispatch]);

  const summary = summaryData?.data;
  const stripe = stripeData?.data;
  const payoutHistory = (transactionsData?.data || []).filter(tx => tx.type === 'PAYOUT' || tx.type === 'REFUND'); // Including refund as it affects balance

  const kycVerified = true; // Still mock, should come from profile/kyc check
  const stripeConnected = stripe?.payoutsEnabled;

  const handleConfirm = async () => {
    const amount = parseFloat(requestAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount");
      return;
    }

    try {
      await requestPayout({ amount }).unwrap();
      toast.success("Payout request submitted");
      setModalOpen(false);
      setRequestAmount("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Request failed");
    }
  };

  if (isSummaryLoading || isStripeLoading || isTransactionsLoading) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <div className="h-8 w-1/3 animate-pulse rounded-full bg-slate-200" />
        <div className="grid grid-cols-1 gap-4">
          <div className="h-32 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse" />
          <div className="h-48 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse" />
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-10">
      <TitleBreadCrumbs title="Payouts" breadCrumbTitle="Vendor / Payouts" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Queue for Payout</p>
          <p className="text-3xl font-bold text-slate-900">
            {summary?.currency || "SEK"} {summary?.pendingPayoutBalance?.toLocaleString() || "0.00"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Requests currently being processed</p>
          
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              disabled={!stripeConnected || !summary?.availableBalance}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-30"
            >
              Withdraw Funds
            </button>
            <NavLink to="/vendor/wallet" className="text-center text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
              Go to Wallet Ledger
            </NavLink>
          </div>

          {!stripeConnected && (
            <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700 leading-relaxed shadow-sm">
              <HiOutlineExclamationTriangle className="inline h-4 w-4 mr-1 -mt-0.5" />
              Stripe payouts not ready. Please complete your onboarding.
              <div className="mt-2 flex gap-3">
                <NavLink to="/vendor/stripe" className="text-blue-700 font-bold hover:underline">
                  Connect Stripe
                </NavLink>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-4">Request New Transfer</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={requestAmount}
                  placeholder="0.00"
                  onChange={(event) => setRequestAmount(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-2xl font-bold focus:border-slate-900 focus:outline-none transition-colors"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                  {summary?.currency || "SEK"}
                </div>
              </div>
              <button
                type="button"
                disabled={!stripeConnected || !requestAmount}
                onClick={() => setModalOpen(true)}
                className="rounded-2xl bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-30"
              >
                Submit Request
              </button>
            </div>
            <p className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Available to withdraw: {summary?.currency} {summary?.availableBalance?.toLocaleString() || "0.00"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="px-4 py-3 text-xs uppercase tracking-[0.3em] text-slate-400">
              Payout history
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Request</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Requested</th>
                    <th className="px-4 py-3 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payoutHistory.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4 font-mono text-[10px] text-slate-400">{row.id.slice(0, 8)}...</td>
                      <td className="px-4 py-4 font-bold text-slate-900">
                        {summary?.currency} {parseFloat(row.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight ${
                          row.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' : 
                          row.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">{new Date(row.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4 text-xs text-slate-500 font-medium">{row.description || "—"}</td>
                    </tr>
                  ))}
                  {!payoutHistory.length && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-xs text-slate-400 italic">
                        No payout history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Confirm payout</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {summary?.currency} {parseFloat(requestAmount).toLocaleString() || "0"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              This payout will be processed to the connected Stripe account after verification.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPayoutRequesting}
                onClick={handleConfirm}
                className="rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition-all hover:bg-slate-800"
              >
                {isPayoutRequesting ? "Processing..." : "Confirm Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

export default VendorPayouts;
