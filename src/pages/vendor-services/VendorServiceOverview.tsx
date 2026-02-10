import { useEffect, useMemo, useState } from "react";
import { HiOutlinePencilSquare, HiOutlinePlus } from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ServiceMasterCategory } from "@/services/serviceCategoriesApi";
import { useGetServiceOfferingsQuery } from "@/services/vendorOfferingsApi";
import type { VendorServiceEntity } from "@/services/vendorServicesApi";

import well from "@/assets/Images/well.jpg";
import wellSm from "@/assets/Images/optimized/well-sm.jpg";
import type { Visual } from "@/pages/vendor-services/vendorServicesVisuals";

import { AddOfferingDialog } from "@/pages/vendor-services/AddOfferingDialog";
import {
  categoryVisuals,
  masterServiceVisuals,
} from "@/pages/vendor-services/vendorServicesVisuals";

const fallbackOverviewVisual = (alt: string): Visual => ({
  src: well,
  alt,
  srcSet: `${wellSm} 480w, ${well} 1200w`,
});

type VendorServiceOverviewProps = {
  service: VendorServiceEntity;
  masterServices: ServiceMasterCategory[];
  onEditService: () => void;
  onEditOfferings: (offeringId?: string) => void;
  requestAddOfferingOpen?: boolean;
  onConsumeAddOfferingRequest?: () => void;
};

export function VendorServiceOverview({
  service,
  masterServices,
  onEditService,
  onEditOfferings,
  requestAddOfferingOpen,
  onConsumeAddOfferingRequest,
}: VendorServiceOverviewProps) {
  const [addOfferingOpen, setAddOfferingOpen] = useState(false);

  const { data: offerings = [], isFetching, isError, refetch } =
    useGetServiceOfferingsQuery(service.id, {
      skip: !service.id,
    });

  useEffect(() => {
    if (requestAddOfferingOpen) {
      setAddOfferingOpen(true);
      onConsumeAddOfferingRequest?.();
    }
  }, [onConsumeAddOfferingRequest, requestAddOfferingOpen]);

  const master = useMemo(() => {
    return masterServices?.find((m) => m.id === service.category?.masterCategoryId);
  }, [masterServices, service.category?.masterCategoryId]);

  const masterVisual =
    masterServiceVisuals[master?.slug ?? ""] ?? fallbackOverviewVisual(master?.name ?? "Master service");
  const categoryVisual =
    categoryVisuals[service.category?.slug ?? ""] ?? masterVisual;

  const primaryVisual = service.media?.[0]?.url
    ? {
        src: service.media[0].url,
        alt: service.title ?? categoryVisual.alt,
      }
    : categoryVisual;

  return (
    <DashboardContainer className="space-y-6 pb-16">
      <TitleBreadCrumbs
        className="flex-1"
        title="My Service"
        breadCrumbTitle="Vendor / Service"
        subtitle="Manage your service details and add offerings."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
              service.status === "LIVE"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {service.status}
          </span>
          {service.category?.name ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              {service.category.name}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onEditService}
            className="gap-2"
          >
            <HiOutlinePencilSquare className="h-4 w-4" />
            Edit service
          </Button>
          <Button type="button" onClick={() => setAddOfferingOpen(true)} className="gap-2">
            <HiOutlinePlus className="h-4 w-4" />
            Add offering
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-5">
          <div className="mb-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
            <img
              src={primaryVisual.src}
              alt={primaryVisual.alt}
              className="h-56 w-full object-cover"
              loading="lazy"
              decoding="async"
              srcSet={primaryVisual.srcSet}
              sizes="(max-width: 1024px) 100vw, 640px"
            />
            <div className="flex flex-wrap items-center gap-2 px-4 py-3 text-xs font-semibold text-slate-600">
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700">
                Master
              </span>
              <span className="truncate">{master?.name ?? "—"}</span>
              <span className="text-slate-300">•</span>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700">
                Category
              </span>
              <span className="truncate">{service.category?.name ?? "—"}</span>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-slate-900">{service.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{service.description}</p>

          {service.terms ? (
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Terms
              </p>
              <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">
                {service.terms}
              </p>
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Offerings</h3>
            <button
              type="button"
              onClick={() => onEditOfferings()}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Manage
            </button>
          </div>

          {isFetching ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ) : isError ? (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Unable to load offerings.
            </div>
          ) : offerings.length ? (
            <ul className="mt-4 space-y-2">
              {offerings.map((offering) => (
                <li key={offering.id}>
                  <button
                    type="button"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-left hover:bg-slate-100"
                    onClick={() => onEditOfferings(offering.id)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {offering.name}
                        </p>
                        {offering.description ? (
                          <p className="truncate text-xs text-slate-500">
                            {offering.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-slate-800">
                          ${Number(offering.salePrice ?? offering.basePrice).toFixed(2)}
                        </p>
                        {offering.usesSlots ? (
                          <p className="text-[11px] text-slate-500">Slots enabled</p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <p className="text-sm font-semibold text-slate-900">No offerings yet</p>
              <p className="mt-1 text-xs text-slate-500">
                Add an offering so customers can book you.
              </p>
              <Button
                type="button"
                className="mt-4 gap-2"
                onClick={() => setAddOfferingOpen(true)}
              >
                <HiOutlinePlus className="h-4 w-4" />
                Add offering
              </Button>
            </div>
          )}
        </div>
      </div>

      <AddOfferingDialog
        open={addOfferingOpen}
        onOpenChange={setAddOfferingOpen}
        serviceId={service.id}
        onCreated={() => refetch()}
      />
    </DashboardContainer>
  );
}
