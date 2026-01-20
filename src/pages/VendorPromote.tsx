import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { HiOutlineArrowTrendingUp, HiOutlineSparkles } from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useMockLoader } from "@/lib/useMockLoader";

const VendorPromote = () => {
  const dispatch = useAppDispatch();
  const loading = useMockLoader();
  const [budget, setBudget] = useState(4500);
  const [selectedAction, setSelectedAction] = useState("boost");

  useEffect(() => {
    dispatch(setPageTitle("Promote"));
  }, [dispatch]);

  const expectedResults = useMemo(() => {
    const multiplier = budget / 1000;
    return {
      leads: Math.round(15 * multiplier),
      bookings: Math.round(6 * multiplier),
      revenue: Math.round(18000 * multiplier),
    };
  }, [budget]);

  if (loading) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <div className="h-8 w-1/3 animate-pulse rounded-full bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
          <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-10">
      <TitleBreadCrumbs title="Promote" breadCrumbTitle="Vendor / Promote" />

      <div className="grid gap-4 md:grid-cols-3">
        <button
          type="button"
          onClick={() => setSelectedAction("boost")}
          className={`rounded-2xl border px-4 py-3 text-left transition ${
            selectedAction === "boost" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200"
          }`}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Boost profile</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Gain visibility in top searches</p>
          <p className="text-xs text-slate-500">Highlight best reviews and services.</p>
        </button>
        <button
          type="button"
          onClick={() => setSelectedAction("service")}
          className={`rounded-2xl border px-4 py-3 text-left transition ${
            selectedAction === "service" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200"
          }`}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Top service</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Promote a service</p>
          <p className="text-xs text-slate-500">Push a high-margin service ahead.</p>
        </button>
        <button
          type="button"
          onClick={() => setSelectedAction("discount")}
          className={`rounded-2xl border px-4 py-3 text-left transition ${
            selectedAction === "discount"
              ? "border-blue-500 bg-blue-50"
              : "border-slate-200 bg-white hover:border-blue-200"
          }`}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Run discount</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Launch coupon campaign</p>
          <p className="text-xs text-slate-500">Target high-intent customers.</p>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Budget selector</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            type="range"
            min={1000}
            max={10000}
            step={500}
            value={budget}
            onChange={(event) => setBudget(Number(event.target.value))}
            className="w-full"
          />
          <div className="text-sm text-slate-700">₹{budget.toLocaleString("en-IN")} allocated</div>
        </div>
        <p className="mt-2 text-xs text-slate-500">Budget used per week based on your promotion plan.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Expected leads</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{expectedResults.leads}</p>
          <p className="text-xs text-slate-500">Hot leads ready for reply</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Expected bookings</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{expectedResults.bookings}</p>
          <p className="text-xs text-slate-500">Confirm these to hit payouts</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Expected revenue</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">₹{expectedResults.revenue.toLocaleString("en-IN")}</p>
          <p className="text-xs text-slate-500">Projected payout potential</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Need help planning?</p>
          <p className="text-xs text-slate-500">We update growth suggestions in analytics weekly.</p>
        </div>
        <NavLink
          to="/vendor/analytics"
          className="inline-flex items-center gap-1 rounded-full border border-blue-200 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
        >
          <HiOutlineSparkles className="h-4 w-4" />
          Open analytics
        </NavLink>
      </div>
    </DashboardContainer>
  );
};

export default VendorPromote;
