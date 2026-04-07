import { Check, Search, Star } from "lucide-react";
import { useMemo, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import filterIcon from "@/assets/icons/Filter.svg";
import mapImage from "@/assets/Images/map.png";
import couponImage from "@/assets/Images/coupon2.png";
import { useGetWelcomeCouponsQuery, type WelcomeCoupon } from "@/services/welcomeCouponsApi";

const highlightFilters = [
  { label: "4.5", icon: <Star className="h-3 w-3 text-amber-500" /> },
  { label: "Offer" },
  { label: "Nearby" },
];
const categories = [
  { id: "Hair & salon", label: "Hair & salon", count: 23 },
  { id: "Spa & wellness", label: "Spa & wellness", count: 18 },
  { id: "Fitness", label: "Fitness", count: 14 },
  { id: "Events", label: "Events", count: 12 },
  { id: "Vacation", label: "Vacation", count: 9 },
];

const locations = [
  { id: "Stockholms", label: "Stockholms", count: 23 },
  { id: "Gothenburg", label: "Gothenburg", count: 18 },
  { id: "Malmo", label: "Malmo", count: 14 },
  { id: "Kalmar", label: "Kalmar", count: 12 },
  { id: "Uppsala", label: "Uppsala", count: 9 },
];

export type ServicesSidebarFilterItem = {
  id: string;
  label: string;
  count: number;
};

export type ServicesSidebarProps = {
  categories?: ServicesSidebarFilterItem[];
  locations?: ServicesSidebarFilterItem[];
  selectedCategoryIds?: string[];
  selectedLocationIds?: string[];
  onToggleCategory?: (categoryId: string) => void;
  onToggleLocation?: (locationId: string) => void;
  ratingMin?: number;
  onToggleRatingMin?: () => void;
  priceRange?: { min: number; max: number };
  onPriceRangeChange?: Dispatch<SetStateAction<{ min: number; max: number }>>;
  onApplyPrice?: () => void;
  onResetPrice?: () => void;
  onClearAll?: () => void;
};

const formatWelcomeCouponLabel = (coupon: WelcomeCoupon) => {
  if (coupon.title) return coupon.title;

  const base = coupon.discountType === "FLAT" ? `₹${coupon.value}` : `${coupon.value}%`;
  const suffix = coupon.onlyNewCustomers ? "off first booking" : "off";
  return `${base} ${suffix}`;
};

export default function ServicesSidebar({
  categories: providedCategories,
  locations: providedLocations,
  selectedCategoryIds: controlledCategoryIds,
  selectedLocationIds: controlledLocationIds,
  onToggleCategory,
  onToggleLocation,
  ratingMin,
  onToggleRatingMin,
  priceRange: controlledPriceRange,
  onPriceRangeChange,
  onApplyPrice,
  onResetPrice,
  onClearAll,
}: ServicesSidebarProps) {
  const PRICE_MIN = 0;
  const PRICE_MAX = 10000;
  const formatPriceBadge = (value: number) => (value >= 1000 ? `${Math.floor(value / 1000)}K` : `${value}`);

  const resolvedCategories = providedCategories ?? categories;
  const resolvedLocations = providedLocations ?? locations;

  const [categorySearch, setCategorySearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");

  const [uncontrolledCategoryIds, setUncontrolledCategoryIds] = useState<string[]>(() =>
    categories[0] ? [categories[0].id] : []
  );
  const [uncontrolledLocationIds, setUncontrolledLocationIds] = useState<string[]>(() =>
    locations[0] ? [locations[0].id] : []
  );
  const [uncontrolledPriceRange, setUncontrolledPriceRange] = useState({
    min: PRICE_MIN,
    max: PRICE_MAX,
  });

  const selectedCategoryIds = controlledCategoryIds ?? uncontrolledCategoryIds;
  const selectedLocationIds = controlledLocationIds ?? uncontrolledLocationIds;

  const priceRange = controlledPriceRange ?? uncontrolledPriceRange;
  const setPriceRange = onPriceRangeChange ?? setUncontrolledPriceRange;

  const toggleSelected = (ids: string[], id: string) =>
    ids.includes(id) ? ids.filter((entry) => entry !== id) : [...ids, id];

  const toggleCategory = (id: string) => {
    if (onToggleCategory) return onToggleCategory(id);
    setUncontrolledCategoryIds((prev) => toggleSelected(prev, id));
  };

  const toggleLocation = (id: string) => {
    if (onToggleLocation) return onToggleLocation(id);
    setUncontrolledLocationIds((prev) => toggleSelected(prev, id));
  };

  const handleRangeInput =
    (key: "min" | "max") => (event: ChangeEvent<HTMLInputElement>) => {
    const numeric = Number(event.target.value);
    if (Number.isNaN(numeric)) return;
    setPriceRange((prev) => {
      if (key === "min") {
        const nextMin = Math.min(Math.max(numeric, PRICE_MIN), prev.max);
        return { ...prev, min: nextMin };
      }
      const nextMax = Math.max(Math.min(numeric, PRICE_MAX), prev.min);
      return { ...prev, max: nextMax };
    });
  };

  const handleResetPrice = () => {
    if (onResetPrice) {
      onResetPrice();
      return;
    }
    setUncontrolledPriceRange({ min: PRICE_MIN, max: PRICE_MAX });
  };

  const handleResetLocations = () => {
    if (!onToggleLocation) return;
    for (const locationId of controlledLocationIds ?? []) {
      onToggleLocation(locationId);
    }
  };

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
      return;
    }

    setUncontrolledCategoryIds([]);
    setUncontrolledLocationIds([]);
    setUncontrolledPriceRange({ min: PRICE_MIN, max: PRICE_MAX });
  };

  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return resolvedCategories;
    return resolvedCategories.filter((item) => item.label.toLowerCase().includes(q));
  }, [categorySearch, resolvedCategories]);

  const filteredLocations = useMemo(() => {
    const q = locationSearch.trim().toLowerCase();
    if (!q) return resolvedLocations;
    return resolvedLocations.filter((item) => item.label.toLowerCase().includes(q));
  }, [locationSearch, resolvedLocations]);

  const { data: welcomeCoupons = [] } = useGetWelcomeCouponsQuery({ limit: 1 });
  const welcomeCoupon = welcomeCoupons[0];
  const couponCode = welcomeCoupon?.code ?? "NEW1000";
  const couponLabel = welcomeCoupon ? formatWelcomeCouponLabel(welcomeCoupon) : "₹1000 off first booking";

  return (
    <aside className="hidden w-84 flex-col gap-6 rounded-lg bg-white p-5 shadow-lg shadow-slate-900/5 backdrop-blur lg:flex">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={filterIcon} alt="Filters" className="h-5 w-5" />
          <p className="text-[18px] font-semibold text-[#0F172A]">Filters</p>
        </div>
        <button
          type="button"
          className="text-[12px] font-medium tracking-wide text-[#3289FF]"
          onClick={handleClearAll}
        >
          Clear all
        </button>
      </div>

      <div className="space-y-3">
        <div className="overflow-hidden border border-slate-200 bg-slate-100">
          <img
            src={mapImage}
            alt="Map preview"
            className="h-33.25 w-80 object-cover"
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          {highlightFilters.map((filter) => (
            <span
              key={filter.label}
              className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold text-slate-600 shadow-sm"
              onClick={
                filter.label === "4.5" && onToggleRatingMin ? () => onToggleRatingMin() : undefined
              }
              role={filter.label === "4.5" ? "button" : undefined}
              aria-pressed={filter.label === "4.5" ? ratingMin === 4.5 : undefined}
            >
              {filter.icon}
              {filter.label}
            </span>
          ))}
        </div>
      </div>

      <div
        className="relative px-4 py-3 bg-cover bg-center w-67.25 h-24.25"
        style={{ backgroundImage: `url(${couponImage})` }}
      >
        <div className="mt-3 flex items-center gap-5">
          <div className="flex flex-col text-xs text-slate-500">
            <span>Use code</span>
            <span className="font-semibold text-sky-500">{couponCode}</span>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <div className="text-[13px] font-semibold text-nowrap text-slate-900">
              {couponLabel}
            </div>
            <button
              type="button"
              className="rounded-full bg-blue-500 px-5 py-1 text-sm font-semibold text-white transition hover:bg-blue-600 w-21 h-8"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.24)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[16px] font-bold text-[#333333]">Category</p>
          </div>
        </div>

        <div className="relative mt-4 w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search category"
            value={categorySearch}
            onChange={(event) => setCategorySearch(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-600 placeholder:text-slate-400 shadow-sm focus:border-slate-400 focus:outline-none"
          />
        </div>

        <div className="mt-4 max-h-56 overflow-y-auto rounded-[22px] bg-slate-50 p-3">
          <div className="flex flex-col gap-2">
            {filteredCategories.map((category) => {
              const isSelected = selectedCategoryIds.includes(category.id);
              const initials = category.label
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() ?? "")
                .join("");

              return (
                <label
                  key={category.id}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-sm font-medium text-slate-900 transition ${
                    isSelected
                      ? "border-blue-200 bg-white shadow-sm"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCategory(category.id)}
                    className="sr-only"
                    aria-label={`Filter by ${category.label}`}
                  />
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-50 text-[10px] font-bold text-slate-700">
                      {initials || "C"}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-slate-900">{category.label}</span>
                      <span className="block text-xs text-slate-500">{category.count} places</span>
                    </span>
                  </div>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                      isSelected
                        ? "border-[#5b4cf0] bg-[#5b4cf0]"
                        : "border-[#cfd6ff] bg-white"
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.24)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[16px] font-bold text-[#333333]">Location</p>
            <p className="mt-1 text-xs text-slate-500">Select the areas you want to browse.</p>
          </div>
          <button
            type="button"
            onClick={handleResetLocations}
            className="text-sm font-medium text-slate-400 transition hover:text-slate-600"
          >
            Reset
          </button>
        </div>

        <div className="relative mt-4 w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search location"
            value={locationSearch}
            onChange={(event) => setLocationSearch(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-600 placeholder:text-slate-400 shadow-sm focus:border-slate-400 focus:outline-none"
          />
        </div>

        <div className="mt-4 max-h-56 overflow-y-auto rounded-[22px] bg-slate-50 p-3">
          <div className="flex flex-col gap-2">
            {filteredLocations.map((location) => {
              const isSelected = selectedLocationIds.includes(location.id);
              const initials = location.label
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() ?? "")
                .join("");

              return (
                <label
                  key={location.id}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-sm font-medium text-slate-900 transition ${
                    isSelected
                      ? "border-blue-200 bg-white shadow-sm"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleLocation(location.id)}
                    className="sr-only"
                    aria-label={`Filter by ${location.label}`}
                  />
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-50 text-[10px] font-bold text-slate-700">
                      {initials || "L"}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-slate-900">{location.label}</span>
                      <span className="block text-xs text-slate-500">{location.count} places</span>
                    </span>
                  </div>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                      isSelected
                        ? "border-[#5b4cf0] bg-[#5b4cf0]"
                        : "border-[#cfd6ff] bg-white"
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-100 bg-white p-4 ">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[16px] font-bold text-[#333333]">Price range</p>
            <p className="mt-1 text-xs text-slate-500">
              The average price is SDK {formatPriceBadge(Math.round((priceRange.min + priceRange.max) / 2))}
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetPrice}
            className="text-sm font-medium text-slate-400 transition hover:text-slate-600"
          >
            Reset
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <div className="relative h-2">
            <div className="absolute inset-0 h-2 rounded-full bg-slate-200" />
            <div
              className="absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-[#2d6bff] to-[#6f7cff]"
              style={{
                width: `${(priceRange.max / PRICE_MAX) * 100}%`,
              }}
            />
            <div
              className="absolute -top-10 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#2d6bff] text-center text-[11px] font-bold leading-none text-white"
              style={{
                left: `calc(${(priceRange.max / PRICE_MAX) * 100}% - 1.5rem)`,
              }}
            >
              <span className="block">
                SDK
                <br />
                {formatPriceBadge(priceRange.max)}
              </span>
            </div>
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              value={priceRange.max}
              onChange={handleRangeInput("max")}
              className="absolute inset-0 h-full w-full appearance-none bg-transparent"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                SDK
              </span>
              <input
                type="number"
                min={PRICE_MIN}
                max={priceRange.max}
                value={priceRange.min}
                onChange={handleRangeInput("min")}
                className="w-full border-none bg-transparent p-0 text-[15px] font-semibold text-slate-900 focus:outline-none"
              />
            </div>
            <span className="text-slate-400">-</span>
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                SDK
              </span>
              <input
                type="number"
                min={priceRange.min}
                max={PRICE_MAX}
                value={priceRange.max}
                onChange={handleRangeInput("max")}
                className="w-full border-none bg-transparent p-0 text-[15px] font-semibold text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onApplyPrice}
            className="w-full rounded-2xl bg-[#1D76FF] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Apply price filter
          </button>
        </div>
      </div>
    </aside>
  );
}
