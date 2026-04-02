import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DashboardContainer } from "@/components/dashboard";
import { LocationPicker } from "@/components/forms/LocationPicker";
import StatusPill from "@/components/vendor-dashboard/StatusPill";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HiOutlineMapPin } from "react-icons/hi2";
import defaultVendorCover from "@/assets/Images/bgsalon.jpg";
import foodCover from "@/assets/Images/food.jpg";
import leisureCover from "@/assets/Images/event.jpg";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { setUser } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { authApi, useGetCitiesQuery, useUploadAvatarMutation } from "@/features/auth/api/authApi";
import { useMockLoader } from "@/lib/useMockLoader";
import {
  useCreateVendorBusinessProfileMutation,
  useGetVendorProfileQuery,
  useUpdateVendorProfileMutation,
} from "@/features/vendorProfile/api/vendorProfileApi";
import { vendorServicesApi } from "@/services/vendorServicesApi";
import type { BusinessHour } from "@/features/vendorProfile/api/vendorProfileApi";
import toast from "react-hot-toast";

dayjs.extend(customParseFormat);

const formSteps = [
  { id: "info", label: "Profile Info" },
  { id: "seo", label: "SEO & Visibility" },
  { id: "contact", label: "Contact & Location" },
  { id: "hours", label: "Business Hours" },
  { id: "preview", label: "Preview" },
];
const weekdayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const parseCoordsFromText = (value: string): { lat: number | null; lng: number | null } => {
  const taggedMatch = value.match(
    /coords\s*:\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/i,
  );
  const match =
    taggedMatch ?? value.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return { lat: null, lng: null };
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { lat: null, lng: null };
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return { lat: null, lng: null };
  return { lat, lng };
};

const stripCoordsTag = (value: string) =>
  value
    .replace(/\s*\[\s*coords\s*:\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\]\s*$/i, "")
    .trim();

const buildHeadquartersValue = (
  headquarters: string,
  coordinates: { lat: number | null; lng: number | null },
) => {
  const cleanHeadquarters = stripCoordsTag(headquarters);
  const lat = Number(coordinates.lat);
  const lng = Number(coordinates.lng);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  if (!hasCoords) return cleanHeadquarters;

  const coordsTag = `coords:${lat.toFixed(6)},${lng.toFixed(6)}`;
  return cleanHeadquarters ? `${cleanHeadquarters} [${coordsTag}]` : coordsTag;
};

