import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineEnvelope, HiOutlineMapPin, HiOutlinePhone, HiOutlineShieldCheck } from "react-icons/hi2";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import StatusPill from "@/components/vendor-dashboard/StatusPill";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useMockLoader } from "@/lib/useMockLoader";
import { useGetVendorProfileQuery, useUpdateVendorProfileMutation } from "@/features/vendorProfile/api/vendorProfileApi";
import type { BusinessHour } from "@/features/vendorProfile/api/vendorProfileApi";

const tabs = [
  { id: "info", label: "Profile Info" },
  { id: "seo", label: "SEO & Visibility" },
  { id: "contact", label: "Contact & Location" },
  { id: "hours", label: "Business Hours" },
  { id: "preview", label: "Preview" },
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
  const loading = useMockLoader();
  const saveTimerRef = useRef<number | undefined>(undefined);

  // API hooks
  const { data: profileData, isLoading: isLoadingProfile, error: profileError } = useGetVendorProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateVendorProfileMutation();

  // Local state for editable fields
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [headquarters, setHeadquarters] = useState("");
  const [serviceOverview, setServiceOverview] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [isIndexable, setIsIndexable] = useState(true);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form fields when data is loaded
  useEffect(() => {
    if (profileData?.data) {
      const profile = profileData.data;
      setBusinessName(profile.businessName || "");
      setDescription(profile.description || "");
      setHeadquarters(profile.headquarters || "");
      setServiceOverview(profile.serviceOverview || "");
      setSeoTitle(profile.seoTitle || "");
      setSeoDescription(profile.seoDescription || "");
      setSeoKeywords(profile.seoKeywords || []);
      setIsIndexable(profile.isIndexable);
      setContactEmail(profile.contactEmail || "");
      setContactPhone(profile.contactPhone || "");
      
      // Ensure businessHours is always an array
      const hours = profile.businessHours;
      if (Array.isArray(hours)) {
        setBusinessHours(hours);
      } else if (hours && typeof hours === 'object') {
        // If it's an object but not an array, try to convert it
        setBusinessHours([]);
      } else {
        setBusinessHours([]);
      }
    }
  }, [profileData]);

  useEffect(() => {
    dispatch(setPageTitle("Business Profile"));
  }, [dispatch]);

  useEffect(() => {
    return () => {
      window.clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleSave = async () => {
    try {
      await updateProfile({
        businessName,
        description: description || null,
        headquarters: headquarters || null,
        serviceOverview,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords,
        isIndexable,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        businessHours: businessHours.length > 0 ? businessHours : undefined,
      }).unwrap();

      setSavedStatus("Profile saved");
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(() => {
        setSavedStatus("");
      }, 1800);
    } catch (error) {
      console.error("Failed to save profile:", error);
      setSavedStatus("Failed to save");
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(() => {
        setSavedStatus("");
      }, 1800);
    }
  };

  const infoFields = useMemo(() => {
    if (!profileData?.data) return [];
    const profile = profileData.data;
    return [
      { label: "Business name", value: profile.businessName },
      { label: "StadonClick slug", value: profile.slug },
      { label: "Headquarters", value: profile.headquarters || "Not set" },
      { label: "City", value: profile.city?.name || "Not set" },
      { label: "Services focus", value: serviceOverview || "Not set" },
    ];
  }, [profileData, serviceOverview]);

  if (loading || isLoadingProfile) {
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

  if (profileError) {
    return (
      <DashboardContainer className="space-y-4 py-8">
        <TitleBreadCrumbs title="Business Profile" breadCrumbTitle="Vendor / Business Profile" />
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
          <p className="text-sm font-semibold text-red-900">Failed to load profile</p>
          <p className="text-xs text-red-600 mt-1">Please try refreshing the page</p>
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
              <h2 className="text-xl font-semibold text-slate-900">{profileData?.data?.businessName || "Loading..."}</h2>
              <p className="text-sm font-semibold text-slate-600">{profileData?.data?.headquarters || "Not set"}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="space-y-1 text-right text-xs font-semibold text-slate-500">
                <p>Profile review</p>
                <p>Indexable</p>
              </div>
              <div className="space-y-1">
                <StatusPill status={profileData?.data?.status || "PENDING_REVIEW"} />
                <StatusPill status={isIndexable ? "Active" : "Hidden"} tone={isIndexable ? "success" : "danger"} size="sm" />
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{description || "No description available"}</p>
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
              {contactEmail || "No email set"}
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
            onClick={() => setIsIndexable((prev) => !prev)}
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
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Keywords</p>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                    value={seoKeywords.join(", ")}
                    onChange={(e) => setSeoKeywords(e.target.value.split(",").map(k => k.trim()))}
                  />
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Description</p>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Preview snippet</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{seoTitle || "No title set"}</p>
                <p className="text-xs text-blue-600">https://stadonclick.com/vendors/{profileData?.data?.slug || ""}</p>
                <p className="text-sm text-slate-600">{seoDescription || "No description set"}</p>
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Contact</p>
                <div className="text-sm text-slate-900">
                  <p>
                    <HiOutlinePhone className="inline h-4 w-4 text-blue-500" /> {contactPhone || "Not set"}
                  </p>
                  <p>
                  <HiOutlineEnvelope className="inline h-4 w-4 text-emerald-500" /> {contactEmail || "Not set"}
                  </p>
                  <p>
                  <HiOutlineMapPin className="inline h-4 w-4 text-amber-500" /> {profileData?.data?.city?.name || "Not set"}
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {businessHours && businessHours.length > 0 ? (
                  businessHours.map((slot: BusinessHour, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <input
                        type="text"
                        value={slot.day}
                        onChange={(e) => {
                          const updated = [...businessHours];
                          updated[index] = { ...slot, day: e.target.value };
                          setBusinessHours(updated);
                        }}
                        className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm font-semibold text-slate-900"
                        placeholder="Mon"
                      />
                      <input
                        type="text"
                        value={slot.value}
                        onChange={(e) => {
                          const updated = [...businessHours];
                          updated[index] = { ...slot, value: e.target.value };
                          setBusinessHours(updated);
                        }}
                        className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm font-semibold text-slate-900"
                        placeholder="09:00 - 17:00"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = businessHours.filter((_, i) => i !== index);
                          setBusinessHours(updated);
                        }}
                        className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-1 sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 text-center">
                    No business hours set. Click "Add Hours" to get started.
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setBusinessHours([...businessHours, { day: "", value: "" }]);
                }}
                className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100"
              >
                + Add Hours
              </button>
              
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                Add holiday exceptions or block slots before you leave town.
              </div>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Public preview</p>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{profileData?.data?.businessName || "Loading..."}</p>
                  <StatusPill status="LIVE" tone="success" size="sm" />
                </div>
                <p className="text-sm text-slate-600">{description || "No description available"}</p>
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
              disabled={isUpdating}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? "Saving..." : "Save profile"}
            </button>
            {savedStatus && <span className="text-emerald-600">{savedStatus}</span>}
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default VendorProfile;
