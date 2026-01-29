import { useEffect, useState } from "react";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useGetStripeStatusQuery, useConnectStripeMutation } from "@/features/vendorStripe/api/vendorStripeApi";
import { toast } from "react-hot-toast";

const VendorStripe = () => {
  const dispatch = useAppDispatch();
  const { data: stripeData, isLoading, error } = useGetStripeStatusQuery();
  const [connectStripe, { isLoading: isConnecting }] = useConnectStripeMutation();
  const [disconnectModal, setDisconnectModal] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle("Stripe Connect"));
  }, [dispatch]);

  const stripe = stripeData?.data;

  const handleConnect = async () => {
    try {
      const result = await connectStripe().unwrap();
      if (result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to start Stripe connection");
    }
  };

  if (isLoading) {
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
      
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Error loading Stripe account status.
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Payment Infrastructure</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">
          {stripe?.connected ? "Stripe Connected" : "Secure Payouts with Stripe"}
        </p>
        <p className="mt-1 text-sm text-slate-600 leading-relaxed max-w-2xl">
          Stripe powers our secure payouts and enables instant card booking verification. 
          Connect your bank account to start receiving earnings automatically.
        </p>
        
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {!stripe?.connected ? (
            <button
              type="button"
              disabled={isConnecting}
              onClick={handleConnect}
              className="rounded-xl bg-slate-900 px-8 py-3 font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50"
            >
              {isConnecting ? "Redirecting..." : "Connect Stripe Account"}
            </button>
          ) : (
            <>
               {!stripe.onboardingComplete ? (
                 <button
                    type="button"
                    onClick={handleConnect}
                    className="rounded-xl bg-amber-500 px-8 py-3 font-bold text-white transition-all hover:bg-amber-600"
                  >
                    Resume Onboarding
                  </button>
               ) : (
                  <button
                    type="button"
                    onClick={() => setDisconnectModal(true)}
                    className="rounded-xl border border-slate-200 px-8 py-3 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Manage Account
                  </button>
               )}
            </>
          )}
        </div>

        {stripe?.connected && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className={`rounded-xl border p-4 flex items-center justify-between ${stripe.chargesEnabled ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Payments Acceptance</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stripe.chargesEnabled ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                  {stripe.chargesEnabled ? "ACTIVE" : "INACTIVE"}
                </span>
             </div>
             <div className={`rounded-xl border p-4 flex items-center justify-between ${stripe.payoutsEnabled ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Payout Capability</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stripe.payoutsEnabled ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                  {stripe.payoutsEnabled ? "READY" : "PENDING"}
                </span>
             </div>
          </div>
        )}
      </div>

      {disconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">Manage Stripe Connection</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              To disconnect or change your bank details, you will be redirected to the Stripe Dashboard. 
              Existing bookings remain unaffected, but new payouts will be paused.
            </p>
            <div className="mt-8 flex flex-col gap-3">
               <button
                type="button"
                onClick={handleConnect}
                className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white transition-all hover:bg-slate-800"
              >
                Go to Stripe Dashboard
              </button>
              <button
                type="button"
                onClick={() => setDisconnectModal(false)}
                className="w-full rounded-2xl bg-slate-100 py-4 font-bold text-slate-600 transition-all hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

export default VendorStripe;
