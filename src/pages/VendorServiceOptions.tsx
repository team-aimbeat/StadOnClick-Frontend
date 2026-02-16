import { useEffect, useMemo, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { HiOutlineChevronLeft, HiOutlineCloud, HiOutlineSparkles } from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useMockLoader } from "@/lib/useMockLoader";
import {
  useCreateRuleMutation,
  useCreateSlotMutation,
  useGetServiceOfferingsQuery,
} from "@/services/vendorOfferingsApi";

type Slot = {
  id: string;
  label: string;
  status: "available" | "blocked";
};

type MediaItem = {
  id: string;
  title: string;
  type: "image" | "video";
  status: "enabled" | "disabled";
};

type ServiceOptions = {
  id: string;
  name: string;
  pricingModel: "fixed" | "hourly" | "package";
  slots: Slot[];
  visibility: { published: boolean; featured: boolean };
  media: MediaItem[];
  price: number;
};

const optionsSeed: Record<string, ServiceOptions> = {
  "svc-plumbing": {
    id: "svc-plumbing",
    name: "Emergency Plumbing",
    pricingModel: "fixed",
    price: 1799,
    slots: [
      { id: "slot-1", label: "Mon 09:00 AM", status: "available" },
      { id: "slot-2", label: "Tue 02:00 PM", status: "available" },
      { id: "slot-3", label: "Wed 06:00 PM", status: "blocked" },
    ],
    visibility: { published: true, featured: false },
    media: [
      { id: "media-1", title: "Plumbing van", type: "image", status: "enabled" },
      { id: "media-2", title: "Technician video", type: "video", status: "enabled" },
    ],
  },
  "svc-maintenance": {
    id: "svc-maintenance",
    name: "HVAC Maintenance",
    pricingModel: "package",
    price: 5499,
    slots: [],
    visibility: { published: false, featured: false },
    media: [
      { id: "media-3", title: "Air-con audit", type: "image", status: "enabled" },
    ],
  },
};

