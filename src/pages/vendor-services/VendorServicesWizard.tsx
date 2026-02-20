import type React from "react";
import type { Dayjs } from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlinePlusCircle, HiOutlineTrash } from "react-icons/hi2";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

import type { ServiceCategory, ServiceMasterCategory } from "@/services/serviceCategoriesApi";
import type { VendorOffering } from "@/services/vendorOfferingsApi";
import well from "@/assets/Images/well.jpg";
import wellSm from "@/assets/Images/optimized/well-sm.jpg";
import type { Visual } from "@/pages/vendor-services/vendorServicesVisuals";

import { DashboardContainer } from "@/components/dashboard";
import { LocationPicker } from "@/components/forms/LocationPicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { MasterServiceCard } from "@/pages/vendor-services/MasterServiceCard";
import { MasterServiceHero } from "@/pages/vendor-services/MasterServiceHero";
import { formatCurrency } from "@/pages/vendor-services/vendorServicesUtils";
import { categoryVisuals, masterServiceVisuals } from "@/pages/vendor-services/vendorServicesVisuals";

const fallbackMasterVisual = (alt: string): Visual => ({
  src: well,
  alt,
  srcSet: `${wellSm} 480w, ${well} 1200w`,
});

export type VendorServicesWizardProps = {
  wizardScrollRef: React.RefObject<HTMLDivElement | null>;
  isEditing: boolean;
  stepOrder: Array<{ id: number; label: string }>;
  stepMotion: any;
  currentStep: number;
  highestStep: number;
  goToStep: (step: number) => void;
  setShowListing: (value: boolean) => void;
  setCurrentStep: (value: number) => void;

  selectedMasterServiceId: string;
  masterServiceOptions: ServiceMasterCategory[];
  isMasterLoading: boolean;
  wizardError: string | null;
  handleSelectMaster: (id: string) => void;
  handleNextFromMaster: () => void;
  selectedMasterService?: ServiceMasterCategory;

  categoryOptions: ServiceCategory[];
  isCategoryFetching: boolean;
  categoryError: boolean;
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
  handleNextFromCategory: () => void;
  selectedCategory?: ServiceCategory;

  handleNextFromDetails: () => void;
  createdServiceId: string | null;
  vendorServiceDetails: {
    title: string;
    description: string;
    terms: string;
    latitude: string;
    longitude: string;
  };
  vendorServiceErrors: Record<string, string>;
  handleVendorServiceDetailChange: (
    field: "title" | "description" | "terms" | "latitude" | "longitude",
    value: string,
  ) => void;
  refundPolicy: { type: string; windowHours: string };
  handleRefundPolicyChange: (field: "type" | "windowHours", value: string) => void;

  selectedExistingOfferingId: string;
  setSelectedExistingOfferingId: (value: string) => void;
  existingOfferings: VendorOffering[];
  isOfferingsFetching: boolean;
  offeringsError: boolean;

  handleCreateOffering: any;
  register: any;
  fields: any[];
  append: (value: any) => void;
  remove: (index: number) => void;
  errors: any;
  generalError: string | null;

  enableSlots: boolean;
  setEnableSlots: (value: boolean) => void;
  slotFields: { startTime: string; endTime: string; capacity: string };
  slotStartDate: Dayjs | null;
  slotEndDate: Dayjs | null;
  slotStartTime: Dayjs | null;
  slotEndTime: Dayjs | null;
  handleSlotDateChange: (kind: "start" | "end", value: Dayjs | null) => void;
  handleSlotTimeChange: (kind: "start" | "end", value: Dayjs | null) => void;
  handleSlotFieldUpdate: (
    field: "startTime" | "endTime" | "capacity",
    value: string,
  ) => void;
  slotValidationError: string | null;

  enableRules: boolean;
  setEnableRules: (value: boolean) => void;
  ruleFields: { type: string; value: string };
  handleRuleFieldUpdate: (field: "type" | "value", value: string) => void;
  ruleValidationError: string | null;
  RULE_OPTIONS: Array<{ label: string; value: string }>;

  isSubmitting: boolean;

  pendingCategoryReset: { masterId?: string; categoryId?: string } | null;
  setPendingCategoryReset: React.Dispatch<
    React.SetStateAction<{ masterId?: string; categoryId?: string } | null>
  >;
  isResettingOfferings: boolean;
  handleConfirmedCategoryReset: () => void;
};

