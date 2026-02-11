import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
} from "react-icons/hi2";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import StatusPill from "@/components/vendor-dashboard/StatusPill";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { setUser } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { authApi } from "@/features/auth/api/authApi";
import { useMockLoader } from "@/lib/useMockLoader";
import {
  useCreateVendorBusinessProfileMutation,
  useGetVendorProfileQuery,
  useUpdateVendorProfileMutation,
} from "@/features/vendorProfile/api/vendorProfileApi";
import type { BusinessHour } from "@/features/vendorProfile/api/vendorProfileApi";
import toast from "react-hot-toast";
const sidebarSections = [
  { id: "info", label: "Profile Info" },
  { id: "seo", label: "SEO & Visibility" },
  { id: "contact", label: "Contact & Location" },
  { id: "hours", label: "Business Hours" },
  { id: "preview", label: "Preview" },
];

const VendorProfile = () => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("info");
  const loading = useMockLoader();

  const { data: profileData, isLoading: isLoadingProfile, error: profileError } = useGetVendorProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateVendorProfileMutation();
  const [createBusinessProfile, { isLoading: isCreating }] = useCreateVendorBusinessProfileMutation();

  const [businessName, setBusinessName] = useState("");
  const [cityId, setCityId] = useState("");
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
  const [invalidHours, setInvalidHours] = useState<number[]>([]);

  useEffect(() => {
    if (profileData?.data) {
      const profile = profileData.data;
      setBusinessName(profile.businessName || "");
      setCityId(profile.city?.id || "");
      setDescription(profile.description || "");
      setHeadquarters(profile.headquarters || "");
      setServiceOverview(profile.serviceOverview || "");
      setSeoTitle(profile.seoTitle || "");
      setSeoDescription(profile.seoDescription || "");
      setSeoKeywords(profile.seoKeywords || []);
      setIsIndexable(profile.isIndexable);
      setContactEmail(profile.contactEmail || "");
      setContactPhone(profile.contactPhone || "");
      const hours = profile.businessHours;
      if (Array.isArray(hours)) {
        setBusinessHours(hours);
      } else {
        setBusinessHours([]);
      }
    }
  }, [profileData]);

  useEffect(() => {
    dispatch(setPageTitle("Business Profile"));
  }, [dispatch]);

  const validateBusinessHour = (slot: BusinessHour) =>
    (slot.day?.trim().length ?? 0) >= 2 && (slot.value?.trim().length ?? 0) >= 2;

  const isSetupMode = !profileData?.data;
  const isSaving = isUpdating || isCreating;

  const updateBusinessHour = (index: number, field: keyof BusinessHour, value: string) => {
    setBusinessHours((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setInvalidHours((prev) => prev.filter((i) => i !== index));
  };

  const handleSave = async () => {
    if (!businessName.trim()) {
      toast.error("Business name is required.");
      return;
    }

    const invalidIndexes = businessHours.reduce<number[]>((errs, slot, index) => {
      const isValid = validateBusinessHour(slot);
      if (!isValid) {
        errs.push(index);
      }
      return errs;
    }, []);

    if (invalidIndexes.length > 0) {
      setInvalidHours(invalidIndexes);
      toast.error("Each business hour entry needs at least 2 characters for day and time.");
      return;
    }

    try {
      if (isSetupMode) {
        await createBusinessProfile({
          businessName: businessName.trim(),
          description: description || undefined,
          cityId: cityId || undefined,
          headquarters: headquarters || undefined,
          serviceOverview: serviceOverview || undefined,
          seoTitle: seoTitle || undefined,
          seoDescription: seoDescription || undefined,
          seoKeywords: seoKeywords.filter(Boolean),
          isIndexable,
          contactEmail: contactEmail || undefined,
          contactPhone: contactPhone || undefined,
          businessHours: businessHours.length > 0 ? businessHours : [],
        }).unwrap();
        toast.success("Business profile created. Vendor ID generated.");
      } else {
        await updateProfile({
          businessName,
          cityId: cityId || null,
          description: description || null,
          headquarters: headquarters || null,
          serviceOverview,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
          seoKeywords: seoKeywords.filter(Boolean),
          isIndexable,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          businessHours: businessHours.length > 0 ? businessHours : undefined,
        }).unwrap();
        toast.success("Profile saved");
      }

      setInvalidHours([]);
      dispatch(authApi.util.invalidateTags(["User"]));
      if (authUser) {
        dispatch(
          setUser({
            ...authUser,
            nextAction: null,
            vendorAccess: authUser.vendorAccess
              ? { ...authUser.vendorAccess, setupRequired: false }
              : authUser.vendorAccess,
          }),
        );
      }

      if (isSetupMode || location.pathname.includes("/business-profile/setup")) {
        navigate("/vendor/dashboard", { replace: true });
      }
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      toast.error(error?.data?.message || error?.data?.error || "Failed to save profile");
    }
  };

  const completenessItems = useMemo(() => {
    const profile = profileData?.data;

    if (!profile) {
      return [];
    }

    const servicesCount = profile._count?.services ?? 1;

    return [
      { label: "Add business details", done: Boolean(profile.description?.trim()) },
      { label: "Upload KYC documents", done: profile.kycStatus !== "NOT_SUBMITTED" },
      { label: "Connect Stripe payouts", done: profile.payoutsEnabled },
      { label: "Publish  services", done: servicesCount >= 1 },
      { label: "Respond to new leads", done: profile.totalBookings > 0 },
      { label: "Share recent photos", done: Boolean(profile.seoImageKey) },
    ];
  }, [profileData]);

  if (loading || isLoadingProfile) {
    return (
      <DashboardContainer className="py-10">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-64 bg-slate-200 rounded" />
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div className="h-64 bg-slate-200 rounded-2xl" />
            </div>
            <div className="lg:col-span-9 space-y-6">
              <div className="h-96 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </DashboardContainer>
    );
  }

  const profile = profileData?.data;

  return (
    <DashboardContainer className="py-8 pb-24">
      <TitleBreadCrumbs title="Business Profile" breadCrumbTitle="Vendor / Business Profile" />

      <div className="grid lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3 lg:sticky lg:top-6 h-fit space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {sidebarSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-5 py-3.5 text-sm font-medium transition-colors ${
                  activeSection === section.id
                ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-4 font-medium">
              Profile completeness
            </p>
            <div className="space-y-3 text-sm">
              {completenessItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  {item.done ? (
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <HiOutlineClock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  )}
                  <span className={item.done ? "text-slate-800" : "text-slate-600"}>{item.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500 leading-relaxed">
              Completing these steps improves visibility and lead quality.
            </p>
          </div>
        </aside>

        <main className="lg:col-span-9 space-y-6">
          {profileError && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
              <p className="text-amber-900 font-medium">No business profile yet.</p>
              <p className="text-amber-800 text-sm mt-1">
                Fill the fields below and save to create your business profile and generate vendor ID.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 md:p-8">
            <div className="pb-6 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Business</p>
                  <h2 className="text-2xl font-semibold text-slate-900 mt-1">
                    {profile?.businessName || "Your Business"}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">{profile?.headquarters || "Location not set"}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-xs font-medium text-slate-500">
                    <p>Profile status</p>
                    <p className="mt-0.5">Search visibility</p>
                  </div>
                  <div className="space-y-1.5">
                    <StatusPill status={profile?.status || "PENDING_REVIEW"} />
               
                  </div>
                </div>
              </div>

              <p className="mt-5 text-slate-700 leading-relaxed">{description || "No business description added yet."}</p>
            </div>

            {activeSection === "info" && (
              <div className="pt-6 space-y-6">
                <div className="grid sm:grid-cols-2 gap-5 rounded-xl border border-slate-100 bg-slate-50/50 p-6">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">Business Name *</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">City ID</label>
                    <input
                      type="text"
                      value={cityId}
                      onChange={(e) => setCityId(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                      placeholder="UUID"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">Description</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm resize-y min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">Headquarters</label>
                    <input
                      type="text"
                      value={headquarters}
                      onChange={(e) => setHeadquarters(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">Services Focus</label>
                    <input
                      type="text"
                      value={serviceOverview}
                      onChange={(e) => setServiceOverview(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50/40 border border-blue-100 p-5 text-sm text-slate-700">
                  <p className="font-medium text-slate-800">Why this information matters</p>
                  <p className="mt-1.5">Clear details help customers find and trust your business faster.</p>
                </div>
              </div>
            )}

            {activeSection === "seo" && (
              <div className="pt-6 space-y-6">
                <div className="space-y-5 rounded-xl border border-slate-100 bg-slate-50/50 p-6">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">SEO Title</label>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">Keywords</label>
                      <input
                        type="text"
                        value={seoKeywords.join(", ")}
                        onChange={(e) => setSeoKeywords(e.target.value.split(",").map((k) => k.trim()))}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                      Meta Description
                    </label>
                    <textarea
                      rows={3}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm resize-y min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 p-5 bg-white">
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Google preview</p>
                  <p className="font-medium text-blue-700">{seoTitle || "Title not set"}</p>
                  <p className="text-sm text-green-700">
                    https://stadonclick.com/vendors/{profile?.slug || "your-slug"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                    {seoDescription || "No description set..."}
                  </p>
                </div>
              </div>
            )}

            {activeSection === "contact" && (
              <div className="pt-6 grid md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-6 shadow-sm space-y-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">Contact Details</p>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">Contact Phone</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">Contact Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-medium">Location Performance</p>
                  <p className="text-sm text-slate-700">
                    Most viewed areas: Lower Parel, Bandra, Andheri. Consider highlighting availability in these zones.
                  </p>
                  <div className="mt-5 h-40 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                    Map preview (placeholder)
                  </div>
                </div>
              </div>
            )}

            {activeSection === "hours" && (
              <div className="pt-6 space-y-6">
                <div className="rounded-xl border border-slate-100 p-6 bg-white shadow-sm">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {businessHours.length > 0 ? (
                      businessHours.map((slot, index) => {
                        const rowInvalid = invalidHours.includes(index);
                        return (
                          <div key={index} className="space-y-1">
                            <div
                              className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                                rowInvalid
                                  ? "border-red-300 bg-red-50"
                                  : "border-slate-200 bg-slate-50"
                              }`}
                            >
                              <input
                                value={slot.day}
                                onChange={(e) => updateBusinessHour(index, "day", e.target.value)}
                                className="w-20 rounded border border-slate-300 px-3 py-1.5 text-sm"
                                placeholder="Mon"
                              />
                              <input
                                value={slot.value}
                                onChange={(e) => updateBusinessHour(index, "value", e.target.value)}
                                className="flex-1 rounded border border-slate-300 px-3 py-1.5 text-sm"
                                placeholder="09:00 - 17:00"
                              />
                              <button
                                onClick={() => {
                                  setBusinessHours(businessHours.filter((_, i) => i !== index));
                                  setInvalidHours((prev) => prev.filter((i) => i !== index));
                                }}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </div>
                            {rowInvalid && (
                              <p className="text-xs text-red-600">
                                Day and time must each be at least 2 characters.
                              </p>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-2 text-center py-8 text-slate-500 text-sm">
                        No business hours added yet.
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setBusinessHours([...businessHours, { day: "", value: "" }])}
                    className="mt-5 w-full py-2.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 font-medium text-sm"
                  >
                    + Add Hours
                  </button>
                </div>
              </div>
            )}

          {activeSection === "preview" && (
            <div className="pt-6">
              <div className="rounded-xl border border-slate-100 p-6 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {profile?.businessName || "Business Name"}
                  </h3>
                  <StatusPill status="LIVE" tone="success" size="sm" />
                </div>
                <p className="text-slate-700">{description || "No description available"}</p>
              </div>
            </div>
          )}

          <div className="mt-6 border-t border-slate-100 pt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`ml-auto px-8 py-2.5 rounded-xl font-semibold text-white transition ${
                isSaving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSaving ? "Saving..." : isSetupMode ? "Create Business Profile" : "Save Changes"}
            </button>
          </div>
        </div>
      </main>
    </div>
  </DashboardContainer>
);
};

export default VendorProfile;
