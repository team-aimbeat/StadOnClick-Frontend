import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent,
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
  plannedCategories,
  plannedCategoryNames,
  slugifyCategory,
} from "@/data/vendorServiceCategories";
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
  useCreateOfferingMutation,
  useCreateSlotMutation,
  useCreateRuleMutation,
} from "@/services/vendorOfferingsApi";
import { useGetServiceOfferingsQuery } from "@/services/vendorOfferingsApi";

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
  serviceId: string;
};

const serviceSeeds: Service[] = [
  {
    id: "svc-plumbing",
    name: "Emergency Plumbing",
    story: "24/7 emergency plumbing with on-site diagnosis and repairs.",
    category: "Plumbing",
    status: "LIVE",
    pricingModel: "fixed",
    hasMedia: true,
    offerings: [
      {
        id: "offering-repair",
        name: "Repair Visit",
        price: 1800,
        status: "ACTIVE",
        pricingModel: "fixed",
        slots: [
          { id: "slot-1", label: "Mon, 10:00 AM", capacity: 3 },
          { id: "slot-2", label: "Mon, 02:00 PM", capacity: 2 },
        ],
      },
      {
        id: "offering-gas",
        name: "Gas Line Safety Check",
        price: 2500,
        status: "ACTIVE",
        pricingModel: "fixed",
        slots: [{ id: "slot-3", label: "Tue, 09:00 AM", capacity: 2 }],
      },
    ],
  },
  // ... your other seed services remain the same
];

