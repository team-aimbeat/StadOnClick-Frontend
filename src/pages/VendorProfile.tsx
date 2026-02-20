// import { useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { HiOutlineCheckCircle } from "react-icons/hi2";
// import { DashboardContainer } from "@/components/dashboard";
// import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
// import StatusPill from "@/components/vendor-dashboard/StatusPill";
// import { setPageTitle } from "@/features/Layout/themeConfigSlice";
// import { setUser } from "@/features/auth/authSlice";
// import { useAppDispatch, useAppSelector } from "@/app/hooks";
// import { authApi } from "@/features/auth/api/authApi";
// import { useMockLoader } from "@/lib/useMockLoader";
// import {
//   useCreateVendorBusinessProfileMutation,
//   useGetVendorProfileQuery,
//   useUpdateVendorProfileMutation,
// } from "@/features/vendorProfile/api/vendorProfileApi";
// import type { BusinessHour } from "@/features/vendorProfile/api/vendorProfileApi";
// import toast from "react-hot-toast";
// const formSteps = [
//   { id: "info", label: "Profile Info", description: "Provide business basics" },
//   { id: "seo", label: "SEO & Visibility", description: "Boost discoverability" },
//   { id: "contact", label: "Contact & Location", description: "Where can they reach you?" },
//   { id: "hours", label: "Business Hours", description: "Share when you're open" },
//   { id: "preview", label: "Preview", description: "See how it looks live" },
// ];

// const VendorProfile = () => {
//   const dispatch = useAppDispatch();
//   const authUser = useAppSelector((state) => state.auth.user);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [activeStep, setActiveStep] = useState(0);
//   const loading = useMockLoader();

//   const { data: profileData, isLoading: isLoadingProfile, error: profileError } = useGetVendorProfileQuery();
//   const [updateProfile, { isLoading: isUpdating }] = useUpdateVendorProfileMutation();
//   const [createBusinessProfile, { isLoading: isCreating }] = useCreateVendorBusinessProfileMutation();

//   const [businessName, setBusinessName] = useState("");
//   const [cityId, setCityId] = useState("");
//   const [description, setDescription] = useState("");
//   const [headquarters, setHeadquarters] = useState("");
//   const [serviceOverview, setServiceOverview] = useState("");
//   const [seoTitle, setSeoTitle] = useState("");
//   const [seoDescription, setSeoDescription] = useState("");
//   const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
//   const [isIndexable, setIsIndexable] = useState(true);
//   const [contactEmail, setContactEmail] = useState("");
//   const [contactPhone, setContactPhone] = useState("");
//   const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
//   const [invalidHours, setInvalidHours] = useState<number[]>([]);

//   useEffect(() => {
//     if (profileData?.data) {
//       const profile = profileData.data;
//       setBusinessName(profile.businessName || "");
//       setCityId(profile.city?.id || "");
//       setDescription(profile.description || "");
//       setHeadquarters(profile.headquarters || "");
//       setServiceOverview(profile.serviceOverview || "");
//       setSeoTitle(profile.seoTitle || "");
//       setSeoDescription(profile.seoDescription || "");
//       setSeoKeywords(profile.seoKeywords || []);
//       setIsIndexable(profile.isIndexable);
//       setContactEmail(profile.contactEmail || "");
//       setContactPhone(profile.contactPhone || "");
//       const hours = profile.businessHours;
//       if (Array.isArray(hours)) {
//         setBusinessHours(hours);
//       } else {
//         setBusinessHours([]);
//       }
//     }
//   }, [profileData]);

//   useEffect(() => {
//     dispatch(setPageTitle("Business Profile"));
//   }, [dispatch]);

//   const validateBusinessHour = (slot: BusinessHour) =>
//     (slot.day?.trim().length ?? 0) >= 2 && (slot.value?.trim().length ?? 0) >= 2;

