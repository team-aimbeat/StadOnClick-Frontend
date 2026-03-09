import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import dayjs, { type Dayjs } from "dayjs";
import boxImg from "@/assets/Images/box.png";
import { Button } from "@/components/ui/button";
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
  useDeleteServiceOfferingsMutation,
} from "@/services/vendorOfferingsApi";
import {
  useCreateVendorServiceMutation,
  useCreateVendorMasterServiceMutation,
  useCreateVendorServiceCategoryMutation,
  useUpdateVendorServiceMutation,
  useGetVendorServicesQuery,
  type VendorServiceEntity,
} from "@/services/vendorServicesApi";
import { normalizeApiError } from "@/shared/utils/normalizeApiError";
import { VendorServicesWizard } from "./vendor-services/VendorServicesWizard";
import { VendorServiceOverview } from "./vendor-services/VendorServiceOverview";

type StepState = "idle" | "loading" | "success" | "error";

type OfferingFormValues = {
  name: string;
  description: string;
  bookingUrl?: string;
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

type VendorServiceDetails = {
  title: string;
  description: string;
  terms: string;
};

type RefundPolicyType = "NO_REFUND" | "PARTIAL_BEFORE_WINDOW";

type RefundPolicyForm = {
  type: RefundPolicyType;
  windowHours: string;
};

const defaultRefundPolicy: RefundPolicyForm = {
  type: "PARTIAL_BEFORE_WINDOW",
  windowHours: "48",
};

const VendorServices = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [addOfferingRequested, setAddOfferingRequested] = useState(false);

  const wizardScrollRef = useRef<HTMLDivElement | null>(null);
  const [pendingScrollToWizard, setPendingScrollToWizard] = useState(false);
  const [selectedMasterServiceId, setSelectedMasterServiceId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedExistingOfferingId, setSelectedExistingOfferingId] =
    useState("");
  const [pendingPrefillOfferingId, setPendingPrefillOfferingId] = useState<
    string | null
  >(null);
  const [enableSlots, setEnableSlots] = useState(false);
  const [enableRules, setEnableRules] = useState(false);
  const [slotTargetOfferingIndex, setSlotTargetOfferingIndex] = useState(0);
  const [ruleTargetOfferingIndex, setRuleTargetOfferingIndex] = useState(0);
  const [slotFields, setSlotFields] = useState<SlotFields>(slotInitialState);
  const [slotStartDate, setSlotStartDate] = useState<Dayjs | null>(null);
  const [slotEndDate, setSlotEndDate] = useState<Dayjs | null>(null);
  const [slotStartTime, setSlotStartTime] = useState<Dayjs | null>(
    dayjs().hour(9).minute(0),
  );
  const [slotEndTime, setSlotEndTime] = useState<Dayjs | null>(
    dayjs().hour(10).minute(0),
  );
  const [ruleFields, setRuleFields] = useState<RuleFields>(ruleInitialState);
  const [slotValidationError, setSlotValidationError] = useState<string | null>(
    null,
  );
  const [ruleValidationError, setRuleValidationError] = useState<string | null>(
    null,
  );
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [lastCreatedOfferingId, setLastCreatedOfferingId] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offeringStep, setOfferingStep] = useState<StepState>("idle");
  const [slotStep, setSlotStep] = useState<StepState>("idle");
  const [ruleStep, setRuleStep] = useState<StepState>("idle");
  const [offeringError, setOfferingError] = useState<string | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [ruleError, setRuleError] = useState<string | null>(null);
  const [createdServiceId, setCreatedServiceId] = useState<string | null>(null);
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [mode, setMode] = useState<"overview" | "wizard">("overview");
  const [selectedMasterForQuery, setSelectedMasterForQuery] = useState("");
  const [, startMasterTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(1);
  const [highestStep, setHighestStep] = useState(1);
  const [wizardError, setWizardError] = useState<string | null>(null);
  const isEditing = Boolean(createdServiceId);
  const [pendingCategoryReset, setPendingCategoryReset] = useState<{
    masterId?: string;
    categoryId?: string;
  } | null>(null);
  const [isResettingOfferings, setIsResettingOfferings] = useState(false);

  const [deleteServiceOfferings] = useDeleteServiceOfferingsMutation();

  useEffect(() => {
    if (searchParams.get("addOffering") === "1") {
      setAddOfferingRequested(true);
    }
  }, [searchParams]);

  const resetOfferingsState = useCallback(() => {
    setSelectedExistingOfferingId("");
    setEnableSlots(false);
    setEnableRules(false);
    setSlotTargetOfferingIndex(0);
    setRuleTargetOfferingIndex(0);
    setSlotFields({ ...slotInitialState });
    setSlotStartDate(null);
    setSlotEndDate(null);
    setSlotStartTime(dayjs().hour(9).minute(0));
    setSlotEndTime(dayjs().hour(10).minute(0));
    setRuleFields({ ...ruleInitialState });
    setSlotValidationError(null);
    setRuleValidationError(null);
    setSlotStep("idle");
    setRuleStep("idle");
    setOfferingStep("idle");
    setOfferingError(null);
    setGeneralError(null);
    setLastCreatedOfferingId(null);
  }, []);

  const applyMasterAndCategory = (masterId?: string, categoryId?: string) => {
    if (masterId) {
      setSelectedMasterServiceId(masterId);
      startMasterTransition(() => {
        setSelectedMasterForQuery(masterId);
      });
    }
    if (categoryId) {
      setSelectedCategoryId(categoryId);
    }
  };

  const handleConfirmedCategoryReset = async () => {
    if (!pendingCategoryReset) return;
    setIsResettingOfferings(true);
    try {
      if (createdServiceId) {
        await deleteServiceOfferings(createdServiceId).unwrap();
      }
      resetOfferingsState();
      applyMasterAndCategory(
        pendingCategoryReset.masterId,
        pendingCategoryReset.categoryId,
      );
      setWizardError(null);
      setCurrentStep(2);
      setHighestStep((prev) => Math.max(prev, 2));
    } catch (error) {
      toast.error("Unable to reset offerings for this service.");
    } finally {
      setPendingCategoryReset(null);
      setIsResettingOfferings(false);
    }
  };

  const handleSelectMaster = useCallback(
    (id: string) => {
      const isChangingMaster =
        selectedMasterServiceId && selectedMasterServiceId !== id;

      if (isEditing && isChangingMaster) {
        setPendingCategoryReset({ masterId: id, categoryId: "" });
        return;
      }

      setSelectedMasterServiceId(id);
      startMasterTransition(() => {
        setSelectedMasterForQuery(id);
      });

      if (isChangingMaster) {
        resetOfferingsState();
        setSelectedCategoryId("");
        setCurrentStep(1);
        setHighestStep(1);
      }
    },
    [
      isEditing,
      resetOfferingsState,
      selectedMasterServiceId,
      startMasterTransition,
    ],
  );

  useEffect(() => {
    if (mode === "wizard" && pendingScrollToWizard) {
      requestAnimationFrame(() => {
        wizardScrollRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
      setPendingScrollToWizard(false);
    }
  }, [mode, pendingScrollToWizard]);

  const {
    data: vendorServices = [],
    isLoading: isServicesLoading,
    refetch: refetchServices,
  } = useGetVendorServicesQuery();
  const hasService = vendorServices.length > 0;

  const [vendorServiceDetails, setVendorServiceDetails] =
    useState<VendorServiceDetails>({
      title: "",
      description: "",
      terms: "",
    });
  const [vendorServiceErrors, setVendorServiceErrors] = useState<
    Record<string, string>
  >({});
  const [refundPolicy, setRefundPolicy] =
    useState<RefundPolicyForm>(defaultRefundPolicy);
  const [vendorServiceStep, setVendorServiceStep] = useState<StepState>("idle");
  const [vendorServiceError, setVendorServiceError] = useState<string | null>(
    null,
  );

  const [createVendorService] = useCreateVendorServiceMutation();
  const [createVendorMasterService] = useCreateVendorMasterServiceMutation();
  const [createVendorServiceCategory] = useCreateVendorServiceCategoryMutation();
  const [updateVendorService] = useUpdateVendorServiceMutation();
  const [createOffering] = useCreateOfferingMutation();
  const [createSlot] = useCreateSlotMutation();
  const [createRule] = useCreateRuleMutation();

  const {
    data: masterServices = [],
    isLoading: isMasterLoading,
    isError: masterError,
    refetch: refetchMasterServices,
  } = useGetMasterCategoriesQuery();

  const {
    data: categoryOptions = [],
    isFetching: isCategoryFetching,
    isError: categoryError,
    refetch: refetchCategoryOptions,
  } = useGetServiceCategoriesByMasterQuery(selectedMasterForQuery, {
    skip: !selectedMasterForQuery,
  });

  const {
    data: existingOfferings = [],
    isFetching: isOfferingsFetching,
    isError: offeringsError,
  } = useGetServiceOfferingsQuery(createdServiceId!, {
    skip: !createdServiceId,
  });

  const { register, handleSubmit, formState, reset, setValue, control, watch } =
    useForm<{ offerings: OfferingFormValues[] }>({
      mode: "onBlur",
      defaultValues: {
        offerings: [
          {
            name: "",
            description: "",
            bookingUrl: "",
            basePrice: 0,
            salePrice: 0,
            maxQuantity: undefined,
          },
        ],
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "offerings",
  });
  const watchedOfferings = watch("offerings");

  useEffect(() => {
    const maxIndex = Math.max((watchedOfferings?.length ?? 1) - 1, 0);
    if (slotTargetOfferingIndex > maxIndex) {
      setSlotTargetOfferingIndex(maxIndex);
    }
    if (ruleTargetOfferingIndex > maxIndex) {
      setRuleTargetOfferingIndex(maxIndex);
    }
  }, [
    watchedOfferings?.length,
    slotTargetOfferingIndex,
    ruleTargetOfferingIndex,
  ]);

  const { errors } = formState;

  const masterServiceOptions = useMemo(() => {
    if (!masterServices.length) return [];
    return [...masterServices].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
  }, [masterServices]);

  const selectedMasterService = masterServiceOptions.find(
    (service) => service.id === selectedMasterServiceId,
  );
  const selectedCategory = categoryOptions.find(
    (category) => category.id === selectedCategoryId,
  );

  const stepOrder = useMemo(
    () => [
      { id: 1, label: "Master service" },
      { id: 2, label: "Service category" },
      { id: 3, label: "Vendor service details" },
      { id: 4, label: "Offerings & extras" },
    ],
    [],
  );
  const stepMotion = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -14 },
    transition: { duration: 0.18, ease: [0.16, 0.64, 0.37, 0.99] as const },
  };

  useEffect(() => {
    setSelectedExistingOfferingId("");
  }, [createdServiceId]);

  useEffect(() => {
    if (!createdServiceId || !pendingPrefillOfferingId) return;
    setSelectedExistingOfferingId(pendingPrefillOfferingId);
    setPendingPrefillOfferingId(null);
  }, [createdServiceId, pendingPrefillOfferingId]);

  useEffect(() => {
    setWizardError(null);
    setGeneralError(null);
  }, [currentStep]);

  useEffect(() => {
    if (enableSlots && !slotFields.startTime && !slotFields.endTime) {
      const start = dayjs().minute(0).second(0).millisecond(0);
      const end = start.add(1, "hour");
      setSlotStartDate(start);
      setSlotEndDate(end);
      setSlotStartTime(start);
      setSlotEndTime(end);
      handleSlotFieldUpdate("startTime", start.toISOString());
      handleSlotFieldUpdate("endTime", end.toISOString());
    }
  }, [enableSlots, slotFields.endTime, slotFields.startTime]);

  useEffect(() => {
    if (!selectedMasterServiceId) return;

    // When managing an existing service, keep the prefilled selections intact
    // and ensure the category query uses the correct master id.
    if (createdServiceId) {
      if (!selectedMasterForQuery) {
        setSelectedMasterForQuery(selectedMasterServiceId);
      }
      return;
    }

    setSelectedCategoryId("");
    setSelectedExistingOfferingId("");
    setEnableSlots(false);
    setEnableRules(false);
    setSlotTargetOfferingIndex(0);
    setRuleTargetOfferingIndex(0);
    setSlotFields({ ...slotInitialState });
    setSlotStartDate(null);
    setSlotEndDate(null);
    setSlotStartTime(dayjs().hour(9).minute(0));
    setSlotEndTime(dayjs().hour(10).minute(0));
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
    setCurrentStep(1);
    setHighestStep(1);
  }, [createdServiceId, selectedMasterForQuery, selectedMasterServiceId]);

  useEffect(() => {
    if (!selectedExistingOfferingId) return;
    const offering = existingOfferings.find(
      (item) => item.id === selectedExistingOfferingId,
    );
    if (!offering) return;
    // Prefill the FIRST offering card
    setValue("offerings.0.name", offering.name);
    setValue("offerings.0.description", offering.description ?? "");
    setValue("offerings.0.bookingUrl", offering.bookingUrl ?? "");
    setValue("offerings.0.basePrice", offering.basePrice);
    setValue("offerings.0.salePrice", offering.salePrice);
    setValue("offerings.0.maxQuantity", offering.maxQuantity ?? undefined);
  }, [existingOfferings, selectedExistingOfferingId, setValue]);

  const handleSlotFieldUpdate = (field: keyof SlotFields, value: string) => {
    setSlotFields((prev) => ({ ...prev, [field]: value }));
    setSlotValidationError(null);
    setSlotStep((prev) => (prev === "error" ? "idle" : prev));
  };

  const combineDayAndTime = (date: Dayjs | null, time: Dayjs | null) => {
    if (!date || !time) return null;
    return date
      .hour(time.hour())
      .minute(time.minute())
      .second(0)
      .millisecond(0);
  };

  type SlotKind = "start" | "end";
  const handleSlotDateChange = (kind: SlotKind, value: Dayjs | null) => {
    if (kind === "start") setSlotStartDate(value);
    else setSlotEndDate(value);
    const combined = combineDayAndTime(
      value,
      kind === "start" ? slotStartTime : slotEndTime,
    );
    if (combined) {
      handleSlotFieldUpdate(
        kind === "start" ? "startTime" : "endTime",
        combined.toISOString(),
      );
    }
  };

  const handleSlotTimeChange = (kind: SlotKind, value: Dayjs | null) => {
    if (kind === "start") setSlotStartTime(value);
    else setSlotEndTime(value);
    const combined = combineDayAndTime(
      kind === "start" ? slotStartDate : slotEndDate,
      value,
    );
    if (combined) {
      handleSlotFieldUpdate(
        kind === "start" ? "startTime" : "endTime",
        combined.toISOString(),
      );
    }
  };

  const handleRuleFieldUpdate = (field: keyof RuleFields, value: string) => {
    setRuleFields((prev) => ({ ...prev, [field]: value }));
    setRuleValidationError(null);
    setRuleStep((prev) => (prev === "error" ? "idle" : prev));
  };

  const goToStep = (step: number) => {
    const safe = Math.min(Math.max(step, 1), 4);
    setCurrentStep(safe);
    setHighestStep((prev) => Math.max(prev, safe));
  };

  const handleNextFromMaster = () => {
    if (!selectedMasterServiceId) {
      setWizardError("Select a master service to continue.");
      return;
    }
    setWizardError(null);
    goToStep(2);
  };

  const handleCreateMasterService = useCallback(
    async (input: { name: string; slug?: string }) => {
      const payload = {
        name: input.name.trim(),
        slug: input.slug?.trim() || undefined,
        createDefaultCategory: false,
      };
      const created = await createVendorMasterService(payload).unwrap();
      await refetchMasterServices();
      handleSelectMaster(created.id);
      setWizardError(null);
      toast.success("Master service created.");
      return created;
    },
    [createVendorMasterService, handleSelectMaster, refetchMasterServices],
  );

  const handleCreateServiceCategory = useCallback(
    async (input: { name: string; slug?: string; masterCategoryId?: string }) => {
      const masterCategoryId = input.masterCategoryId || selectedMasterServiceId;
      if (!masterCategoryId) {
        throw new Error("Select a master service first.");
      }
      const created = await createVendorServiceCategory({
        masterCategoryId,
        name: input.name.trim(),
        slug: input.slug?.trim() || undefined,
        isActive: true,
      }).unwrap();
      await refetchCategoryOptions();
      setSelectedCategoryId(created.id);
      setWizardError(null);
      toast.success("Service category created.");
      return created;
    },
    [
      createVendorServiceCategory,
      refetchCategoryOptions,
      selectedMasterServiceId,
      setSelectedCategoryId,
    ],
  );

  const handleNextFromCategory = () => {
    if (!selectedCategoryId) {
      setWizardError("Pick a category before moving forward.");
      return;
    }
    setWizardError(null);
    goToStep(3);
  };

  const handleNextFromDetails = () => {
    if (!selectedCategoryId) {
      setWizardError("Pick a category before entering details.");
      goToStep(2);
      return;
    }
    const isValid = validateVendorServiceDetails();
    if (!isValid) {
      setWizardError("Complete the required vendor service fields.");
      return;
    }
    setWizardError(null);
    goToStep(4);
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
    if (!refundPolicy.type) {
      errors.refundPolicy = "Select a refund policy.";
    } else {
      const windowHours = Number(refundPolicy.windowHours);

      if (refundPolicy.type !== "NO_REFUND") {
        if (Number.isNaN(windowHours) || windowHours <= 0) {
          errors.refundPolicy =
            "Enter a valid cutoff window (hours) greater than 0.";
        }
      }
    }

    setVendorServiceErrors(errors);
    return Object.keys(errors).length === 0;
  }, [refundPolicy.type, refundPolicy.windowHours, vendorServiceDetails]);

  const handleVendorServiceDetailChange = (
    field: keyof VendorServiceDetails,
    value: string,
  ) => {
    setVendorServiceDetails((prev) => ({ ...prev, [field]: value }));
    setVendorServiceErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleRefundPolicyChange = (
    field: keyof RefundPolicyForm,
    value: string,
  ) => {
    setRefundPolicy((prev) => ({ ...prev, [field]: value }));
    setVendorServiceErrors((prev) => {
      const next = { ...prev };
      delete next.refundPolicy;
      return next;
    });
  };

  const handleCreateOffering = handleSubmit(async (data) => {
    if (!selectedCategoryId) {
      setGeneralError("Select a category before creating an offering.");
      return;
    }
    if (!createdServiceId && hasService) {
      setGeneralError(
        "Only one service is allowed per vendor. Please update the existing service instead.",
      );
      return;
    }
    if (!createdServiceId && !validateVendorServiceDetails()) {
      setGeneralError("Complete the vendor service details before continuing.");
      return;
    }
    setGeneralError(null);
    setVendorServiceStep("loading");
    setVendorServiceError(null);
    setOfferingStep("loading");
    setOfferingError(null);
    setIsSubmitting(true);

    let currentServiceId = createdServiceId;

    try {
      // 1. Create Service if not exists
      if (!currentServiceId) {
        const parsedWindowHours =
          refundPolicy.type === "NO_REFUND"
            ? null
            : Number(refundPolicy.windowHours);

        const vendorServicePayload = {
          categoryId: selectedCategoryId,
          title: vendorServiceDetails.title.trim(),
          description: vendorServiceDetails.description.trim(),
          terms: vendorServiceDetails.terms.trim(),
          refundPolicy: {
            type: refundPolicy.type,
            windowHours: parsedWindowHours,
          },
        };

        const createdVendorService =
          await createVendorService(vendorServicePayload).unwrap();
        currentServiceId = createdVendorService.id;
        setCreatedServiceId(currentServiceId);
        setVendorServiceStep("success");
        toast.success("Vendor service created");
      } else {
        const updatePayload: {
          id: string;
          categoryId: string;
          title?: string;
          description?: string;
          terms?: string;
          refundPolicy?: { type: RefundPolicyType; windowHours?: number | null };
        } = {
          id: currentServiceId,
          categoryId: selectedCategoryId,
        };

        const nextTitle = vendorServiceDetails.title.trim();
        if (nextTitle) updatePayload.title = nextTitle;

        const nextDescription = vendorServiceDetails.description.trim();
        if (nextDescription) updatePayload.description = nextDescription;

        const nextTerms = vendorServiceDetails.terms.trim();
        if (nextTerms) updatePayload.terms = nextTerms;

        const parsedWindowHours =
          refundPolicy.type === "NO_REFUND"
            ? null
            : Number(refundPolicy.windowHours);
        if (
          refundPolicy.type === "NO_REFUND" ||
          (Number.isFinite(parsedWindowHours) && parsedWindowHours > 0)
        ) {
          updatePayload.refundPolicy = {
            type: refundPolicy.type,
            windowHours: refundPolicy.type === "NO_REFUND" ? null : parsedWindowHours,
          };
        }

        await updateVendorService({
          ...updatePayload,
        }).unwrap();
        setVendorServiceStep("success");
      }

      // 2. Create multiple Offerings
      const createdOfferingIds: string[] = [];
      for (const offeringVals of data.offerings) {
        const payload: CreateOfferingPayload = {
          serviceId: currentServiceId,
          name: offeringVals.name.trim(),
          description: offeringVals.description.trim(),
          bookingUrl: offeringVals.bookingUrl?.trim() || undefined,
          basePrice: offeringVals.basePrice,
          salePrice: offeringVals.salePrice,
          maxQuantity: offeringVals.maxQuantity,
        };
        const createdOffering = await createOffering(payload).unwrap();
        setLastCreatedOfferingId(createdOffering.id);
        createdOfferingIds.push(createdOffering.id);
      }

      if (enableSlots && createdOfferingIds.length > 0) {
        const selectedSlotTargetId =
          createdOfferingIds[
            Math.min(Math.max(slotTargetOfferingIndex, 0), createdOfferingIds.length - 1)
          ];
        await createSlotFlow(selectedSlotTargetId);
      }

      if (enableRules && createdOfferingIds.length > 0) {
        const selectedRuleTargetId =
          createdOfferingIds[
            Math.min(Math.max(ruleTargetOfferingIndex, 0), createdOfferingIds.length - 1)
          ];
        await createRuleFlow(selectedRuleTargetId);
      }

      setOfferingStep("success");
      toast.success(
        "All offerings and extra configurations saved successfully",
        {
          id: "vendor-multi-offering-success",
        },
      );

      // Cleanup & return to overview
      reset();
      setSelectedMasterServiceId("");
      setSelectedMasterForQuery("");
      setSelectedCategoryId("");
      setSelectedExistingOfferingId("");
      setPendingPrefillOfferingId(null);
      setEnableSlots(false);
      setEnableRules(false);
      setSlotTargetOfferingIndex(0);
      setRuleTargetOfferingIndex(0);
      setSlotFields({ ...slotInitialState });
      setSlotStartDate(null);
      setSlotEndDate(null);
      setSlotStartTime(dayjs().hour(9).minute(0));
      setSlotEndTime(dayjs().hour(10).minute(0));
      setRuleFields({ ...ruleInitialState });
      setRefundPolicy(defaultRefundPolicy);
      setCurrentStep(1);
      setHighestStep(1);
      setMode("overview");
      refetchServices();
    } catch (error) {
      const normalized = normalizeApiError(error, "Operation failed");
      const vendorContextError =
        normalized.formError === "VENDOR_CONTEXT_REQUIRED" ||
        normalized.formError === "VENDOR_NOT_FOUND";
      const message = vendorContextError
        ? "Unable to resolve vendor session. Please complete vendor profile setup and sign in again."
        : normalized.toastMessage;
      setGeneralError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  });

  const openWizardForNewService = useCallback(() => {
    setMode("wizard");
    setCreatedServiceId(null);
    setSelectedMasterServiceId("");
    setSelectedMasterForQuery("");
    setSelectedCategoryId("");
    setSelectedExistingOfferingId("");
    setPendingPrefillOfferingId(null);
    resetOfferingsState();
    setVendorServiceDetails({
      title: "",
      description: "",
      terms: "",
    });
    setRefundPolicy(defaultRefundPolicy);
    setCurrentStep(1);
    setHighestStep(1);
    reset();
    setPendingScrollToWizard(true);
  }, [reset, resetOfferingsState]);

  const openWizardForService = useCallback(
    (
      service: VendorServiceEntity,
      options?: { step?: number; offeringId?: string },
    ) => {
      setMode("wizard");
      setCreatedServiceId(service.id);
      setSelectedCategoryId(service.category?.id ?? "");
      const masterId = service.category?.masterCategoryId ?? "";
      setSelectedMasterServiceId(masterId);
      startMasterTransition(() => {
        setSelectedMasterForQuery(masterId);
      });
      setVendorServiceDetails({
        title: service.title ?? "",
        description: service.description ?? "",
        terms: service.terms ?? "",
      });
      setRefundPolicy(
        service.refundPolicy?.type
          ? {
              type: service.refundPolicy.type,
              windowHours:
                service.refundPolicy.windowHours != null
                  ? String(service.refundPolicy.windowHours)
                  : "48",
            }
          : defaultRefundPolicy,
      );
      setHighestStep(4);
      setCurrentStep(options?.step ?? 3);
      if (options?.offeringId) {
        setPendingPrefillOfferingId(options.offeringId);
      }
      setPendingScrollToWizard(true);
    },
    [startMasterTransition],
  );

  useEffect(() => {
    if (!addOfferingRequested) return;
    if (isServicesLoading) return;
    if (hasService) return;

    toast.error("Create your service first, then add offerings.");

    const next = new URLSearchParams(searchParams);
    next.delete("addOffering");
    setSearchParams(next, { replace: true });
    setAddOfferingRequested(false);

    openWizardForNewService();
  }, [
    addOfferingRequested,
    hasService,
    isServicesLoading,
    openWizardForNewService,
    searchParams,
    setSearchParams,
  ]);

  if (mode === "overview") {
    const activeService = vendorServices[0];

    if (isServicesLoading) {
      return (
        <div className="mx-auto px-6 py-10 text-sm text-slate-600">
          Loading service...
        </div>
      );
    }

    if (!activeService) {
      return (
        <div className="mx-auto px-6 py-14">
          <div className="mx-auto flex max-w-3xl flex-col items-center rounded-[32px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div >
              <img src={boxImg} className="w-110 ml-15 " alt="box" />
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-slate-900">
              Welcome to Vendor Services
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-slate-500">
              Start by creating your first service, then add offerings, slots,
              and rules to publish a complete customer-ready listing.
            </p>

            <Button onClick={openWizardForNewService} className="mt-5">
              Create New Service
            </Button>
          </div>
        </div>
      );
    }

    const consumeAddOfferingRequest = () => {
      setAddOfferingRequested(false);
      const next = new URLSearchParams(searchParams);
      next.delete("addOffering");
      setSearchParams(next, { replace: true });
    };

    return (
      <VendorServiceOverview
        service={activeService}
        masterServices={masterServices}
        onEditService={() => openWizardForService(activeService, { step: 3 })}
        onEditOfferings={(offeringId) =>
          openWizardForService(activeService, { step: 4, offeringId })
        }
        requestAddOfferingOpen={addOfferingRequested}
        onConsumeAddOfferingRequest={consumeAddOfferingRequest}
      />
    );
  }

  return (
    <VendorServicesWizard
      wizardScrollRef={wizardScrollRef}
      isEditing={isEditing}
      stepOrder={stepOrder}
      stepMotion={stepMotion}
      currentStep={currentStep}
      highestStep={highestStep}
      goToStep={goToStep}
      setShowListing={(value) => setMode(value ? "overview" : "wizard")}
      setCurrentStep={setCurrentStep}
      selectedMasterServiceId={selectedMasterServiceId}
      masterServiceOptions={masterServiceOptions}
      isMasterLoading={isMasterLoading}
      wizardError={wizardError}
      handleCreateMasterService={handleCreateMasterService}
      handleSelectMaster={handleSelectMaster}
      handleNextFromMaster={handleNextFromMaster}
      selectedMasterService={selectedMasterService}
      categoryOptions={categoryOptions}
      isCategoryFetching={isCategoryFetching}
      categoryError={categoryError}
      selectedCategoryId={selectedCategoryId}
      setSelectedCategoryId={setSelectedCategoryId}
      handleCreateServiceCategory={handleCreateServiceCategory}
      handleNextFromCategory={handleNextFromCategory}
      selectedCategory={selectedCategory}
      handleNextFromDetails={handleNextFromDetails}
      createdServiceId={createdServiceId}
      vendorServiceDetails={vendorServiceDetails}
      vendorServiceErrors={vendorServiceErrors}
      handleVendorServiceDetailChange={handleVendorServiceDetailChange}
      refundPolicy={refundPolicy}
      handleRefundPolicyChange={handleRefundPolicyChange}
      selectedExistingOfferingId={selectedExistingOfferingId}
      setSelectedExistingOfferingId={setSelectedExistingOfferingId}
      existingOfferings={existingOfferings}
      isOfferingsFetching={isOfferingsFetching}
      offeringsError={offeringsError}
      handleCreateOffering={handleCreateOffering}
      register={register}
      fields={fields}
      append={append}
      remove={remove}
      watchedOfferings={watchedOfferings ?? []}
      errors={errors}
      generalError={generalError}
      enableSlots={enableSlots}
      setEnableSlots={setEnableSlots}
      slotTargetOfferingIndex={slotTargetOfferingIndex}
      setSlotTargetOfferingIndex={setSlotTargetOfferingIndex}
      slotFields={slotFields}
      slotStartDate={slotStartDate}
      slotEndDate={slotEndDate}
      slotStartTime={slotStartTime}
      slotEndTime={slotEndTime}
      handleSlotDateChange={handleSlotDateChange}
      handleSlotTimeChange={handleSlotTimeChange}
      handleSlotFieldUpdate={handleSlotFieldUpdate}
      slotValidationError={slotValidationError}
      enableRules={enableRules}
      setEnableRules={setEnableRules}
      ruleTargetOfferingIndex={ruleTargetOfferingIndex}
      setRuleTargetOfferingIndex={setRuleTargetOfferingIndex}
      ruleFields={ruleFields}
      handleRuleFieldUpdate={handleRuleFieldUpdate}
      ruleValidationError={ruleValidationError}
      RULE_OPTIONS={RULE_OPTIONS}
      isSubmitting={isSubmitting}
      pendingCategoryReset={pendingCategoryReset}
      setPendingCategoryReset={setPendingCategoryReset}
      isResettingOfferings={isResettingOfferings}
      handleConfirmedCategoryReset={handleConfirmedCategoryReset}
    />
  );
};

export default VendorServices;
