import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { Check, Sparkles } from "lucide-react";

import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useListPlansQuery,
  useGetMyPlanQuery,
  useCreateCheckoutSessionMutation,
  useConfirmCheckoutSessionMutation,
} from "@/features/userSubscriptions/api/userSubscriptionsApi";

const palette = [
  { bg: "from-emerald-50 via-white to-emerald-100", accent: "text-emerald-600", border: "border-emerald-200" },
  { bg: "from-amber-200 via-amber-500 to-amber-200", accent: "text-amber-600", border: "border-amber-400" },
  { bg: "from-amber-50 via-white to-amber-100", accent: "text-amber-600", border: "border-amber-200" },
];

export default function UserSubscriptionsPage() {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { data: plansRes, isLoading } = useListPlansQuery();
  const { data: myPlan } = useGetMyPlanQuery(undefined, { skip: !authUser });
  const [createCheckoutSession, { isLoading: isStartingCheckout }] = useCreateCheckoutSessionMutation();
  const [confirmCheckoutSession, { isLoading: isConfirmingCheckout }] = useConfirmCheckoutSessionMutation();
  const [billingCycle] = useState<"annual" | "monthly">("annual");

  const plans = plansRes?.data ?? [];
  const activePlanId = myPlan?.data?.planId;

  const sortedPlans = useMemo(
    () => plans.slice().sort((a, b) => Number(a.price) - Number(b.price)),
    [plans]
  );

  const handlePurchase = async (planId: string) => {
    if (!authUser) {
      toast.error("Please sign in to purchase a plan");
      return;
    }
    try {
      const res = await createCheckoutSession({ planId }).unwrap();
      const checkoutUrl = res?.data?.checkoutUrl;
      if (!checkoutUrl) {
        toast.error("Unable to start checkout");
        return;
      }
      window.location.href = checkoutUrl;
    } catch (err: any) {
      const message = err?.data?.message ?? "Unable to start checkout";
      toast.error(message);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) return;

    const finalize = async () => {
      try {
        await confirmCheckoutSession({ sessionId }).unwrap();
        toast.success("Subscription activated");
      } catch (err: any) {
        const message = err?.data?.message ?? "Payment not completed";
        toast.error(message);
      } finally {
        params.delete("session_id");
        params.delete("planId");
        const newQuery = params.toString();
        const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ""}`;
        window.history.replaceState({}, "", newUrl);
      }
    };

    void finalize();
  }, [confirmCheckoutSession]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="mx-auto max-w-6xl px-4 py-12 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Pricing</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Customer Subscription Plans</h1>
            <p className="text-slate-600 max-w-2xl">
              Choose a plan to unlock premium booking perks. Plans are applied to your customer account.
            </p>
            {activePlanId && myPlan?.data ? (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                Active: {myPlan.data.plan.planName} � ends {new Date(myPlan.data.endDate).toLocaleDateString()}
              </Badge>
            ) : (
              <Badge variant="outline">No active subscription</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <span className="text-sm font-semibold text-slate-600">Billing</span>
            <div className="flex items-center rounded-full border border-slate-100 bg-slate-50 p-1 text-xs font-semibold text-slate-600">
              <button
                type="button"
                className={`rounded-full px-3 py-1 transition ${billingCycle === "monthly" ? "bg-white shadow-sm text-emerald-600" : ""}`}
              >
                Monthly
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1 transition ${billingCycle === "annual" ? "bg-white shadow-sm text-emerald-600" : ""}`}
              >
                Annual
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full text-sm text-slate-500">Loading plans�</div>
          ) : sortedPlans.length === 0 ? (
            <div className="col-span-full text-sm text-slate-500">No plans available.</div>
          ) : (
            sortedPlans.map((plan, idx) => {
              const isActive = activePlanId === plan.id;
              const colors = palette[idx % palette.length];
              return (
                <div
                  key={plan.id}
                  className={`relative overflow-hidden rounded-3xl border ${colors.border} bg-gradient-to-br ${colors.bg} shadow-xl`}
                >
                  {isActive && (
                    <span className="absolute right-4 top-4 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow">
                      Active
                    </span>
                  )}
                  <div className="p-6 space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        {plan.status === "ACTIVE" ? "Available" : plan.status}
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">{plan.planName}</h2>
                      <div className="text-4xl font-extrabold text-slate-900">
                        {new Intl.NumberFormat("sv-SE", { style: "currency", currency: plan.currency }).format(
                          Number(plan.price)
                        )}
                        <span className="ml-1 text-base font-semibold text-slate-500">/ {plan.durationDays} days</span>
                      </div>
                      {plan.description && <p className="text-sm text-slate-600">{plan.description}</p>}
                    </div>

                    <ul className="space-y-2 text-sm">
                      {(plan.perks?.length ? plan.perks : ["Priority support", "Faster booking", "Exclusive offers"]).map(
                        (perk, perkIdx) => (
                          <li key={perkIdx} className="flex items-start gap-2 text-slate-700">
                            <Check className="mt-[2px] h-4 w-4 text-emerald-500" />
                            <span>{perk}</span>
                          </li>
                        )
                      )}
                    </ul>

                    <Button
                      className="w-full rounded-full text-base font-semibold"
                      size="lg"
                      disabled={isActive || isStartingCheckout || isConfirmingCheckout}
                      onClick={() => handlePurchase(plan.id)}
                    >
                      {isActive ? "Your current plan" : isStartingCheckout ? "Redirecting…" : "Start now"}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
