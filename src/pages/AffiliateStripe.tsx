import { HiOutlineArrowTopRightOnSquare, HiOutlineCheckCircle, HiOutlineExclamationTriangle } from "react-icons/hi2";
import { toast } from "react-hot-toast";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import {
  useConnectAffiliateStripeMutation,
  useCreateAffiliateStripeDashboardLinkMutation,
  useGetAffiliateStripeStatusQuery,
} from "@/features/affiliate/api/affiliateApi";

const formatRequirement = (value: string) =>
  value
    .replace(/\./g, " / ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function AffiliateStripe() {
  const { data: stripeResponse, isLoading, error, refetch } = useGetAffiliateStripeStatusQuery();
  const [connectStripe, { isLoading: isConnecting }] = useConnectAffiliateStripeMutation();
  const [openDashboard, { isLoading: isOpeningDashboard }] =
    useCreateAffiliateStripeDashboardLinkMutation();

  const stripe = stripeResponse?.data;
  const pendingRequirements = stripe?.requirements.currentlyDue ?? [];

  const redirectToStripe = async (mode: "connect" | "manage") => {
    try {
      const response =
        mode === "connect"
          ? await connectStripe().unwrap()
          : await openDashboard().unwrap();
      if (!response.data?.url) {
        throw new Error("Missing redirect target");
      }

      window.location.assign(response.data.url);
    } catch (err: any) {
      if (err?.data?.code === "STRIPE_CONNECT_NOT_ENABLED") {
        toast.error(
          "Stripe Connect is not enabled on the platform's Stripe account. Please contact support to resolve this platform setup issue.",
          { duration: 6000 }
        );
      } else {
        toast.error(err?.data?.message || "Unable to open Stripe right now.");
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardContainer className="space-y-4 pb-10">
        <div className="h-8 w-1/3 animate-pulse rounded-full bg-slate-200" />
        <div className="h-56 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse" />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-6 pb-10">
      <TitleBreadCrumbs title="Payout Setup" breadCrumbTitle="Affiliate / Payout Setup" />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Affiliate Payouts
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {stripe?.connected ? "Your payout account is linked" : "Set up robust bank payouts for commissions"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              We use Stripe Express to send your affiliate commissions directly to your bank account.
              Once your account is verified, payouts for your payable commissions will be initiated 
              automatically. Any commissions held during setup will settle instantly after verification.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 lg:w-[320px]">
            <p className="font-semibold text-slate-900">Robust System Features</p>
            <div className="mt-3 space-y-2 text-xs">
              <p>• <strong>Automated:</strong> No more manual withdraw requests.</p>
              <p>• <strong>Real-time:</strong> Commissions allocated when the customer pays.</p>
              <p>• <strong>Catch-up:</strong> Held funds settle immediately once your bank is ready.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <div className="flex items-start gap-3">
              <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Payout setup is not available right now.</p>
                <p className="mt-1">
                  This is usually a platform Stripe configuration issue, not an issue with your affiliate
                  account.
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-3 rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
                >
                  Retry Status Check
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div
            className={`rounded-2xl border p-4 ${
              stripe?.connected ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Link</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {stripe?.connected ? "Connected" : "Not started"}
            </p>
          </div>
          <div
            className={`rounded-2xl border p-4 ${
              stripe?.onboardingComplete
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Verification</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {stripe?.onboardingComplete ? "Complete" : "Action required"}
            </p>
          </div>
          <div
            className={`rounded-2xl border p-4 ${
              stripe?.payoutsEnabled
                ? "border-emerald-200 bg-emerald-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Payout Capability</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {stripe?.payoutsEnabled ? "Ready for automatic payouts" : "Not enabled yet"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {!stripe?.connected && (
            <button
              type="button"
              disabled={isConnecting}
              onClick={() => redirectToStripe("connect")}
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {isConnecting ? "Opening Stripe..." : "Set Up Payouts"}
            </button>
          )}

          {stripe?.connected && !stripe.onboardingComplete && (
            <button
              type="button"
              disabled={isConnecting}
              onClick={() => redirectToStripe("connect")}
              className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
            >
              {isConnecting ? "Opening Stripe..." : "Finish Stripe Setup"}
            </button>
          )}

          {stripe?.connected && (
            <button
              type="button"
              disabled={isOpeningDashboard}
              onClick={() => redirectToStripe("manage")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <HiOutlineArrowTopRightOnSquare className="h-4 w-4" />
              {isOpeningDashboard ? "Opening..." : "Manage in Stripe"}
            </button>
          )}
        </div>
      </div>

      {stripe?.payoutsEnabled ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
          <div className="flex items-start gap-3">
            <HiOutlineCheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Automatic affiliate payouts are enabled.</p>
              <p className="mt-1">
                When a commission is marked payable, it can be transferred to your connected Stripe
                account immediately. Final bank arrival still depends on Stripe&apos;s payout schedule.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {pendingRequirements.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Stripe still needs</h3>
          <p className="mt-1 text-sm text-slate-500">
            Complete these items in Stripe before payouts can be enabled.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {pendingRequirements.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
              >
                {formatRequirement(item)}
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardContainer>
  );
}