const VendorProfile = () => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const loading = useMockLoader();
  const isBusinessOnboardingRoute = location.pathname === "/business/onboarding";
  const isVendorUser = (authUser?.roles ?? []).includes("VENDOR");
  const shouldSkipVendorProfileQuery = isBusinessOnboardingRoute && !isVendorUser;

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useGetVendorProfileQuery(undefined, { skip: shouldSkipVendorProfileQuery });
  const { data: citiesResponse, isLoading: isLoadingCities } = useGetCitiesQuery(undefined);
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();
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
  const [seoKeywordInput, setSeoKeywordInput] = useState("");
  const [isIndexable, setIsIndexable] = useState(true);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [invalidHours, setInvalidHours] = useState<number[]>([]);
  const [isVendorAvatarBroken, setIsVendorAvatarBroken] = useState(false);
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<string>("Mon");
  const [headquartersCoords, setHeadquartersCoords] = useState<{
    lat: number | null;
    lng: number | null;
  }>({ lat: null, lng: null });
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (profileData?.data) {
      const profile = profileData.data;
      setBusinessName(profile.businessName || "");
      setCityId(profile.city?.id || "");
      setDescription(profile.description || "");
      setHeadquarters(stripCoordsTag(profile.headquarters || ""));
      setHeadquartersCoords(parseCoordsFromText(profile.headquarters || ""));
      setServiceOverview(profile.serviceOverview || "");
      setSeoTitle(profile.seoTitle || "");
      setSeoDescription(profile.seoDescription || "");
      setSeoKeywords(profile.seoKeywords || []);
      setIsIndexable(profile.isIndexable);
      setContactEmail(profile.contactEmail || "");
      setContactPhone(profile.contactPhone || "");
      const hours = profile.businessHours;
      setBusinessHours(Array.isArray(hours) ? hours : []);
    }
  }, [profileData]);

  useEffect(() => {
    dispatch(setPageTitle("Business Profile"));
  }, [dispatch]);

  const validateBusinessHour = (slot: BusinessHour) =>
    (slot.day?.trim().length ?? 0) >= 2 && (slot.value?.trim().length ?? 0) >= 2;

  const isSetupMode = !profileData?.data;
  const isSaving = isUpdating || isCreating;
  const activeSection = formSteps[activeStep]?.id ?? "info";
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === formSteps.length - 1;
  const nextStepLabel = formSteps[activeStep + 1]?.label ?? "";

  const goToStep = (index: number) => setActiveStep(index);
  const goNextStep = () => setActiveStep((prev) => Math.min(prev + 1, formSteps.length - 1));
  const goPreviousStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const updateBusinessHour = (index: number, field: keyof BusinessHour, value: string) => {
    setBusinessHours((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setInvalidHours((prev) => prev.filter((i) => i !== index));
  };
  const parseBusinessHourValue = (value: string) => {
    const [rawStart = "", rawEnd = ""] =
      value.includes(" - ") ? value.split(" - ") : value.split(/\s*-\s*/);
    const parseTime = (input: string) => {
      if (!input.trim()) return null;
      const parsed = dayjs(input.trim(), ["h:mm A", "hh:mm A", "H:mm", "HH:mm"], true);
      return parsed.isValid() ? parsed : null;
    };
    return {
      startTime: parseTime(rawStart),
      endTime: parseTime(rawEnd),
    };
  };
  const updateBusinessHourTimeRange = (
    index: number,
    startTime: Dayjs | null,
    endTime: Dayjs | null,
  ) => {
    const startText = startTime ? startTime.format("hh:mm A") : "";
    const endText = endTime ? endTime.format("hh:mm A") : "";
    const range = startText || endText ? `${startText} - ${endText}`.trim() : "";
    updateBusinessHour(index, "value", range);
  };
  const resolveDayKey = (value: string) => {
    const normalized = value.trim().toLowerCase();
    const match = weekdayOptions.find((day) => normalized.startsWith(day.toLowerCase()));
    return match ?? "Mon";
  };
  const businessHourSlotsByDay = useMemo(() => {
    const grouped: Record<string, Array<{ index: number; slot: BusinessHour }>> = {
      Mon: [],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
      Sat: [],
      Sun: [],
    };
    businessHours.forEach((slot, index) => {
      const day = resolveDayKey(slot.day || "");
      grouped[day].push({ index, slot });
    });
    return grouped;
  }, [businessHours]);
  const selectedDaySlots = businessHourSlotsByDay[selectedScheduleDay] ?? [];

  const handleSave = async () => {
    if (!businessName.trim()) {
      toast.error("Business name is required.");
      return;
    }
    const invalidIndexes = businessHours.reduce<number[]>((errs, slot, index) => {
      if (!validateBusinessHour(slot)) errs.push(index);
      return errs;
    }, []);
    if (invalidIndexes.length > 0) {
      setInvalidHours(invalidIndexes);
      toast.error("Each business hour entry needs at least 2 characters for day and time.");
      return;
    }
    const headquartersForSave = buildHeadquartersValue(headquarters, headquartersCoords);
    try {
      if (isSetupMode) {
        await createBusinessProfile({
          businessName: businessName.trim(),
          description: description || undefined,
          cityId: cityId || undefined,
          headquarters: headquartersForSave || undefined,
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
          headquarters: headquartersForSave || null,
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
      dispatch(vendorServicesApi.util.invalidateTags(["VendorServices"]));
      if (authUser) {
        dispatch(
          setUser({
            ...authUser,
            nextAction: null,
            vendorAccess: authUser.vendorAccess
              ? { ...authUser.vendorAccess, setupRequired: false }
              : authUser.vendorAccess,
          })
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

  const profileStrength = useMemo(() => {
    if (completenessItems.length === 0) return 0;
    const completed = completenessItems.filter((item) => item.done).length;
    return Math.round((completed / completenessItems.length) * 100);
  }, [completenessItems]);

  const seoHealthScore = useMemo(() => {
    const titleScore = seoTitle.trim() ? 30 : 0;
    const descriptionScore = seoDescription.trim() ? 35 : 0;
    const keywordsScore = seoKeywords.filter(Boolean).length > 0 ? 20 : 0;
    const indexScore = isIndexable ? 15 : 0;
    return titleScore + descriptionScore + keywordsScore + indexScore;
  }, [isIndexable, seoDescription, seoKeywords, seoTitle]);

  const cityOptions = useMemo(() => {
    const cities = citiesResponse?.data ?? [];
    return [...cities].sort((a, b) => a.name.localeCompare(b.name));
  }, [citiesResponse?.data]);

  const profile = profileData?.data;
  const defaultCoverByCategory = useMemo(() => {
    const categoryText = [
      serviceOverview,
      profile?.serviceOverview,
      profile?.description,
      ...(profile?.seoKeywords ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (categoryText.includes("food")) return foodCover;
    if (categoryText.includes("leisure")) return leisureCover;
    return defaultVendorCover;
  }, [
    serviceOverview,
    profile?.serviceOverview,
    profile?.description,
    profile?.seoKeywords,
  ]);

  const coverImageUrl = useMemo(() => {
    const candidate = profile?.seoImageKey?.trim();
    if (!candidate) return defaultCoverByCategory;
    if (/^https?:\/\//i.test(candidate) || candidate.startsWith("data:")) {
      return candidate;
    }

    const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
    if (!apiBaseUrl) return defaultCoverByCategory;
    return `${apiBaseUrl}/${candidate.replace(/^\/+/, "")}`;
  }, [defaultCoverByCategory, profile?.seoImageKey]);
  const vendorAvatarUrl = useMemo(() => {
    const candidate = (authUser?.profileImageUrl ?? "").trim();
    if (!candidate) return "";
    if (/^https?:\/\//i.test(candidate) || candidate.startsWith("data:")) {
      return candidate;
    }

    const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
    if (!apiBaseUrl) return candidate;
    return `${apiBaseUrl}/${candidate.replace(/^\/+/, "")}`;
  }, [authUser?.profileImageUrl]);
  const showVendorAvatar = Boolean(vendorAvatarUrl) && !isVendorAvatarBroken;
  const validateImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return false;
    }
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast.error("Image must be 5MB or smaller.");
      return false;
    }
    return true;
  };
  const handleAvatarUploadClick = () => {
    avatarInputRef.current?.click();
  };
  const handleAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (!validateImageFile(file)) return;

    try {
      const formData = new FormData();
      formData.append("profileImage", file);
      const response = await uploadAvatar(formData).unwrap();
      const uploadedUrl = response?.profileImageUrl;

      if (uploadedUrl && authUser) {
        dispatch(setUser({ ...authUser, profileImageUrl: uploadedUrl }));
        setIsVendorAvatarBroken(false);
      }
      toast.success("Profile image updated");
    } catch (error) {
      toast.error("Unable to upload profile image");
    }
  };
  const handleCoverUploadClick = () => {
    coverInputRef.current?.click();
  };
  const handleCoverFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (!validateImageFile(file)) return;

    try {
      const formData = new FormData();
      formData.append("profileImage", file);
      const response = await uploadAvatar(formData).unwrap();
      const uploadedUrl = response?.profileImageUrl;
      if (!uploadedUrl) {
        toast.error("Unable to upload cover image");
        return;
      }

      await updateProfile({ seoImageKey: uploadedUrl }).unwrap();
      toast.success("Cover image updated");
    } catch (error) {
      toast.error("Unable to upload cover image");
    }
  };

  if (loading || isLoadingProfile) {
    return (
      <DashboardContainer className="py-10">
        <div className="mx-auto max-w-8xl animate-pulse space-y-4">
          <div className="h-44 bg-slate-200 rounded-2xl" />
          <div className="flex gap-5">
            <div className="w-72 h-96 bg-slate-200 rounded-2xl" />
            <div className="flex-1 h-96 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </DashboardContainer>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder:text-slate-300";
  const labelCls = "block text-xs font-medium text-slate-500 mb-1.5";

  return (
    <DashboardContainer className="pb-24">
      <div className="mx-auto max-w-8xl space-y-5">

        {/* â”€â”€ Alert Banner â”€â”€ */}
        {profileError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-semibold text-amber-900">No business profile yet.</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Fill the fields below and save to create your business profile and generate vendor ID.
            </p>
          </div>
        )}

        {/* â”€â”€ Profile Hero â”€â”€ */}
        <div className="relative overflow-hidden rounded-[28px] border border-slate-100 bg-white px-5 py-5">
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverFileChange}
          />
          <div
            className="pointer-events-none absolute -right-6 top-4 h-36 w-36 rounded-[26px] bg-cover bg-center opacity-10 blur-[1px]"
            style={{ backgroundImage: `url(${coverImageUrl})` }}
            aria-hidden
          />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="h-18 w-18 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {showVendorAvatar ? (
                    <img
                      src={vendorAvatarUrl}
                      alt={profile?.businessName || businessName || "Vendor"}
                      className="h-full w-full object-cover"
                      onError={() => setIsVendorAvatarBroken(true)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-2xl font-bold text-slate-700">
                      {(profile?.businessName || businessName || "V").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAvatarUploadClick}
                  disabled={isUploadingAvatar}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                  aria-label="Upload vendor profile image"
                  title={isUploadingAvatar ? "Uploading..." : "Upload profile image"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5h2m-1 0v14m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-[family:'proxima-condensed-bold',sans-serif] text-[30px] font-bold tracking-tight text-slate-900">
                    {profile?.businessName || businessName || "Business Name"}
                  </h1>
                  <StatusPill status={profile?.status || "PENDING_REVIEW"} size="sm" />
                </div>
                <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                  Complete your profile to start receiving bookings from new clients.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <HiOutlineMapPin className="h-4 w-4 text-slate-500" />
                    {profile?.city?.name || cityId || "City not set"}
                  </span>
                  <span className="hidden h-4 w-px bg-slate-300 sm:block" aria-hidden />
                  <span>{dayjs().format("dddd, D MMM YYYY")}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <button
                type="button"
                onClick={() => navigate(`/vendor/${profile?.slug || "profile"}`)}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#3554e0] transition hover:bg-blue-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H3m0 0l4-4m-4 4l4 4m13-8v8a2 2 0 01-2 2H6" />
                </svg>
                View Public Profile
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#3554e0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2742be] disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* â”€â”€ Body: Sidebar + Main â”€â”€ */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* â”€â”€ Left Sidebar â”€â”€ */}
          <aside className="w-full lg:w-80 shrink-0 space-y-5">
            <div className="rounded-[24px] border border-slate-100 bg-[#0f172a] p-5 text-white shadow-[0_18px_50px_-38px_rgba(15,23,42,0.45)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                Profile Strength
              </p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-[38px] font-bold leading-none">
                  {profileStrength}%
                </span>
                <span className="pb-1 text-sm font-medium text-white/55">
                  Intermediate
                </span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-[#3554e0]"
                  style={{ width: `${profileStrength}%` }}
                />
              </div>
              <ul className="mt-5 space-y-3 text-sm text-white/80">
                {completenessItems.slice(0, 4).map((item) => (
                  <li key={item.label} className="flex items-center gap-2">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full ${
                        item.done ? "bg-emerald-500 text-white" : "border border-white/30"
                      }`}
                    >
                      {item.done ? "✓" : ""}
                    </span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.2)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Identity Check
              </p>
              <div className="mt-4 rounded-[18px] border border-slate-100 bg-slate-50 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-blue-50 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.79 3-4s-1.343-4-3-4-3 1.79-3 4 1.343 4 3 4zM6 20a6 6 0 0112 0" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Verified Vendor
                    </p>
                    <p className="text-xs text-slate-500">Tier 1 Status</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/vendor/kyc")}
                className="mt-4 w-full rounded-2xl border border-[#d8e0ff] bg-white px-4 py-3 text-sm font-semibold text-[#3554e0] transition hover:bg-slate-50"
              >
                Upgrade Verification
              </button>
            </div>
          </aside>

          {/* â”€â”€ Main Panel â”€â”€ */}
          <main className="flex-1 min-w-0">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

              {/* Horizontal Tabs */}
              <div className="border-b border-slate-100 px-6 overflow-x-auto">
                <nav className="flex">
                  {formSteps.map((step, index) => {
                    const isActive = index === activeStep;
                    const isCompleted = index < activeStep;
                    return (
                      <button
                        key={step.id}
                        onClick={() => goToStep(index)}
                        className={`relative shrink-0 px-5 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                          isActive
                            ? "text-blue-600"
                            : isCompleted
                            ? "text-slate-500 hover:text-slate-700"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {step.label}
                        {isActive && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6 space-y-5">
            {activeSection === "info" && (
              <div className="pt-6 space-y-6">
                <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.25)]">
                  <p className="text-[18px] font-bold text-slate-900">
                    General Information
                  </p>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        City
                      </label>
                      <Select value={cityId} onValueChange={setCityId}>
                        <SelectTrigger className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 focus:bg-white">
                          <SelectValue placeholder={isLoadingCities ? "Loading cities..." : "Select city"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-72 overflow-y-auto">
                          {isLoadingCities ? (
                            <SelectItem value="__loading__" disabled>
                              Loading cities...
                            </SelectItem>
                          ) : cityOptions.length === 0 ? (
                            <SelectItem value="__empty__" disabled>
                              No cities found
                            </SelectItem>
                          ) : (
                            cityOptions.map((city) => (
                              <SelectItem key={city.id} value={city.id}>
                                {city.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your business values and services..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Headquarters
                      </label>
                      <input
                        type="text"
                        value={headquarters}
                        onChange={(e) => {
                          const value = e.target.value;
                          setHeadquarters(value);
                          setHeadquartersCoords(parseCoordsFromText(value));
                        }}
                        placeholder="e.g. Silicon Valley"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Services Focus
                      </label>
                      <input
                        type="text"
                        value={serviceOverview}
                        onChange={(e) => setServiceOverview(e.target.value)}
                        placeholder="e.g. Corporate, Retail"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-blue-100 bg-blue-50/60 p-5">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20.5A8.5 8.5 0 1012 3.5a8.5 8.5 0 000 17z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-blue-700">
                        Why this information matters
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Your business profile is the first thing potential clients see. Providing accurate and detailed information increases trust and helps our matching algorithm place your services in front of the right buyers. Vendors with complete profiles see a 40% increase in initial inquiries.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

                {/* â”€â”€ SEO & Visibility â”€â”€ */}
                {activeSection === "seo" && (
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Business Profile</p>
                        <h2 className="mt-1 text-[20px] font-bold tracking-tight text-slate-900">
                          SEO &amp; Visibility
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                          Optimise how your business appears in search engine results.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center rounded-xl bg-[#3554e0] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2742be] disabled:cursor-not-allowed disabled:bg-blue-400"
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                      <div className="space-y-5">
                        <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.22)]">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m-7-7h14" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-[18px] font-bold text-slate-900">Meta Information</p>
                            </div>
                          </div>

                          <div className="mt-6 space-y-4">
                            <div>
                              <div className="mb-2 flex items-center justify-between">
                                <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                  SEO Title
                                </label>
                                <span className="text-xs font-semibold text-[#3554e0]">
                                  {seoTitle.length}/60
                                </span>
                              </div>
                              <input
                                type="text"
                                value={seoTitle}
                                onChange={(e) => setSeoTitle(e.target.value)}
                                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white"
                                placeholder="Modern Interiors | Curated Furniture Design Studio"
                              />
                              <p className="mt-2 text-xs text-slate-400">
                                Recommended: 50-60 characters
                              </p>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                Keywords
                              </label>
                              <div className="mt-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                <div className="flex flex-wrap gap-2">
                                  {seoKeywords.filter(Boolean).length > 0 ? (
                                    seoKeywords.filter(Boolean).map((keyword) => (
                                      <span
                                        key={keyword}
                                        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                                      >
                                        {keyword}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setSeoKeywords((prev) => prev.filter((item) => item !== keyword))
                                          }
                                          className="text-slate-400 hover:text-slate-600"
                                        >
                                          ×
                                        </button>
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-sm text-slate-400">Add keywords...</span>
                                  )}
                                </div>
                              <input
                                type="text"
                                value={seoKeywordInput}
                                onChange={(e) => setSeoKeywordInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    const value = seoKeywordInput.trim();
                                    if (!value) return;
                                    setSeoKeywords((prev) => [...prev, ...value.split(",").map((k) => k.trim()).filter(Boolean)]);
                                    setSeoKeywordInput("");
                                  }
                                }}
                                placeholder="Add keyword..."
                                className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-0"
                              />
                              </div>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                Meta Description
                              </label>
                              <textarea
                                rows={4}
                                value={seoDescription}
                                onChange={(e) => setSeoDescription(e.target.value)}
                                className="mt-2 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white resize-none"
                                placeholder="Discover bespoke furniture and minimalist interior solutions..."
                              />
                              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                                <span>Recommended: 150-160 characters</span>
                                <span className="font-semibold text-[#3554e0]">
                                  {seoDescription.length}/160
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.22)]">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16M4 6h16M4 18h16" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-[18px] font-bold text-slate-900">Search Engine Indexing</p>
                              <p className="text-sm text-slate-500">Allow Google and other search engines to crawl your profile.</p>
                            </div>
                          </div>
                          <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                            <span className="text-sm text-slate-600">Allow search engine indexing</span>
                            <button
                              type="button"
                              onClick={() => setIsIndexable(!isIndexable)}
                              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                                isIndexable ? "bg-[#3554e0]" : "bg-slate-200"
                              }`}
                            >
                              <span
                                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                  isIndexable ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5">
              

                        <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.22)]">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">SEO Health Score</p>
                          <div className="mt-4 flex items-center gap-4">
                            <div className="relative grid h-16 w-16 place-items-center">
                              <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                                <path
                                  className="text-slate-100"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                  d="M18 2.5a15.5 15.5 0 1 1 0 31a15.5 15.5 0 1 1 0-31"
                                />
                                <path
                                  className="text-[#3554e0]"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  strokeLinecap="round"
                                  fill="none"
                                  strokeDasharray={`${Math.max(0, Math.min(100, seoHealthScore))}, 100`}
                                  d="M18 2.5a15.5 15.5 0 1 1 0 31a15.5 15.5 0 1 1 0-31"
                                />
                              </svg>
                              <span className="absolute text-sm font-bold text-slate-900">{seoHealthScore}%</span>
                            </div>
                            <p className="text-sm leading-6 text-slate-600">
                              Your meta description is the perfect length. Consider adding 2 more high-intent keywords to improve ranking.
                            </p>
                          </div>
                        </div>

                        <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.22)]">
                          <p className="text-[18px] font-bold text-slate-900">Quick SEO Tips</p>
                          <ul className="mt-4 space-y-4 text-sm text-slate-600">
                            <li className="flex items-start gap-3">
                              <span className="mt-0.5 text-[#3554e0]">●</span>
                              <span>Include your primary business category in the title tag.</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="mt-0.5 text-[#3554e0]">●</span>
                              <span>Keep descriptions engaging to improve Click-Through Rate (CTR).</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="mt-0.5 text-[#3554e0]">●</span>
                              <span>Ensure your business location is mentioned in keywords if applicable.</span>
                            </li>
                          </ul>
                          <button
                            type="button"
                            className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                          >
                            Learn More in SEO Guide
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* â”€â”€ Contact & Location â”€â”€ */}
                {activeSection === "contact" && (
                  <div className="grid gap-5 xl:grid-cols-[0.95fr_1.4fr]">
                    <div className="space-y-5">
                      <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.22)]">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18a1 1 0 001-1V7a1 1 0 00-1-1H3a1 1 0 00-1 1v8a1 1 0 001 1z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[18px] font-bold text-slate-900">Contact Channels</p>
                            <p className="text-sm text-slate-500">How customers can reach you</p>
                          </div>
                        </div>

                        <div className="mt-5 space-y-4">
                          <div>
                            <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                              Contact Phone
                            </label>
                            <div className="mt-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                              <input
                                type="text"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                placeholder="+1 (555) 234-8901"
                                className="w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                              Contact Email
                            </label>
                            <div className="mt-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                              <input
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                placeholder="ops@luxurycurations.io"
                                className="w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.22)]">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5v14" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[18px] font-bold text-slate-900">Headquarters</p>
                            <p className="text-sm text-slate-500">Main office address</p>
                          </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                          <p className="text-sm font-medium text-slate-500">Main office address</p>
                          <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
                            {headquarters || "725 5th Ave, New York, NY 10022, United States"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-[20px] border border-blue-100 bg-blue-50/70 px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-xl bg-blue-100 text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M4.93 19h14.14c1.54 0 2.51-1.67 1.74-3L14.74 4.99c-.77-1.33-2.71-1.33-3.48 0L3.19 16c-.77 1.33.2 3 1.74 3z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-blue-700">Verified Enterprise</p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              Your location data is synchronized with public business registries for authenticity.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.22)]">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-[18px] font-bold text-slate-900">Business Location</p>
                            <p className="mt-1 text-sm text-slate-500">
                              Search, drop a pin, or reuse the saved office address.
                            </p>
                          </div>
                          <div className="flex items-center gap-2 rounded-full bg-slate-50 p-1 text-xs font-semibold text-slate-500">
                            <span className="rounded-full bg-white px-3 py-1 shadow-sm">My location</span>
                            <span className="rounded-full bg-[#edf2ff] px-3 py-1 text-[#3554e0]">Drop pin here</span>
                          </div>
                        </div>

                        <div className="mt-5 rounded-[28px] border border-slate-100 bg-slate-50 p-4">
                          <div className="rounded-[22px] bg-white px-4 py-3 shadow-sm">
                            <LocationPicker
                              label="Business location"
                              helperText="This will be saved in your business profile."
                              value={headquartersCoords}
                              onChange={({ lat, lng, address }) => {
                                setHeadquartersCoords({ lat, lng });
                                const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                                setHeadquarters(address?.trim() || fallbackAddress);
                              }}
                            />
                          </div>

                          <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Latitude</p>
                              <p className="mt-2 text-sm font-semibold text-slate-800">
                                {headquartersCoords.lat !== null ? `${headquartersCoords.lat.toFixed(4)}Â° N` : "Not set"}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Longitude</p>
                              <p className="mt-2 text-sm font-semibold text-slate-800">
                                {headquartersCoords.lng !== null ? `${headquartersCoords.lng.toFixed(4)}Â° E` : "Not set"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-[18px] border border-slate-100 bg-white p-4 ">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                            Business Note
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            Changes are applied immediately to your public profile.
                          </p>
                        </div>
                        <div className="rounded-[18px] border border-slate-100 bg-white p-4 ">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                            Status
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            Keep the contact and location information current for better trust.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* â”€â”€ Business Hours â”€â”€ */}
                {activeSection === "hours" && (
                  <div className="space-y-5">
                    <div className="rounded-[24px] border border-slate-100 bg-white px-6 py-5 ">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">Operating Controls</p>
                      <h3 className="mt-1 text-[30px] font-bold tracking-tight text-slate-900">Business Hours</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                        Set your availability for clients and automated booking sequences. Changes here reflect across your storefront and service listings in real time.
                      </p>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[0.42fr_1fr]">
                      <div className="rounded-[24px] border border-slate-100 bg-white p-5">
                        <p className="text-base font-bold text-slate-900">Weekly Schedule</p>
                        <div className="mt-4 space-y-2">
                          {weekdayOptions.map((day) => {
                            const count = businessHourSlotsByDay[day]?.length ?? 0;
                            const isActive = day === selectedScheduleDay;
                            const label = count > 0 ? `${count} slot${count > 1 ? "s" : ""}` : "Closed";
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => setSelectedScheduleDay(day)}
                                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                                  isActive
                                    ? "bg-[#3554e0] text-white shadow-lg shadow-blue-200"
                                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                }`}
                              >
                                <span className={`text-sm font-semibold ${isActive ? "text-white" : "text-slate-700"}`}>
                                  {day}
                                </span>
                                <span className={`text-xs font-semibold ${isActive ? "text-white/80" : "text-slate-400"}`}>
                                  {label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="rounded-[24px] border border-slate-100 bg-white p-5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="text-[28px] font-bold tracking-tight text-slate-900">
                                {selectedScheduleDay === "Mon"
                                  ? "Monday"
                                  : selectedScheduleDay === "Tue"
                                  ? "Tuesday"
                                  : selectedScheduleDay === "Wed"
                                  ? "Wednesday"
                                  : selectedScheduleDay === "Thu"
                                  ? "Thursday"
                                  : selectedScheduleDay === "Fri"
                                  ? "Friday"
                                  : selectedScheduleDay === "Sat"
                                  ? "Saturday"
                                  : "Sunday"}
                              </h3>
                              <p className="mt-1 text-sm text-slate-500">
                                Configure specific time blocks for this day.
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-400">Closed</span>
                              <button
                                type="button"
                                className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#3554e0]"
                                aria-label="Day open toggle"
                              >
                                <span className="inline-block h-5 w-5 translate-x-5 rounded-full bg-white shadow-sm" />
                              </button>
                              <span className="text-xs font-semibold text-slate-400">Open</span>
                            </div>
                          </div>

                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <div className="mt-5 space-y-4">
                              {selectedDaySlots.length > 0 ? (
                                selectedDaySlots.map(({ index, slot }) => {
                                  const rowInvalid = invalidHours.includes(index);
                                  const { startTime, endTime } = parseBusinessHourValue(slot.value ?? "");
                                  return (
                                    <div
                                      key={index}
                                      className={`rounded-2xl border p-4 ${
                                        rowInvalid ? "border-red-300 bg-red-50" : "border-slate-100 bg-slate-50"
                                      }`}
                                    >
                                      <div className="grid gap-3 md:grid-cols-2">
                                        <TimePicker
                                          label="Start Time"
                                          value={startTime}
                                          onChange={(value) => updateBusinessHourTimeRange(index, value, endTime)}
                                          slotProps={{ textField: { size: "small", fullWidth: true } }}
                                        />
                                        <TimePicker
                                          label="End Time"
                                          value={endTime}
                                          onChange={(value) => updateBusinessHourTimeRange(index, startTime, value)}
                                          slotProps={{ textField: { size: "small", fullWidth: true } }}
                                        />
                                      </div>
                                      <div className="mt-3 flex justify-end">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setBusinessHours(businessHours.filter((_, i) => i !== index));
                                            setInvalidHours((prev) => prev.filter((i) => i !== index));
                                          }}
                                          className="text-xs font-semibold text-red-500 transition hover:text-red-600"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                      {rowInvalid && (
                                        <p className="mt-2 text-xs text-red-500">
                                          Day and time must each be at least 2 characters.
                                        </p>
                                      )}
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-400">
                                  No slots added for {selectedScheduleDay}.
                                </div>
                              )}

                              <button
                                onClick={() =>
                                  setBusinessHours([
                                    ...businessHours,
                                    { day: selectedScheduleDay, value: "" },
                                  ])
                                }
                                className="w-full rounded-2xl border border-dashed border-[#cfd8ff] bg-white py-3 text-sm font-semibold text-[#3554e0] transition hover:bg-blue-50"
                              >
                                + Add Business Hours
                              </button>
                            </div>
                          </LocalizationProvider>
                        </div>

        

                       
                      </div>
                    </div>
                  </div>
                )}

                {/* â”€â”€ Preview â”€â”€ */}
                {activeSection === "preview" && (
                  <div className="space-y-5">
                    <div
                      className="relative overflow-hidden rounded-[28px] border border-slate-100 bg-slate-900 text-white shadow-[0_18px_50px_-38px_rgba(15,23,42,0.45)]"
                      style={{
                        backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.08), rgba(15,23,42,0.78)), url(${coverImageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
                      <div className="relative flex min-h-[260px] flex-col justify-end p-5 sm:p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                          <div className="flex items-end gap-4">
                            <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
                              {showVendorAvatar ? (
                                <img
                                  src={vendorAvatarUrl}
                                  alt={profile?.businessName || businessName || "Vendor"}
                                  className="h-full w-full object-cover"
                                  onError={() => setIsVendorAvatarBroken(true)}
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-2xl font-bold text-slate-700">
                                  {(profile?.businessName || businessName || "V").charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="pb-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-[28px] font-bold tracking-tight text-white">
                                  {profile?.businessName || businessName || "Business Name"}
                                </h3>
                                <StatusPill status={profile?.status || "PENDING_REVIEW"} size="sm" />
                              </div>
                              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/80">
                                Complete your profile to start receiving bookings from new clients.
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/75">
                                <span>{profile?.city?.name || cityId || "City not set"}</span>
                                <span>•</span>
                                <span>{contactPhone || contactEmail || "No contact details"}</span>
                                <span>•</span>
                                <span>{dayjs().format("ddd, D MMM YYYY")}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                     
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
                      <div className="space-y-5">
                        <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.18)]">
                          <p className="text-[18px] font-bold text-slate-900">About the Business</p>
                          <p className="mt-4 text-sm leading-7 text-slate-600">
                            {description ||
                              "Paaji brings a revolutionary approach to Indian culinary traditions in the heart of San Francisco. Founded with the vision of blending rustic North Indian flavours with contemporary presentation, we specialize in curated dining experiences that feel warm, thoughtful, and memorable."}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {(seoKeywords.length > 0 ? seoKeywords : ["Sustainable Sourcing", "Outdoor Seating", "Event Catering", "Vegan Options"]).slice(0, 4).map((item) => (
                              <span
                                key={item}
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          {[
                            {
                              title: "Dine-in Experience",
                              text: "Premium dine-in service with a curated in-store vibe.",
                            },
                            {
                              title: "Private Events",
                              text: "Host special occasions for groups and celebrations.",
                            },
                            {
                              title: "Elite Catering",
                              text: "Professional off-site catering for private events.",
                            },
                          ].map((card) => (
                            <div key={card.title} className="rounded-[20px] border border-slate-100 bg-white p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.16)]">
                              <p className="text-sm font-bold text-slate-900">{card.title}</p>
                              <p className="mt-2 text-sm leading-6 text-slate-600">{card.text}</p>
                            </div>
                          ))}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {[
                            {
                              title: "Outdoor Seating",
                              text: "Comfortable seating for relaxed dining.",
                            },
                            {
                              title: "Artisanal Pantry",
                              text: "Exclusive spice blends and house-made sauces.",
                            },
                          ].map((card) => (
                            <div key={card.title} className="rounded-[20px] border border-slate-100 bg-white p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.16)]">
                              <p className="text-sm font-bold text-slate-900">{card.title}</p>
                              <p className="mt-2 text-sm leading-6 text-slate-600">{card.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.18)]">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Business Hours</p>
                          <div className="mt-4 space-y-3 text-sm">
                            {businessHours.length > 0 ? (
                              businessHours.slice(0, 4).map((h, i) => (
                                <div key={`${h.day}-${i}`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                  <span className="font-semibold text-slate-700">{h.day}</span>
                                  <span className="text-slate-500">{h.value || "Closed"}</span>
                                </div>
                              ))
                            ) : (
                              <>
                                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                  <span className="font-semibold text-slate-700">Mon - Thu</span>
                                  <span className="text-slate-500">11:00 AM - 10:00 PM</span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                                  <span className="font-semibold text-slate-700">Fri - Sun</span>
                                  <span className="text-slate-500">12:00 PM - 9:00 PM</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-[0_18px_50px_-38px_rgba(15,23,42,0.18)]">
                          <div className="h-48 bg-[linear-gradient(135deg,#2f7f74_0%,#3aa9a0_100%)] p-4">
                            <div className="flex h-full items-center justify-center rounded-[18px] border border-white/20 bg-white/10 backdrop-blur-sm">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3554e0] text-white shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s6-4.35 6-10a6 6 0 10-12 0c0 5.65 6 10 6 10z" />
                                  <circle cx="12" cy="11" r="2.5" fill="currentColor" stroke="none" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="text-sm font-semibold text-slate-900">Visit Us</p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">{headquarters || "725 5th Ave, New York, NY 10022, United States"}</p>
                            <button
                              type="button"
                              className="mt-4 w-full rounded-2xl bg-[#edf2ff] px-4 py-3 text-sm font-semibold text-[#3554e0]"
                            >
                              Get Directions
                            </button>
                          </div>
                        </div>

           
                      </div>
                    </div>
                  </div>
                )}

                {/* â”€â”€ Footer Navigation â”€â”€ */}
                <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 pt-4">
                    {!isFirstStep && (
                      <button type="button" onClick={goPreviousStep} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                        Back
                      </button>
                    )}
                    {!isLastStep && (
                      <button type="button" onClick={goNextStep} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition">
                        Next: {nextStepLabel}
                      </button>
                    )}
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`rounded-xl px-8 py-2.5 text-sm font-semibold text-white transition ${isSaving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                      {isSaving ? "Saving..." : isSetupMode ? "Create Business Profile" : "Save Changes"}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </main>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default VendorProfile;
