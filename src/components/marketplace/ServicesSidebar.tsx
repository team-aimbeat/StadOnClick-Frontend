import { BriefcaseBusiness, CarFront, Check, HeartPulse, MapPin, Navigation, Percent, Search, Star, Utensils, Zap } from "lucide-react";
import { useMemo, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import filterIcon from "@/assets/icons/Filter.svg";
import mapImage from "@/assets/Images/map.png";
import couponImage from "@/assets/Images/coupon2.png";
import { useGetWelcomeCouponsQuery, type WelcomeCoupon } from "@/services/welcomeCouponsApi";

const highlightFilters = [
  { label: "4.5", icon: <Star className="h-3 w-3 text-amber-500" /> },
  { label: "Offer", icon: <Percent className="h-3 w-3" /> },
  { label: "Nearby", icon: <Navigation className="h-3 w-3" /> },
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

const categoryCardMeta: Record<
  string,
  { subtitle: string; icon: typeof BriefcaseBusiness }
> = {
  "service test": { subtitle: "42 Services available", icon: BriefcaseBusiness },
  "driving classes": { subtitle: "Top rated instructors", icon: CarFront },
  "eateries & hotspots": { subtitle: "Local culinary gems", icon: Utensils },
  "health & wellness": { subtitle: "Professional care", icon: HeartPulse },
  "home utilities": { subtitle: "Maintenance & repair", icon: Zap },
};

const locationCardMeta: Record<
  string,
  { subtitle: string; icon: typeof MapPin }
> = {
  stockholms: { subtitle: "Popular city center venues", icon: MapPin },
  gothenburg: { subtitle: "Coastal service providers", icon: MapPin },
  malmo: { subtitle: "Fast-growing local options", icon: MapPin },
  kalmar: { subtitle: "Trusted neighborhood picks", icon: MapPin },
  uppsala: { subtitle: "Top-rated nearby services", icon: MapPin },
};

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
  const formatPricePill = (value: number) => `$${value}`;

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
        <div className="relative overflow-hidden h-45 rounded-[20px] border border-slate-200 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.55)]">
          <img
            src={mapImage}
            alt="Map preview"
            className="h-32 w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,58,39,0.88)_0%,rgba(52,84,55,0.62)_48%,rgba(108,146,96,0.34)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(15,23,42,0.08))]" />

          <div className="absolute inset-0 h-25 flex items-center justify-between px-4">
            <div className="max-w-[11rem] text-white">
              
              <p className="text-[20px] font-semibold leading-tight">Explore on Map</p>
              <p className="mt-1 text-xs text-white/75">Find services in your neighborhood</p>
            </div>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/92 text-[#4f67ff] shadow-[0_14px_30px_-20px_rgba(15,23,42,0.6)] backdrop-blur-sm"
              aria-label="Use map"
            >
              <MapPin className="h-4 w-4" />
            </button>
          </div>

          <div className="absolute bottom-3 left-4 right-4">
            <button
              type="button"
              className="w-full rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#4f67ff] shadow-[0_12px_24px_-20px_rgba(15,23,42,0.8)]"
            >
              Explore on Map
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {highlightFilters.map((filter) => (
            <span
              key={filter.label}
              className={`flex items-center justify-center gap-1.5 rounded-full border px-2 py-2 text-[11px] font-semibold shadow-sm transition ${
                filter.label === "4.5"
                  ? ratingMin === 4.5
                    ? "border-[#3457f6] bg-[#3457f6] text-white shadow-[0_10px_24px_-18px_rgba(52,87,246,0.85)]"
                    : "border-[#d8defd] bg-white text-[#3457f6]"
                  : "border-[#d9e0ee] bg-white text-[#6f7f99] shadow-[0_8px_18px_-18px_rgba(15,23,42,0.3)]"
              }`}
              onClick={
                filter.label === "4.5" && onToggleRatingMin ? () => onToggleRatingMin() : undefined
              }
              role={filter.label === "4.5" ? "button" : undefined}
              aria-pressed={filter.label === "4.5" ? ratingMin === 4.5 : undefined}
            >
              {filter.icon}
              {filter.label === "4.5" ? "4.5+ Rating" : filter.label === "Offer" ? "% Offer" : "Nearby"}
            </span>
          ))}
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
              const categoryKey = category.label.trim().toLowerCase();
              const meta = categoryCardMeta[categoryKey];
              const Icon = meta?.icon ?? BriefcaseBusiness;
              const subtitle =
                meta?.subtitle ?? `${category.count} services available`;

              return (
                <label
                  key={category.id}
                  className={`flex items-center justify-between gap-3 rounded-[20px] border px-4 py-3.5 text-sm transition ${
                    isSelected
                      ? "border-[#9db2ff] bg-[#f7f9ff] "
                      : "border-transparent bg-[#f6f7ff] hover:border-[#dde3ff]"
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
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isSelected ? "bg-[#4F7DFF]  text-white" : "bg-[#e7e9f7] text-slate-700"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-semibold text-slate-900">
                        {category.label}
                      </span>
                      <span className="block text-xs text-slate-500">{subtitle}</span>
                    </span>
                  </div>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                      isSelected
                        ? "border-[#4F7DFF]  bg-[#4F7DFF] "
                        : "border-[#cfd6ff] bg-transparent"
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
              const locationKey = location.label.trim().toLowerCase();
              const meta = locationCardMeta[locationKey];
              const Icon = meta?.icon ?? MapPin;
              const subtitle =
                meta?.subtitle ?? `${location.count} services available`;

              return (
                <label
                  key={location.id}
                  className={`flex items-center justify-between gap-3 rounded-[20px] border px-4 py-3.5 text-sm transition ${
                    isSelected
                      ? "border-[#4F7DFF]  bg-[#f7f9ff] "
                      : "border-transparent bg-[#f6f7ff] hover:border-[#dde3ff]"
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
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isSelected ? "bg-[#4F7DFF]  text-white" : "bg-[#e7e9f7] text-slate-700"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-semibold text-slate-900">
                        {location.label}
                      </span>
                      <span className="block text-xs text-slate-500">{subtitle}</span>
                    </span>
                  </div>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                      isSelected
                        ? "border-[#4F7DFF]  bg-[#4F7DFF] "
                        : "border-[#cfd6ff] bg-transparent"
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
              The average price is ${Math.round((priceRange.min + priceRange.max) / 2)}
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
          <div className="relative overflow-hidden rounded-[22px] bg-[#f7f5ff] px-3 pb-5 pt-4">
            <svg viewBox="0 0 260 92" className="pointer-events-none absolute inset-x-3 bottom-8 h-20 w-[calc(100%-1.5rem)]" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="price-hill-gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#b7abff" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#b7abff" stopOpacity="0.18" />
                </linearGradient>
              </defs>
              <path
                d="M0 76 L15 72 L30 78 L45 61 L60 68 L75 48 L90 58 L105 26 L120 44 L135 18 L150 55 L165 35 L180 65 L195 49 L210 72 L225 63 L240 76 L260 76 L260 92 L0 92 Z"
                fill="url(#price-hill-gradient)"
              />
            </svg>

            <div
              className="absolute bottom-[4.3rem] z-10 -translate-x-1/2 rounded-full bg-[#171717] px-3 py-1 text-xs font-semibold text-white shadow-lg"
              style={{ left: `${12 + (priceRange.min / PRICE_MAX) * 236}px` }}
            >
              {formatPricePill(priceRange.min)}
            </div>
            <div
              className="absolute bottom-[4.3rem] z-10 -translate-x-1/2 rounded-full bg-[#171717] px-3 py-1 text-xs font-semibold text-white shadow-lg"
              style={{ left: `${12 + (priceRange.max / PRICE_MAX) * 236}px` }}
            >
              {formatPricePill(priceRange.max)}
            </div>

            <div className="relative mt-16 h-2">
              <div className="absolute inset-0 h-2 rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]" />
              <div
                className="absolute top-0 h-2 rounded-full bg-gradient-to-r from-[#8c79ff] to-[#6f5cff]"
                style={{
                  left: `${(priceRange.min / PRICE_MAX) * 100}%`,
                  width: `${((priceRange.max - priceRange.min) / PRICE_MAX) * 100}%`,
                }}
              />
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#705cff] bg-white"
                style={{ left: `${(priceRange.min / PRICE_MAX) * 100}%` }}
              />
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#705cff] bg-white"
                style={{ left: `${(priceRange.max / PRICE_MAX) * 100}%` }}
              />
            </div>

            <input
              type="range"
              min={PRICE_MIN}
              max={priceRange.max}
              value={priceRange.min}
              onChange={handleRangeInput("min")}
              className="absolute bottom-5 left-3 h-2 w-[calc(100%-1.5rem)] appearance-none bg-transparent opacity-0"
            />
            <input
              type="range"
              min={priceRange.min}
              max={PRICE_MAX}
              value={priceRange.max}
              onChange={handleRangeInput("max")}
              className="absolute bottom-5 left-3 h-2 w-[calc(100%-1.5rem)] appearance-none bg-transparent opacity-0"
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
