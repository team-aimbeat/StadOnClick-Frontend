import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineShieldCheck } from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useMockLoader } from "@/lib/useMockLoader";

type PayoutHistoryRow = {
  id: string;
  amount: number;
  status: "paid" | "processing" | "failed";
  requestedAt: string;
  note?: string;
};

const historySeed: PayoutHistoryRow[] = [
  { id: "PO-1208", amount: 15200, status: "paid", requestedAt: "2025-01-10", note: "Bank transfer completed" },
  { id: "PO-1207", amount: 8200, status: "paid", requestedAt: "2024-12-24" },
  { id: "PO-1206", amount: 5400, status: "failed", requestedAt: "2024-12-12", note: "Account mismatch" },
];

const VendorPayouts = () => {
  const dispatch = useAppDispatch();
  const loading = useMockLoader();
  const [amount, setAmount] = useState(12000);
  const [modalOpen, setModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [kycVerified] = useState(false);
  const [stripeConnected] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle("Payouts"));
  }, [dispatch]);

  const pendingNote = useMemo(() => {
    if (!kycVerified) {
      return "KYC not verified. Upload documents to unlock payouts.";
    }
    if (!stripeConnected) {
      return "Connect Stripe to receive payouts.";
    }
    return "";
  }, [kycVerified, stripeConnected]);

  const canRequest = kycVerified && stripeConnected;
  const pendingAmount = 32000;
  const pendingCount = 2;

  const handleConfirm = () => {
    setModalOpen(false);
    setSuccessMessage("Payout request submitted. We will process it in 24 hrs.");
  };

  if (loading) {
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
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pending payouts</p>
          <p className="text-3xl font-semibold text-slate-900">₹{pendingAmount.toLocaleString("en-IN")}</p>
          <p className="text-xs text-slate-500">{pendingCount} requests waiting approval</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              disabled={!canRequest}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Request payout
            </button>
            <NavLink to="/vendor/wallet" className="text-xs font-semibold text-blue-600 hover:text-blue-500">
              View wallet
            </NavLink>
          </div>
          {!canRequest && (
            <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              <HiOutlineExclamationTriangle className="inline h-4 w-4" />
              {pendingNote}
              <div className="mt-1 space-x-2 text-[11px] font-semibold">
                {!kycVerified && (
                  <NavLink to="/vendor/kyc" className="text-blue-600 hover:text-blue-500">
                    Upload KYC
                  </NavLink>
                )}
                {!stripeConnected && (
                  <NavLink to="/vendor/stripe" className="text-blue-600 hover:text-blue-500">
                    Connect Stripe
                  </NavLink>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Request payout</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
                Amount to request
              </div>
              <input
                type="number"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                disabled={!canRequest}
                className="rounded-2xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Submit request
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Payout requests above ₹5,000 will be reviewed manually.
            </p>
            {successMessage && (
              <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                <HiOutlineCheckCircle className="inline h-4 w-4" /> {successMessage}
              </div>
            )}
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
                  {historySeed.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{row.id}</td>
                      <td className="px-4 py-3">
                        ₹{row.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-700">{row.status}</td>
                      <td className="px-4 py-3">{row.requestedAt}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{row.note || "—"}</td>
                    </tr>
                  ))}
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
            <p className="mt-2 text-xl font-semibold text-slate-900">
              Request ₹{amount.toLocaleString("en-IN")}
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
                onClick={handleConfirm}
                className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
              >
                Confirm request
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

export default VendorPayouts;
