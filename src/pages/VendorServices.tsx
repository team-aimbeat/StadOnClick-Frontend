import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HiOutlinePlus,
  HiOutlineSparkles,
  HiOutlineXMark,
} from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import StatusPill from "@/components/vendor-dashboard/StatusPill";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useMockLoader } from "@/lib/useMockLoader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import VendorServiceStep3, {
  VendorServiceStep3Handle,
} from "./VendorServiceStep3";
import {
  useGetMasterCategoriesQuery,
  useGetServiceCategoriesByMasterQuery,
  type ServiceMasterCategory,
} from "@/services/serviceCategoriesApi";
import {
  useCreateOfferingMutation,
  useCreateSlotMutation,
  useCreateRuleMutation,
} from "@/services/vendorOfferingsApi";
import { useGetServiceOfferingsQuery } from "@/services/vendorOfferingsApi";
import well from "@/assets/Images/well.jpg";
import { plannedCategories } from "@/data/vendorServiceCategories";

type PricingModel = "fixed" | "hourly" | "package";
type Slot = {
  id: string;
  label: string;
  capacity: number;
  status?: "available" | "blocked";
};
type Offering = {
  id: string;
  name: string;
  price: number;
  status: "ACTIVE" | "PAUSED";
  pricingModel: PricingModel;
  slots: Slot[];
};
type Service = {
  id: string;
  name: string;
  story: string;
  category: string;
  status: "LIVE" | "PAUSED" | "DRAFT";
  pricingModel: PricingModel;
  hasMedia: boolean;
  offerings: Offering[];
  subcategory?: string;
};

type ServiceDraft = {
  name: string;
  story: string;
  basePrice: string;
  salePrice: string;
  subcategory: string;
  serviceId: string;                    // ← renamed for clarity (this is the primary id)
};