export const VendorServicesWizard = (props: VendorServicesWizardProps) => {
  const {
    wizardScrollRef,
    isEditing,
    stepOrder,
    stepMotion,
    currentStep,
    highestStep,
    goToStep,
    setShowListing,
    setCurrentStep,
    selectedMasterServiceId,
    masterServiceOptions,
    isMasterLoading,
    wizardError,
    handleSelectMaster,
    handleNextFromMaster,
    selectedMasterService,
    categoryOptions,
    isCategoryFetching,
    categoryError,
    selectedCategoryId,
    setSelectedCategoryId,
    handleNextFromCategory,
    handleNextFromDetails,
    createdServiceId,
    vendorServiceDetails,
    vendorServiceErrors,
    handleVendorServiceDetailChange,
    refundPolicy,
    handleRefundPolicyChange,
    selectedCategory,
    selectedExistingOfferingId,
    setSelectedExistingOfferingId,
    existingOfferings,
    isOfferingsFetching,
    offeringsError,
    handleCreateOffering,
    register,
    fields,
    append,
    remove,
    errors,
    generalError,
    enableSlots,
    setEnableSlots,
    slotFields,
    slotStartDate,
    slotEndDate,
    slotStartTime,
    slotEndTime,
    handleSlotDateChange,
    handleSlotTimeChange,
    handleSlotFieldUpdate,
    slotValidationError,
    enableRules,
    setEnableRules,
    ruleFields,
    handleRuleFieldUpdate,
    ruleValidationError,
    RULE_OPTIONS,
    isSubmitting,
    pendingCategoryReset,
    setPendingCategoryReset,
    isResettingOfferings,
    handleConfirmedCategoryReset,
  } = props;
  const isMovieBookingsCategory = selectedCategory?.slug === "movie-bookings";

  return (
    <div ref={wizardScrollRef}>
      <DashboardContainer className="space-y-6 pb-16">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              Vendor Experience
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              {isEditing ? "Update Offerings" : "Create Offerings"}
            </h1>
            <p className="text-sm text-slate-500">
              Move step by step: master service → category → details → offerings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowListing(true);
              setCurrentStep(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
          <div className="flex flex-wrap gap-3">
            {stepOrder.map((step) => {
              const isActive = currentStep === step.id;
              const isDone = currentStep > step.id;
              const isLockedStep = isEditing && step.id < 3;
              const isClickable = step.id <= highestStep && !isLockedStep;
              return (
                <div
                  key={step.id}
                  role={isClickable ? "button" : undefined}
                  tabIndex={isClickable ? 0 : -1}
                  onClick={() => isClickable && goToStep(step.id)}
                  onKeyDown={(e) => {
                    if (!isClickable) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goToStep(step.id);
                    }
                  }}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : isDone
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                  style={{ cursor: isClickable ? "pointer" : "default" }}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : isDone
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {step.id}
                  </span>
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {currentStep === 1 && (
            <motion.section
              key="step-1"
              className="rounded-3xl border border-slate-100 bg-white p-6"
              {...stepMotion}
            >
              <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                    Master service
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">
                    Select your core offering
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Choose a master service to unlock categories, details, and offerings.
                  </p>

                  <div className="mt-5">
                    {isMasterLoading ? (
                      <div className="grid gap-3 mt-10 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 animate-pulse"
                          >
                            <div className="h-12 w-12 rounded-full bg-slate-200" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 w-20 rounded-full bg-slate-200" />
                              <div className="h-2 w-16 rounded-full bg-slate-200" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
                        {masterServiceOptions.map((service) => {
                          const isSelected = service.id === selectedMasterServiceId;
                          const visual =
                            masterServiceVisuals[service.slug] ?? fallbackMasterVisual(service.name);
                          return (
                            <MasterServiceCard
                              key={service.id}
                              service={service}
                              isSelected={isSelected}
                              visual={visual}
                              onSelect={handleSelectMaster}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 ml-4">
                  <MasterServiceHero service={selectedMasterService} />
                </div>
              </div>

              {wizardError && <p className="mt-4 text-sm text-rose-600">{wizardError}</p>}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextFromMaster}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 disabled:bg-slate-400"
                  disabled={!selectedMasterServiceId}
                >
                  Continue to categories
                </button>
              </div>
            </motion.section>
          )}
          {currentStep === 2 && (
            <motion.section
              key="step-2"
              className="rounded-3xl border border-slate-100 bg-white p-6"
              {...stepMotion}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Step 2 · Category
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Choose a service category
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFromCategory}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 disabled:bg-slate-400"
                    disabled={!selectedCategoryId}
                  >
                    Continue to details
                  </button>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                {selectedMasterServiceId ? (
                  isCategoryFetching ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-20 rounded-2xl border border-slate-200 bg-white/60 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : categoryOptions.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {categoryOptions.map((category) => {
                        const isSelected = category.id === selectedCategoryId;
                        const masterVisual =
                          selectedMasterService &&
                          masterServiceVisuals[selectedMasterService.slug];
                        const categoryImage =
                          categoryVisuals[category.slug] ??
                          masterVisual ??
                          fallbackMasterVisual(category.name);
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              const isChangingCategory =
                                selectedCategoryId && selectedCategoryId !== category.id;
                              if (isEditing && isChangingCategory) {
                                setPendingCategoryReset({
                                  categoryId: category.id,
                                  masterId: selectedMasterServiceId,
                                });
                                return;
                              }
                              setSelectedCategoryId(category.id);
                            }}
                            className={`rounded-2xl border px-3 py-3 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500
                              ${isSelected ? "border-blue-500 bg-blue-50 text-slate-900" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}
                            aria-pressed={isSelected}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                                <img
                                  src={categoryImage.src}
                                  alt={categoryImage.alt}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                  decoding="async"
                                  fetchPriority="low"
                                  srcSet={categoryImage.srcSet}
                                  sizes="48px"
                                />
                              </div>
                              <div>
                                <p className="font-semibold">{category.name}</p>
                                <p className="text-xs text-slate-500">{category.slug}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      No categories found for this service yet.
                    </p>
                  )
                ) : (
                  <p className="text-xs text-slate-500">Choose a master service first.</p>
                )}
                {categoryError && (
                  <p className="text-xs text-rose-600">
                    Unable to load categories for that service right now.
                  </p>
                )}
              </div>

              {wizardError && <p className="text-sm text-rose-600">{wizardError}</p>}
            </motion.section>
          )}
          {currentStep === 3 && (
            <motion.section
              key="step-3"
              className="rounded-3xl border border-slate-100 bg-white p-6"
              {...stepMotion}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Step 3 · Vendor service
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Fill vendor service details
                  </h2>
                  <p className="text-sm text-slate-500">
                    These values are needed before offerings are created.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFromDetails}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
                  >
                    Continue to offerings
                  </button>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Vendor service details
                    </h3>
                    <p className="text-xs text-slate-500">
                      This creates the vendor-level service before adding offerings.
                    </p>
                  </div>

                  {createdServiceId && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Service created
                    </span>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Service title *"
                    value={vendorServiceDetails.title}
                    onChange={(e) => handleVendorServiceDetailChange("title", e.target.value)}
                    className="rounded-xl border px-3 py-2 text-sm"
                  />
                </div>

                <LocationPicker
                  value={{
                    lat: vendorServiceDetails.latitude ? Number(vendorServiceDetails.latitude) : null,
                    lng: vendorServiceDetails.longitude ? Number(vendorServiceDetails.longitude) : null,
                  }}
                  onChange={({ lat, lng }) => {
                    handleVendorServiceDetailChange("latitude", String(lat));
                    handleVendorServiceDetailChange("longitude", String(lng));
                  }}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="manual-lat">
                      Latitude (optional manual entry)
                    </label>
                    <input
                      id="manual-lat"
                      type="number"
                      step="0.000001"
                      min="-90"
                      max="90"
                      value={vendorServiceDetails.latitude}
                      onChange={(e) => handleVendorServiceDetailChange("latitude", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
                      placeholder="e.g. 28.6139"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="manual-lng">
                      Longitude (optional manual entry)
                    </label>
                    <input
                      id="manual-lng"
                      type="number"
                      step="0.000001"
                      min="-180"
                      max="180"
                      value={vendorServiceDetails.longitude}
                      onChange={(e) => handleVendorServiceDetailChange("longitude", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
                      placeholder="e.g. 77.2090"
                    />
                  </div>
                </div>
                {(vendorServiceErrors.latitude || vendorServiceErrors.longitude) && (
                  <p className="text-xs text-rose-600">
                    {vendorServiceErrors.latitude || vendorServiceErrors.longitude}
                  </p>
                )}

                <textarea
                  placeholder="Service description *"
                  value={vendorServiceDetails.description}
                  onChange={(e) =>
                    handleVendorServiceDetailChange("description", e.target.value)
                  }
                  className="min-h-[90px] w-full rounded-xl border px-3 py-2 text-sm"
                />

                <textarea
                  placeholder="Terms & conditions *"
                  value={vendorServiceDetails.terms}
                  onChange={(e) => handleVendorServiceDetailChange("terms", e.target.value)}
                  className="min-h-[70px] w-full rounded-xl border px-3 py-2 text-sm"
                />

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Refund policy</p>
                      <p className="text-xs text-slate-500">
                        Define how cancellations are refunded for this service.
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Master-level
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 hover:border-blue-500">
                      <input
                        type="radio"
                        name="refund-policy"
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                        value="PARTIAL_BEFORE_WINDOW"
                        checked={refundPolicy.type === "PARTIAL_BEFORE_WINDOW"}
                        onChange={() =>
                          handleRefundPolicyChange("type", "PARTIAL_BEFORE_WINDOW")
                        }
                      />
                      <div>
                        <p className="font-semibold text-slate-900">
                          Refund before cutoff (platform keeps commission)
                        </p>
                        <p className="text-xs text-slate-500">
                          Refund applies if cancelled in time; platform commission is always kept.
                        </p>
                      </div>
                    </label>
                    <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 hover:border-blue-500">
                      <input
                        type="radio"
                        name="refund-policy"
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                        value="NO_REFUND"
                        checked={refundPolicy.type === "NO_REFUND"}
                        onChange={() => handleRefundPolicyChange("type", "NO_REFUND")}
                      />
                      <div>
                        <p className="font-semibold text-slate-900">No refunds</p>
                        <p className="text-xs text-slate-500">
                          Cancellations are not refunded.
                        </p>
                      </div>
                    </label>
                  </div>

                  {refundPolicy.type !== "NO_REFUND" ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-1 text-sm text-slate-700">
                        <span className="font-semibold text-slate-600">
                          Cutoff window (hours before start) *
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={refundPolicy.windowHours}
                          onChange={(event) =>
                            handleRefundPolicyChange("windowHours", event.target.value)
                          }
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
                          placeholder="e.g. 48"
                        />
                      </label>

                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-600">
                        <p className="font-semibold text-slate-800">
                          Refund percent is set by the platform admin; platform commission is non-refundable.
                        </p>
                        <p className="mt-1">
                          When a refund applies, the platform&apos;s global rule decides the refund percentage and
                          the commission kept; vendors cannot override it.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {vendorServiceErrors.refundPolicy && (
                    <p className="text-xs text-rose-600">{vendorServiceErrors.refundPolicy}</p>
                  )}
                </div>
              </div>

              {wizardError && <p className="text-sm text-rose-600">{wizardError}</p>}
            </motion.section>
          )}
          {currentStep === 4 && (
            <motion.div key="step-4" className="space-y-6" {...stepMotion}>
              <section className="rounded-3xl border border-slate-100 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                      Step 4 · Offerings & extras
                    </p>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Build offerings for this service
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100"
                  >
                    Back
                  </button>
                </div>

                <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p className="font-semibold text-slate-800">Summary</p>
                  <p>
                    Master:{" "}
                    <span className="font-semibold">{selectedMasterService?.name ?? "—"}</span>
                  </p>
                  <p>
                    Category:{" "}
                    <span className="font-semibold">{selectedCategory?.name ?? "—"}</span>
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleCreateOffering} noValidate>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Basic offerings (optional)
                    </label>
                    <Select
                      value={selectedExistingOfferingId}
                      onValueChange={setSelectedExistingOfferingId}
                      disabled={!createdServiceId}
                    >
                      <SelectTrigger className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-50">
                        <SelectValue
                          placeholder={
                            createdServiceId
                              ? isOfferingsFetching
                                ? "Loading offerings..."
                                : "Select an existing offering to prefill"
                              : "Create vendor service first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {existingOfferings.map((offering) => (
                          <SelectItem key={offering.id} value={offering.id}>
                            {offering.name} — {formatCurrency(offering.salePrice)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {offeringsError && (
                      <p className="text-xs text-rose-600">
                        Unable to surface existing offerings for this category.
                      </p>
                    )}
                    <p className="text-xs text-slate-500">
                      Only the offering ID is stored internally; select one to reuse its values.
                    </p>
                  </div>

                  {generalError && (
                    <div className="rounded-2xl bg-rose-50/80 p-3 text-sm text-rose-800">
                      {generalError}
                    </div>
                  )}

                  <AnimatePresence initial={false}>
                    {fields.map((field, index) => (
                      <motion.div
                        key={field.id}
                        layout
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: [0.16, 0.64, 0.37, 0.99] }}
                        className="relative grid border rounded-2xl px-5 py-8 gap-4 md:grid-cols-2 group"
                      >
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          >
                            <HiOutlineTrash className="h-5 w-5" />
                          </button>
                        )}
                        <label className="space-y-1 text-sm text-slate-700">
                          <span className="font-semibold text-slate-600">
                            Offering name *
                          </span>
                          <input
                            type="text"
                            {...register(`offerings.${index}.name` as const, {
                              required: "Offerings need a name.",
                            })}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
                            placeholder="e.g. Premium Food Service"
                          />
                          {errors.offerings?.[index]?.name && (
                            <p className="text-xs text-rose-600">
                              {errors.offerings[index]?.name?.message}
                            </p>
                          )}
                        </label>

                        <label className="space-y-1 text-sm text-slate-700 md:col-span-2">
                          <span className="font-semibold text-slate-600">
                            Offering description *
                          </span>
                          <textarea
                            rows={3}
                            {...register(`offerings.${index}.description` as const, {
                              required: "Description is required.",
                            })}
                            className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
                            placeholder="A short description shown to users in the marketplace"
                          />
                          {errors.offerings?.[index]?.description && (
                            <p className="text-xs text-rose-600">
                              {errors.offerings[index]?.description?.message}
                            </p>
                          )}
                        </label>

                        {isMovieBookingsCategory && (
                          <label className="space-y-1 text-sm text-slate-700 md:col-span-2">
                            <span className="font-semibold text-slate-600">
                              Booking URL *
                            </span>
                            <input
                              type="url"
                              {...register(`offerings.${index}.bookingUrl` as const, {
                                setValueAs: (value: string) =>
                                  typeof value === "string" ? value.trim() || undefined : value,
                                validate: (value: string | undefined) => {
                                  const trimmed = value?.trim();
                                  if (!isMovieBookingsCategory) return true;
                                  if (!trimmed) {
                                    return "Booking URL is required for Movie Bookings.";
                                  }
                                  try {
                                    // Validate a complete URL (e.g. https://example.com).
                                    new URL(trimmed);
                                    return true;
                                  } catch {
                                    return "Enter a valid URL.";
                                  }
                                },
                              })}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
                              placeholder="https://example.com/book"
                            />
                            {errors.offerings?.[index]?.bookingUrl && (
                              <p className="text-xs text-rose-600">
                                {errors.offerings[index]?.bookingUrl?.message}
                              </p>
                            )}
                          </label>
                        )}

                        <label className="space-y-1 text-sm text-slate-700">
                          <span className="font-semibold text-slate-600">
                            Base price *
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            {...register(`offerings.${index}.basePrice` as const, {
                              required: "Base price is required.",
                              min: { value: 0, message: "Must be zero or higher." },
                              valueAsNumber: true,
                            })}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
                            placeholder="500"
                          />
                          {errors.offerings?.[index]?.basePrice && (
                            <p className="text-xs text-rose-600">
                              {errors.offerings[index]?.basePrice?.message}
                            </p>
                          )}
                        </label>

                        <label className="space-y-1 text-sm text-slate-700">
                          <span className="font-semibold text-slate-600">
                            Sale price *
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            {...register(`offerings.${index}.salePrice` as const, {
                              required: "Sale price is required.",
                              min: { value: 0, message: "Must be zero or higher." },
                              valueAsNumber: true,
                            })}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
                            placeholder="450"
                          />
                          {errors.offerings?.[index]?.salePrice && (
                            <p className="text-xs text-rose-600">
                              {errors.offerings[index]?.salePrice?.message}
                            </p>
                          )}
                        </label>

                        <label className="space-y-1 text-sm text-slate-700">
                          <span className="font-semibold text-slate-600">
                            Max quantity
                          </span>
                          <input
                            type="number"
                            {...register(`offerings.${index}.maxQuantity` as const, {
                              min: { value: 1, message: "Must be at least 1" },
                              valueAsNumber: true,
                            })}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
                            placeholder="Optional"
                          />
                          {errors.offerings?.[index]?.maxQuantity && (
                            <p className="text-xs text-rose-600">
                              {errors.offerings[index]?.maxQuantity?.message}
                            </p>
                          )}
                        </label>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <button
                    type="button"
                    onClick={() =>
                      append({
                        name: "",
                        description: "",
                        bookingUrl: "",
                        basePrice: 0,
                        salePrice: 0,
                      })
                    }
                    className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-dashed border-slate-200 py-4 text-sm font-semibold text-slate-500 transition-colors duration-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50"
                  >
                    <HiOutlinePlusCircle className="h-5 w-5" />
                    Add another offering
                  </button>
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <label className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                      <span>Enable slots</span>
                      <Switch checked={enableSlots} onCheckedChange={setEnableSlots} />
                    </label>
                    <p className="text-xs text-slate-500">
                      Only call the slot API if you need time-based capacity.
                    </p>

                    {enableSlots && (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2 text-sm text-slate-700">
                            <p className="font-semibold text-slate-600">Start *</p>
                            <DatePicker
                              value={slotStartDate}
                              onChange={(value) => handleSlotDateChange("start", value)}
                              slotProps={{
                                textField: { size: "small", fullWidth: true },
                              }}
                            />
                            <TimePicker
                              value={slotStartTime}
                              onChange={(value) => handleSlotTimeChange("start", value)}
                              slotProps={{
                                textField: { size: "small", fullWidth: true },
                              }}
                            />
                          </div>
                          <div className="space-y-2 text-sm text-slate-700">
                            <p className="font-semibold text-slate-600">End *</p>
                            <DatePicker
                              value={slotEndDate}
                              onChange={(value) => handleSlotDateChange("end", value)}
                              slotProps={{
                                textField: { size: "small", fullWidth: true },
                              }}
                            />
                            <TimePicker
                              value={slotEndTime}
                              onChange={(value) => handleSlotTimeChange("end", value)}
                              slotProps={{
                                textField: { size: "small", fullWidth: true },
                              }}
                            />
                          </div>
                          <label className="space-y-1 text-sm text-slate-700">
                            <span className="font-semibold text-slate-600">
                              Capacity *
                            </span>
                            <input
                              type="number"
                              min="1"
                              value={slotFields.capacity}
                              onChange={(event) =>
                                handleSlotFieldUpdate("capacity", event.target.value)
                              }
                              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
                              required
                            />
                          </label>
                        </div>
                      </LocalizationProvider>
                    )}

                    {slotValidationError && (
                      <p className="text-xs text-rose-600">{slotValidationError}</p>
                    )}
                  </div>

                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <label className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                      <span>Enable rules</span>
                      <Switch checked={enableRules} onCheckedChange={setEnableRules} />
                    </label>
                    <p className="text-xs text-slate-500">
                      Rules do not rely on the slot ID—only the offering ID returned in step 1.
                    </p>

                    {enableRules && (
                      <div className="space-y-3">
                        <label className="space-y-1 text-sm text-slate-700">
                          <span className="font-semibold text-slate-600">
                            Rule type *
                          </span>
                          <Select
                            value={ruleFields.type}
                            onValueChange={(value) => handleRuleFieldUpdate("type", value)}
                          >
                            <SelectTrigger className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700">
                              <SelectValue placeholder="Select a rule type" />
                            </SelectTrigger>
                            <SelectContent>
                              {RULE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </label>
                        <label className="space-y-1 text-sm text-slate-700">
                          <span className="font-semibold text-slate-600">
                            Value *
                          </span>
                          <textarea
                            value={ruleFields.value}
                            onChange={(event) =>
                              handleRuleFieldUpdate("value", event.target.value)
                            }
                            className="min-h-[96px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
                            placeholder="Describe what customers should know about this rule."
                            required
                          />
                        </label>
                      </div>
                    )}

                    {ruleValidationError && (
                      <p className="text-xs text-rose-600">{ruleValidationError}</p>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold text-slate-900">
                        Summary
                      </p>
                      <span className="text-xs text-slate-500">
                        Sequential, transactional API calls.
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      All fields marked with * are required.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                  >
                    {isSubmitting ? "Processing..." : "Create offering & extras"}
                  </button>
                </form>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        <Dialog
          open={Boolean(pendingCategoryReset)}
          onOpenChange={(open) => {
            if (!open) setPendingCategoryReset(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset offerings?</DialogTitle>
              <DialogDescription>
                Changing the master service or category will remove all existing offerings for this service.
                You’ll need to recreate offerings after saving.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
              This action cannot be undone.
            </div>
            <DialogFooter>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                onClick={() => setPendingCategoryReset(null)}
                disabled={isResettingOfferings}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                onClick={handleConfirmedCategoryReset}
                disabled={isResettingOfferings}
              >
                {isResettingOfferings ? "Resetting..." : "Yes, remove offerings"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardContainer>
    </div>
  );
};