const VendorServiceOptions = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const dispatch = useAppDispatch();
  const loading = useMockLoader();
  const service = useMemo(
    () => optionsSeed[serviceId ?? "svc-plumbing"] ?? optionsSeed["svc-plumbing"],
    [serviceId]
  );
  const [pricingModel, setPricingModel] = useState(service.pricingModel);
  const [price, setPrice] = useState(service.price);
  const [slots, setSlots] = useState<Slot[]>(service.slots);
  const [visibility, setVisibility] = useState(service.visibility);
  const [media, setMedia] = useState(service.media);
  const [message, setMessage] = useState("");
  const [slotDraft, setSlotDraft] = useState({
    startTime: new Date().toISOString().slice(0, 16),
    capacity: 1,
  });
  const [ruleDraft, setRuleDraft] = useState({ type: "", value: "" });

  useEffect(() => {
    dispatch(setPageTitle(`Service Options – ${service.name}`));
  }, [dispatch, service.name]);

  useEffect(() => {
    setPricingModel(service.pricingModel);
    setPrice(service.price);
    setSlots(service.slots);
    setVisibility(service.visibility);
    setMedia(service.media);
    setSlotDraft({
      startTime: new Date().toISOString().slice(0, 16),
      capacity: 1,
    });
    setRuleDraft({ type: "", value: "" });
  }, [service]);

  const serviceIdParam = serviceId ?? service.id;
  const {
    data: offerings = [],
    isFetching: isFetchingOfferings,
  } = useGetServiceOfferingsQuery(serviceIdParam, {
    skip: !serviceIdParam,
  });
  const primaryOffering = offerings[0];

  const displaySlots = useMemo<Slot[]>(() => {
    if (primaryOffering?.slots?.length) {
      return primaryOffering.slots.map((slot) => ({
        id: slot.id,
        label: formatSlotLabel(slot.startTime, slot.endTime),
        status: slot.status === "OPEN" ? "available" : "blocked",
      }));
    }

    return service.slots;
  }, [primaryOffering, service.slots]);

  const slotSummary = useMemo(
    () => ({
      available: displaySlots.filter((slot) => slot.status === "available").length,
      blocked: displaySlots.filter((slot) => slot.status === "blocked").length,
      total: displaySlots.length,
    }),
    [displaySlots]
  );

  useEffect(() => {
    setSlots(displaySlots);
  }, [displaySlots]);

  const ruleList = primaryOffering?.rules ?? [];
  const [createSlot, { isLoading: creatingSlot }] = useCreateSlotMutation();
  const [createRule, { isLoading: creatingRule }] = useCreateRuleMutation();

  const handleCreateSlot = async () => {
    if (!primaryOffering) {
      setMessage("Awaiting an offering before publishing slots.");
      return;
    }

    if (!slotDraft.startTime) {
      setMessage("Pick a start time for the slot.");
      return;
    }

    try {
      await createSlot({
        offeringId: primaryOffering.id,
        startTime: new Date(slotDraft.startTime).toISOString(),
        capacity: slotDraft.capacity,
      }).unwrap();

      setMessage("Slot published");
      setSlotDraft((prev) => ({ ...prev, capacity: 1 }));
    } catch (error) {
      setMessage("Failed to publish slot. Try again.");
    }
  };

  const handleCreateRule = async () => {
    if (!primaryOffering) {
      setMessage("Create an offering before adding rules.");
      return;
    }

    const type = ruleDraft.type.trim();
    const value = ruleDraft.value.trim();

    if (!type || !value) {
      setMessage("Rule type and value are required.");
      return;
    }

    try {
      await createRule({
        offeringId: primaryOffering.id,
        ruleType: type,
        value,
      }).unwrap();

      setRuleDraft({ type: "", value: "" });
      setMessage("Rule saved");
    } catch (error) {
      setMessage("Failed to save rule");
    }
  };

  const toggleVisibility = () => {
    setVisibility((prev) => {
      const next = { ...prev, published: !prev.published };
      setMessage(`Visibility ${next.published ? "published" : "hidden"}`);
      return next;
    });
  };

  const toggleFeatured = () => {
    setVisibility((prev) => {
      const next = { ...prev, featured: !prev.featured };
      setMessage(next.featured ? "Now featured" : "Removed from featured");
      return next;
    });
  };


  const archiveService = () => {
    setMessage("Service archived. Customers will see it as inactive.");
  };

  const reorderMedia = () => {
    setMedia((prev) => [...prev.slice(1), prev[0]]);
    setMessage("Media reordered for highlighting");
  };

  if (loading) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <div className="h-8 w-1/2 animate-pulse rounded-full bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
          <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
          <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-10">
      <TitleBreadCrumbs
        title={`Service Options`}
        breadCrumbTitle={`Vendor / Services / ${service.name}`}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <NavLink
          to="/vendor/services"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <HiOutlineChevronLeft className="h-4 w-4" />
          Back to services
        </NavLink>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Visibility & pricing
        </p>
      </div>

      {message && (
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
          {message}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pricing</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{service.name}</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Pricing model</span>
              <select
                value={pricingModel}
                onChange={(event) => setPricingModel(event.target.value as ServiceOptions["pricingModel"])}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                <option value="fixed">Fixed</option>
                <option value="hourly">Hourly</option>
                <option value="package">Package</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span>Price</span>
              <input
                type="number"
                value={price}
                onChange={(event) => setPrice(Number(event.target.value))}
                className="w-24 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Max quantity</span>
              <span className="text-xs font-semibold text-slate-700">
                {primaryOffering?.maxQuantity ?? "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Remaining quantity</span>
              <span className="text-xs font-semibold text-slate-700">
                {primaryOffering?.remainingQuantity ?? "N/A"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Updating pricing updates all linked offerings and slot booking values.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMessage("Pricing update scheduled")}
            className="mt-4 w-full rounded-2xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Save pricing
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 md:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Availability & slots
              </p>
              {isFetchingOfferings && (
                <p className="text-[11px] text-slate-400">Syncing offering data…</p>
              )}
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1 text-[11px] text-slate-500">
                Start time
                <input
                  type="datetime-local"
                  value={slotDraft.startTime}
                  onChange={(event) =>
                    setSlotDraft((prev) => ({ ...prev, startTime: event.target.value }))
                  }
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs focus:border-blue-500"
                />
              </label>
              <label className="flex flex-col gap-1 text-[11px] text-slate-500">
                Capacity
                <input
                  type="number"
                  min={1}
                  value={slotDraft.capacity}
                  onChange={(event) =>
                    setSlotDraft((prev) => ({
                      ...prev,
                      capacity: Math.max(1, Number(event.target.value)),
                    }))
                  }
                  className="w-20 rounded-full border border-slate-200 px-3 py-1 text-xs focus:border-blue-500"
                />
              </label>
              <button
                type="button"
                onClick={handleCreateSlot}
                disabled={creatingSlot}
                className="rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {creatingSlot ? "Publishing…" : "Publish slot"}
              </button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              Available · {slotSummary.available}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              Blocked · {slotSummary.blocked}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              Total · {slotSummary.total}
            </div>
          </div>
          <div className="mt-3 space-y-2 text-xs text-slate-700">
            {slots.length
              ? slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2"
                  >
                    <span>{slot.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        slot.status === "available"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {slot.status}
                    </span>
                  </div>
                ))
              : (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
                  No slots yet. Add a slot to open booking windows.
                </p>
              )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Media</p>
              <p className="text-sm font-semibold text-slate-900">Gallery</p>
            </div>
            <button
              type="button"
              onClick={reorderMedia}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
            >
              Reorder
            </button>
          </div>
          <div className="mt-3 space-y-2 text-xs text-slate-700">
            {media.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <span>
                  {item.title} · {item.type.toUpperCase()}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    item.status === "enabled"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setMessage("Media upload triggered")}
            className="mt-3 w-full rounded-2xl border border-dashed border-slate-400 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-500"
          >
            Upload media
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Visibility</p>
          <div className="mt-3 space-y-2 text-sm font-semibold text-slate-700">
            <div className="flex items-center justify-between">
              <span>Listing live</span>
              <button
                type="button"
                onClick={toggleVisibility}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  visibility.published ? "bg-emerald-50 text-emerald-700" : "border border-slate-200 text-slate-600"
                }`}
              >
                {visibility.published ? "Published" : "Hidden"}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span>Featured on home feed</span>
              <button
                type="button"
                onClick={toggleFeatured}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  visibility.featured ? "bg-blue-50 text-blue-700" : "border border-slate-200 text-slate-600"
                }`}
              >
                {visibility.featured ? "Featured" : "Set as featured"}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Update visibility to control if customers see your service on the marketplace or in search.
            </p>
          </div>
          <NavLink
            to="/vendor/promote"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500"
          >
            <HiOutlineSparkles className="h-4 w-4" />
            Promote this service
          </NavLink>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Rules</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1.2fr_1.2fr_auto]">
          <input
            type="text"
            value={ruleDraft.type}
            onChange={(event) => setRuleDraft((prev) => ({ ...prev, type: event.target.value }))}
            placeholder="Rule type"
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:ring focus:ring-blue-200/50"
          />
          <input
            type="text"
            value={ruleDraft.value}
            onChange={(event) => setRuleDraft((prev) => ({ ...prev, value: event.target.value }))}
            placeholder="Value"
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:ring focus:ring-blue-200/50"
          />
          <button
            type="button"
            onClick={handleCreateRule}
            disabled={creatingRule}
            className="rounded-2xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
          >
            {creatingRule ? "Saving…" : "Save rule"}
          </button>
        </div>
        <div className="mt-4 space-y-2 text-xs text-slate-700">
          {ruleList.length > 0 ? (
            ruleList.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <span className="font-semibold text-slate-900">{rule.ruleType}</span>
                <span className="text-slate-500">{rule.value}</span>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
              No rules yet. Rules keep your offerings consistent.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Delete / Archive</p>
        <p className="mt-2 text-sm text-slate-700">
          Archiving keeps the service in your draft library and removes it from live listings.
        </p>
        <button
          type="button"
          onClick={archiveService}
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
        >
          Archive service
        </button>
      </div>
    </DashboardContainer>
  );
};

function formatSlotLabel(startTime: string, endTime?: string | null) {
  const formatSlotTime = (isoString: string) => {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "--:--";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const startLabel = formatSlotTime(startTime);

  if (!endTime) {
    return startLabel;
  }

  const endLabel = formatSlotTime(endTime);

  return `${startLabel} - ${endLabel}`;
}

export default VendorServiceOptions;

