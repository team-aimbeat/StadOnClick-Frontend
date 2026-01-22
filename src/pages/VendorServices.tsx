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
} from "react-icons/hi2";
import type { IconType } from "react-icons";

import { DashboardContainer } from "@/components/dashboard";
import StatusPill from "@/components/vendor-dashboard/StatusPill";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useMockLoader } from "@/lib/useMockLoader";

type PricingModel = "fixed" | "hourly" | "package";
type Slot = {
  id: string;
  label: string;
  capacity: number;
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
};
type BusinessSection = {
  id: string;
  title: string;
  value: string;
  helper?: string;
    icon: IconType;
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
  {
    id: "svc-cleaning",
    name: "Executive Cleaning",
    story: "Dedicated crew for deep cleaning, sanitisation, and post-renovation finishing.",
    category: "Cleaning",
    status: "PAUSED",
    pricingModel: "hourly",
    hasMedia: false,
    offerings: [
      {
        id: "offering-2bhk",
        name: "2BHK Deep Clean",
        price: 4200,
        status: "PAUSED",
        pricingModel: "hourly",
        slots: [
          { id: "slot-4", label: "Thu, 08:00 AM", capacity: 1 },
          { id: "slot-5", label: "Thu, 01:00 PM", capacity: 1 },
        ],
      },
    ],
  },
  {
    id: "svc-maintenance",
    name: "HVAC Maintenance",
    story: "Preventive maintenance for residential and commercial air-conditioners.",
    category: "HVAC",
    status: "LIVE",
    pricingModel: "package",
    hasMedia: true,
    offerings: [
      {
        id: "offering-hvac",
        name: "Comprehensive HVAC Audit",
        price: 5600,
        status: "ACTIVE",
        pricingModel: "package",
        slots: [],
      },
    ],
  },
];

