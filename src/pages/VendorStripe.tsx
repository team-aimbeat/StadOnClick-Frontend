import { useEffect, useState } from "react";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useMockLoader } from "@/lib/useMockLoader";

const VendorStripe = () => {
  const dispatch = useAppDispatch();
  const loading = useMockLoader();
  const [connected, setConnected] = useState(false);
  const [chargesEnabled, setChargesEnabled] = useState(false);
  const [payoutsEnabled, setPayoutsEnabled] = useState(false);
  const [disconnectModal, setDisconnectModal] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle("Stripe Connect"));
  }, [dispatch]);

  const handleConnect = () => {
    setConnected(true);
    setChargesEnabled(true);
    setPayoutsEnabled(true);
  };

  if (loading) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <div className="h-8 w-1/3 animate-pulse rounded-full bg-slate-200" />
        <div className="h-40 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse" />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-10">
      <TitleBreadCrumbs title="Stripe Connect" breadCrumbTitle="Vendor / Stripe Connect" />
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Stripe setup</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">
          {connected ? "Connected" : "Connect to Stripe"}
        </p>
        <p className="text-sm text-slate-600">
          Stripe powers secure payouts and enables instant card booking verification.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={connected ? () => setDisconnectModal(true) : handleConnect}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300"
          >
            {connected ? "Disconnect account" : "Connect Stripe"}
          </button>
          {!connected && (
            <button
              type="button"
              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Complete onboarding
            </button>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
          <span className={`rounded-full border px-3 py-1 ${chargesEnabled ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50"}`}>
            Charges enabled
          </span>
          <span className={`rounded-full border px-3 py-1 ${payoutsEnabled ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50"}`}>
            Payouts ready
          </span>
        </div>
      </div>

      {disconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold text-slate-900">Disconnect Stripe</p>
            <p className="mt-2 text-xs text-slate-600">
              Disconnecting will pause payouts until you reconnect. Existing bookings remain unaffected.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDisconnectModal(false)}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConnected(false);
                  setChargesEnabled(false);
                  setPayoutsEnabled(false);
                  setDisconnectModal(false);
                }}
                className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

export default VendorStripe;
