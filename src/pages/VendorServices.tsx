import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppSelector } from "@/app/hooks";
import { toast } from "react-hot-toast";

import { DashboardContainer } from "@/components/dashboard";
import type { ServiceMasterCategory } from "@/services/serviceCategoriesApi";
import {
  useGetMasterCategoriesQuery,
  useGetServiceCategoriesByMasterQuery,
} from "@/services/serviceCategoriesApi";
import {
  CreateOfferingPayload,
  CreateRulePayload,
  CreateSlotPayload,
  useCreateOfferingMutation,
  useCreateRuleMutation,
  useCreateSlotMutation,
  useGetServiceOfferingsQuery,
} from "@/services/vendorOfferingsApi";
import { useCreateVendorServiceMutation } from "@/services/vendorServicesApi";
import { normalizeApiError } from "@/shared/utils/normalizeApiError";
import eventImage from "@/assets/Images/well.jpg";
import wellnessImage from "@/assets/Images/wellness.jpg";
import familyImage from "@/assets/Images/family.jpg";
import learnImage from "@/assets/Images/learn.jpg";
import homeImage from "@/assets/Images/home.jpg";
import travelImage from "@/assets/Images/travel.jpg";
import foodImage from "@/assets/Images/food.jpg";
import hotelImage from "@/assets/Images/hotel.jpg";
import well from "@/assets/Images/well.jpg";


type StepState = "idle" | "loading" | "success" | "error";

type OfferingFormValues = {
  name: string;
  basePrice: number;
  salePrice: number;
  maxQuantity?: number;
};

type SlotFields = {
  startTime: string;
  endTime: string;
  capacity: string;
};

type RuleType =
  | "CANCELLATION_POLICY"
  | "MIN_NOTICE"
  | "AGE_REQUIREMENT"
  | "SPECIAL_REQUIREMENT";

type RuleFields = {
  type: RuleType | "";
  value: string;
};

const RULE_OPTIONS: { label: string; value: RuleType }[] = [
  { label: "Cancellation policy", value: "CANCELLATION_POLICY" },
  { label: "Minimum notice requirement", value: "MIN_NOTICE" },
  { label: "Age or experience requirement", value: "AGE_REQUIREMENT" },
  { label: "Special requirement / agreement", value: "SPECIAL_REQUIREMENT" },
];

const slotInitialState: SlotFields = {
  startTime: "",
  endTime: "",
  capacity: "1",
};

const ruleInitialState: RuleFields = {
  type: "",
  value: "",
};

const stateBadgeStyles: Record<StepState, string> = {
  idle: "bg-slate-100 text-slate-600",
  loading: "bg-blue-50 text-blue-700",
  success: "bg-emerald-100 text-emerald-700",
  error: "bg-rose-100 text-rose-700",
};

const masterServiceVisuals: Record<
  string,
  { src: string; alt: string }
> = {
  "experiences-activities": { src: eventImage, alt: "Experiences & activities" },
  "health-wellness": { src: wellnessImage, alt: "Health & wellness" },
  "kids-family": { src: familyImage, alt: "Kids & family" },
  "learning-skill-development": { src: learnImage, alt: "Learning & skill development" },
  "home-personal-services": { src: homeImage, alt: "Home & personal services" },
  "travel-transportation": { src: travelImage, alt: "Travel & transportation" },
  "food-leisure": { src: foodImage, alt: "Food & leisure" },
  "real-estate-local-support": { src: hotelImage, alt: "Real estate & local support" },
};

const categoryVisuals: Record<string, { src: string; alt: string }> = {
  "events-around-the-city": {
    src: eventImage,
    alt: "Events around the city",
  },
  "concerts-live-shows": {
    src: eventImage,
    alt: "Concerts & live shows",
  },
  "movie-bookings": {
    src: homeImage,
    alt: "Movie bookings",
  },
  "museums-exhibitions": {
    src: learnImage,
    alt: "Museums & exhibitions",
  },
  "tourist-buses-boat-tours": {
    src: travelImage,
    alt: "Tourist buses & boat tours",
  },
  "tourist-activities-attractions": {
    src: familyImage,
    alt: "Tourist activities & attractions",
  },
  "places-to-visit-near-city": {
    src: travelImage,
    alt: "Places to visit near the city",
  },
};

