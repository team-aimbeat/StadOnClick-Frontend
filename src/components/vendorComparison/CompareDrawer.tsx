import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VendorComparisonRecord } from "@/services/vendorComparisonApi";
import { Button } from "@/components/ui/button";

type Props = {
  selected: VendorComparisonRecord[];
  onRemove: (vendorId: string) => void;
};

export function CompareDrawer({ selected, onRemove }: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(selected.length > 0);
  }, [selected.length]);

  if (!open) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[90%] max-w-4xl -translate-x-1/2 rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Compare {selected.length} / 4
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-slate-700">
            {selected.map((vendor) => (
              <span
                key={vendor.vendorId}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1"
              >
                {vendor.vendorName}
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-slate-900"
                  onClick={() => onRemove(vendor.vendorId)}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => selected.forEach((v) => onRemove(v.vendorId))}
          >
            Clear
          </Button>
          <Button size="sm" onClick={() => navigate(`/compare?ids=${selected.map((v) => v.vendorId).join(",")}`)}>
            Compare
          </Button>
        </div>
      </div>
    </div>
  );
}
