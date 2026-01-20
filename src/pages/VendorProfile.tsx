import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineEnvelope, HiOutlineMapPin, HiOutlinePhone, HiOutlineShieldCheck } from "react-icons/hi2";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import StatusPill from "@/components/vendor-dashboard/StatusPill";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useMockLoader } from "@/lib/useMockLoader";

const tabs = [
  { id: "info", label: "Profile Info" },
  { id: "seo", label: "SEO & Visibility" },
  { id: "contact", label: "Contact & Location" },
  { id: "hours", label: "Business Hours" },
  { id: "preview", label: "Preview" },
];

const profileDetails = {
  name: "UrbanFix Plumbing & Heating",
  slug: "urbanfix-plumbing-heating",
  description: "24/7 emergency plumbing, heating, and water purifier services across Mumbai & Pune with verified technicians.",
  email: "hello@urbanfix.co",
  phone: "+91 99230 44519",
  city: "Mumbai",
  address: "Unit B-403, Neptune Tower, Lower Parel, Mumbai 400013",
  tags: ["Emergency servicеs", "Household", "Commercial", "Gas service"],
};

const seoDraft = {
  title: "UrbanFix Plumbing & Heating | 24/7 Emergency Support",
  description:
    "Trust UrbanFix for plumbing, heating, and healing water systems. Verified vendors, SLAs, and transparent pricing for Mumbai homes.",
  keywords: ["plumbing", "gas fitting", "water purifier", "emergency services", "UrbanFix"],
  snippetUrl: "https://stadonclick.com/vendors/urbanfix-plumbing-heating",
};

const hours = [
  { day: "Mon", value: "07:00 - 21:00" },
  { day: "Tue", value: "07:00 - 21:00" },
  { day: "Wed", value: "07:00 - 21:00" },
  { day: "Thu", value: "07:00 - 21:00" },
  { day: "Fri", value: "07:00 - 21:00" },
  { day: "Sat", value: "08:00 - 22:00" },
  { day: "Sun", value: "09:00 - 20:00" },
];

const checklist = [
  { label: "Add business description", done: true },
  { label: "Upload KYC documents", done: false },
  { label: "Connect Stripe payouts", done: false },
  { label: "Publish 3+ services", done: true },
  { label: "Respond to new leads", done: true },
  { label: "Share recent photos", done: false },
];

