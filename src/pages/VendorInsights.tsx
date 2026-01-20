import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useMockLoader } from "@/lib/useMockLoader";

const changes = [
  { label: "Leads", value: "+12%", subtitle: "Week over week" },
  { label: "Conversion", value: "+5%", subtitle: "Week over week" },
  { label: "Revenue", value: "+18k", subtitle: "New bookings added" },
];

const suggestions = [
  "Add 2+ slots to HVAC service for weekends",
  "Upload at least 3 new photos to your plumbing service",
  "Reply to new leads within 10 minutes to keep chance high",
  "Improve SEO description to match top search terms",
];

const VendorInsights = () => {
  const dispatch = useAppDispatch();
  const loading = useMockLoader();

  useEffect(() => {
    dispatch(setPageTitle("Insights"));
  }, [dispatch]);

  if (loading) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <div className="h-8 w-1/3 animate-pulse rounded-full bg-slate-200" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-10">
      <TitleBreadCrumbs title="Insights" breadCrumbTitle="Vendor / Insights" />

      <div className="grid gap-4 md:grid-cols-3">
        {changes.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-left"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
            <p className="text-xs text-slate-500">{item.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Lead quality</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">Average rating 4.6 · 72% hot</p>
        <p className="text-sm text-slate-600">
          Leads sourced from StadonClick are trending higher when the profile has media and quick replies.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-600">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            Top source: Search
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            Best time: 10:00-14:00
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Best performing service</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Emergency Plumbing</p>
          <p className="text-sm text-slate-600">Conversion 28% · Avg ticket ₹3,450</p>
          <div className="mt-3 space-y-2 text-xs text-slate-500">
            <p>Use this service as hero card on marketplace.</p>
            <p>Promote to nearby 5 communities for quick wins.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Suggested actions</p>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            {suggestions.map((suggestion) => (
              <div key={suggestion} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Explore further</p>
        <NavLink
          to="/vendor/analytics"
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500"
        >
          View detailed analytics
        </NavLink>
        <NavLink
          to="/vendor/leads"
          className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-800"
        >
          Review leads
        </NavLink>
      </div>
    </DashboardContainer>
  );
};

export default VendorInsights;
