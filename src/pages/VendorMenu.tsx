import { useEffect, useState } from 'react';
import { HiOutlineArrowDown, HiOutlineArrowUp, HiOutlineCloud, HiOutlineTrash } from 'react-icons/hi2';

import { useAppDispatch } from '@/app/hooks';
import { DashboardContainer } from '@/components/dashboard';
import { MenuUploadDialog } from '@/components/modals/MenuUploadDialog';
import { ConfirmDeleteDialog } from '@/components/modals/ConfirmDeleteDialog';
import TitleBreadCrumbs from '@/components/shared/TitleBreadCrumbs';
import { setPageTitle } from '@/features/Layout/themeConfigSlice';
import {
  MenuMedia,
  useDeleteServiceMenuMediaMutation,
  useGetServiceMenuMediaQuery,
} from '@/services/menuMediaApi';
import { useGetVendorProfileStatusQuery, useGetVendorServicesQuery } from '@/services/vendorServicesApi';

type MenuItem = {
  id: string;
  title: string;
  type: 'image' | 'video';
  order: number;
  url: string;
};

const mapToMenuItem = (media: MenuMedia, fallbackIndex: number): MenuItem => ({
  id: media.id,
  title: media.title || (media.type === 'IMAGE' ? 'Menu Image' : 'Menu Video'),
  type: media.type === 'IMAGE' ? 'image' : 'video',
  order: media.sortOrder ?? fallbackIndex + 1,
  url: media.signedUrl,
});

const VendorMenu = () => {
  const dispatch = useAppDispatch();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [message, setMessage] = useState('');
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmingMediaId, setConfirmingMediaId] = useState<string | null>(null);

  const { data: vendorProfile, isLoading: isVendorLoading } = useGetVendorProfileStatusQuery();
  const vendorId = vendorProfile?.id as string | undefined;

  const {
    data: vendorServices = [],
    isLoading: isServicesLoading,
    isError: isServicesError,
    error: servicesError,
  } = useGetVendorServicesQuery(vendorId);

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedServiceId && vendorServices.length > 0) {
      setSelectedServiceId(vendorServices[0].id);
    }
  }, [selectedServiceId, vendorServices]);

  const resolvedServiceId = selectedServiceId;
  const [deleteServiceMenuMedia] = useDeleteServiceMenuMediaMutation();

  useEffect(() => {
    dispatch(setPageTitle('Menu'));
  }, [dispatch]);

  const { data, isLoading, isError, error } = useGetServiceMenuMediaQuery(resolvedServiceId!, {
    skip: !resolvedServiceId,
  });

  useEffect(() => {
    if (!data) return;

    setItems(data.map((m: MenuMedia, index: number) => mapToMenuItem(m, index)));
  }, [data]);

  const handleUploadButton = () => {
    if (items.length >= 12) {
      setMessage('Maximum 12 items allowed');
      return;
    }

    setMessage('');
    setUploadDialogOpen(true);
  };

  const handleMediaUploaded = (media: MenuMedia) => {
    setItems((prev) => {
      const next = [...prev, mapToMenuItem(media, prev.length)];
      return next.sort((a, b) => a.order - b.order);
    });

    setMessage('Menu uploaded.');
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    setItems((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

      return next.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));
    });
  };

  const deleteMedia = async (id: string) => {
    if (!resolvedServiceId) {
      setMessage('Please select a service first.');
      return;
    }

    setDeletingMediaId(id);
    setMessage('');

    try {
      await deleteServiceMenuMedia({
        serviceId: resolvedServiceId,
        mediaId: id,
      }).unwrap();

      setItems((prev) => prev.filter((item) => item.id !== id));
      setMessage('Menu removed.');
    } catch (err: any) {
      setMessage(err?.data?.message || 'Failed to delete menu media. Please try again.');
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

  if (isVendorLoading || isServicesLoading || isLoading) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <div className="h-8 w-1/4 animate-pulse rounded-full bg-slate-200" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
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
            'Failed to load menu media'}
        </p>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-10">
      <TitleBreadCrumbs title="Menu" breadCrumbTitle="Vendor / Menu" />

      {vendorServices.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold text-slate-600">Select service</p>
          <select
            value={resolvedServiceId ?? ''}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
          >
            {vendorServices.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {!resolvedServiceId && vendorServices.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          Create a service first, then you can upload menu images for it.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">Gallery ({items.length}/12)</p>

        <button
          type="button"
          onClick={handleUploadButton}
          disabled={!resolvedServiceId}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-700 hover:border-blue-300"
        >
          <HiOutlineCloud className="h-6 w-6" />
          Upload menu
        </button>
      </div>

      {resolvedServiceId && (
        <MenuUploadDialog
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
        <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700">
          {message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="h-48 overflow-hidden rounded-2xl bg-slate-100">
              {item.type === 'image' ? (
                <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
              ) : (
                <video src={item.url} className="h-full w-full object-cover" controls />
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{item.title}</span>
              <span className="rounded-full border border-slate-200 px-2 py-0.5">{item.type}</span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-1 text-xs">
              <button
                onClick={() => moveItem(index, 'up')}
                disabled={index === 0}
                className="flex-1 rounded-full border border-slate-200 px-2 py-1 disabled:opacity-50"
              >
                <HiOutlineArrowUp className="mx-auto h-3 w-3" />
              </button>

              <button
                onClick={() => moveItem(index, 'down')}
                disabled={index === items.length - 1}
                className="flex-1 rounded-full border border-slate-200 px-2 py-1 disabled:opacity-50"
              >
                <HiOutlineArrowDown className="mx-auto h-3 w-3" />
              </button>

              <button
                onClick={() => handleDeleteButtonClick(item.id)}
                disabled={deletingMediaId === item.id || confirmingMediaId === item.id}
                className="flex-1 rounded-full border border-slate-200 px-2 py-1"
              >
                {deletingMediaId === item.id ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Deleting...
                  </span>
                ) : (
                  <HiOutlineTrash className="mx-auto h-3 w-3" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardContainer>
  );
};

export default VendorMenu;