//   const isSetupMode = !profileData?.data;
//   const isSaving = isUpdating || isCreating;
//   const activeSection = formSteps[activeStep]?.id ?? "info";
//   const isFirstStep = activeStep === 0;
//   const isLastStep = activeStep === formSteps.length - 1;
//   const nextStepLabel = formSteps[activeStep + 1]?.label ?? "";
//   const goToStep = (index: number) => setActiveStep(index);
//   const goNextStep = () => setActiveStep((prev) => Math.min(prev + 1, formSteps.length - 1));
//   const goPreviousStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));

//   const updateBusinessHour = (index: number, field: keyof BusinessHour, value: string) => {
//     setBusinessHours((prev) => {
//       const updated = [...prev];
//       updated[index] = { ...updated[index], [field]: value };
//       return updated;
//     });
//     setInvalidHours((prev) => prev.filter((i) => i !== index));
//   };

//   const handleSave = async () => {
//     if (!businessName.trim()) {
//       toast.error("Business name is required.");
//       return;
//     }

//     const invalidIndexes = businessHours.reduce<number[]>((errs, slot, index) => {
//       const isValid = validateBusinessHour(slot);
//       if (!isValid) {
//         errs.push(index);
//       }
//       return errs;
//     }, []);

//     if (invalidIndexes.length > 0) {
//       setInvalidHours(invalidIndexes);
//       toast.error("Each business hour entry needs at least 2 characters for day and time.");
//       return;
//     }

//     try {
//       if (isSetupMode) {
//         await createBusinessProfile({
//           businessName: businessName.trim(),
//           description: description || undefined,
//           cityId: cityId || undefined,
//           headquarters: headquarters || undefined,
//           serviceOverview: serviceOverview || undefined,
//           seoTitle: seoTitle || undefined,
//           seoDescription: seoDescription || undefined,
//           seoKeywords: seoKeywords.filter(Boolean),
//           isIndexable,
//           contactEmail: contactEmail || undefined,
//           contactPhone: contactPhone || undefined,
//           businessHours: businessHours.length > 0 ? businessHours : [],
//         }).unwrap();
//         toast.success("Business profile created. Vendor ID generated.");
//       } else {
//         await updateProfile({
//           businessName,
//           cityId: cityId || null,
//           description: description || null,
//           headquarters: headquarters || null,
//           serviceOverview,
//           seoTitle: seoTitle || null,
//           seoDescription: seoDescription || null,
//           seoKeywords: seoKeywords.filter(Boolean),
//           isIndexable,
//           contactEmail: contactEmail || null,
//           contactPhone: contactPhone || null,
//           businessHours: businessHours.length > 0 ? businessHours : undefined,
//         }).unwrap();
//         toast.success("Profile saved");
//       }

//       setInvalidHours([]);
//       dispatch(authApi.util.invalidateTags(["User"]));
//       if (authUser) {
//         dispatch(
//           setUser({
//             ...authUser,
//             nextAction: null,
//             vendorAccess: authUser.vendorAccess
//               ? { ...authUser.vendorAccess, setupRequired: false }
//               : authUser.vendorAccess,
//           }),
//         );
//       }

//       if (isSetupMode || location.pathname.includes("/business-profile/setup")) {
//         navigate("/vendor/dashboard", { replace: true });
//       }
//     } catch (error: any) {
//       console.error("Failed to save profile:", error);
//       toast.error(error?.data?.message || error?.data?.error || "Failed to save profile");
//     }
//   };

//   if (loading || isLoadingProfile) {
//     return (
//       <DashboardContainer className="py-10">
//         <div className="animate-pulse space-y-8">
//           <div className="h-8 w-64 bg-slate-200 rounded" />
//           <div className="grid lg:grid-cols-12 gap-6">
//             <div className="lg:col-span-3 space-y-6">
//               <div className="h-64 bg-slate-200 rounded-2xl" />
//             </div>
//             <div className="lg:col-span-9 space-y-6">
//               <div className="h-96 bg-slate-200 rounded-2xl" />
//             </div>
//           </div>
//         </div>
//       </DashboardContainer>
//     );
//   }

//   const profile = profileData?.data;

