import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  HiOutlineCalendarDays,
  HiOutlineChartBar,
  HiOutlineChevronRight,
  HiOutlineClock,
  HiOutlineGlobeAlt,
  HiOutlineIdentification,
  HiOutlineMap,
  HiOutlinePlus,
  HiOutlineShare,
  HiOutlineSparkles,
  HiOutlineTag,
  HiOutlineUsers,
  HiOutlineXMark,
  HiOutlinePhone,
  HiOutlineDocumentText,
  HiOutlineWrenchScrewdriver,
  HiOutlineHomeModern,
  HiOutlineBuildingOffice2,
  HiOutlinePaintBrush,
  HiOutlineBolt,
  HiOutlineScissors,
  HiOutlineComputerDesktop,
  HiOutlineHeart,
  HiOutlineAcademicCap,
  HiOutlineTruck,
  HiOutlineQuestionMarkCircle,
} from "react-icons/hi2";
import type { IconType } from "react-icons";

import { DashboardContainer } from "@/components/dashboard";
import StatusPill from "@/components/vendor-dashboard/StatusPill";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useMockLoader } from "@/lib/useMockLoader";

type PricingModel = "fixed" | "hourly" | "package";
type Slot = { id: string; label: string; capacity: number };
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

const categoryIcons: Record<string, IconType> = {
  Plumbing: HiOutlineWrenchScrewdriver,
  Cleaning: HiOutlineSparkles,
  HVAC: HiOutlineBuildingOffice2,
  Electrical: HiOutlineBolt,
  Painting: HiOutlinePaintBrush,
  "Home Maintenance": HiOutlineHomeModern,
  "Beauty & Grooming": HiOutlineScissors,
  "IT Support": HiOutlineComputerDesktop,
  Wellness: HiOutlineHeart,
  Tutoring: HiOutlineAcademicCap,
  Delivery: HiOutlineTruck,
  General: HiOutlineHomeModern,
  Other: HiOutlineQuestionMarkCircle,
};

