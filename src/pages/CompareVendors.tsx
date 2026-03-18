import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, Plus, Search, Sparkles, X } from "lucide-react";

import { VendorComparisonTable } from "@/components/vendorComparison/VendorComparisonTable";
import { useCompareVendorsQuery, useListVendorsQuery } from "@/services/vendorComparisonApi";

const parseIds = (search: string) => {
  const params = new URLSearchParams(search);
  const ids = params.get("ids");
  if (!ids) return [];
  return ids
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 4);
};

export default function CompareVendors() {
  const location = useLocation();
  const navigate = useNavigate();
  const [inputId, setInputId] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ids, setIds] = useState<string[]>(() => parseIds(location.search));

  useEffect(() => {
    const parsed = parseIds(location.search);
    // Normalize URL if it contained >4 ids
    const params = new URLSearchParams(location.search);
    if (params.get("ids")) {
      const normalized = parsed.join(",");
      if (params.get("ids") !== normalized) {
        params.set("ids", normalized);
        navigate(`/compare?${params.toString()}`, { replace: true });
        return;
      }
    }
    setIds(parsed);
  }, [location.search, navigate]);

  const { data, isLoading, isError, error, refetch } = useCompareVendorsQuery({ ids }, { skip: !ids.length });
  const vendorList = useListVendorsQuery();
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const quickPicks = useMemo(() => (vendorList.data?.data ?? []).slice(0, 6), [vendorList.data?.data]);

  // close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!dropdownOpen) return;
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const vendors = data?.data ?? [];
  const vendorOptions = useMemo(() => {
    const all = vendorList.data?.data ?? [];
    const filtered = all.filter(
      (v) =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.category.toLowerCase().includes(search.toLowerCase()) ||
        v.id.toLowerCase().includes(search.toLowerCase())
    );
    return (search ? filtered : all).slice(0, 20); // show a small curated list when empty search
  }, [vendorList.data?.data, search]);

  const addId = () => {
    const trimmed = inputId.trim();
    if (!trimmed) return;

    const resolvedId =
      selectedId ??
      vendorOptions.find((v) => v.name.toLowerCase() === trimmed.toLowerCase())?.id;

    if (!resolvedId) return;
    if (ids.includes(resolvedId)) {
      setInputId("");
      setSelectedId(null);
      return;
    }

    const next = [...ids, resolvedId].slice(0, 4);
    const params = new URLSearchParams(location.search);
    params.set("ids", next.join(","));
    navigate(`/compare?${params.toString()}`, { replace: true });
    setInputId("");
    setSearch("");
    setDropdownOpen(true);
    setSelectedId(null);
    refetch();
  };

  const selectVendor = (id: string, name: string) => {
    setInputId(name);
    setSelectedId(id);
    setSearch("");
    setDropdownOpen(true);
  };

  const removeId = (id: string) => {
    const next = ids.filter((x) => x !== id);
    const params = new URLSearchParams(location.search);
    if (next.length) {
      params.set("ids", next.join(","));
    } else {
      params.delete("ids");
    }
    navigate(`/compare?${params.toString()}`, { replace: true });
  };

  const handleBack = () => {
    // Go back if possible, otherwise fall back to home
    if (window.history.state && typeof window.history.state.idx === "number" && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-[80vh] bg-slate-50 ">
      <div className="relative mx-auto max-w-6xl px-4 py-10 space-y-8">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="pointer-events-none absolute inset-x-10 -top-10 h-48 rounded-[40px] blur-3xl" />
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white ">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full  blur-3xl" />
          <div className="absolute -left-20 -bottom-32 h-64 w-64 rounded-full blur-3xl" />
          <div className="relative grid gap-6 px-8 py-10 md:grid-cols-[1.2fr,0.8fr] md:items-center">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
                <Sparkles className="h-3 w-3" /> Compare
              </p>
              <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Vendor Service Comparison</h1>
              <p className="max-w-xl text-sm text-slate-600">
                Line up to four vendors from the same category, stack their performance, and spot the strongest fit for
                your next launch.
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live traffic & conversions
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-sky-500" /> Ratings + repeat visitors
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 px-5 py-4 text-sm text-emerald-900 shadow-inner">
              <p className="mb-2 flex items-center gap-2 font-semibold">
                Quick Tip
                <Sparkles className="h-4 w-4 text-amber-500" />
              </p>
              <p className="text-sm leading-relaxed">
                Keep all vendors from the same category for the clearest read. You can search by name, category, or ID
                and mix manual IDs with dropdown picks.
              </p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-lg shadow-emerald-50/80 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">Pick your vendors</p>
              <p className="text-xs text-slate-500">Search by name/category or paste the vendor ID. Max 4 vendors.</p>
            </div>
            <div className="hidden items-center gap-2 text-xs font-semibold text-emerald-700 md:flex">
              <Sparkles className="h-4 w-4" />
              Smart suggestions refresh as you type
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-start">
            <div className="relative flex w-full flex-col gap-2 md:max-w-xl" ref={dropdownRef}>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 focus-within:border-emerald-500 focus-within:bg-white">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={inputId}
                  onChange={(e) => {
                    setInputId(e.target.value);
                    setSearch(e.target.value);
                    setDropdownOpen(true);
                    setSelectedId(null);
                  }}
                  onFocus={() => {
                    setDropdownOpen(true);
                    if (!search) setSearch("");
                  }}
                  placeholder="Search vendor name, category, or paste vendor ID"
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              {dropdownOpen && vendorOptions.length > 0 && (
                <div className="absolute top-full z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                  {vendorOptions.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className="flex w-full items-start gap-3 px-3 py-3 text-left transition hover:bg-emerald-50"
                      onClick={() => {
                        selectVendor(v.id, v.name);
                      }}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-sm font-semibold text-emerald-700">
                        {v.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">{v.name}</span>
                        <span className="text-xs text-slate-500">{v.category}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={addId}
              disabled={!inputId.trim() || ids.length >= 4}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lgdisabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
            >
              <Plus className="h-4 w-4" />
              Add vendor (max 4)
            </button>
          </div>

          {quickPicks.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-600">Quick picks:</span>
              {quickPicks.map((v) => (
                <button
                  key={v.id}
                  onClick={() => selectVendor(v.id, v.name)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                  type="button"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {v.name}
                </button>
              ))}
            </div>
          )}

          {ids.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
              {ids.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-emerald-800"
                >
                  {(() => {
                    const fromResult = vendors.find((v) => v.vendorId === id)?.vendorName;
                    const fromList = vendorList.data?.data?.find((v) => v.id === id)?.name;
                    return fromResult ?? fromList ?? "Selected vendor";
                  })()}
                  <button
                    className="rounded-full p-1 text-emerald-700 transition hover:bg-emerald-100"
                    onClick={() => removeId(id)}
                    aria-label={`Remove ${id}`}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            Loading vendors...
          </div>
        )}
        {isError && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {((error as any)?.data?.message as string) ??
              "Unable to load comparison right now. Please ensure max 4 vendors."}
          </div>
        )}
        {!ids.length && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-4 py-5 text-sm text-slate-500">
            Add vendors to compare by entering vendor IDs above.
          </div>
        )}
        {!isLoading && vendors.length > 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white/80 p-4 shadow-xl shadow-emerald-50/60">
            <VendorComparisonTable vendors={vendors} />
          </div>
        )}
      </div>
    </div>
  );
}