//   return (
//     <DashboardContainer className="py-8 pb-24">
//       {/* <TitleBreadCrumbs title="Business Profile" breadCrumbTitle="Vendor / Business Profile" /> */}

//       <div className="flex justify-center">
//         <main className="w-full max-w-5xl space-y-6">
//           {profileError && (
//             <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
//               <p className="text-amber-900 font-medium">No business profile yet.</p>
//               <p className="text-amber-800 text-sm mt-1">
//                 Fill the fields below and save to create your business profile and generate vendor ID.
//               </p>
//             </div>
//           )}

//           <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 md:p-8">
//             <div className="pb-6 border-b border-slate-100">
//               <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
//                 <div>
//                   <p className="text-xs uppercase tracking-wider text-slate-500">Business</p>
//                   <h2 className="text-2xl font-semibold text-slate-900 mt-1">
//                     {profile?.businessName || "Your Business"}
//                   </h2>
//                   <p className="text-sm text-slate-600 mt-1">{profile?.headquarters || "Location not set"}</p>
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <div className="text-right text-xs font-medium text-slate-500">
//                     <p>Profile status</p>
//                     <p className="mt-0.5">Search visibility</p>
//                   </div>
//                   <div className="space-y-1.5">
//                     <StatusPill status={profile?.status || "PENDING_REVIEW"} />
               
//                   </div>
//                 </div>
//               </div>

//               <p className="mt-5 text-slate-700 leading-relaxed">{description || "No business description added yet."}</p>
//             </div>
//             <div className="rounded-2xl bg-white  px-6 py-6">
//               <div className="flex items-center gap-3">
//                 {formSteps.map((step, index) => {
//                   const isCompleted = index < activeStep;
//                   const isActive = index === activeStep;
//                   return (
//                     <div key={step.id} className="flex flex-1 items-center">
//                       <div className="flex w-full justify-center">
//                         <button
//                           type="button"
//                           onClick={() => goToStep(index)}
//                           className={`inline-flex h-12 w-12 items-center justify-center rounded-full border-2 text-base font-semibold transition ${
//                             isActive
//                               ? "border-blue-600 text-blue-600"
//                               : isCompleted
//                               ? "border-blue-200 bg-blue-50 text-blue-700"
//                               : "border-slate-200 text-slate-500"
//                           }`}
//                         >
//                           {index + 1}
//                         </button>
//                       </div>
//                       {index < formSteps.length - 1 && <span className="flex-1 h-[1px] bg-slate-200" />}
//                     </div>
//                   );
//                 })}
//               </div>
//               <div className="mt-4 grid grid-cols-1 gap-1 text-center text-[14px]  tracking-[0.1em] sm:grid-cols-5">
//                 {formSteps.map((step) => (
//                   <div key={`${step.id}-label`}>
//                     <p className="text-[11px] font-semibold text-slate-900">{step.label}</p>
//                     {/* <p className="text-[10px] text-slate-500 tracking-[0.12em]">{step.description}</p> */}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {activeSection === "info" && (
//               <div className="pt-6 space-y-6">
//                 <div className="grid sm:grid-cols-2 gap-5 rounded-xl border border-slate-100 bg-slate-50/50 p-6">
//                   <div className="space-y-1.5">
//                     <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">Business Name *</label>
//                     <input
//                       type="text"
//                       value={businessName}
//                       onChange={(e) => setBusinessName(e.target.value)}
//                       className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
//                     />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">City ID</label>
//                     <input
//                       type="text"
//                       value={cityId}
//                       onChange={(e) => setCityId(e.target.value)}
//                       className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
//                       placeholder="UUID"
//                     />
//                   </div>
//                   <div className="space-y-1.5 sm:col-span-2">
//                     <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">Description</label>
//                     <textarea
//                       rows={3}
//                       value={description}
//                       onChange={(e) => setDescription(e.target.value)}
//                       className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm resize-y min-h-20"
//                     />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">Headquarters</label>
//                     <input
//                       type="text"
//                       value={headquarters}
//                       onChange={(e) => setHeadquarters(e.target.value)}
//                       className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
//                     />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">Services Focus</label>
//                     <input
//                       type="text"
//                       value={serviceOverview}
//                       onChange={(e) => setServiceOverview(e.target.value)}
//                       className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
//                     />
//                   </div>
//                 </div>

