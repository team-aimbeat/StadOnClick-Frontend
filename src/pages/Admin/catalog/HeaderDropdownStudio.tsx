import { useEffect, useMemo, useState } from "react";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";

import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Button } from "@/components/ui/button";
import {
  defaultHeaderDropdownContent,
  normalizeHeaderDropdownContent,
  type HeaderDropdownContent,
} from "@/lib/headerDropdownContent";
import {
  useGetMasterCategoriesQuery,
  useLazyGetServiceCategoriesByMasterQuery,
  type ServiceCategory,
} from "@/services/serviceCategoriesApi";

export default function HeaderDropdownStudio() {
  const [isSaving, setIsSaving] = useState(false);
  const [fullPayload, setFullPayload] = useState<Record<string, unknown>>({});
  const [dropdown, setDropdown] = useState<HeaderDropdownContent>(defaultHeaderDropdownContent);
  const [subCategoryCache, setSubCategoryCache] = useState<Record<string, ServiceCategory[]>>({});
  const [loadingBySlug, setLoadingBySlug] = useState<Record<string, boolean>>({});
  const { data: masterCategories = [] } = useGetMasterCategoriesQuery();
  const [fetchCategoriesForMaster] = useLazyGetServiceCategoriesByMasterQuery();
  const enabledCardCount = useMemo(
    () => dropdown.cards.filter((card) => card.showSubcategories).length,
    [dropdown.cards],
  );

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
        if (!baseUrl) return;

        const cmsResponse = await fetch(`${baseUrl}/pages/home`, { credentials: "include" });
        if (cmsResponse.ok) {
          const payload = (await cmsResponse.json()) as Record<string, unknown>;
          if (ignore) return;
          setFullPayload(payload);
          if (payload.headerDropdown) {
            setDropdown(normalizeHeaderDropdownContent(payload.headerDropdown));
          } else {
            const legacyResponse = await fetch(`${baseUrl}/home-content`, { credentials: "include" });
            if (legacyResponse.ok) {
              const legacyPayload = (await legacyResponse.json()) as Record<string, unknown>;
              setDropdown(normalizeHeaderDropdownContent(legacyPayload.headerDropdown));
            } else {
              setDropdown(normalizeHeaderDropdownContent(undefined));
            }
          }
          return;
        }

        const legacyResponse = await fetch(`${baseUrl}/home-content`, { credentials: "include" });
        if (!legacyResponse.ok) return;
        const payload = (await legacyResponse.json()) as Record<string, unknown>;
        if (ignore) return;
        setFullPayload(payload);
        setDropdown(normalizeHeaderDropdownContent(payload.headerDropdown));
      } catch {
        // keep defaults
      }
    };
    void load();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    dropdown.cards.forEach((card) => {
      const master = masterCategories.find((item) => item.slug === card.slug);
      if (!master) return;
      if (subCategoryCache[card.slug] || loadingBySlug[card.slug]) return;

      setLoadingBySlug((prev) => ({ ...prev, [card.slug]: true }));
      fetchCategoriesForMaster(master.id)
        .unwrap()
        .then((result) => {
          setSubCategoryCache((prev) => ({ ...prev, [card.slug]: result as ServiceCategory[] }));
        })
        .catch(() => {
          setSubCategoryCache((prev) => ({ ...prev, [card.slug]: [] }));
        })
        .finally(() => {
          setLoadingBySlug((prev) => ({ ...prev, [card.slug]: false }));
        });
    });
  }, [dropdown.cards, fetchCategoriesForMaster, loadingBySlug, masterCategories, subCategoryCache]);

  const save = async () => {
    try {
      setIsSaving(true);
      const payload = { ...fullPayload, headerDropdown: dropdown };
      const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
      if (!baseUrl) {
        toast.error("Missing VITE_API_URL");
        return;
      }
      const response = await fetch(`${baseUrl}/admin/home-content`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(errorPayload?.message || `Save failed (${response.status})`);
      }
      setFullPayload(payload);
      toast.success("Header dropdown content saved");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save header dropdown content");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <TitleBreadCrumbs title="Header Dropdown Studio" breadCrumbTitle="Admin / Layout Studio / Header Dropdown" />

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Mega Menu Cards</h2>
            <p className="text-xs text-slate-500">Edit badge, title, CTA, image, and per-subcategory visibility.</p>
          </div>
          <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {enabledCardCount}/{dropdown.cards.length} cards showing subcategories
          </p>
        </div>

        <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-4">
          {dropdown.cards.map((card, index) => (
            <div key={card.slug} className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">{card.slug}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">Card {index + 1}</span>
              </div>
              <div className="mb-1.5 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                <img src={card.image || undefined} alt={card.slug} className="aspect-[16/9] w-full object-cover" />
              </div>
              <div className="grid gap-1.5">
                <label className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
                  <span className="text-[11px] font-medium text-slate-700">Show subcategories</span>
                  <button
                    type="button"
                    onClick={() =>
                      setDropdown((prev) => {
                        const next = [...prev.cards];
                        next[index] = { ...next[index], showSubcategories: !next[index].showSubcategories };
                        return { ...prev, cards: next };
                      })
                    }
                    className={`inline-flex h-6 min-w-[54px] items-center justify-center rounded-full px-2 text-[11px] font-semibold transition ${
                      card.showSubcategories
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {card.showSubcategories ? "Enabled" : "Hidden"}
                  </button>
                </label>
                <label className="space-y-0.5">
                  <span className="text-[11px] font-medium text-slate-600">Badge</span>
                  <input
                    value={card.badge}
                    onChange={(event) =>
                      setDropdown((prev) => {
                        const next = [...prev.cards];
                        next[index] = { ...next[index], badge: event.target.value };
                        return { ...prev, cards: next };
                      })
                    }
                    className="h-7 w-full rounded-md border border-slate-300 bg-white px-2 text-[11px]"
                  />
                </label>
                <label className="space-y-0.5">
                  <span className="text-[11px] font-medium text-slate-600">Title</span>
                  <input
                    value={card.title}
                    onChange={(event) =>
                      setDropdown((prev) => {
                        const next = [...prev.cards];
                        next[index] = { ...next[index], title: event.target.value };
                        return { ...prev, cards: next };
                      })
                    }
                    className="h-7 w-full rounded-md border border-slate-300 bg-white px-2 text-[11px]"
                  />
                </label>
                <label className="space-y-0.5">
                  <span className="text-[11px] font-medium text-slate-600">CTA Label</span>
                  <input
                    value={card.ctaLabel}
                    onChange={(event) =>
                      setDropdown((prev) => {
                        const next = [...prev.cards];
                        next[index] = { ...next[index], ctaLabel: event.target.value };
                        return { ...prev, cards: next };
                      })
                    }
                    className="h-7 w-full rounded-md border border-slate-300 bg-white px-2 text-[11px]"
                  />
                </label>
                <label className="space-y-0.5">
                  <span className="text-[11px] font-medium text-slate-600">CTA Href</span>
                  <input
                    value={card.ctaHref}
                    onChange={(event) =>
                      setDropdown((prev) => {
                        const next = [...prev.cards];
                        next[index] = { ...next[index], ctaHref: event.target.value };
                        return { ...prev, cards: next };
                      })
                    }
                    className="h-7 w-full rounded-md border border-slate-300 bg-white px-2 text-[11px]"
                  />
                </label>
                <label className="space-y-0.5">
                  <span className="text-[11px] font-medium text-slate-600">Image URL</span>
                  <input
                    value={card.image}
                    onChange={(event) =>
                      setDropdown((prev) => {
                        const next = [...prev.cards];
                        next[index] = { ...next[index], image: event.target.value };
                        return { ...prev, cards: next };
                      })
                    }
                    className="h-7 w-full rounded-md border border-slate-300 bg-white px-2 text-[11px]"
                    placeholder="https://..."
                  />
                </label>
                <label className="inline-flex h-7 cursor-pointer items-center justify-center rounded-md border border-dashed border-slate-400 bg-slate-50 px-2 text-[11px] font-medium text-slate-700 transition hover:border-slate-500 hover:bg-slate-100">
                  <Upload className="mr-1 h-3.5 w-3.5" />
                  Upload image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result !== "string") return;
                        setDropdown((prev) => {
                          const next = [...prev.cards];
                          next[index] = { ...next[index], image: reader.result as string };
                          return { ...prev, cards: next };
                        });
                      };
                      reader.readAsDataURL(file);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-1.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-700">Subcategory Visibility</p>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {(subCategoryCache[card.slug] ?? []).length}
                    </span>
                  </div>
                  {loadingBySlug[card.slug] ? (
                    <p className="text-[11px] text-slate-500">Loading subcategories...</p>
                  ) : subCategoryCache[card.slug]?.length ? (
                    <div className="max-h-32 space-y-1 overflow-auto">
                      {subCategoryCache[card.slug].map((sub) => {
                        const isHidden = card.hiddenSubcategorySlugs.includes(sub.slug);
                        return (
                          <div key={`${card.slug}-${sub.slug}`} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-2 py-1">
                            <span className="truncate text-[11px] text-slate-700">{sub.name}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setDropdown((prev) => {
                                  const next = [...prev.cards];
                                  const hiddenSet = new Set(next[index].hiddenSubcategorySlugs);
                                  if (hiddenSet.has(sub.slug)) {
                                    hiddenSet.delete(sub.slug);
                                  } else {
                                    hiddenSet.add(sub.slug);
                                  }
                                  next[index] = {
                                    ...next[index],
                                    hiddenSubcategorySlugs: Array.from(hiddenSet),
                                  };
                                  return { ...prev, cards: next };
                                })
                              }
                              className={`inline-flex h-6 min-w-[64px] items-center justify-center rounded-full px-2 text-[11px] font-semibold transition ${
                                isHidden ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {isHidden ? "Hidden" : "Enabled"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No subcategories found for this category.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-md backdrop-blur">
        <p className="text-xs text-slate-500">Save to apply dropdown visibility and card content updates.</p>
        <Button onClick={save} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save dropdown changes"}
        </Button>
      </section>
    </div>
  );
}

