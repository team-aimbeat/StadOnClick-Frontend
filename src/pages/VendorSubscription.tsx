import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { HiOutlineCheckCircle, HiOutlineSparkles } from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useMockLoader } from "@/lib/useMockLoader";

type Plan = {
  name: string;
  leadsPerDay: number;
  price: number;
  badges?: string[];
  highlights: string[];
};

const plans: Plan[] = [
  { name: "BASIC", leadsPerDay: 10, price: 4999, highlights: ["Local visibility", "Support chat"] },
  {
    name: "PRO",
    leadsPerDay: 25,
    price: 8999,
    badges: ["Recommended"],
    highlights: ["Priority leads", "Dedicated guide", "Automations"],
  },
  {
    name: "ENTERPRISE",
    leadsPerDay: 60,
    price: 19999,
    highlights: ["Dedicated account manager", "Partner promotions", "Insights"],
  },
];

const VendorSubscription = () => {
  const dispatch = useAppDispatch();
  const loading = useMockLoader();
  const [selectedPlan, setSelectedPlan] = useState<Plan>(plans[1]);
  const [success, setSuccess] = useState("");
  const [planExpired] = useState(true);

  useEffect(() => {
    dispatch(setPageTitle("Lead Plan Subscription"));
  }, [dispatch]);

  const handlePurchase = () => {
    setSuccess(`You have purchased the ${selectedPlan.name} plan. Leads unlocked immediately.`);
  };

  if (loading) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <div className="h-8 w-1/3 animate-pulse rounded-full bg-slate-200" />
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-32 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse" />
          ))}
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-10">
      <TitleBreadCrumbs title="Lead Plan Subscription" breadCrumbTitle="Vendor / Subscription" />

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Current plan</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-slate-900">PRO</p>
            <p className="text-sm text-slate-600">25 leads / day · Expires: 12 Feb 2025</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Used: 22/25 today</p>
            <p>Status: {planExpired ? "Expired" : "Active"}</p>
          </div>
        </div>
        {planExpired && (
          <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
            Your current plan has expired. Renew to keep receiving leads.
            <NavLink to="/vendor/promote" className="ml-2 text-blue-600 hover:text-blue-500">
              Renew plan
            </NavLink>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Compare plans</p>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <button
              key={plan.name}
              type="button"
              onClick={() => setSelectedPlan(plan)}
              className={`flex flex-col rounded-2xl border px-4 py-3 text-left transition ${
                plan.name === selectedPlan.name
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-blue-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">{plan.name}</p>
                {plan.badges?.map((badge) => (
                  <span key={badge} className="rounded-full border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                    {badge}
                  </span>
                ))}
              </div>
              <p className="text-2xl font-bold text-slate-900">₹{plan.price}</p>
              <p className="text-xs text-slate-500">{plan.leadsPerDay} leads / day</p>
              <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                {plan.highlights.map((highlight) => (
                  <p key={highlight}>• {highlight}</p>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Purchase flow</p>
        <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-slate-600">
          <p>Selected plan: {selectedPlan.name}</p>
          <p>Leads / day: {selectedPlan.leadsPerDay}</p>
          <p>Price: ₹{selectedPlan.price}</p>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Confirming this purchase will renew your plan for 30 days and unlock new leads immediately.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handlePurchase}
            className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Confirm purchase
          </button>
          <NavLink to="/vendor/analytics" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
            View lead analytics →
          </NavLink>
        </div>
        {success && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <HiOutlineCheckCircle className="inline h-4 w-4" /> {success}
          </div>
        )}
      </div>
    </DashboardContainer>
  );
};

export default VendorSubscription;
