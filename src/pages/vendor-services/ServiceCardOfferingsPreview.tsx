import { useGetServiceOfferingsQuery } from "@/services/vendorOfferingsApi";

export const ServiceCardOfferingsPreview = ({ serviceId }: { serviceId: string }) => {
  const { data: offerings = [], isFetching, isError } = useGetServiceOfferingsQuery(serviceId, {
    skip: !serviceId,
  });

  if (isFetching) {
    return (
      <div className="mb-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        Loading offerings…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mb-3 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
        Unable to load offerings preview.
      </div>
    );
  }

  if (!offerings.length) {
    return (
      <div className="mb-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        No offerings yet — add them from “Manage Service”.
      </div>
    );
  }

  const top = offerings.slice(0, 3);

  return (
    <div className="mb-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        Offerings preview
      </p>
      <ul className="mt-2 space-y-1">
        {top.map((offering) => (
          <li
            key={offering.id}
            className="flex items-center justify-between text-sm text-slate-700"
          >
            <span className="truncate">{offering.name}</span>
            <span className="text-xs font-semibold text-slate-600">
              ${offering.salePrice?.toFixed(2) ?? offering.basePrice?.toFixed(2) ?? "—"}
            </span>
          </li>
        ))}
      </ul>
      {offerings.length > top.length && (
        <p className="mt-1 text-[11px] text-slate-500">
          + {offerings.length - top.length} more
        </p>
      )}
    </div>
  );
};