const VendorServices = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useMockLoader();

  const [notification, setNotification] = useState("");
  const notifyRef = useRef<number>();
  const [services, setServices] = useState<Service[]>([]);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft>({
    name: "",
    story: "",
    basePrice: "",
    salePrice: "",
    subcategory: "",
    serviceId: "",
  });
  const [ruleDraft, setRuleDraft] = useState<{ type: string; value: string }>({
    type: "",
    value: "",
  });
  const [rules, setRules] = useState<{ id: string; type: string; value: string }[]>([]);
  const step3Ref = useRef<VendorServiceStep3Handle>(null);
  const [createOffering] = useCreateOfferingMutation();
  const [createSlot] = useCreateSlotMutation();
  const [createRule] = useCreateRuleMutation();
  const { data: masterCategories = [] } = useGetMasterCategoriesQuery();

  const masterCategoryOptions = useMemo(() => {
    if (!masterCategories.length) return [];

    return [...masterCategories].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
  }, [masterCategories]);

  const activeCategory = masterCategoryOptions.find(
    (category) => category.id === serviceDraft.serviceId,
  );

  const selectedCategoryName = activeCategory?.name ?? "Category";
  const selectedServiceId = serviceDraft.subcategory || serviceDraft.serviceId;

  const {
    data: serviceSubCategories = [],
  } = useGetServiceCategoriesByMasterQuery(serviceDraft.serviceId, {
    skip: !serviceDraft.serviceId,
  });

  useEffect(() => {
    setServiceDraft((draft) =>
      draft.subcategory ? { ...draft, subcategory: "" } : draft,
    );
  }, [serviceDraft.serviceId]);

  useEffect(() => {
    if (!masterCategoryOptions.length) return;
    if (!serviceDraft.serviceId) return;
    const exists = masterCategoryOptions.some(
      (category) => category.id === serviceDraft.serviceId,
    );
    if (!exists) {
      setServiceDraft((draft) => ({ ...draft, serviceId: "" }));
    }
  }, [masterCategoryOptions, serviceDraft.serviceId]);

  useEffect(() => {
    if (!masterCategoryOptions.length) return;

    const params = new URLSearchParams(location.search);
    if (params.get("openWizard") === "true" && params.get("category")) {
      const slug = params.get("category")!;
      const category = masterCategoryOptions.find((cat) => cat.slug === slug);
      if (category) {
        setServiceDraft((draft) => ({ ...draft, serviceId: category.id }));
        setWizardStep(2);
        setWizardOpen(true);
      }
      navigate("/vendor/services", { replace: true });
    }
  }, [location.search, navigate, masterCategoryOptions]);

  useEffect(() => {
    return () => window.clearTimeout(notifyRef.current);
  }, []);

  const addNotification = (msg: string) => {
    setNotification(msg);
    window.clearTimeout(notifyRef.current);
    notifyRef.current = window.setTimeout(() => setNotification(""), 3000);
  };

  const wizardSteps = [
    { id: 1, label: "Category", helper: "Choose the best fit for your offering" },
    { id: 2, label: "Details", helper: "Tell customers what makes this special" },
    { id: 3, label: "Configure offerings", helper: "Each offering can have its own pricing, slots, and rules." },
    { id: 4, label: "Rules", helper: "Any booking requirements or restrictions?" },
  ];

  const handleContinue = async () => {
    if (wizardStep === 1 && !serviceDraft.serviceId) {
      addNotification("Select a category before continuing.");
      return;
    }
    if (wizardStep === 2 && !serviceDraft.name.trim()) {
      addNotification("Service name is required.");
      return;
    }
    if (wizardStep === 3) {
      const valid = await step3Ref.current?.validate();
      if (!valid) return;
    }
    setWizardStep((p) => Math.min(p + 1, wizardSteps.length));
  };

  const continueDisabled =
    (wizardStep === 1 && !serviceDraft.serviceId) ||
    (wizardStep === 2 && !serviceDraft.name.trim());

  const resetWizard = () => {
    setWizardStep(1);
    setServiceDraft({
      name: "",
      story: "",
      basePrice: "",
      salePrice: "",
      subcategory: "",
      serviceId: "",
    });
    setRuleDraft({ type: "", value: "" });
    setRules([]);
  };

  const handleCategorySelect = (categoryId: string) => {
    setServiceDraft((draft) => ({ ...draft, serviceId: categoryId, subcategory: "" }));
    const matchedCategory = masterCategoryOptions.find((cat) => cat.id === categoryId);
    if (matchedCategory?.slug) {
      navigate(`/vendor/services/category/${matchedCategory.slug}`);
    }
  };

  const handleAddRule = () => {
    if (!ruleDraft.type.trim() || !ruleDraft.value.trim()) return;
    setRules((prev) => [
      ...prev,
      { id: `rule-${Date.now()}`, type: ruleDraft.type.trim(), value: ruleDraft.value.trim() },
    ]);
    setRuleDraft({ type: "", value: "" });
  };

  const handleSubmitWizard = async () => {
    if (!serviceDraft.name.trim()) return;

    const step3Valid = await step3Ref.current?.validate();
    if (!step3Valid) return;

    const step3Values = step3Ref.current?.getValues();
    if (!step3Values?.offerings?.length) {
      addNotification("Add at least one offering before continuing.");
      return;
    }

    const serviceId = selectedServiceId;
    if (!serviceId) {
      addNotification("No category selected.");
      return;
    }

    try {
      const createdOfferings = [];

      for (const offering of step3Values.offerings) {
        const created = await createOffering({
        serviceId: offering.serviceId || serviceId,  // safe fallback
          name: offering.name.trim(),
          basePrice: offering.basePrice,
          salePrice: offering.salePrice ?? null,
          maxQuantity: offering.maxQuantity ?? null,
        }).unwrap();

        createdOfferings.push(created);

        if (offering.slots?.length) {
          for (const slot of offering.slots) {
            await createSlot({
              offeringId: created.id,
              startTime: new Date(slot.startTime).toISOString(),
              endTime: slot.endTime ? new Date(slot.endTime).toISOString() : undefined,
              capacity: slot.capacity,
            }).unwrap();
          }
        }
      }

      if (createdOfferings.length > 0 && rules.length > 0) {
        for (const rule of rules) {
          await createRule({
            offeringId: createdOfferings[0].id,
            ruleType: rule.type,
            value: rule.value,
          }).unwrap();
        }
      }

      const baseTimestamp = Date.now();
      const localOfferings = step3Values.offerings.map((offering, index) => ({
        id: `off-${baseTimestamp}-${index}`,
        name: offering.name,
        price: offering.salePrice ?? offering.basePrice,
        status: "ACTIVE" as const,
        pricingModel: "fixed" as const,
        slots: offering.slots.map((slot, slotIndex) => ({
          id: `slot-${baseTimestamp}-${index}-${slotIndex}`,
          label: formatSlotLabel(slot.startTime, slot.endTime),
          capacity: slot.capacity,
        })),
      }));

      const newService: Service = {
        id: `svc-${baseTimestamp}`,
        name: serviceDraft.name.trim(),
        story: serviceDraft.story.trim() || "New service experience",
        category: selectedCategoryName,
        subcategory: serviceDraft.subcategory || undefined,
        status: "DRAFT",
        pricingModel: "fixed",
        hasMedia: false,
        offerings: localOfferings,
      };

      setServices((prev) => [...prev, newService]);

      addNotification("Service created successfully (draft mode)");
      setWizardOpen(false);
      resetWizard();
    } catch (error) {
      console.error("Error creating service:", error);
      addNotification("Failed to publish offerings. Try again.");
    }
  };

  const handleToggleServiceStatus = (id: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: s.status === "LIVE" ? "PAUSED" : s.status === "PAUSED" ? "LIVE" : s.status,
            }
          : s
      )
    );
    addNotification("Service status updated");
  };

  if (loading) {
    return (
      <DashboardContainer className="space-y-6 pt-8">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
        <div className="space-y-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <TitleBreadCrumbs title="Services" breadCrumbTitle="Vendor / Services" />
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Your Services
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            {services.length} service{services.length !== 1 ? "s" : ""} listed
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              resetWizard();
              setWizardOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            <HiOutlinePlus className="h-4.5 w-4.5" />
            Add New Service
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Services" value={services.length} color="blue" />
        <StatCard
          label="Offerings"
          value={services.reduce((sum, s) => sum + s.offerings.length, 0)}
          color="indigo"
        />
        <StatCard
          label="Total Slots"
          value={services.reduce(
            (sum, s) => sum + s.offerings.reduce((a, o) => a + o.slots.length, 0),
            0
          )}
          color="emerald"
        />
        {services.some((s) => !s.hasMedia) && (
          <StatCard
            label="Needs Media"
            value={services.filter((s) => !s.hasMedia).length}
            color="amber"
            highlight
          />
        )}
      </div>

      {/* Services List */}
      {services.length === 0 ? (
        <EmptyState onAdd={() => setWizardOpen(true)} />
      ) : (
        <div className="space-y-5">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onToggleStatus={() => handleToggleServiceStatus(service.id)}
            />
          ))}
        </div>
      )}

      {/* Wizard Modal */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/50 px-2 py-6 backdrop-blur-sm">
          <div className="w-full max-w-7xl rounded-2xl bg-white sm:rounded-3xl overflow-auto max-h-[90vh]">
            {/* Progress */}
            <div className="flex gap-1 bg-slate-50 px-6 pt-4 pb-3">
              {wizardSteps.map((s) => (
                <div
                  key={s.id}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    s.id <= wizardStep ? "bg-blue-600" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Step {wizardStep} of {wizardSteps.length}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {wizardSteps[wizardStep - 1].label}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {wizardSteps[wizardStep - 1].helper}
                </p>
              </div>

              <div className="min-h-[340px]">
                {wizardStep === 1 && (
                  <CategoryStep
                    categories={masterCategoryOptions}
                    selectedId={serviceDraft.serviceId}
                    onSelect={handleCategorySelect}
                  />
                )}

                {wizardStep === 2 && (
                  <DetailsStep
                    draft={serviceDraft}
                    setDraft={setServiceDraft}
                    masterCategoryId={serviceDraft.serviceId}
                    subcategories={serviceSubCategories}
                    selectedCategoryName={selectedCategoryName}
                  />
                )}

                {wizardStep === 3 && (
                  <VendorServiceStep3
                    ref={step3Ref}
                    hideFooter
                    serviceId={selectedServiceId}
                  />
                )}

                {wizardStep === 4 && (
                  <RulesStep
                    ruleDraft={ruleDraft}
                    setRuleDraft={setRuleDraft}
                    rules={rules}
                    onAddRule={handleAddRule}
                  />
                )}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-between">
                <button
                  onClick={() => setWizardOpen(false)}
                  className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {wizardStep > 1 && (
                    <button
                      onClick={() => setWizardStep((p) => p - 1)}
                      className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Back
                    </button>
                  )}
                  <button
                    disabled={continueDisabled}
                    onClick={
                      wizardStep === wizardSteps.length ? handleSubmitWizard : handleContinue
                    }
                    className="rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 transition-all"
                  >
                    {wizardStep === wizardSteps.length ? "Create Service" : "Continue"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-emerald-600 px-6 py-3.5 text-white shadow-lg">
          {notification}
        </div>
      )}
    </DashboardContainer>
  );
};

// ────────────────────────────────────────────────
//  Helper Components (unchanged)
// ────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color = "slate",
  highlight = false,
}: {
  label: string;
  value: number | string;
  color?: "blue" | "indigo" | "emerald" | "amber" | "slate";
  highlight?: boolean;
}) {
  const base = "rounded-2xl border p-5 shadow-sm transition-all hover:shadow";
  const colors = {
    blue: "border-blue-100 bg-blue-50/60 text-blue-800",
    indigo: "border-indigo-100 bg-indigo-50/60 text-indigo-800",
    emerald: "border-emerald-100 bg-emerald-50/60 text-emerald-800",
    amber: "border-amber-100 bg-amber-50/60 text-amber-800",
    slate: "border-slate-100 bg-slate-50 text-slate-800",
  };

  return (
    <div className={`${base} ${colors[color]} ${highlight ? "ring-2 ring-amber-300/40" : ""}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 py-16 text-center">
      <HiOutlineSparkles className="h-12 w-12 text-slate-400" />
      <h3 className="mt-4 text-xl font-semibold text-slate-800">No services yet</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Start adding your services to attract more customers and manage bookings.
      </p>
      <button
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
      >
        <HiOutlinePlus className="h-4 w-4" />
        Add Your First Service
      </button>
    </div>
  );
}

function ServiceCard({ service, onToggleStatus }: { service: Service; onToggleStatus: () => void }) {
  const { data: backendOfferings } = useGetServiceOfferingsQuery(service.id, {
    skip: !service.id,
  });

  const displayOfferings = useMemo(() => {
    if (!backendOfferings || backendOfferings.length === 0) {
      return service.offerings;
    }

    return backendOfferings.map((offering) => ({
      id: offering.id,
      name: offering.name,
      price: offering.salePrice ?? offering.basePrice,
      status: "ACTIVE" as const,
      slots: offering.slots.map((slot) => ({
        id: slot.id,
        label: formatSlotLabel(slot.startTime, slot.endTime),
        capacity: slot.capacity,
        status: slot.status === "OPEN" ? "available" : "blocked",
      })),
    }));
  }, [backendOfferings, service.offerings]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-900">{service.name}</h3>
            <StatusPill status={service.status} />
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">{service.story}</p>
        </div>
        <button
          onClick={onToggleStatus}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            service.status === "LIVE"
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
          }`}
        >
          {service.status === "LIVE" ? "Pause" : "Activate"}
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {displayOfferings.map((offering) => (
          <div key={offering.id} className="px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900">{offering.name}</p>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <span className="font-semibold text-emerald-700">
                    ₹{offering.price.toLocaleString()}
                  </span>
                  <StatusPill status={offering.status} size="sm" />
                  <span className="text-slate-600">
                    {offering.slots.length} slot{offering.slots.length !== 1 && "s"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium hover:bg-slate-50">
                  Edit
                </button>
                <button className="rounded-lg bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100">
                  + Slot
                </button>
              </div>
            </div>

            {offering.slots.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {offering.slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-1 text-xs font-medium"
                  >
                    {slot.label}
                    <span className="text-slate-500">· {slot.capacity}</span>
                    <button className="ml-1 text-rose-500 hover:text-rose-700">
                      <HiOutlineXMark className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatSlotLabel(startTime: string, endTime?: string | null) {
  const start = new Date(startTime);
  if (Number.isNaN(start.getTime())) {
    return "Unknown slot";
  }

  const startLabel = start.toLocaleString("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
  });

  if (!endTime) {
    return startLabel;
  }

  const end = new Date(endTime);
  const endLabel = Number.isNaN(end.getTime())
    ? "Unknown"
    : end.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" });

  return `${startLabel} · ${endLabel}`;
}

function CategoryStep({
  categories,
  selectedId,
  onSelect,
}: {
  categories: ServiceMasterCategory[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (!categories.length) {
    return (
      <div className="space-y-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
        <p>Loading categories from the backend...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Choose Category Business
      </p>
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          All categories
        </p>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        {categories.map((cat) => {
          const isSelected = cat.id === selectedId;
          const baseBorder = isSelected
            ? "border-blue-500 ring-4 ring-blue-200/70"
            : "border-slate-200 hover:border-slate-300 hover:shadow-lg";
          const visual = plannedCategories.find((item) => item.slug === cat.slug);
          const IconComponent = visual?.icon ?? HiOutlineSparkles;
          const imageSrc = visual?.image ?? well;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              className={`flex flex-col justify-between rounded-2xl border bg-white p-0 text-left shadow-sm transition-all ${baseBorder}`}
            >
              <div className="h-28 w-full overflow-hidden rounded-t-2xl bg-slate-100">
                <img
                  src={imageSrc}
                  alt={cat.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="space-y-2 px-4 pb-4 pt-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ${isSelected ? "ring-2 ring-blue-300" : ""}`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{cat.name}</p>
                </div>
                {cat.slug && (
                  <p className="text-xs text-slate-500">
                    {cat.slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                  </p>
                )}
              </div>
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}

function DetailsStep({
  draft,
  setDraft,
  masterCategoryId,
  subcategories,
  selectedCategoryName,
}: {
  draft: ServiceDraft;
  setDraft: Dispatch<SetStateAction<ServiceDraft>>;
  masterCategoryId: string;
  subcategories: { id: string; name: string }[];
  selectedCategoryName: string;
}) {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-100">
        <p className="text-sm font-medium text-slate-700">
          Selected Category:{" "}
          <span className="font-semibold">{selectedCategoryName}</span>
        </p>
      </div>

      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Service Name *
        </span>
        <input
          value={draft.name}
          onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
          className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200/50"
          placeholder="e.g. Premium Deep Cleaning"
          required
        />
      </label>

      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Subcategory
        </span>
        {masterCategoryId ? (
          subcategories.length > 0 ? (
            <Select
              value={draft.subcategory}
              onValueChange={(value) => setDraft((p) => ({ ...p, subcategory: value }))}
            >
              <SelectTrigger className="mt-1.5 w-full max-w-md rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200/50">
                <SelectValue placeholder="Select a subcategory (optional)" />
              </SelectTrigger>
              <SelectContent className="max-h-72 rounded-2xl border border-slate-100 bg-white shadow-lg">
                {subcategories.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="mt-3 text-sm text-slate-500 italic">
              No subcategories available for this category yet.
            </p>
          )
        ) : (
          <p className="mt-3 text-sm text-amber-600">
            Please select a category first (previous step)
          </p>
        )}
      </div>
    </div>
  );
}

function RulesStep({
  ruleDraft,
  setRuleDraft,
  rules,
  onAddRule,
}: {
  ruleDraft: { type: string; value: string };
  setRuleDraft: (draft: { type: string; value: string }) => void;
  rules: { id: string; type: string; value: string }[];
  onAddRule: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-700">Rules (optional)</p>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={ruleDraft.type}
          placeholder="Rule type (e.g. Min notice, Cancellation)"
          onChange={(e) => setRuleDraft({ ...ruleDraft, type: e.target.value })}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
        />
        <input
          value={ruleDraft.value}
          placeholder="Value (e.g. 24 hours, 50% fee)"
          onChange={(e) => setRuleDraft({ ...ruleDraft, value: e.target.value })}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
        />
      </div>
      <button
        type="button"
        onClick={onAddRule}
        className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
      >
        + Add rule
      </button>
      <div className="space-y-2">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2 text-sm"
          >
            <span>
              <strong>{rule.type}:</strong> {rule.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VendorServices;
