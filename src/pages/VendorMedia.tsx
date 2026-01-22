import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import { useGetServiceMediaQuery } from "@/services/serviceMediaApi";

type MediaItem = {
  id: string;
  title: string;
  type: "image" | "video";
  status: "enabled" | "disabled";
  order: number;
  url: string;
};

const VendorMedia = () => {
  const dispatch = useAppDispatch();
  const { serviceId } = useParams<{ serviceId: string }>();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    dispatch(setPageTitle("Photos & Media"));
  }, [dispatch]);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetServiceMediaQuery('568fa4d3-ce94-4de7-b5fd-77150fa023bc', {
  });

  useEffect(() => {
    if (!data) return;

    setItems(
      data.map((m: any, index: number) => ({
        id: m.id,
        title: m.type === "IMAGE" ? "Image" : "Video",
        type: m.type.toLowerCase(),
        status: m.isActive ? "enabled" : "disabled",
        order: m.sortOrder ?? index + 1,
        url: m.signedUrl,
      }))
    );
  }, [data]);

  const handleUpload = () => {
    if (items.length >= 12) {
      setMessage("Maximum 12 items allowed");
      return;
    }
    setMessage("Upload API not wired yet");
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    setItems((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const next = [...prev];
      [next[index], next[targetIndex]] = [
        next[targetIndex],
        next[index],
      ];

      return next.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));
    });
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
    setMessage("Item deleted (not persisted)");
  };

  if (isLoading) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <div className="h-8 w-1/4 animate-pulse rounded-full bg-slate-200" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-32 rounded-2xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      </DashboardContainer>
    );
  }

  if (isError) {
    return (
      <DashboardContainer className="pt-8">
        <p className="text-sm text-red-500">
          {(error as any)?.data?.message || "Failed to load media"}
        </p>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-10">
      <TitleBreadCrumbs
        title="Media"
        breadCrumbTitle="Vendor / Photos & Media"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">
          Gallery ({items.length}/12)
        </p>

        <button
          type="button"
          onClick={handleUpload}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-700 hover:border-blue-300"
        >
          <HiOutlineCloud className="h-6 w-6" />
          Upload media
        </button>
      </div>

      {message && (
        <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700">
          {message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div className="h-48 overflow-hidden rounded-2xl bg-slate-100">
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  src={item.url}
                  className="h-full w-full object-cover"
                  controls
                />
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{item.title}</span>
              <span className="rounded-full border border-slate-200 px-2 py-0.5">
                {item.type}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-1 text-xs">
              <button
                onClick={() => moveItem(index, "up")}
                disabled={index === 0}
                className="flex-1 rounded-full border border-slate-200 px-2 py-1 disabled:opacity-50"
              >
                <HiOutlineArrowUp className="mx-auto h-3 w-3" />
              </button>

              <button
                onClick={() => moveItem(index, "down")}
                disabled={index === items.length - 1}
                className="flex-1 rounded-full border border-slate-200 px-2 py-1 disabled:opacity-50"
              >
                <HiOutlineArrowDown className="mx-auto h-3 w-3" />
              </button>

              <button
                onClick={() => toggleStatus(item.id)}
                className="flex-1 rounded-full border border-slate-200 px-2 py-1"
              >
                {item.status === "enabled" ? "Disable" : "Enable"}
              </button>

              <button
                onClick={() => deleteItem(item.id)}
                className="flex-1 rounded-full border border-slate-200 px-2 py-1"
              >
                <HiOutlineTrash className="mx-auto h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardContainer>
  );
};

export default VendorMedia;
