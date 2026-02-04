import React from "react";

import type { ServiceMasterCategory } from "@/services/serviceCategoriesApi";
import type { Visual } from "@/pages/vendor-services/vendorServicesVisuals";

type MasterServiceCardProps = {
  service: ServiceMasterCategory;
  isSelected: boolean;
  visual: Visual;
  onSelect: (id: string) => void;
};

export const MasterServiceCard = React.memo(function MasterServiceCard({
  service,
  isSelected,
  visual,
  onSelect,
}: MasterServiceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(service.id)}
      className={`flex h-full w-full flex-col gap-3 rounded-[24px] border bg-white px-3 py-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500
        ${isSelected ? "border-blue-500" : "border-slate-200 hover:border-slate-300"}`}
      aria-pressed={isSelected}
    >
      <div className="h-32 overflow-hidden rounded-[18px] border border-slate-200 bg-slate-100">
        <img
          src={visual.src}
          alt={visual.alt}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
      </div>
      <div className="space-y-0.5 px-1">
        <p className="truncate text-base font-semibold text-slate-900">{service.name}</p>
        <p className="truncate text-[11px] text-slate-500">{service.slug}</p>
      </div>
    </button>
  );
});

