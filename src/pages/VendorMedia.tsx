import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineArrowDown,
  HiOutlineArrowUp,
  HiOutlineArrowPath,
  HiOutlineCloud,
  HiOutlinePencilSquare,
  HiOutlinePhoto,
  HiOutlinePlus,
  HiOutlineTrash,
} from "react-icons/hi2";

import { useAppDispatch } from "@/app/hooks";
import { DashboardContainer } from "@/components/dashboard";
import { ConfirmDeleteDialog } from "@/components/modals/ConfirmDeleteDialog";
import { MediaUploadDialog } from "@/components/modals/MediaUploadDialog";
import { cn } from "@/lib/utils";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import {
  ServiceMedia,
  useDeleteServiceMediaMutation,
  useGetServiceMediaQuery,
} from "@/services/serviceMediaApi";
import {
  useGetVendorProfileStatusQuery,
  useGetVendorServicesQuery,
} from "@/services/vendorServicesApi";

type MediaItem = {
  id: string;
  title: string;
  type: "image" | "video";
  status: "enabled" | "disabled";
  order: number;
  url: string;
};

const MAX_MEDIA_SLOTS = 12;

const mapToMediaItem = (media: ServiceMedia, fallbackIndex: number): MediaItem => ({
  id: media.id,
  title: media.title?.trim() || (media.type === "IMAGE" ? `Photo ${fallbackIndex + 1}` : `Video ${fallbackIndex + 1}`),
  type: media.type === "IMAGE" ? "image" : "video",
  status: media.isActive ? "enabled" : "disabled",
  order: media.sortOrder ?? fallbackIndex + 1,
  url: media.signedUrl,
});

