import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { HiOutlineChevronRight, HiOutlinePlus, HiOutlineXMark } from "react-icons/hi2";

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
  const [expanded, setExpanded] = useState<string[]>(serviceSeeds.map((svc) => svc.id));
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", price: "" });
  const [notification, setNotification] = useState("");
  const notifyRef = useRef<number>();

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

  const toggleExpansion = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
                label: `Slot ${nextSlots.length + 1} · ${["09:00 AM", "12:00 PM", "03:00 PM"][i % 3]}`,
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

  const handleCreateService = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addNotification("Service draft created");
  };

  const hasLiveWarning = (service: Service) =>
    service.status === "LIVE" && service.offerings.every((offering) => offering.slots.length === 0);

  const servicesWithoutMedia = useMemo(
    () => services.filter((svc) => !svc.hasMedia),
    [services]
  );

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
            onClick={() => setCreateOpen((prev) => !prev)}
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

      {notification && (
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
          {notification}
        </div>
      )}

      {createOpen && (
        <form
          onSubmit={handleCreateService}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              placeholder="Service name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none"
            />
            <input
              placeholder="Category"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none"
            />
            <input
              placeholder="Base price"
              value={form.price}
              onChange={(event) => setForm({ ...form, price: event.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none"
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-slate-500">Draft will be saved for review before publishing.</p>
            <button
              type="submit"
              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Create service
            </button>
          </div>
        </form>
      )}

      {services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-700">
          No active services yet. Create a service so customers can place orders from StadonClick.
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600"
            >
              Start with a service
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">{service.name}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{service.category}</p>
                  <p className="text-xs text-slate-500">{service.story}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={service.status} size="sm" />
                  <StatusPill status={service.pricingModel.toUpperCase()} size="sm" tone="info" />
                  <button
                    type="button"
                    onClick={() => handleToggleServiceStatus(service.id)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:border-slate-300"
                  >
                    {service.status === "LIVE" ? "Pause" : "Activate"}
                  </button>
                  <NavLink
                    to={`/vendor/services/${service.id}/options`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500"
                  >
                    Service Options
                    <HiOutlineChevronRight className="h-4 w-4" />
                  </NavLink>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-500">
                <span>Offerings: {service.offerings.length}</span>
                <span>
                  Slots:{" "}
                  {service.offerings.reduce((total, curr) => total + curr.slots.length, 0) || "0"}
                </span>
                <span>Media: {service.hasMedia ? "Complete" : "Missing"}</span>
                <span className="inline-flex items-center gap-1">
                  Pricing model
                  <select
                    value={service.pricingModel}
                    onChange={(event) =>
                      handlePricingChange(service.id, event.target.value as PricingModel)
                    }
                    className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="hourly">Hourly</option>
                    <option value="package">Package</option>
                  </select>
                </span>
                <button
                  type="button"
                  onClick={() => addNotification("Create offering flow coming soon")}
                  className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Create offering
                </button>
              </div>

              {hasLiveWarning(service) && (
                <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                  Service is LIVE but no slots available.
                </div>
              )}

              {!service.hasMedia && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                  Service has no media, may rank lower.
                </div>
              )}

              <div className="mt-4 space-y-3">
                {service.offerings.map((offering) => (
                  <div
                    key={offering.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{offering.name}</p>
                        <p className="text-xs text-slate-500">
                          ₹{offering.price} · {offering.pricingModel}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusPill status={offering.status} size="sm" />
                        <button
                          type="button"
                          onClick={() => handleOfferingStatus(service.id, offering.id)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600"
                        >
                          {offering.status === "ACTIVE" ? "Pause" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSlot(service.id, offering.id)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600"
                        >
                          Add slot
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSlot(service.id, offering.id, true)}
                          className="rounded-full border border-blue-200 px-3 py-1 text-[11px] font-semibold text-blue-600"
                        >
                          Bulk add
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
                      {offering.slots.map((slot) => (
                        <span
                          key={slot.id}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700"
                        >
                          {slot.label} · Cap {slot.capacity}
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(service.id, offering.id, slot.id)}
                            className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[10px] text-slate-500 hover:bg-slate-200"
                          >
                            <HiOutlineXMark className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      {!offering.slots.length && (
                        <span className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-[11px] text-slate-500">
                          No slots yet
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {servicesWithoutMedia.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
          <p className="font-semibold text-slate-900">Media reminder</p>
          <p>
            {servicesWithoutMedia.length} service
            {servicesWithoutMedia.length > 1 ? "s" : ""} missing media. Upload photos or videos so the
            listing ranks higher.
          </p>
        </div>
      )}
    </DashboardContainer>
  );
};

export default VendorServices;