const formatCurrency = (value: number | null | undefined) =>
  value != null
    ? new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value)
    : "-";

type VendorServiceDetails = {
  title: string;
  description: string;
  terms: string;
  latitude: string;
  longitude: string;
};

const VendorServices = () => {
  const [selectedMasterServiceId, setSelectedMasterServiceId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedExistingOfferingId, setSelectedExistingOfferingId] = useState("");
  const [enableSlots, setEnableSlots] = useState(false);
  const [enableRules, setEnableRules] = useState(false);
  const [slotFields, setSlotFields] = useState<SlotFields>(slotInitialState);
  const [ruleFields, setRuleFields] = useState<RuleFields>(ruleInitialState);
  const [slotValidationError, setSlotValidationError] = useState<string | null>(null);
  const [ruleValidationError, setRuleValidationError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [lastCreatedOfferingId, setLastCreatedOfferingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offeringStep, setOfferingStep] = useState<StepState>("idle");
  const [slotStep, setSlotStep] = useState<StepState>("idle");
  const [ruleStep, setRuleStep] = useState<StepState>("idle");
  const [offeringError, setOfferingError] = useState<string | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [ruleError, setRuleError] = useState<string | null>(null);
  const [createdServiceId, setCreatedServiceId] = useState<string | null>(null);
const [isCreatingService, setIsCreatingService] = useState(false);


  const [vendorServiceDetails, setVendorServiceDetails] = useState<VendorServiceDetails>({
    title: "",
    description: "",
    terms: "",
    latitude: "",
    longitude: "",
  });
  const [vendorServiceErrors, setVendorServiceErrors] = useState<Record<string, string>>({});
  const [vendorServiceStep, setVendorServiceStep] = useState<StepState>("idle");
  const [vendorServiceError, setVendorServiceError] = useState<string | null>(null);
  const vendorId = useAppSelector((state) => state.auth.user?.id ?? "");

  const [createVendorService] = useCreateVendorServiceMutation();
  const [createOffering] = useCreateOfferingMutation();
  const [createSlot] = useCreateSlotMutation();
  const [createRule] = useCreateRuleMutation();

  const {
    data: masterServices = [],
    isLoading: isMasterLoading,
    isError: masterError,
  } = useGetMasterCategoriesQuery();

  const {
    data: categoryOptions = [],
    isFetching: isCategoryFetching,
    isError: categoryError,
  } = useGetServiceCategoriesByMasterQuery(selectedMasterServiceId, {
    skip: !selectedMasterServiceId,
  });

const {
  data: existingOfferings = [],
  isFetching: isOfferingsFetching,
  isError: offeringsError,
} = useGetServiceOfferingsQuery(createdServiceId!, {
  skip: !createdServiceId,
});


  const { register, handleSubmit, formState, reset, setValue } =
    useForm<OfferingFormValues>({
      mode: "onBlur",
      defaultValues: {
        name: "",
        basePrice: 0,
        salePrice: 0,
        maxQuantity: undefined,
      },
    });

  const { errors } = formState;

  const masterServiceOptions = useMemo(() => {
    if (!masterServices.length) return [];
    return [...masterServices].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [masterServices]);

  const selectedMasterService = masterServiceOptions.find(
    (service) => service.id === selectedMasterServiceId,
  );
  const selectedCategory = categoryOptions.find(
    (category) => category.id === selectedCategoryId,
  );

useEffect(() => {
  setSelectedExistingOfferingId("");
}, [createdServiceId]);

  useEffect(() => {
    if (!selectedMasterServiceId) return;
    setSelectedCategoryId("");
    setSelectedExistingOfferingId("");
    setEnableSlots(false);
    setEnableRules(false);
    setSlotFields({ ...slotInitialState });
    setRuleFields({ ...ruleInitialState });
    setSlotValidationError(null);
    setRuleValidationError(null);
    setSlotStep("idle");
    setSlotError(null);
    setRuleStep("idle");
    setRuleError(null);
    setOfferingStep("idle");
    setOfferingError(null);
    setGeneralError(null);
    setLastCreatedOfferingId(null);
  }, [selectedMasterServiceId]);

  useEffect(() => {
    if (!selectedExistingOfferingId) return;
    const offering = existingOfferings.find((item) => item.id === selectedExistingOfferingId);
    if (!offering) return;
    setValue("name", offering.name);
    setValue("basePrice", offering.basePrice);
    setValue("salePrice", offering.salePrice);
    setValue("maxQuantity", offering.maxQuantity ?? undefined);
  }, [existingOfferings, selectedExistingOfferingId, setValue]);

  const handleSlotFieldUpdate = (field: keyof SlotFields, value: string) => {
    setSlotFields((prev) => ({ ...prev, [field]: value }));
    setSlotValidationError(null);
    setSlotStep((prev) => (prev === "error" ? "idle" : prev));
  };

  const handleRuleFieldUpdate = (field: keyof RuleFields, value: string) => {
    setRuleFields((prev) => ({ ...prev, [field]: value }));
    setRuleValidationError(null);
    setRuleStep((prev) => (prev === "error" ? "idle" : prev));
  };

  const validateSlotInputs = useCallback(() => {
    const { startTime, endTime, capacity } = slotFields;
    if (!startTime || !endTime) {
      setSlotValidationError("Start and end time are required.");
      return false;
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setSlotValidationError("Enter valid date/time values.");
      return false;
    }
    if (end <= start) {
      setSlotValidationError("End time must be after start time.");
      return false;
    }
    if (!capacity || Number(capacity) < 1) {
      setSlotValidationError("Capacity must be at least 1.");
      return false;
    }
    setSlotValidationError(null);
    return true;
  }, [slotFields]);

  const validateRuleInputs = useCallback(() => {
    if (!ruleFields.type) {
      setRuleValidationError("Select a rule type.");
      return false;
    }
    if (!ruleFields.value.trim()) {
      setRuleValidationError("Describe the rule so customers understand it.");
      return false;
    }
    setRuleValidationError(null);
    return true;
  }, [ruleFields]);

  const createSlotFlow = useCallback(
    async (offeringId: string) => {
      if (!validateSlotInputs()) {
        setSlotStep("error");
        return Promise.reject(new Error("slot-validation"));
      }
      setSlotStep("loading");
      setSlotError(null);
      const payload: CreateSlotPayload = {
        offeringId,
        startTime: new Date(slotFields.startTime).toISOString(),
        endTime: new Date(slotFields.endTime).toISOString(),
        capacity: Number(slotFields.capacity),
      };
      try {
        await createSlot(payload).unwrap();
        setSlotStep("success");
        return true;
      } catch (error) {
        const normalized = normalizeApiError(error, "Unable to save the slot");
        setSlotError(normalized.toastMessage);
        setSlotStep("error");
        toast.error(normalized.toastMessage, { id: "vendor-slot-error" });
        return Promise.reject(error);
      }
    },
    [createSlot, slotFields, validateSlotInputs],
  );

  const createRuleFlow = useCallback(
    async (offeringId: string) => {
      if (!validateRuleInputs()) {
        setRuleStep("error");
        return Promise.reject(new Error("rule-validation"));
      }
      setRuleStep("loading");
      setRuleError(null);
      const payload: CreateRulePayload = {
        offeringId,
        ruleType: ruleFields.type as RuleType,
        value: ruleFields.value.trim(),
      };
      try {
        await createRule(payload).unwrap();
        setRuleStep("success");
        return true;
      } catch (error) {
        const normalized = normalizeApiError(error, "Unable to save the rule");
        setRuleError(normalized.toastMessage);
        setRuleStep("error");
        toast.error(normalized.toastMessage, { id: "vendor-rule-error" });
        return Promise.reject(error);
      }
    },
    [createRule, ruleFields, validateRuleInputs],
  );

  const handleRetrySlot = async () => {
    if (!lastCreatedOfferingId) return;
    try {
      await createSlotFlow(lastCreatedOfferingId);
    } catch {
      // errors already surfaced
    }
  };

  const handleRetryRule = async () => {
    if (!lastCreatedOfferingId) return;
    try {
      await createRuleFlow(lastCreatedOfferingId);
    } catch {
      // errors already surfaced
    }
  };

  const validateVendorServiceDetails = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!vendorServiceDetails.title.trim()) {
      errors.title = "Title is required.";
    }
    if (!vendorServiceDetails.description.trim()) {
      errors.description = "Description is required.";
    }
    if (!vendorServiceDetails.terms.trim()) {
      errors.terms = "Terms are required.";
    }
    if (!vendorServiceDetails.latitude.trim()) {
      errors.latitude = "Latitude is required.";
    } else if (Number.isNaN(Number(vendorServiceDetails.latitude))) {
      errors.latitude = "Enter a valid latitude.";
    }
    if (!vendorServiceDetails.longitude.trim()) {
      errors.longitude = "Longitude is required.";
    } else if (Number.isNaN(Number(vendorServiceDetails.longitude))) {
      errors.longitude = "Enter a valid longitude.";
    }
    setVendorServiceErrors(errors);
    return Object.keys(errors).length === 0;
  }, [vendorServiceDetails]);

  const handleVendorServiceDetailChange = (
    field: keyof VendorServiceDetails,
    value: string,
  ) => {
    setVendorServiceDetails((prev) => ({ ...prev, [field]: value }));
    setVendorServiceErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleCreateOffering = handleSubmit(async (values) => {
    if (!selectedCategoryId) {
      setGeneralError("Select a category before creating an offering.");
      return;
    }
    if (!validateVendorServiceDetails()) {
      setGeneralError("Complete the vendor service details before continuing.");
      return;
    }
    if (!vendorId) {
      setGeneralError("Unable to resolve vendor session. Please reauthenticate.");
      return;
    }

    setGeneralError(null);
    setVendorServiceStep("loading");
    setVendorServiceError(null);
    setOfferingStep("loading");
    setOfferingError(null);
    setIsSubmitting(true);

    let createdOfferingId: string | null = null;
    try {
     const vendorServicePayload = {
  vendorId: '4338e9ec-5e00-4bb6-ba61-bd818f804587', // ✅ REQUIRED
  categoryId: selectedCategoryId,
  title: vendorServiceDetails.title.trim(),
  description: vendorServiceDetails.description.trim(),
  terms: vendorServiceDetails.terms.trim(),
  latitude: Number(vendorServiceDetails.latitude),
  longitude: Number(vendorServiceDetails.longitude),
};

const createdVendorService = await createVendorService(vendorServicePayload).unwrap();
setCreatedServiceId(createdVendorService.id);

      setVendorServiceStep("success");

      const payload: CreateOfferingPayload = {
         serviceId: createdServiceId!,
        name: values.name.trim(),
        basePrice: values.basePrice,
        salePrice: values.salePrice,
        maxQuantity: values.maxQuantity,
      };
      const createdOffering = await createOffering(payload).unwrap();
      createdOfferingId = createdOffering.id;
      setLastCreatedOfferingId(createdOffering.id);
      setOfferingStep("success");

      if (enableSlots) {
        try {
          await createSlotFlow(createdOffering.id);
        } catch {
          return;
        }
      }

      if (enableRules) {
        try {
          await createRuleFlow(createdOffering.id);
        } catch {
          return;
        }
      }

      toast.success("Vendor service and offering saved successfully", {
        id: "vendor-offering-success",
      });
      reset();
      setSelectedMasterServiceId("");
      setSelectedCategoryId("");
      setSelectedExistingOfferingId("");
      setEnableSlots(false);
      setEnableRules(false);
      setSlotFields({ ...slotInitialState });
      setRuleFields({ ...ruleInitialState });
      setSlotStep("idle");
      setSlotValidationError(null);
      setSlotError(null);
      setRuleStep("idle");
      setRuleValidationError(null);
      setRuleError(null);
      setVendorServiceDetails({
        title: "",
        description: "",
        terms: "",
        latitude: "",
        longitude: "",
      });
      setVendorServiceErrors({});
      setVendorServiceStep("idle");
      setVendorServiceError(null);
      setLastCreatedOfferingId(null);
      setGeneralError(null);
      setOfferingError(null);
    } catch (error) {
      if (vendorServiceStep === "loading") {
        const normalized = normalizeApiError(error, "Unable to create vendor service");
        setVendorServiceError(normalized.toastMessage);
        setVendorServiceStep("error");
        setGeneralError(normalized.toastMessage);
        toast.error(normalized.toastMessage, { id: "vendor-service-error" });
      } else {
        const normalized = normalizeApiError(error, "Unable to create offering");
        setGeneralError(normalized.toastMessage);
        setOfferingError(normalized.toastMessage);
        setOfferingStep("error");
        toast.error(normalized.toastMessage, { id: "vendor-offering-error" });
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  const statusEntries = [
    {
      title: "Create vendor service",
      state: vendorServiceStep,
      description: "Creates the vendor-level listing before the offering.",
      error: vendorServiceError,
    },
    {
      title: "Create offering",
      state: offeringStep,
      description: "Stores the mandatory offering before any extras.",
      error: offeringError,
    },
    {
      title: enableSlots ? "Create slot" : "Slot creation skipped",
      state: enableSlots ? slotStep : "idle",
      description: enableSlots
        ? "Slot data depends on the newly created offering."
        : "Enable slots to add availability.",
      error: slotError,
      onRetry: enableSlots ? handleRetrySlot : undefined,
    },
    {
      title: enableRules ? "Create slot rule" : "Rules skipped",
      state: enableRules ? ruleStep : "idle",
      description: enableRules
        ? "Rules also depend on the offering id."
        : "Toggle rules to apply booking requirements.",
      error: ruleError,
      onRetry: enableRules ? handleRetryRule : undefined,
    },
  ];

  return (
    <DashboardContainer className="space-y-6 pb-16">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
          Vendor Experience
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Create Offerings</h1>
        <p className="text-sm text-slate-500">
          Work through master services, categories, and offerings in order. Each section updates
          responsively to keep the workflow focused.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
              Master service
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Select your core offering</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a master service card in the section below to unlock dependent categories,
              offerings, and slot/rule configuration. Images keep the layout familiar while the
              form lets you capture pricing details.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              <span className="rounded-full border border-slate-200 px-3 py-1">Responsive</span>
              <span className="rounded-full border border-slate-200 px-3 py-1">Accessible</span>
              <span className="rounded-full border border-slate-200 px-3 py-1">Master-focused</span>
            </div>

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
              const visual = masterServiceVisuals[service.slug];
              const imageSrc = visual?.src ?? swell;
              const imageAlt = visual?.alt ?? service.name;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedMasterServiceId(service.id)}
                  className={`flex h-full w-full flex-col gap-3 rounded-[24px] border bg-white px-3 py-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500
                    ${isSelected ? "border-blue-500 shadow-[0_12px_30px_rgba(59,130,246,0.15)]" : "border-slate-200 hover:border-slate-300"}`}
                  aria-pressed={isSelected}
                >
                  <div className="h-32 overflow-hidden rounded-[18px] border border-slate-200 bg-slate-100">
                    <img
                      src={imageSrc}
                      alt={imageAlt}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-0.5 px-1">
                    <p className="truncate text-base font-semibold text-slate-900">
                      {service.name}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {service.slug}
                    </p>
                  </div>
                </button>
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
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <form className="space-y-6" onSubmit={handleCreateOffering} noValidate>
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Category</p>
                <span className="text-xs text-slate-500">
                  Built from the selected master service
                </span>
              </div>
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
                      selectedMasterService && masterServiceVisuals[selectedMasterService.slug];
                    const visual = categoryVisuals[category.slug] ?? masterVisual;
                    const imageSrc = visual?.src ?? well;
                    const imageAlt = visual?.alt ?? category.name;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(category.id)}
                        className={`rounded-2xl border px-3 py-3 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500
                            ${isSelected ? "border-blue-500 bg-blue-50 text-slate-900" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}
                        aria-pressed={isSelected}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                            <img
                              src={imageSrc}
                              alt={imageAlt}
                              className="h-full w-full object-cover"
                              loading="lazy"
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


{/* Vendor Service Form */}
<section className="space-y-4 rounded-2xl border p-4">
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
      onChange={(e) =>
        handleVendorServiceDetailChange("title", e.target.value)
      }
      className="rounded-xl border px-3 py-2 text-sm"
    />

    <input
      type="text"
      placeholder="Latitude *"
      value={vendorServiceDetails.latitude}
      onChange={(e) =>
        handleVendorServiceDetailChange("latitude", e.target.value)
      }
      className="rounded-xl border px-3 py-2 text-sm"
    />

    <input
      type="text"
      placeholder="Longitude *"
      value={vendorServiceDetails.longitude}
      onChange={(e) =>
        handleVendorServiceDetailChange("longitude", e.target.value)
      }
      className="rounded-xl border px-3 py-2 text-sm"
    />
  </div>

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
    onChange={(e) =>
      handleVendorServiceDetailChange("terms", e.target.value)
    }
    className="min-h-[70px] w-full rounded-xl border px-3 py-2 text-sm"
  />

  <button
    type="button"
    disabled={isCreatingService || !!createdServiceId}
    onClick={async () => {
      if (!validateVendorServiceDetails()) {
        setGeneralError("Complete vendor service details first.");
        return;
      }

      try {
        setIsCreatingService(true);

        const payload = {
          vendorId:'4338e9ec-5e00-4bb6-ba61-bd818f804587',
          categoryId: selectedCategoryId,
          title: vendorServiceDetails.title.trim(),
          description: vendorServiceDetails.description.trim(),
          terms: vendorServiceDetails.terms.trim(),
          latitude: Number(vendorServiceDetails.latitude),
          longitude: Number(vendorServiceDetails.longitude),
        };

        const created = await createVendorService(payload).unwrap();
        setCreatedServiceId(created.id);

        toast.success("Vendor service created");
      } catch (error) {
        toast.error(normalizeApiError(error).toastMessage);
      } finally {
        setIsCreatingService(false);
      }
    }}
    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-400"
  >
    {isCreatingService ? "Creating service..." : "Create vendor service"}
  </button>
</section>


            <div className="space-y-2">
              <label htmlFor="existing-offering" className="text-sm font-semibold text-slate-700">
                Basic offerings (optional)
              </label>
              <select
                id="existing-offering"
                value={selectedExistingOfferingId}
                onChange={(event) => setSelectedExistingOfferingId(event.target.value)}
               disabled={!createdServiceId}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
              >
               <option value="">
  {createdServiceId
    ? isOfferingsFetching
      ? "Loading offerings..."
      : "Select an existing offering to prefill"
    : "Create vendor service first"}
</option>

                {existingOfferings.map((offering) => (
                  <option key={offering.id} value={offering.id}>
                      {offering.name} - {formatCurrency(offering.salePrice)}
                  </option>
                ))}
              </select>
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

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-semibold text-slate-600">Offering name *</span>
                <input
                  type="text"
                  {...register("name", { required: "Offerings need a name." })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
                  placeholder="e.g. Premium Food Service"
                />
                {errors.name && (
                  <p className="text-xs text-rose-600">{errors.name.message}</p>
                )}
              </label>

              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-semibold text-slate-600">Base price *</span>
                <input
                  type="number"
                  step="0.01"
                  {...register("basePrice", {
                    required: "Base price is required.",
                    min: { value: 0, message: "Must be zero or higher." },
                    valueAsNumber: true,
                  })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
                  placeholder="500"
                />
                {errors.basePrice && (
                  <p className="text-xs text-rose-600">{errors.basePrice.message}</p>
                )}
              </label>

              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-semibold text-slate-600">Sale price *</span>
                <input
                  type="number"
                  step="0.01"
                  {...register("salePrice", {
                    required: "Sale price is required.",
                    min: { value: 0, message: "Must be zero or higher." },
                    valueAsNumber: true,
                  })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
                  placeholder="450"
                />
                {errors.salePrice && (
                  <p className="text-xs text-rose-600">{errors.salePrice.message}</p>
                )}
              </label>

              <label className="space-y-1 text-sm text-slate-700">
                <span className="font-semibold text-slate-600">Max quantity</span>
                <input
                  type="number"
                  {...register("maxQuantity", {
                    min: { value: 1, message: "Must be at least 1" },
                    valueAsNumber: true,
                  })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
                  placeholder="Optional"
                />
                {errors.maxQuantity && (
                  <p className="text-xs text-rose-600">{errors.maxQuantity.message}</p>
                )}
              </label>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={enableSlots}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  onChange={(event) => setEnableSlots(event.target.checked)}
                />
                Enable slots
              </label>
              <p className="text-xs text-slate-500">
                Only call the slot API if you need time-based capacity.
              </p>

              {enableSlots && (
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="font-semibold text-slate-600">Start time *</span>
                    <input
                      type="datetime-local"
                      value={slotFields.startTime}
                      onChange={(event) => handleSlotFieldUpdate("startTime", event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
                      required
                    />
                  </label>
                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="font-semibold text-slate-600">End time *</span>
                    <input
                      type="datetime-local"
                      value={slotFields.endTime}
                      onChange={(event) => handleSlotFieldUpdate("endTime", event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
                      required
                    />
                  </label>
                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="font-semibold text-slate-600">Capacity *</span>
                    <input
                      type="number"
                      min="1"
                      value={slotFields.capacity}
                      onChange={(event) => handleSlotFieldUpdate("capacity", event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
                      required
                    />
                  </label>
                </div>
              )}

              {slotValidationError && (
                <p className="text-xs text-rose-600">{slotValidationError}</p>
              )}
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={enableRules}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  onChange={(event) => setEnableRules(event.target.checked)}
                />
                Enable rules
              </label>
              <p className="text-xs text-slate-500">
                Rules do not rely on the slot ID-only the offering ID returned in step 1.
              </p>

              {enableRules && (
                <div className="space-y-3">
                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="font-semibold text-slate-600">Rule type *</span>
                    <select
                      value={ruleFields.type}
                      onChange={(event) => handleRuleFieldUpdate("type", event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
                    >
                      <option value="">Select a rule type</option>
                      {RULE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="font-semibold text-slate-600">Value *</span>
                    <textarea
                      value={ruleFields.value}
                      onChange={(event) => handleRuleFieldUpdate("value", event.target.value)}
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
                <p className="text-base font-semibold text-slate-900">Summary</p>
                <span className="text-xs text-slate-500">
                  Sequential, transactional API calls.
                </span>
              </div>
              <p className="text-xs text-slate-500">All fields marked with * are required.</p>
            </div>

            <button
              type="submit"
            
              className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {isSubmitting ? "Processing..." : "Create offering & extras"}
            </button>
          </form>
        </section>

        <section className="space-y-4">
          {statusEntries.map((entry) => (
            <StepStatus
              key={entry.title}
              title={entry.title}
              state={entry.state}
              description={entry.description}
              error={entry.error}
              onRetry={entry.onRetry}
            />
          ))}
          {lastCreatedOfferingId && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
              Latest offering ID:{" "}
              <span className="font-semibold text-slate-900">{lastCreatedOfferingId}</span>
            </div>
          )}
        </section>
      </div>
    </DashboardContainer>
  );
};

type StepStatusProps = {
  title: string;
  state: StepState;
  description?: string;
  error?: string | null;
  onRetry?: () => void;
};

const StepStatus = ({ title, state, description, error, onRetry }: StepStatusProps) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stateBadgeStyles[state]}`}>
        {state === "idle"
          ? "Pending"
          : state === "loading"
          ? "Working"
          : state === "success"
          ? "Done"
          : "Failed"}
      </span>
    </div>
    {error && (
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-rose-600">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Retry
          </button>
        )}
      </div>
    )}
  </div>
);



type MasterServiceHeroProps = {
  service?: ServiceMasterCategory | null;
};

const MasterServiceHero = ({ service }: MasterServiceHeroProps) => {
  const visual = service ? masterServiceVisuals[service.slug] : masterServiceVisuals["experiences-activities"];
  const heroImage = visual?.src ?? eventImage;
  const heroLabel = service ? service.name : "Select a master service";
  const heroSlug = service ? service.slug : "master service";
  const featureTags = service
    ? ["Responsive", "Accessible", "Master-focused"]
    : ["Choose a service", "Ready when you are"];

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-200/80">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
        <div className="h-48 overflow-hidden rounded-2xl bg-slate-100">
          <img
            src={heroImage}
            alt={visual?.alt ?? heroLabel}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
          {featureTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-center text-xs text-slate-500"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Master service</p>
        <h3 className="mt-1 text-xl font-semibold text-slate-900">{heroLabel}</h3>
        <p className="text-sm text-slate-500">{heroSlug.replaceAll("-", " ")}</p>
        <p className="mt-2 text-sm text-slate-600">
          {service
            ? "This showcase panel highlights the core service you selected before you configure offerings."
            : "Select any master service card to preview its hero imagery and instructions here."}
        </p>
      </div>
    </div>
  );
};

export default VendorServices;