const VendorServices = () => {
  const dispatch = useAppDispatch();
  const loading = useMockLoader();
  const [services, setServices] = useState<Service[]>(serviceSeeds);
  const [notification, setNotification] = useState("");
  const notifyRef = useRef<number>();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(
    serviceSeeds[0]?.category ?? "General"
  );
  const [serviceDraft, setServiceDraft] = useState({
    name: "",
    story: "",
    basePrice: "",
    salePrice: "",
    usesSlots: true,
  });
  const [slotDraft, setSlotDraft] = useState({
    label: "",
    startTime: "",
    capacity: 2,
  });
  const [slots, setSlots] = useState<Slot[]>([]);
  const [ruleDraft, setRuleDraft] = useState({ type: "", value: "" });
  const [rules, setRules] = useState<{ id: string; type: string; value: string }[]>([]);

  useEffect(() => {
    dispatch(setPageTitle("Services"));
  }, [dispatch]);

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

  const wizardSteps = [
    { id: 1, label: "Category", helper: "Choose the best fit for your offering" },
    { id: 2, label: "Details", helper: "Tell customers what makes this special" },
    { id: 3, label: "Availability", helper: "When can customers book this?" },
    { id: 4, label: "Rules", helper: "Any booking requirements or restrictions?" },
  ];

  const resetWizard = () => {
    setWizardStep(1);
    setSelectedCategory(categoryOptions[0] ?? "General");
    setServiceDraft({ name: "", story: "", basePrice: "", salePrice: "", usesSlots: true });
    setSlotDraft({ label: "", startTime: "", capacity: 2 });
    setSlots([]);
    setRuleDraft({ type: "", value: "" });
    setRules([]);
  };

  const handleAddSlotDraft = () => {
    if (!slotDraft.label.trim() || !slotDraft.startTime) return;
    const timeLabel = new Date(slotDraft.startTime).toLocaleString("en-US", {
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
    });
    const newSlot: Slot = {
      id: `slot-${Date.now()}`,
      label: `${slotDraft.label} · ${timeLabel}`,
      capacity: slotDraft.capacity,
    };
    setSlots((prev) => [...prev, newSlot]);
    setSlotDraft({ label: "", startTime: "", capacity: 2 });
  };

  const handleRemoveSlotDraft = (id: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddRule = () => {
    if (!ruleDraft.type.trim() || !ruleDraft.value.trim()) return;
    setRules((prev) => [
      ...prev,
      { id: `rule-${Date.now()}`, type: ruleDraft.type.trim(), value: ruleDraft.value.trim() },
    ]);
    setRuleDraft({ type: "", value: "" });
  };

  const handleSubmitWizard = () => {
    if (!serviceDraft.name.trim()) return;
    const price = Number(serviceDraft.salePrice || serviceDraft.basePrice || 0);
    const newService: Service = {
      id: `svc-${Date.now()}`,
      name: serviceDraft.name.trim(),
      story: serviceDraft.story.trim() || "New service experience",
      category: selectedCategory,
      status: "DRAFT",
      pricingModel: "fixed",
      hasMedia: false,
      offerings: [
        {
          id: `off-${Date.now()}`,
          name: serviceDraft.name.trim(),
          price,
          status: "ACTIVE",
          pricingModel: "fixed",
          slots: serviceDraft.usesSlots ? slots : [],
        },
      ],
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
          <NavLink
            to="/vendor/promote"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-all"
          >
            <HiOutlineSparkles className="h-4 w-4" />
            Growth Ideas
          </NavLink>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl sm:rounded-3xl overflow-hidden">
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
                    onSelect={setSelectedCategory}
                  />
                )}

                {wizardStep === 2 && (
                  <DetailsStep draft={serviceDraft} setDraft={setServiceDraft} />
                )}

                {wizardStep === 3 && (
                  <AvailabilityStep
                    usesSlots={serviceDraft.usesSlots}
                    slots={slots}
                    slotDraft={slotDraft}
                    setSlotDraft={setSlotDraft}
                    onAddSlot={handleAddSlotDraft}
                    onRemoveSlot={handleRemoveSlotDraft}
                    onToggleUsesSlots={(checked) =>
                      setServiceDraft((p) => ({ ...p, usesSlots: checked }))
                    }
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
                    disabled={
                      (wizardStep === 1 && !selectedCategory) ||
                      (wizardStep === 2 && !serviceDraft.name.trim()) ||
                      (wizardStep === 3 && serviceDraft.usesSlots && slots.length === 0)
                    }
                    onClick={
                      wizardStep === wizardSteps.length
                        ? handleSubmitWizard
                        : () => setWizardStep((p) => Math.min(p + 1, wizardSteps.length))
                    }
                    className="rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 transition-all"
                  >
                    {wizardStep === wizardSteps.length ? "Create Service" : "Continue →"}
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
        {service.offerings.map((offering) => (
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

function CategoryStep({
  selected,
  options,
  onSelect,
}: {
  selected: string;
  options: string[];
  onSelect: (cat: string) => void;
}) {
  const allCategories = [...new Set([...options, "General", "Other"])];

  return (
    <div className="space-y-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Choose Category
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allCategories.map((cat) => {
          const Icon = categoryIcons[cat] || HiOutlineQuestionMarkCircle;
          const isSelected = selected === cat;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelect(cat)}
              className={`group flex items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-200 ${
                isSelected
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200/70 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
              }`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl transition-colors ${
                  isSelected
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{cat}</p>
                {cat === "General" && (
                  <p className="mt-0.5 text-xs text-slate-500">Any type of service</p>
                )}
                {cat === "Other" && (
                  <p className="mt-0.5 text-xs text-slate-500">Not listed above</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Placeholder for other steps — implement similarly
function DetailsStep({ draft, setDraft }: { draft: any; setDraft: any }) {
  return (
    <div className="space-y-6">
      {/* Service name, story, prices, etc. */}
      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Service Name *
        </span>
        <input
          value={draft.name}
          onChange={(e) => setDraft((p: any) => ({ ...p, name: e.target.value }))}
          className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200/50"
          placeholder="e.g. Premium Deep Cleaning"
        />
      </label>
      {/* Add story, basePrice, salePrice similarly */}
    </div>
  );
}

// You can continue implementing AvailabilityStep and RulesStep in the same style

export default VendorServices;