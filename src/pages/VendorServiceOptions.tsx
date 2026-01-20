import { useEffect, useMemo, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { HiOutlineChevronLeft, HiOutlineCloud, HiOutlineSparkles } from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useMockLoader } from "@/lib/useMockLoader";

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

  useEffect(() => {
    dispatch(setPageTitle(`Service Options – ${service.name}`));
  }, [dispatch, service.name]);

  useEffect(() => {
    setPricingModel(service.pricingModel);
    setPrice(service.price);
    setSlots(service.slots);
    setVisibility(service.visibility);
    setMedia(service.media);
  }, [service]);

  const slotSummary = useMemo(
    () => ({
      available: slots.filter((slot) => slot.status === "available").length,
      blocked: slots.filter((slot) => slot.status === "blocked").length,
    }),
    [slots]
  );

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

  const addSlot = () => {
    setSlots((prev) => [
      ...prev,
      {
        id: `slot-${prev.length + 1}`,
        label: `New Slot ${prev.length + 1} · 08:00 AM`,
        status: "available",
      },
    ]);
    setMessage("Slot added");
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Availability & slots
            </p>
            <button
              type="button"
              onClick={addSlot}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
            >
              Add slot
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              Available · {slotSummary.available}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              Blocked · {slotSummary.blocked}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              Total · {slots.length}
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

export default VendorServiceOptions;
