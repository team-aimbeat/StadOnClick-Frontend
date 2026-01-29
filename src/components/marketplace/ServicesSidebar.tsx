import { Check, Search, Star } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import filterIcon from "@/assets/icons/filter.svg";
import mapImage from "@/assets/Images/map.png";
import couponImage from "@/assets/Images/coupon2.png";

const highlightFilters = [
  { label: "4.5", icon: <Star className="h-3 w-3 text-amber-500" /> },
  { label: "Offer" },
  { label: "Nearby" },
];
const categories = [
  { label: "Hair & salon", count: 23 },
  { label: "Spa & wellness", count: 18 },
  { label: "Fitness", count: 14 },
  { label: "Events", count: 12 },
  { label: "Vacation", count: 9 },
];

const locations = [
  { label: "Stockholms", count: 23 },
  { label: "Gothenburg", count: 18 },
  { label: "Malmo", count: 14 },
  { label: "Kalmar", count: 12 },
  { label: "Uppsala", count: 9 },
];

export default function ServicesSidebar() {
  const PRICE_MIN = 0;
  const PRICE_MAX = 500;

  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Hair & salon",
  ]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    "Stockholms",
  ]);
  const [priceRange, setPriceRange] = useState({
    min: PRICE_MIN,
    max: PRICE_MAX,
  });

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label)
        ? prev.filter((category) => category !== label)
        : [...prev, label]
    );
  };

  const toggleLocation = (label: string) => {
    setSelectedLocations((prev) =>
      prev.includes(label)
        ? prev.filter((location) => location !== label)
        : [...prev, label]
    );
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
    setPriceRange({ min: PRICE_MIN, max: PRICE_MAX });
  };

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
            <span className="font-semibold text-sky-500">NEW1000</span>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <div className="text-[13px] font-semibold text-nowrap text-slate-900">
              ₹1000 off first booking
            </div>
            <button
              type="button"
              className="rounded-full bg-blue-500 px-5 py-1 text-sm font-semibold text-white transition hover:bg-blue-600 w-[84px] h-[32px]"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[16px] font-medium text-[#333333]">Category</p>
        </div>

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search category"
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-600 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          />
        </div>

        <div className="rounded-xl bg-[#F9F9F9] p-3">
          <div className="flex flex-col max-h-[210px] gap-2 overflow-y-auto">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category.label);
              return (
                <label
                  key={category.label}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm font-medium text-slate-900 transition ${
                    isSelected
                      ? "border-sky-200 bg-white shadow-sm"
                      : "border-transparent hover:border-slate-300 bg-transparent"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCategory(category.label)}
                    className="sr-only"
                    aria-label={`Filter by ${category.label}`}
                  />
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-sm border text-white transition ${
                        isSelected
                          ? "border-transparent bg-sky-500"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </span>
                    <span className="text-slate-900">
                      {category.label}{" "}
                      <span className="text-slate-500">
                        ({category.count})
                      </span>
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4 ">
        <div className="flex items-center justify-between">
          <p className="text-[16px] font-medium text-[#333333]">Location</p>
        </div>

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search location"
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-600 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          />
        </div>

        <div className="rounded-xl bg-[#F9F9F9] p-3">
          <div className="flex flex-col max-h-[210px] gap-2 overflow-y-auto">
            {locations.map((location) => {
              const isSelected = selectedLocations.includes(location.label);
              return (
                <label
                  key={location.label}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm font-medium text-slate-900 transition ${
                    isSelected
                      ? "border-sky-200 bg-white shadow-sm"
                      : "border-transparent hover:border-slate-300 bg-transparent"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleLocation(location.label)}
                    className="sr-only"
                    aria-label={`Filter by ${location.label}`}
                  />
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-sm border text-white transition ${
                        isSelected
                          ? "border-transparent bg-sky-500"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </span>
                    <span className="text-slate-900">
                      {location.label}{" "}
                      <span className="text-slate-500">
                        ({location.count})
                      </span>
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 ">
        <div className="flex items-center justify-between">
          <p className="text-[16px] font-medium text-[#333333]">Price range</p>
        </div>

        <div className="space-y-4">
          <div className="relative h-2">
            <div className="absolute inset-0 h-2 rounded-full bg-slate-200" />
            <div
              className="absolute left-0 top-0 h-2 rounded-full bg-[#1D76FF]"
              style={{
                width: `${(priceRange.max / PRICE_MAX) * 100}%`,
              }}
            />
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              value={priceRange.max}
              onChange={handleRangeInput("max")}
              className="absolute inset-0 h-full w-full appearance-none bg-transparent"
            />
            <div
              className="pointer-events-none absolute -top-8 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white shadow-lg"
              style={{
                left: `calc(${(priceRange.max / PRICE_MAX) * 100}% - 1.5rem)`,
              }}
            >
              SDK{priceRange.max}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <span className="text-xs font-semibold uppercase text-slate-400">
                SDK
              </span>
              <input
                type="number"
                min={PRICE_MIN}
                max={priceRange.max}
                value={priceRange.min}
                onChange={handleRangeInput("min")}
                className="w-full border-none p-0 text-sm font-semibold text-slate-900 focus:outline-none"
              />
            </div>
            <span className="text-sm text-slate-400">-</span>
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <span className="text-xs font-semibold uppercase text-slate-400">
                SDK
              </span>
              <input
                type="number"
                min={priceRange.min}
                max={PRICE_MAX}
                value={priceRange.max}
                onChange={handleRangeInput("max")}
                className="w-full border-none p-0 text-sm font-semibold text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <button className="w-full rounded-xl w-[277px] h-[36px] bg-[#1D76FF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600">
              Apply
            </button>
            <button
              type="button"
              className="w-full rounded-xl w-[277px] h-[36px] border border-slate-300 px-4 py-2 text-sm font-semibold text-[#1D76FF] transition hover:bg-slate-100"
              onClick={handleResetPrice}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