const VendorServices = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useMockLoader();
  const [services, setServices] = useState<Service[]>(serviceSeeds);
  const [notification, setNotification] = useState("");
  const notifyRef = useRef<number>();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(
    serviceSeeds[0]?.category ?? "General"
  );
  const fallbackServiceId =
    serviceSeeds[0]?.id ?? "568fa4d3-ce94-4de7-b5fd-77150fa023bc";
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft>({
    name: "",
    story: "",
    basePrice: "",
    salePrice: "",
    subcategory: "",
    serviceId: fallbackServiceId,
  });
  const [ruleDraft, setRuleDraft] = useState({ type: "", value: "" });
  const [rules, setRules] = useState<{ id: string; type: string; value: string }[]>([]);
  const step3Ref = useRef<VendorServiceStep3Handle>(null);
  const [createOffering] = useCreateOfferingMutation();
  const [createSlot] = useCreateSlotMutation();
  const [createRule] = useCreateRuleMutation();

  useEffect(() => {
    dispatch(setPageTitle("Services"));
  }, [dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("openWizard") === "true" && params.get("category")) {
      const slug = params.get("category")!;
      const category = plannedCategories.find((cat) => cat.slug === slug);
      if (category) {
        setSelectedCategory(category.name);
        setWizardStep(2);
        setWizardOpen(true);
      }
      navigate("/vendor/services", { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    return () => window.clearTimeout(notifyRef.current);
  }, []);

  const addNotification = (msg: string) => {
    setNotification(msg);
    window.clearTimeout(notifyRef.current);
    notifyRef.current = window.setTimeout(() => setNotification(""), 3000);
  };

  const categoryOptions = useMemo(
    () => Array.from(new Set(serviceSeeds.map((s) => s.category))),
    []
  );
  const activePlannedCategory = plannedCategories.find(
    (cat) => cat.name === selectedCategory,
  );

  const wizardSteps = [
    { id: 1, label: "Category", helper: "Choose the best fit for your offering" },
    { id: 2, label: "Details", helper: "Tell customers what makes this special" },
    { id: 3, label: "Configure offerings", helper: "Each offering can have its own pricing, slots, and rules." },
    { id: 4, label: "Rules", helper: "Any booking requirements or restrictions?" },
  ];

  const handleContinue = async () => {
    if (wizardStep === 3) {
      const valid = await step3Ref.current?.validate();
      if (!valid) return;
    }
    setWizardStep((p) => Math.min(p + 1, wizardSteps.length));
  };

  const continueDisabled =
    (wizardStep === 1 && !selectedCategory) ||
    (wizardStep === 2 && !serviceDraft.name.trim());

  const resetWizard = () => {
    setWizardStep(1);
    setSelectedCategory(categoryOptions[0] ?? "General");
    setServiceDraft({
      name: "",
      story: "",
      basePrice: "",
      salePrice: "",
      subcategory: "",
      serviceId: fallbackServiceId,
    });
    setRuleDraft({ type: "", value: "" });
    setRules([]);
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setWizardStep(1);
    setWizardOpen(false);
    const category = plannedCategories.find((cat) => cat.name === categoryName);
    if (category) {
      navigate(`/vendor/services/category/${category.slug}`);
    } else {
      const slug = slugifyCategory(categoryName);
      navigate(`/vendor/services/category/${slug}`);
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
    const normalizedValues = step3Ref.current?.getValues();
    if (!normalizedValues?.offerings?.length) {
      addNotification("Add at least one offering before continuing.");
      return;
    }

    const serviceIdParam = serviceDraft.serviceId || fallbackServiceId;
    try {
      const createdOfferings = [];
      for (const offering of normalizedValues.offerings) {
        const created = await createOffering({
          serviceId: serviceIdParam,
          name: offering.name.trim(),
          basePrice: offering.basePrice,
          salePrice: offering.salePrice,
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
    } catch (error) {
      addNotification("Failed to publish offerings. Try again.");
      return;
    }

    const baseTimestamp = Date.now();
    const localOfferings = normalizedValues.offerings.map((offering, index) => ({
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
      category: selectedCategory,
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
    <div className="fixed inset-0 z-50  overflow-y-auto  flex items-center justify-center bg-black/50 px-2 py-6 backdrop-blur-sm"> <div className="w-full max-w-7xl  rounded-2xl bg-white sm:rounded-3xl overflow-auto">
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
                    selected={selectedCategory}
                    options={categoryOptions}
                    onSelect={handleCategorySelect}
                  />
                )}

                {wizardStep === 2 && (
                  <DetailsStep
                    draft={serviceDraft}
                    setDraft={setServiceDraft}
                    subcategories={activePlannedCategory?.subcategories ?? []}
                  />
                )}

                {wizardStep === 3 && (
                  <VendorServiceStep3 ref={step3Ref} hideFooter />
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
                    {wizardStep === wizardSteps.length ? "Create Service" : "Continue ?"}
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
//  Helper Components
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
  selected,
  options,
  onSelect,
}: {
  selected: string;
  options: string[];
  onSelect: (cat: string) => void;
}) {
  const selectedPlannedCategory = plannedCategories.find((cat) => cat.name === selected);
  const extraOptions = options.filter((option) => !plannedCategoryNames.has(option));

  return (
    <div className="space-y-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Choose Category Business
      </p>


      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          All planned categories
        </p>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          {plannedCategories.map((cat) => (
            <div
              key={cat.name}
              role="button"
              tabIndex={0}
              aria-pressed={selected === cat.name}
              onClick={() => onSelect(cat.name)}
              onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(cat.name);
                }
              }}
              className={`rounded-2xl border bg-white shadow-sm outline-none transition ${
                selected === cat.name
                  ? "border-blue-500 ring-5 ring-blue-200 hover:ring-blue-300"
                  : "border-slate-200 hover:border-slate-300 hover:shadow-lg"
                    } cursor-pointer`}
            >
              <div className="h-24 w-full overflow-hidden rounded-t-2xl">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="space-y-2 px-3 pb-3 pt-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <cat.icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {cat.name}
                  </p>
                </div>
                <p className="text-xs text-slate-600">
                  {cat.highlights.slice(0, 2).join(" · ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Placeholder for other steps — implement similarly
function DetailsStep({
  draft,
  setDraft,
  subcategories,
}: {
  draft: ServiceDraft;
  setDraft: Dispatch<SetStateAction<ServiceDraft>>;
  subcategories: string[];
}) {
  return (
    <div className="space-y-6">
      {/* Service name, story, prices, etc. */}
      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Service Name *
        </span>
        <input
          value={draft.name}
          onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
          className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200/50"
          placeholder="e.g. Premium Deep Cleaning"
        />
      </label>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Subcategory
        </p>
        {subcategories.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            This category does not yet have planned subcategories.
          </p>
        ) : (
          <Select
            value={draft.subcategory}
            onValueChange={(value) => setDraft((p) => ({ ...p, subcategory: value }))}
          >
            <SelectTrigger className="mt-1.5 w-70 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200/50">
              <SelectValue placeholder="Choose a subcategory" />
            </SelectTrigger>
            <SelectContent className=" w-full rounded-2xl border border-slate-100 bg-white shadow-lg">
              {subcategories.map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {/* Add story, basePrice, salePrice similarly */}
    </div>
  );
}

function RulesStep({
  ruleDraft,
  setRuleDraft,
  rules,
  onAddRule,
}: {
  ruleDraft: { type: string; value: string }
  setRuleDraft: (draft: { type: string; value: string }) => void
  rules: { id: string; type: string; value: string }[]
  onAddRule: () => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-700">Rules (optional)</p>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={ruleDraft.type}
          placeholder="Rule type"
          onChange={(e) => setRuleDraft({ ...ruleDraft, type: e.target.value })}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
        />
        <input
          value={ruleDraft.value}
          placeholder="Value"
          onChange={(e) => setRuleDraft({ ...ruleDraft, value: e.target.value })}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200/50"
        />
      </div>
      <button
        type="button"
        onClick={onAddRule}
        className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
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
              {rule.type}: {rule.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// You can continue implementing AvailabilityStep and RulesStep in the same style

export default VendorServices;