//                 <div className="rounded-xl bg-blue-50/40 border border-blue-100 p-5 text-sm text-slate-700">
//                   <p className="font-medium text-slate-800">Why this information matters</p>
//                   <p className="mt-1.5">Clear details help customers find and trust your business faster.</p>
//                 </div>
//               </div>
//             )}

//             {activeSection === "seo" && (
//               <div className="pt-6 space-y-6">
//                 <div className="space-y-5 rounded-xl border border-slate-100 bg-slate-50/50 p-6">
//                   <div className="grid sm:grid-cols-2 gap-5">
//                     <div className="space-y-1.5">
//                       <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">SEO Title</label>
//                       <input
//                         type="text"
//                         value={seoTitle}
//                         onChange={(e) => setSeoTitle(e.target.value)}
//                         className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
//                       />
//                     </div>
//                     <div className="space-y-1.5">
//                       <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">Keywords</label>
//                       <input
//                         type="text"
//                         value={seoKeywords.join(", ")}
//                         onChange={(e) => setSeoKeywords(e.target.value.split(",").map((k) => k.trim()))}
//                         className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
//                       />
//                     </div>
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">
//                       Meta Description
//                     </label>
//                     <textarea
//                       rows={3}
//                       value={seoDescription}
//                       onChange={(e) => setSeoDescription(e.target.value)}
//                       className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm resize-y min-h-20"
//                     />
//                   </div>
//                 </div>

//                 <div className="rounded-xl border border-slate-100 p-5 bg-white">
//                   <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Google preview</p>
//                   <p className="font-medium text-blue-700">{seoTitle || "Title not set"}</p>
//                   <p className="text-sm text-green-700">
//                     https://stadonclick.com/vendors/{profile?.slug || "your-slug"}
//                   </p>
//                   <p className="mt-1 text-sm text-slate-600 line-clamp-2">
//                     {seoDescription || "No description set..."}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {activeSection === "contact" && (
//               <div className="pt-6 grid md:grid-cols-2 gap-6">
//                 <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-6 shadow-sm space-y-4">
//                   <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">Contact Details</p>
//                   <div className="space-y-1.5">
//                     <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">Contact Phone</label>
//                     <input
//                       type="text"
//                       value={contactPhone}
//                       onChange={(e) => setContactPhone(e.target.value)}
//                       className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
//                     />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">Contact Email</label>
//                     <input
//                       type="email"
//                       value={contactEmail}
//                       onChange={(e) => setContactEmail(e.target.value)}
//                       className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
//                     />
//                   </div>
//                 </div>