const VendorMedia = () => {
  const dispatch = useAppDispatch();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [message, setMessage] = useState("");
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmingMediaId, setConfirmingMediaId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isRearranging, setIsRearranging] = useState(false);

  const { data: vendorProfile, isLoading: isVendorLoading } = useGetVendorProfileStatusQuery();
  const vendorId = vendorProfile?.id as string | undefined;

  const {
    data: vendorServices = [],
    isLoading: isServicesLoading,
    isError: isServicesError,
    error: servicesError,
  } = useGetVendorServicesQuery(vendorId);

  useEffect(() => {
    if (!selectedServiceId && vendorServices.length > 0) {
      setSelectedServiceId(vendorServices[0].id);
    }
  }, [selectedServiceId, vendorServices]);

  const resolvedServiceId = selectedServiceId;
  const selectedService = useMemo(
    () => vendorServices.find((service) => service.id === resolvedServiceId),
    [resolvedServiceId, vendorServices]
  );
  const selectedServiceName = selectedService?.title ?? "your service";
  const [deleteServiceMedia] = useDeleteServiceMediaMutation();

  useEffect(() => {
    dispatch(setPageTitle("Media & Photos"));
  }, [dispatch]);

  const { data, isLoading, isError, error } = useGetServiceMediaQuery(resolvedServiceId!, {
    skip: !resolvedServiceId,
  });

  useEffect(() => {
    if (!data) return;

    setItems(data.map((m: ServiceMedia, index: number) => mapToMediaItem(m, index)));
  }, [data]);

  const slotUsed = items.length;
  const remainingSlots = Math.max(0, MAX_MEDIA_SLOTS - slotUsed);

  const handleUploadButton = () => {
    if (items.length >= MAX_MEDIA_SLOTS) {
      setMessage("Maximum 12 media slots used.");
      return;
    }

    setMessage("");
    setUploadDialogOpen(true);
  };

  const handleMediaUploaded = (media: ServiceMedia) => {
    setItems((prev) => {
      const next = [...prev, mapToMediaItem(media, prev.length)];
      return next.sort((a, b) => a.order - b.order);
    });

    setMessage("Media uploaded.");
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    setItems((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

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

  const deleteMedia = async (id: string) => {
    if (!resolvedServiceId) {
      setMessage("Please select a service first.");
      return;
    }

    setDeletingMediaId(id);
    setMessage("");

    try {
      await deleteServiceMedia({
        serviceId: resolvedServiceId,
        mediaId: id,
      }).unwrap();

      setItems((prev) => prev.filter((item) => item.id !== id));
      setMessage("Media removed.");
    } catch (err: any) {
      setMessage(err?.data?.message || "Failed to delete media. Please try again.");
    } finally {
      setDeletingMediaId(null);
    }
  };

  const handleDeleteButtonClick = (id: string) => {
    setConfirmingMediaId(id);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmingMediaId) return;
    await deleteMedia(confirmingMediaId);
    setConfirmDialogOpen(false);
    setConfirmingMediaId(null);
  };

  const handleRearrange = () => {
    const next = !isRearranging;
    setIsRearranging(next);
    setMessage(next ? "Use the arrow controls on each card to reorder." : "");
  };

  if (isVendorLoading || isServicesLoading || isLoading) {
    return (
      <DashboardContainer className="space-y-6 pb-10 pt-6">
        <div className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="h-10 w-72 animate-pulse rounded-full bg-slate-200/80" />
              <div className="h-5 w-[28rem] max-w-full animate-pulse rounded-full bg-slate-100" />
            </div>
            <div className="flex gap-3">
              <div className="h-11 w-32 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-11 w-44 animate-pulse rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-[410px] animate-pulse rounded-[28px] bg-slate-100" />
          ))}
        </div>
      </DashboardContainer>
    );
  }

  if (isError || isServicesError) {
    return (
      <DashboardContainer className="pt-8">
        <p className="text-sm text-red-500">
          {(error as any)?.data?.message ||
            (servicesError as any)?.data?.message ||
            "Failed to load media"}
        </p>
      </DashboardContainer>
    );
  }

  const headerTitle = "Media & Photos";
  const headerSubtitle = `Manage and curate your business visual gallery (${slotUsed}/${MAX_MEDIA_SLOTS} slots used)`;

  return (
    <DashboardContainer className="space-y-6 pb-10 pt-6">
      <div className="rounded-[32px] border border-slate-200 from-white via-slate-50 to-slate-100 p-6  sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[28px] font-semibold tracking-tight text-slate-900 sm:text-[34px]">
                {headerTitle}
              </h1>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {slotUsed}/{MAX_MEDIA_SLOTS} slots used
              </span>
            </div>
            <p className="text-sm text-slate-600 sm:text-[15px]">{headerSubtitle}</p>

            {vendorServices.length > 1 && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Service
                </span>
                <select
                  value={resolvedServiceId ?? ""}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="min-w-[220px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700  outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                >
                  {vendorServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-slate-500">
                  Currently showing media for <span className="font-semibold text-slate-700">{selectedServiceName}</span>
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRearrange}
              className={cn(
                "inline-flex h-12 items-center gap-2 rounded-2xl border px-5 text-sm font-semibold transition",
                isRearranging
                  ? "border-slate-300 bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <HiOutlineArrowPath className="h-4 w-4" />
              {isRearranging ? "Done" : "Rearrange"}
            </button>

            <button
              type="button"
              onClick={handleUploadButton}
              disabled={!resolvedServiceId}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiOutlineCloud className="h-5 w-5" />
              Upload New Media
            </button>
          </div>
        </div>
      </div>

      {vendorServices.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
          Create a service first, then you can upload media for it.
        </div>
      )}

      {resolvedServiceId && (
        <MediaUploadDialog
          open={isUploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          serviceId={resolvedServiceId}
          onUploaded={handleMediaUploaded}
        />
      )}

      <ConfirmDeleteDialog
        open={confirmDialogOpen}
        onOpenChange={(open) => {
          setConfirmDialogOpen(open);
          if (!open) {
            setConfirmingMediaId(null);
          }
        }}
        description="This cannot be undone."
        confirmLoading={confirmingMediaId !== null && deletingMediaId === confirmingMediaId}
        onConfirm={handleConfirmDelete}
      />

      {message && (
        <div className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
          {message}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => {
          const mediaTypeLabel = item.type === "image" ? "IMAGE" : "VIDEO";
          const accentClass =
            index % 4 === 0
              ? "bg-blue-600 text-white"
              : index % 4 === 1
                ? "bg-slate-800 text-white"
                : index % 4 === 2
                  ? "bg-indigo-600 text-white"
                  : "bg-emerald-600 text-white";

          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-[28px] border border-slate-200 bg-white"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                {item.type === "image" ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                ) : (
                  <video src={item.url} className="h-full w-full object-cover" controls />
                )}

                <div className="absolute left-4 top-4">
                  <span className={cn("inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.18em] ", accentClass)}>
                    {mediaTypeLabel}
                  </span>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Image label
                    </p>
                    <div className="mt-1 flex items-start gap-2">
                      <h2 className="truncate text-[17px] font-semibold leading-6 text-slate-900">
                        {item.title}
                      </h2>
                      <button
                        type="button"
                        className="mt-0.5 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        aria-label={`Edit ${item.title}`}
                        onClick={() => setMessage("Title editing is not wired yet.")}
                      >
                        <HiOutlinePencilSquare className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                      item.status === "enabled"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {item.status === "enabled" ? "Active" : "Disabled"}
                  </span>
                </div>

                {isRearranging ? (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => moveItem(index, "up")}
                      disabled={index === 0}
                      className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <HiOutlineArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveItem(index, "down")}
                      disabled={index === items.length - 1}
                      className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <HiOutlineArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteButtonClick(item.id)}
                      disabled={deletingMediaId === item.id || confirmingMediaId === item.id}
                      className="inline-flex h-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {deletingMediaId === item.id ? (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">Deleting</span>
                      ) : (
                        <HiOutlineTrash className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(item.id)}
                      className="inline-flex h-10 flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                    >
                      {item.status === "enabled" ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => handleDeleteButtonClick(item.id)}
                      disabled={deletingMediaId === item.id || confirmingMediaId === item.id}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Delete ${item.title}`}
                    >
                      {deletingMediaId === item.id ? (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">...</span>
                      ) : (
                        <HiOutlineTrash className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}

        {resolvedServiceId && remainingSlots > 0 && (
          <button
            type="button"
            onClick={handleUploadButton}
            className="flex min-h-[410px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white/70 p-6 text-center text-slate-500 transition hover:border-blue-300 hover:bg-blue-50/60"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400">
              <HiOutlinePhoto className="h-7 w-7" />
            </span>
            <span className="mt-5 text-lg font-semibold text-slate-700">Add New Slot</span>
            <span className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {remainingSlots} slots remaining
            </span>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
              <HiOutlinePlus className="h-4 w-4" />
              Upload media
            </span>
          </button>
        )}
      </div>
    </DashboardContainer>
  );
};

export default VendorMedia;