const VendorServices = () => {
  const dispatch = useAppDispatch();
  const loading = useMockLoader();
  const [services, setServices] = useState(serviceSeeds);
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
  const [ruleDraft, setRuleDraft] = useState({
    type: "",
    value: "",
  });
  const [rules, setRules] = useState<{ id: string; type: string; value: string }[]>([]);

  useEffect(() => {
    dispatch(setPageTitle("Services"));
  }, [dispatch]);

  useEffect(() => {
    return () => {
      window.clearTimeout(notifyRef.current);
    };
  }, []);

  const addNotification = (message: string) => {
    setNotification(message);
    window.clearTimeout(notifyRef.current);
    notifyRef.current = window.setTimeout(() => setNotification(""), 2000);
  };

  const categoryOptions = useMemo(
    () => Array.from(new Set(serviceSeeds.map((svc) => svc.category))),
    []
  );

  const wizardSteps = [
    { id: 1, label: "Category", helper: "Pick a category that describes your service" },
    { id: 2, label: "Offer", helper: "Describe the experience you'd like to list" },
    { id: 3, label: "Slot", helper: "Schedule when the offering is available" },
    { id: 4, label: "Rules", helper: "Add booking or eligibility rules" },
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
    const nextSlot: Slot = {
      id: `wizard-slot-${Date.now()}-${slots.length}`,
      label: `${slotDraft.label} · ${new Date(slotDraft.startTime).toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
      })}`,
      capacity: slotDraft.capacity,
    };
    setSlots((prev) => [...prev, nextSlot]);
    setSlotDraft({ label: "", startTime: "", capacity: 2 });
  };

  const handleRemoveSlotDraft = (id: string) => {
    setSlots((prev) => prev.filter((slot) => slot.id !== id));
  };

  const handleAddRuleDraft = () => {
    if (!ruleDraft.type.trim() || !ruleDraft.value.trim()) return;
    setRules((prev) => [
      ...prev,
      { id: `wizard-rule-${Date.now()}-${prev.length}`, type: ruleDraft.type.trim(), value: ruleDraft.value.trim() },
    ]);
    setRuleDraft({ type: "", value: "" });
  };

  const handleNextStep = () => {
    setWizardStep((prev) => Math.min(prev + 1, wizardSteps.length));
  };

  const handlePrevStep = () => {
    setWizardStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmitWizard = () => {
    if (!serviceDraft.name.trim()) return;
    const newOfferingId = `offering-${Date.now()}`;
    const newService: Service = {
      id: `svc-${Date.now()}`,
      name: serviceDraft.name.trim(),
      story: serviceDraft.story.trim() || "New service listing",
      category: selectedCategory,
      status: "DRAFT",
      pricingModel: "fixed",
      hasMedia: false,
      offerings: [
        {
          id: newOfferingId,
          name: serviceDraft.name.trim(),
          price: Number(serviceDraft.salePrice || serviceDraft.basePrice || 0),
          status: "ACTIVE",
          pricingModel: "fixed",
          slots: slots.length ? slots : [],
        },
      ],
    };
    setServices((prev) => [...prev, newService]);
    addNotification("Service created (draft)");
    setWizardOpen(false);
    resetWizard();
  };

  const handleToggleServiceStatus = (id: string) => {
    setServices((prev) =>
      prev.map((svc) => {
        if (svc.id !== id) return svc;
        const next =
          svc.status === "LIVE" ? "PAUSED" : svc.status === "PAUSED" ? "LIVE" : svc.status;
        addNotification(`Service ${svc.name} is now ${next}`);
        return { ...svc, status: next };
      })
    );
  };

  const handlePricingChange = (id: string, pricingModel: PricingModel) => {
    setServices((prev) =>
      prev.map((svc) => (svc.id === id ? { ...svc, pricingModel } : svc))
    );
  };

  const handleOfferingStatus = (serviceId: string, offeringId: string) => {
    setServices((prev) =>
      prev.map((svc) => {
        if (svc.id !== serviceId) return svc;
        return {
          ...svc,
          offerings: svc.offerings.map((offering) =>
            offering.id === offeringId
              ? {
                  ...offering,
                  status: offering.status === "ACTIVE" ? "PAUSED" : "ACTIVE",
                }
              : offering
          ),
        };
      })
    );
  };

  const handleAddSlot = (serviceId: string, offeringId: string, bulk = false) => {
    setServices((prev) =>
      prev.map((svc) => {
        if (svc.id !== serviceId) return svc;
        return {
          ...svc,
          offerings: svc.offerings.map((offering) => {
            if (offering.id !== offeringId) return offering;
            const nextSlots = [...offering.slots];
            const count = bulk ? 3 : 1;
            for (let i = 0; i < count; i += 1) {
              nextSlots.push({
                id: `${offeringId}-slot-${nextSlots.length + 1}`,
                label: `Slot ${nextSlots.length + 1} · ${[
                  "09:00 AM",
                  "12:00 PM",
                  "03:00 PM",
                ][i % 3]}`,
                capacity: 2,
              });
            }
            return { ...offering, slots: nextSlots };
          }),
        };
      })
    );
    bulk
      ? addNotification("Bulk slots added to the offering")
      : addNotification("Slot added");
  };

  const handleRemoveSlot = (serviceId: string, offeringId: string, slotId: string) => {
    setServices((prev) =>
      prev.map((svc) => {
        if (svc.id !== serviceId) return svc;
        return {
          ...svc,
          offerings: svc.offerings.map((offering) => {
            if (offering.id !== offeringId) return offering;
            return {
              ...offering,
              slots: offering.slots.filter((slot) => slot.id !== slotId),
            };
          }),
        };
      })
    );
    addNotification("Slot removed");
  };

  const hasLiveWarning = (service: Service) =>
    service.status === "LIVE" && service.offerings.every((offering) => offering.slots.length === 0);

  const servicesWithoutMedia = useMemo(
    () => services.filter((svc) => !svc.hasMedia),
    [services]
  );

  const businessProfile = useMemo(() => {
    const categories = Array.from(new Set(services.map((svc) => svc.category)));
    return {
      businessName: "Aimbeat",
      description: "Strategic growth studio for ambitious founders.",
      contactPhone: "+(91)-9870066177, 9820790117",
      contactEmail: "hello@aimbeat.com",
      address: "706 / A HDIL Premier Residency, Kohinoor City Phase 1 Rd, Kurla West-400070",
      city: "Mumbai, Maharashtra",
      mapLocation: "Andheri East · 19.11°N, 72.87°E",
      timings: "Open Now · Mon – Sat",
      yearEstablished: "Nov 2009",
      categories: categories.length ? categories.join(", ") : "Multiple categories",
      categoryCount: categories.length,
      turnover: "26 - 50 Lakhs",
      employees: "10 - 100",
      website: "www.aimbeat.com",
      socialMedia: "facebook.com/aimbeatcom",
      businessTools: "Manage Offers, Reviews and more",
      kyc: "Update KYC Details",
      additionalInfo: "Update Services, Amenities, Shopping & Delivery Options",
    };
  }, [services]);

  const businessSections: BusinessSection[] = useMemo(
    () => [
      {
        id: "business-name",
        title: "Business Name",
        value: businessProfile.businessName,
        helper: businessProfile.description,
        icon: HiOutlineIdentification,
      },
      {
        id: "contact-details",
        title: "Contact Details",
        value: businessProfile.contactPhone,
        helper: businessProfile.contactEmail,
        icon: HiOutlinePhone,
      },
      {
        id: "business-address",
        title: "Business Address",
        value: businessProfile.address,
        helper: businessProfile.city,
        icon: HiOutlinePhone,
      },
      {
        id: "map-location",
        title: "Map Location",
        value: businessProfile.mapLocation,
        helper: "Pin coordinates updated from services",
        icon: HiOutlineMap,
      },
      {
        id: "business-timings",
        title: "Business Timings",
        value: businessProfile.timings,
        helper: "Operational hours for bookings",
        icon: HiOutlineClock,
      },
      {
        id: "year-established",
        title: "Year of Establishment",
        value: businessProfile.yearEstablished,
        helper: "Serving customers since 2009",
        icon: HiOutlineCalendarDays,
      },
      {
        id: "business-categories",
        title: "Business Categories",
        value: businessProfile.categories,
        helper: `${businessProfile.categoryCount} categories selected`,
        icon: HiOutlineTag,
      },
      {
        id: "yearly-turnover",
        title: "Yearly Turnover",
        value: businessProfile.turnover,
        helper: "Auto calculated from leads",
        icon: HiOutlineChartBar,
      },
      {
        id: "number-of-employees",
        title: "Number of Employees",
        value: businessProfile.employees,
        helper: "Core operations & field teams",
        icon: HiOutlineUsers,
      },
      {
        id: "website",
        title: "Business Website",
        value: businessProfile.website,
        helper: "Public storefront",
        icon: HiOutlineGlobeAlt,
      },
      {
        id: "social-media",
        title: "Social Media",
        value: businessProfile.socialMedia,
        helper: "Engagement links",
        icon: HiOutlineShare,
      },
      {
        id: "business-tools",
        title: "Business Tools",
        value: businessProfile.businessTools,
        helper: "Bundles for offers, reviews, leads",
        icon: HiOutlineSparkles,
      },
      {
        id: "kyc",
        title: "KYC, Payments & Invoices",
        value: businessProfile.kyc,
        helper: "Stripe / tax checks",
        icon: HiOutlineDocumentText,
      },
      {
        id: "additional-info",
        title: "Additional Business Info",
        value: businessProfile.additionalInfo,
        helper: "Enable amenities, shipping & delivery options",
        icon: HiOutlineSparkles,
      },
    ],
    [businessProfile]
  );

  const serviceInsights = useMemo(() => {
    const totalOfferings = services.reduce((sum, svc) => sum + svc.offerings.length, 0);
    const totalSlots = services.reduce(
      (sum, svc) =>
        sum +
        svc.offerings.reduce((slotCount, offering) => slotCount + offering.slots.length, 0),
      0
    );

    const insights = [
      { label: "Services", value: services.length, tone: "emerald" },
      { label: "Offerings", value: totalOfferings },
      { label: "Slots", value: totalSlots },
    ];

    if (servicesWithoutMedia.length) {
      insights.push({
        label: "Media reminders",
        value: `${servicesWithoutMedia.length} service${servicesWithoutMedia.length > 1 ? "s" : ""}`,
        tone: "amber",
      });
    }

    return insights;
  }, [services, servicesWithoutMedia]);

  const mediaPreview = [
    { label: "Service teaser", tone: "from-rose-500 to-amber-500" },
    { label: "Team stories", tone: "from-sky-500 to-indigo-600" },
    { label: "Workspace", tone: "from-emerald-500 to-lime-500" },
  ];

  const stepReady =
    wizardStep === 1
      ? Boolean(selectedCategory)
      : wizardStep === 2
      ? Boolean(serviceDraft.name.trim())
      : wizardStep === 3
      ? !serviceDraft.usesSlots || slots.length > 0
      : true;
  const isWizardActionEnabled =
    wizardStep === wizardSteps.length ? Boolean(serviceDraft.name.trim()) : stepReady;
  const wizardActionLabel = wizardStep === wizardSteps.length ? "Create service" : "Next";

  if (loading) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <div className="h-8 w-1/4 animate-pulse rounded-full bg-slate-200" />
        <div className="space-y-3">
          <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
          <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-10">
      <TitleBreadCrumbs title="Services" breadCrumbTitle="Vendor / Services" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">
          {services.length ? `${services.length} services` : "No services yet"}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              resetWizard();
              setWizardOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600"
          >
            <HiOutlinePlus className="h-4 w-4" />
            Add service
          </button>
          <NavLink
            to="/vendor/promote"
            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            View growth ideas
          </NavLink>
      </div>
    </div>
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-5xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="space-y-3 text-sm lg:w-1/3">
                {wizardSteps.map((step) => {
                  const isActive = wizardStep === step.id;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setWizardStep(step.id)}
                      className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                        isActive ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                          isActive ? "bg-blue-500 text-white" : "border border-slate-200 text-slate-600"
                        }`}
                      >
                        {step.id}
                      </span>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                          Step {step.id}
                        </p>
                        <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                        <p className="text-xs text-slate-500">{step.helper}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="space-y-4 lg:w-2/3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Step {wizardStep}</p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {wizardSteps[wizardStep - 1]?.label}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {wizardSteps[wizardStep - 1]?.helper}
                  </p>
                </div>
                {wizardStep === 1 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                      Choose category
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {categoryOptions.concat("General").map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setSelectedCategory(category)}
                          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                            selectedCategory === category
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {wizardStep === 2 && (
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                      Service name
                      <input
                        value={serviceDraft.name}
                        onChange={(event) =>
                          setServiceDraft((prev) => ({ ...prev, name: event.target.value }))
                        }
                        placeholder="Executive Cleaning"
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                      Story
                      <textarea
                        value={serviceDraft.story}
                        onChange={(event) =>
                          setServiceDraft((prev) => ({ ...prev, story: event.target.value }))
                        }
                        placeholder="What makes this experience special?"
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                        Base price
                        <input
                          type="number"
                          value={serviceDraft.basePrice}
                          onChange={(event) =>
                            setServiceDraft((prev) => ({ ...prev, basePrice: event.target.value }))
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                        Sale price
                        <input
                          type="number"
                          value={serviceDraft.salePrice}
                          onChange={(event) =>
                            setServiceDraft((prev) => ({ ...prev, salePrice: event.target.value }))
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={serviceDraft.usesSlots}
                        onChange={(event) =>
                          setServiceDraft((prev) => ({ ...prev, usesSlots: event.target.checked }))
                        }
                      />
                      Uses slots
                    </label>
                  </div>
                )}
                {wizardStep === 3 && (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                        Slot name
                        <input
                          value={slotDraft.label}
                          onChange={(event) => setSlotDraft((prev) => ({ ...prev, label: event.target.value }))}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                        Start time
                        <input
                          type="datetime-local"
                          value={slotDraft.startTime}
                          onChange={(event) =>
                            setSlotDraft((prev) => ({ ...prev, startTime: event.target.value }))
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                          Capacity
                          <input
                            type="number"
                            min={1}
                            value={slotDraft.capacity}
                            onChange={(event) =>
                              setSlotDraft((prev) => ({ ...prev, capacity: Number(event.target.value) || 1 }))
                            }
                            className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSlotDraft}
                        className="rounded-2xl border border-blue-500 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700"
                      >
                        Add slot
                      </button>
                    </div>
                    <div className="space-y-2">
                      {slots.length ? (
                        slots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                          >
                            <div>
                              <p className="font-semibold text-slate-900">{slot.label}</p>
                              <p className="text-xs text-slate-500">Capacity {slot.capacity}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSlotDraft(slot.id)}
                              className="text-xs font-semibold text-rose-500"
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">No slots yet</p>
                      )}
                    </div>
                  </div>
                )}
                {wizardStep === 4 && (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                        Rule type
                        <input
                          value={ruleDraft.type}
                          onChange={(event) => setRuleDraft((prev) => ({ ...prev, type: event.target.value }))}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="block text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                        Rule value
                        <input
                          value={ruleDraft.value}
                          onChange={(event) => setRuleDraft((prev) => ({ ...prev, value: event.target.value }))}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddRuleDraft}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
                    >
                      Add rule
                    </button>
                    <div className="space-y-2">
                      {rules.length ? (
                        rules.map((rule) => (
                          <div key={rule.id} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm">
                            <p className="font-semibold text-slate-900">{rule.type}</p>
                            <p className="text-xs text-slate-500">{rule.value}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">No rules yet</p>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setWizardOpen(false)}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center gap-3">
                    {wizardStep > 1 && (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
                      >
                        Back
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={!isWizardActionEnabled}
                      onClick={wizardStep === wizardSteps.length ? handleSubmitWizard : handleNextStep}
                      className={`rounded-2xl px-4 py-2 text-xs font-semibold transition ${
                        isWizardActionEnabled
                          ? "border border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                          : "border border-transparent bg-slate-200 text-slate-400"
                      }`}
                    >
                      {wizardActionLabel}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {notification && (
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
          {notification}
        </div>
      )}


    </DashboardContainer>
  );
};

export default VendorServices;