//                 <div className="rounded-xl border border-slate-100 p-6 shadow-sm">
//                   <p className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-medium">Location Performance</p>
//                   <p className="text-sm text-slate-700">
//                     Most viewed areas: Lower Parel, Bandra, Andheri. Consider highlighting availability in these zones.
//                   </p>
//                   <div className="mt-5 h-40 bg-linear-to-br from-slate-50 to-blue-50/30 rounded-lg flex items-center justify-center text-slate-400 text-sm">
//                     Map preview (placeholder)
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeSection === "hours" && (
//               <div className="pt-6 space-y-6">
//                 <div className="rounded-xl border border-slate-100 p-6 bg-white shadow-sm">
//                   <div className="grid gap-4 sm:grid-cols-2">
//                     {businessHours.length > 0 ? (
//                       businessHours.map((slot, index) => {
//                         const rowInvalid = invalidHours.includes(index);
//                         return (
//                           <div key={index} className="space-y-1">
//                             <div
//                               className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
//                                 rowInvalid
//                                   ? "border-red-300 bg-red-50"
//                                   : "border-slate-200 bg-slate-50"
//                               }`}
//                             >
//                               <input
//                                 value={slot.day}
//                                 onChange={(e) => updateBusinessHour(index, "day", e.target.value)}
//                                 className="w-20 rounded border border-slate-300 px-3 py-1.5 text-sm"
//                                 placeholder="Mon"
//                               />
//                               <input
//                                 value={slot.value}
//                                 onChange={(e) => updateBusinessHour(index, "value", e.target.value)}
//                                 className="flex-1 rounded border border-slate-300 px-3 py-1.5 text-sm"
//                                 placeholder="09:00 - 17:00"
//                               />
//                               <button
//                                 onClick={() => {
//                                   setBusinessHours(businessHours.filter((_, i) => i !== index));
//                                   setInvalidHours((prev) => prev.filter((i) => i !== index));
//                                 }}
//                                 className="text-red-600 hover:text-red-700 text-sm font-medium"
//                               >
//                                 Remove
//                               </button>
//                             </div>
//                             {rowInvalid && (
//                               <p className="text-xs text-red-600">
//                                 Day and time must each be at least 2 characters.
//                               </p>
//                             )}
//                           </div>
//                         );
//                       })
//                     ) : (
//                       <div className="col-span-2 text-center py-8 text-slate-500 text-sm">
//                         No business hours added yet.
//                       </div>
//                     )}
//                   </div>

//                   <button
//                     onClick={() => setBusinessHours([...businessHours, { day: "", value: "" }])}
//                     className="mt-5 w-full py-2.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 font-medium text-sm"
//                   >
//                     + Add Hours
//                   </button>
//                 </div>
//               </div>
//             )}

//             {activeSection === "preview" && (
//             <div className="pt-6">
//               <div className="rounded-xl border border-slate-100 p-6 bg-white shadow-sm">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-semibold text-slate-900">
//                     {profile?.businessName || "Business Name"}
//                   </h3>
//                   <StatusPill status="LIVE" tone="success" size="sm" />
//                 </div>
//                 <p className="text-slate-700">{description || "No description available"}</p>
//               </div>
//             </div>
//           )}

//           <div className="mt-6 border-t border-slate-100 pt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//             <div className="flex gap-3">
//               {!isFirstStep && (
//                 <button
//                   type="button"
//                   onClick={goPreviousStep}
//                   className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
//                 >
//                   Back
//                 </button>
//               )}
//               {!isLastStep && (
//                 <button
//                   type="button"
//                   onClick={goNextStep}
//                   className="inline-flex items-center justify-center rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
//                 >
//                   Next: {nextStepLabel}
//                 </button>
//               )}
//             </div>
//             <button
//               onClick={handleSave}
//               disabled={isSaving}
//               className={`px-8 py-2.5 rounded-xl font-semibold text-white transition ${
//                 isSaving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
//               }`}
//             >
//               {isSaving ? "Saving..." : isSetupMode ? "Create Business Profile" : "Save Changes"}
//             </button>
//           </div>
//         </div>
//       </main>
//     </div>
//   </DashboardContainer>
// );
// };

// export default VendorProfile;




import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DashboardContainer } from "@/components/dashboard";
import StatusPill from "@/components/vendor-dashboard/StatusPill";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import defaultVendorCover from "@/assets/images/bgsalon.jpg";
import foodCover from "@/assets/images/food.jpg";
import leisureCover from "@/assets/images/event.jpg";
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
  const [isIndexable, setIsIndexable] = useState(true);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [invalidHours, setInvalidHours] = useState<number[]>([]);
  const [isVendorAvatarBroken, setIsVendorAvatarBroken] = useState(false);
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<string>("Mon");
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

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

        {/* ── Alert Banner ── */}
        {profileError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-semibold text-amber-900">No business profile yet.</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Fill the fields below and save to create your business profile and generate vendor ID.
            </p>
          </div>
        )}

        {/* ── Blue Cover Banner ── */}
        <div
          className="relative h-44 rounded-2xl overflow-hidden bg-slate-300"
          style={{
            backgroundImage: `url(${coverImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/20" />

          {/* Change Cover button */}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverFileChange}
          />
          <button
            type="button"
            onClick={handleCoverUploadClick}
            disabled={isUploadingAvatar || isSaving}
            className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/30 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Change Cover
          </button>
        </div>

        {/* ── Body: Sidebar + Main ── */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── Left Sidebar ── */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

              {/* Avatar + name */}
              <div className="flex flex-col items-center px-6 pt-8 pb-6 border-b border-slate-100">
                <div className="relative">
                  {showVendorAvatar ? (
                    <img
                      src={vendorAvatarUrl}
                      alt={profile?.businessName || businessName || "Vendor"}
                      className="w-24 h-24 rounded-full object-cover shadow-md"
                      onError={() => setIsVendorAvatarBroken(true)}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                      {(profile?.businessName || businessName || "V")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                  />
                  <button
                    type="button"
                    onClick={handleAvatarUploadClick}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:bg-blue-400"
                    aria-label="Upload vendor profile image"
                    title={isUploadingAvatar ? "Uploading..." : "Upload profile image"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <p className="mt-3 text-base font-semibold text-slate-900 text-center">
                  {profile?.businessName || businessName || "Your Business"}
                </p>
                <p className="mt-0.5 text-sm text-slate-400 text-center">
                  {profile?.headquarters || headquarters || "Location not set"}
                </p>
              </div>

              {/* Stats */}
              <div className="divide-y divide-slate-100">
                <div className="flex items-center justify-between px-6 py-3.5">
                  <span className="text-sm text-slate-500">Profile status</span>
                  <StatusPill status={profile?.status || "PENDING_REVIEW"} />
                </div>
                <div className="flex items-center justify-between px-6 py-3.5">
                  <span className="text-sm text-slate-500">Opportunities applied</span>
                  <span className="text-sm font-bold text-blue-600">—</span>
                </div>
                <div className="flex items-center justify-between px-6 py-3.5">
                  <span className="text-sm text-slate-500">Opportunities won</span>
                  <span className="text-sm font-bold text-green-500">—</span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-5 space-y-2.5">
                <button className="w-full rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                  View Public Profile
                </button>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <span className="flex-1 truncate text-sm text-slate-400">
                    {profile?.slug ? `stadonclick.com/v/${profile.slug}` : "Slug not set"}
                  </span>
                  <button className="shrink-0 text-slate-400 hover:text-blue-600 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main Panel ── */}
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
                    <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">City</label>
                    <Select value={cityId} onValueChange={setCityId}>
                      <SelectTrigger className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm">
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
                    <label className="text-xs uppercase tracking-wider text-slate-500 font-medium">Description</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm resize-y min-h-20"
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

                {/* ── SEO & Visibility ── */}
                {activeSection === "seo" && (
                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>SEO Title</label>
                        <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={inputCls} placeholder="Page title for search engines" />
                      </div>
                      <div>
                        <label className={labelCls}>Keywords</label>
                        <input type="text" value={seoKeywords.join(", ")} onChange={(e) => setSeoKeywords(e.target.value.split(",").map((k) => k.trim()))} className={inputCls} placeholder="keyword1, keyword2" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Meta Description</label>
                      <textarea rows={3} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className={`${inputCls} resize-y`} placeholder="Brief description for search results..." />
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white px-5 py-4">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Google Preview</p>
                      <p className="text-sm font-semibold text-blue-700">{seoTitle || "Title not set"}</p>
                      <p className="text-xs text-green-700 mt-0.5">https://stadonclick.com/vendors/{profile?.slug || "your-slug"}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{seoDescription || "No description set..."}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setIsIndexable(!isIndexable)} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${isIndexable ? "bg-blue-600" : "bg-slate-200"}`}>
                        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${isIndexable ? "translate-x-4" : "translate-x-1"}`} />
                      </button>
                      <span className="text-sm text-slate-600">Allow search engine indexing</span>
                    </div>
                  </div>
                )}

                {/* ── Contact & Location ── */}
                {activeSection === "contact" && (
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-5 space-y-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Contact Details</p>
                      <div>
                        <label className={labelCls}>Contact Phone</label>
                        <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputCls} placeholder="+1-800-000" />
                      </div>
                      <div>
                        <label className={labelCls}>Contact Email</label>
                        <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-100 p-5 space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Location Performance</p>
                      <p className="text-sm text-slate-600">Most viewed areas: Lower Parel, Bandra, Andheri. Consider highlighting availability in these zones.</p>
                      <div className="h-40 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-100 flex items-center justify-center text-slate-400 text-sm">
                        Map preview (placeholder)
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Business Hours ── */}
                {activeSection === "hours" && (
                  <div className="rounded-xl border border-slate-100 bg-white p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Set business timings</p>

                      </div>
                
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                      {weekdayOptions.map((day) => {
                        const count = businessHourSlotsByDay[day]?.length ?? 0;
                        const isActive = day === selectedScheduleDay;
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => setSelectedScheduleDay(day)}
                            className={`rounded-lg border px-3 py-2 text-left transition ${
                              isActive
                                ? "border-blue-300 bg-blue-50"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <p className={`text-sm font-semibold ${isActive ? "text-blue-700" : "text-slate-700"}`}>
                              {day}
                            </p>
                            
                          </button>
                        );
                      })}
                    </div>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {selectedDaySlots.length > 0 ? (
                          selectedDaySlots.map(({ index, slot }) => {
                            const rowInvalid = invalidHours.includes(index);
                            const { startTime, endTime } = parseBusinessHourValue(slot.value ?? "");
                            return (
                              <div key={index} className={`rounded-lg border p-3 ${rowInvalid ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
                                <div className="grid gap-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <TimePicker
                                      label="Open"
                                      value={startTime}
                                      onChange={(value) => updateBusinessHourTimeRange(index, value, endTime)}
                                      slotProps={{ textField: { size: "small", fullWidth: true } }}
                                    />
                                    <TimePicker
                                      label="Close"
                                      value={endTime}
                                      onChange={(value) => updateBusinessHourTimeRange(index, startTime, value)}
                                      slotProps={{ textField: { size: "small", fullWidth: true } }}
                                    />
                                  </div>
                                  <div className="flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setBusinessHours(businessHours.filter((_, i) => i !== index));
                                        setInvalidHours((prev) => prev.filter((i) => i !== index));
                                      }}
                                      className="text-red-500 hover:text-red-600 text-xs font-medium transition"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                                {rowInvalid && <p className="mt-1 text-xs text-red-500">Day and time must each be at least 2 characters.</p>}
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-span-2 py-10 text-center text-sm text-slate-400">
                            No slots added for {selectedScheduleDay}.
                          </div>
                        )}
                      </div>
                    </LocalizationProvider>
                    <button
                      onClick={() =>
                        setBusinessHours([
                          ...businessHours,
                          { day: selectedScheduleDay, value: "" },
                        ])
                      }
                      className="w-full rounded-lg border border-blue-200 bg-blue-50 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-100 transition"
                    >
                      + Add Business Hours for {selectedScheduleDay}
                    </button>
                  </div>
                )}

                {/* ── Preview ── */}
                {activeSection === "preview" && (
                  <div className="rounded-xl border border-slate-100 bg-white p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900">{profile?.businessName || businessName || "Business Name"}</h3>
                      <StatusPill status="LIVE" tone="success" size="sm" />
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{description || "No description available."}</p>
                    {(contactPhone || contactEmail) && (
                      <div className="space-y-1 text-sm text-slate-700">
                        {contactPhone && <p><span className="font-medium">Phone:</span> {contactPhone}</p>}
                        {contactEmail && <p><span className="font-medium">Email:</span> {contactEmail}</p>}
                      </div>
                    )}
                    {headquarters && <p className="text-sm text-slate-700"><span className="font-medium">HQ:</span> {headquarters}</p>}
                    {businessHours.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">Business Hours</p>
                        <div className="space-y-1">
                          {businessHours.map((h, i) => (
                            <p key={i} className="text-sm text-slate-600">{h.day}: {h.value}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Footer Navigation ── */}
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

