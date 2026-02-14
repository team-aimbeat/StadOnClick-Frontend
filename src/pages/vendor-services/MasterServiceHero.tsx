import type { ServiceMasterCategory } from "@/services/serviceCategoriesApi";
import well from "@/assets/Images/well.jpg";
import { masterServiceVisuals } from "@/pages/vendor-services/vendorServicesVisuals";

type MasterServiceHeroProps = {
  service?: ServiceMasterCategory | null;
};

export const MasterServiceHero = ({ service }: MasterServiceHeroProps) => {
  const visual = service
    ? masterServiceVisuals[service.slug]
    : masterServiceVisuals["experiences-activities"];
  const heroImage = visual?.src ?? well;
  const heroLabel = service ? service.name : "Select a master service";
  const heroSlug = service ? service.slug : "master service";
  const featureTags = service
    ? ["Responsive", "Accessible", "Master-focused"]
    : ["Choose a service", "Ready when you are"];

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-4">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
        <div className="h-48 overflow-hidden rounded-2xl bg-slate-100">
          <img
            src={heroImage}
            alt={visual?.alt ?? heroLabel}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            srcSet={visual?.srcSet}
            sizes="(max-width: 640px) 100vw, 360px"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
          {featureTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-center text-xs text-slate-500"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
          Master service
        </p>
        <h3 className="mt-1 text-xl font-semibold text-slate-900">{heroLabel}</h3>
        <p className="text-sm text-slate-500">{heroSlug.replaceAll("-", " ")}</p>
        <p className="mt-2 text-sm text-slate-600">
          {service
            ? "This showcase panel highlights the core service you selected before you configure offerings."
            : "Select any master service card to preview its hero imagery and instructions here."}
        </p>
      </div>
    </div>
  );
};