const VendorProfile = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("info");
  const [savedStatus, setSavedStatus] = useState("");
  const [indexable, setIndexable] = useState(true);
  const loading = useMockLoader();
  const saveTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    dispatch(setPageTitle("Business Profile"));
  }, [dispatch]);

  useEffect(() => {
    return () => {
      window.clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleSave = () => {
    setSavedStatus("Profile saved");
    window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      setSavedStatus("");
    }, 1800);
  };

  const infoFields = useMemo(
    () => [
      { label: "Business name", value: profileDetails.name },
      { label: "StadonClick slug", value: profileDetails.slug },
      { label: "Headquarters", value: profileDetails.address },
      { label: "City", value: profileDetails.city },
      { label: "Services focus", value: profileDetails.tags.join(" • ") },
    ],
    []
  );

  if (loading) {
    return (
      <DashboardContainer className="space-y-4 py-8">
        <div className="space-y-3">
          <div className="h-8 w-2/5 animate-pulse rounded-full bg-slate-200" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-6 rounded-lg bg-slate-200" />
            <div className="h-6 rounded-lg bg-slate-200" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-5 shadow-sm">
          <div className="h-40 rounded-lg bg-slate-100 animate-pulse" />
          <div className="h-10 rounded-lg bg-slate-100 animate-pulse" />
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-8">
      <TitleBreadCrumbs title="Business Profile" breadCrumbTitle="Vendor / Business Profile" />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Identity</p>
              <h2 className="text-xl font-semibold text-slate-900">{profileDetails.name}</h2>
              <p className="text-sm font-semibold text-slate-600">{profileDetails.address}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="space-y-1 text-right text-xs font-semibold text-slate-500">
                <p>Profile review</p>
                <p>Indexable</p>
              </div>
              <div className="space-y-1">
                <StatusPill status="PENDING_REVIEW" />
                <StatusPill status={indexable ? "Active" : "Hidden"} tone={indexable ? "success" : "danger"} size="sm" />
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{profileDetails.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <NavLink
              to="/vendor/services"
              className="rounded-full border border-slate-200 px-3 py-1 uppercase tracking-[0.2em] text-slate-600 hover:border-blue-300 hover:text-blue-600"
            >
              View Services
            </NavLink>
            <NavLink
              to="/vendor/media"
              className="rounded-full border border-slate-200 px-3 py-1 uppercase tracking-[0.2em] text-slate-600 hover:border-blue-300 hover:text-blue-600"
            >
              Upload Media
            </NavLink>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
              <HiOutlineShieldCheck className="h-4 w-4 text-emerald-500" />
              {profileDetails.email}
            </span>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Profile completeness</p>
          <div className="space-y-2 text-sm font-semibold text-slate-700">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                {item.done ? (
                  <HiOutlineCheckCircle className="h-4 w-4 text-emerald-500" />
                ) : (
                  <HiOutlineClock className="h-4 w-4 text-amber-500" />
                )}
                <span className={item.done ? "text-slate-900" : "text-slate-500"}>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Improving these items can unlock more leads and higher ranking.
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIndexable((prev) => !prev)}
            className="ml-auto rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 sm:ml-0"
          >
            Toggle Indexable
          </button>
        </div>

        <div className="space-y-4 p-4">
          {activeTab === "info" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {infoFields.map((field) => (
                  <div key={field.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">{field.label}</p>
                    <p className="text-sm font-semibold text-slate-900">{field.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Why this matters</p>
                <p>
                  83% of conversions happen because the listing contains a clear description, verified contact and strong media assets.
                </p>
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1 text-sm">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Title</p>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                    value={seoDraft.title}
                    readOnly
                  />
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Keywords</p>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                    value={seoDraft.keywords.join(", ")}
                    readOnly
                  />
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Description</p>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                  value={seoDraft.description}
                  readOnly
                />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Preview snippet</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{seoDraft.title}</p>
                <p className="text-xs text-blue-600">{seoDraft.snippetUrl}</p>
                <p className="text-sm text-slate-600">{seoDraft.description}</p>
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Contact</p>
                <div className="text-sm text-slate-900">
                  <p>
                    <HiOutlinePhone className="inline h-4 w-4 text-blue-500" /> {profileDetails.phone}
                  </p>
                  <p>
                  <HiOutlineEnvelope className="inline h-4 w-4 text-emerald-500" /> {profileDetails.email}
                  </p>
                  <p>
                  <HiOutlineMapPin className="inline h-4 w-4 text-amber-500" /> {profileDetails.city}
                  </p>
                </div>
                <NavLink
                  to="/vendor/help"
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-white"
                >
                  Contact support
                </NavLink>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Location insight</p>
                <p className="mt-2 text-sm text-slate-700">
                  Your most viewed areas: Lower Parel, Bandra, Andheri. Show availability near these pincodes to convert more leads.
                </p>
                <div className="mt-4 h-32 rounded-2xl bg-gradient-to-br from-blue-50 to-white p-3 text-xs text-slate-500">
                  Map preview placeholder
                </div>
              </div>
            </div>
          )}

          {activeTab === "hours" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {hours.map((slot) => (
                <div
                  key={slot.day}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  <span>{slot.day}</span>
                  <span>{slot.value}</span>
                </div>
              ))}
              <div className="col-span-1 sm:col-span-2 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                Add holiday exceptions or block slots before you leave town.
              </div>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Public preview</p>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{profileDetails.name}</p>
                  <StatusPill status="LIVE" tone="success" size="sm" />
                </div>
                <p className="text-sm text-slate-600">{profileDetails.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                  <span>4.6 ★ (188 reviews)</span>
                  <span>Verified</span>
                  <span>24h response</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <NavLink
                    to="/vendor/services"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-500"
                  >
                    View services listing →
                  </NavLink>
                  <NavLink
                    to="/vendor/leads"
                    className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    See customer conversations →
                  </NavLink>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Save profile
            </button>
            {savedStatus && <span className="text-emerald-600">{savedStatus}</span>}
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default VendorProfile;
