import { HiOutlinePlus } from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import type { ServiceMasterCategory } from "@/services/serviceCategoriesApi";
import type { VendorServiceEntity } from "@/services/vendorServicesApi";
import well from "@/assets/Images/well.jpg";
import wellSm from "@/assets/Images/optimized/well-sm.jpg";
import type { Visual } from "@/pages/vendor-services/vendorServicesVisuals";

import { ServiceCardOfferingsPreview } from "@/pages/vendor-services/ServiceCardOfferingsPreview";
import { categoryVisuals, masterServiceVisuals } from "@/pages/vendor-services/vendorServicesVisuals";

const fallbackListingVisual = (alt: string): Visual => ({
  src: well,
  alt,
  srcSet: `${wellSm} 480w, ${well} 1200w`,
});

type VendorServicesListingProps = {
  hasService: boolean;
  isServicesLoading: boolean;
  vendorServices: VendorServiceEntity[];
  masterServices: ServiceMasterCategory[];
  onAddNewService: () => void;
  onManageService: (service: VendorServiceEntity) => void;
  onConstructFirstService: () => void;
};

export const VendorServicesListing = ({
  hasService,
  isServicesLoading,
  vendorServices,
  masterServices,
  onAddNewService,
  onManageService,
  onConstructFirstService,
}: VendorServicesListingProps) => {
  return (
    <DashboardContainer className="space-y-6 pb-16">
      <TitleBreadCrumbs
        className="flex-1"
        title="My Services"
        breadCrumbTitle="Vendor / Services"
        subtitle="Manage your existing services or add new ones to your profile."
      />
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onAddNewService}
          disabled={hasService}
          className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-200 ${
            hasService ? "cursor-not-allowed bg-slate-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {hasService ? "One service allowed" : "Add New Service"}
        </button>
      </div>

      {isServicesLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-3xl border border-slate-100 bg-white/60 animate-pulse"
            />
          ))}
        </div>
      ) : vendorServices.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vendorServices.map((service) => {
            const master = masterServices?.find(
              (m) => m.id === service.category?.masterCategoryId,
            );
            const masterVisual =
              masterServiceVisuals[master?.slug ?? ""] ??
              fallbackListingVisual(master?.name ?? "Master service");
            const categoryVisual =
              categoryVisuals[service.category?.slug ?? ""] ?? masterVisual;

            const primaryVisual = service.media?.[0]?.url
              ? {
                  src: service.media[0].url,
                  alt: service.title ?? categoryVisual.alt,
                }
              : categoryVisual;

            return (
              <div
                key={service.id}
                className="group relative flex flex-col rounded-3xl border border-slate-100 bg-white p-5 transition"
              >
                <div className="mb-4 grid grid-cols-3 gap-3">
                  <div className="col-span-2 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                    <img
                      src={primaryVisual.src}
                      alt={primaryVisual.alt}
                      className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      srcSet={primaryVisual.srcSet}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                    <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-slate-600">
                      <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700">
                        Category
                      </span>
                      <span className="truncate">{service.category?.name ?? "—"}</span>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                    <img
                      src={masterVisual.src}
                      alt={masterVisual.alt}
                      className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      srcSet={masterVisual.srcSet}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                    <div className="px-3 py-2 text-[11px] font-semibold text-slate-600">
                      <span className="rounded-full bg-white/80 px-2 py-0.5 text-slate-700">
                        Master
                      </span>
                      <p className="truncate text-xs text-slate-500">{master?.name ?? "—"}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-3 flex items-center justify-between">
                  {service.category?.id && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Cat ID: {service.category.id.slice(0, 8)}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      service.status === "LIVE"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {service.status}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">
                  {service.title}
                </h3>
                <p className="mt-1 mb-4 text-sm text-slate-500 line-clamp-2">
                  {service.description}
                </p>
                <ServiceCardOfferingsPreview serviceId={service.id} />

                <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
                  <div className="text-xs text-slate-400">ID: {service.id.slice(0, 8)}...</div>
                  <button
                    type="button"
                    className="group inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700"
                    onClick={() => onManageService(service)}
                  >
                    <span>Manage Service</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-20">
          <div className="mb-4 rounded-full bg-slate-100 p-4">
            <HiOutlinePlus className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No services yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            Start adding your single service and then create multiple offerings under it.
          </p>
          <button
            type="button"
            onClick={onConstructFirstService}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
          >
            Construct your first service
          </button>
        </div>
      )}
    </DashboardContainer>
  );
};

