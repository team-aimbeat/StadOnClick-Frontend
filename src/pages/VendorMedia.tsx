import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  HiOutlineArrowDown,
  HiOutlineArrowUp,
  HiOutlineCloud,
  HiOutlineTrash,
} from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useMockLoader } from "@/lib/useMockLoader";

type MediaItem = {
  id: string;
  title: string;
  type: "image" | "video";
  status: "enabled" | "disabled";
  order: number;
};

const initialMedia: MediaItem[] = [
  { id: "media-1", title: "Team at work", type: "image", status: "enabled", order: 1 },
  { id: "media-2", title: "Plumbing van", type: "image", status: "enabled", order: 2 },
  { id: "media-3", title: "Technician video", type: "video", status: "enabled", order: 3 },
  { id: "media-4", title: "Before / After", type: "image", status: "disabled", order: 4 },
  { id: "media-5", title: "Installer profile", type: "image", status: "enabled", order: 5 },
  { id: "media-6", title: "Water purifier demo", type: "video", status: "enabled", order: 6 },
  { id: "media-7", title: "Service van", type: "image", status: "enabled", order: 7 },
  { id: "media-8", title: "Customer testimonial", type: "video", status: "enabled", order: 8 },
];

const VendorMedia = () => {
  const dispatch = useAppDispatch();
  const loading = useMockLoader();
  const [items, setItems] = useState<MediaItem[]>(initialMedia);
  const [message, setMessage] = useState("");

  useEffect(() => {
    dispatch(setPageTitle("Photos & Media"));
  }, [dispatch]);

  const handleUpload = () => {
    if (items.length >= 12) {
      setMessage("Maximum 12 items allowed");
      return;
    }
    const nextItem: MediaItem = {
      id: `media-${Date.now()}`,
      title: "New media upload",
      type: items.length % 2 === 0 ? "image" : "video",
      status: "enabled",
      order: items.length + 1,
    };
    setItems((prev) => [...prev, nextItem]);
    setMessage("Media uploaded");
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    setItems((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next.map((item, idx) => ({ ...item, order: idx + 1 }));
    });
    setMessage(`Moved ${direction}`);
  };

  const toggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "enabled" ? "disabled" : "enabled",
            }
          : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setMessage("Item deleted");
  };

  if (loading) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <div className="h-8 w-1/4 animate-pulse rounded-full bg-slate-200" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-10">
      <TitleBreadCrumbs title="Media" breadCrumbTitle="Vendor / Photos & Media" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">Gallery ({items.length}/12)</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUpload}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-700 hover:border-blue-300"
          >
            <HiOutlineCloud className="h-4 w-4" />
            Upload media
          </button>
          <NavLink
            to="/vendor/promote"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Promo kits
          </NavLink>
        </div>
      </div>

      {message && (
        <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700">
          {message}
        </div>
      )}

      {items.length >= 12 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
          You have reached the 12-item limit. Delete older uploads to add new content.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div className="h-40 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200" />
            <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{item.title}</span>
              <span className="rounded-full border border-slate-200 px-2 py-0.5">
                {item.type}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-semibold">
              <span>Order #{index + 1}</span>
              <span
                className={`rounded-full px-2 py-0.5 ${
                  item.status === "enabled"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {item.status}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-1 text-xs">
              <button
                type="button"
                onClick={() => moveItem(index, "up")}
                disabled={index === 0}
                className="flex-1 rounded-full border border-slate-200 px-2 py-1 text-center font-semibold text-slate-600 disabled:opacity-50"
              >
                <HiOutlineArrowUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, "down")}
                disabled={index === items.length - 1}
                className="flex-1 rounded-full border border-slate-200 px-2 py-1 text-center font-semibold text-slate-600 disabled:opacity-50"
              >
                <HiOutlineArrowDown className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => toggleStatus(item.id)}
                className="flex-1 rounded-full border border-slate-200 px-2 py-1 text-center font-semibold text-slate-600"
              >
                {item.status === "enabled" ? "Disable" : "Enable"}
              </button>
              <button
                type="button"
                onClick={() => deleteItem(item.id)}
                className="flex-1 rounded-full border border-slate-200 px-2 py-1 text-center font-semibold text-slate-600"
              >
                <HiOutlineTrash className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardContainer>
  );
};

export default VendorMedia;
