import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Plus, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";

import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Button } from "@/components/ui/button";

type HeroDraft = {
  heading: string;
  subheading: string;
  banners: string[];
  popularChips: Array<{ label: string; slug: string }>;
};

const HOME_PREVIEW_PATH = "/?homePreview=1";
const HERO_BANNER_COUNT = 7;
const EXTRA_SECTION_KEYS = [
  { key: "homeDeal", label: "Deals Section" },
  { key: "homeCategories", label: "Categories Section" },
  { key: "addvertise", label: "Advertise Section" },
  { key: "homeTrending", label: "Trending Section" },
  { key: "homeMind", label: "What's On Mind Section" },
  { key: "homeTravel", label: "Travel Section" },
  { key: "blogs", label: "Blogs Section" },
  { key: "homeSightseeing", label: "Sightseeing Section" },
] as const;

const defaultDraft: HeroDraft = {
  heading: "Discover Services. Book Instantly.",
  subheading: "Beauty | Sports | Events | Hotels | Vacation",
  banners: Array.from({ length: HERO_BANNER_COUNT }, () => ""),
  popularChips: [
    { label: "Spa Deals", slug: "spa-deals" },
    { label: "Weekend Turf", slug: "games-outings" },
    { label: "Wedding Venues", slug: "new-deals" },
    { label: "Resort Stays", slug: "restaurant-deals" },
  ],
};

function normalizeHeroBanners(input: unknown): string[] {
  const raw = Array.isArray(input) ? input.map((item) => String(item || "")) : [];
  const normalized = Array.from({ length: HERO_BANNER_COUNT }, (_, index) => raw[index] ?? "");
  return normalized;
}

function toHeroDraftFromPayload(payload: unknown): Partial<HeroDraft> | null {
  if (!payload || typeof payload !== "object") return null;
  const content = payload as Record<string, unknown>;
  const hero = (content.homeHero && typeof content.homeHero === "object"
    ? (content.homeHero as Record<string, unknown>)
    : null) ??
    (Array.isArray(content.sections)
      ? (((content.sections as Array<Record<string, unknown>>).find((section) => section?.type === "hero")
          ?.data as Record<string, unknown>) ?? null)
      : null);

  if (!hero) return null;
  return {
    heading: typeof hero.heading === "string" ? hero.heading : undefined,
    subheading: typeof hero.subheading === "string" ? hero.subheading : undefined,
    banners: normalizeHeroBanners(hero.banners),
    popularChips: Array.isArray(hero.popularChips)
      ? hero.popularChips
          .map((item) => {
            const chip = item as Record<string, unknown>;
            return {
              label: typeof chip?.label === "string" ? chip.label : "",
              slug: typeof chip?.slug === "string" ? chip.slug : "",
            };
          })
          .filter((chip) => chip.label && chip.slug)
      : undefined,
  };
}

export default function HomeContentStudio() {
  const [draft, setDraft] = useState<HeroDraft>(defaultDraft);
  const [extraSections, setExtraSections] = useState<Record<string, string>>(
    Object.fromEntries(EXTRA_SECTION_KEYS.map((item) => [item.key, "{}"])),
  );
  const [bannerUrl, setBannerUrl] = useState("");
  const [popularLabel, setPopularLabel] = useState("");
  const [popularSlug, setPopularSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const previewTabRef = useRef<Window | null>(null);
  const previewChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel("home-content-preview");
    previewChannelRef.current = channel;
    return () => {
      channel.close();
      previewChannelRef.current = null;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const loadDraft = async () => {
      try {
        const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
        if (!baseUrl) return;

        const cmsResponse = await fetch(`${baseUrl}/pages/home`, { credentials: "include" });
        if (cmsResponse.ok) {
          const cmsPayload = await cmsResponse.json();
          const cmsDraft = toHeroDraftFromPayload(cmsPayload);
          setExtraSections((prev) => {
            const next = { ...prev };
            for (const section of EXTRA_SECTION_KEYS) {
              const value = (cmsPayload as Record<string, unknown>)[section.key];
              next[section.key] = JSON.stringify(value ?? {}, null, 2);
            }
            return next;
          });
          if (!ignore && cmsDraft) {
            setDraft((prev) => ({
              ...prev,
              ...cmsDraft,
              banners: normalizeHeroBanners(cmsDraft.banners),
            }));
            return;
          }
        }

        const legacyResponse = await fetch(`${baseUrl}/home-content`, { credentials: "include" });
        if (!legacyResponse.ok) return;
        const legacyPayload = await legacyResponse.json();
        const legacyDraft = toHeroDraftFromPayload(legacyPayload);
        setExtraSections((prev) => {
          const next = { ...prev };
          for (const section of EXTRA_SECTION_KEYS) {
            const value = (legacyPayload as Record<string, unknown>)[section.key];
            next[section.key] = JSON.stringify(value ?? {}, null, 2);
          }
          return next;
        });
        if (!ignore && legacyDraft) {
          setDraft((prev) => ({
            ...prev,
            ...legacyDraft,
            banners: normalizeHeroBanners(legacyDraft.banners),
          }));
        }
      } catch {
        // Keep defaults when API is not available.
      }
    };

    void loadDraft();
    return () => {
      ignore = true;
    };
  }, []);

  const previewPayload = useMemo(
    () => ({
      homeHero: {
        heading: draft.heading,
        subheading: draft.subheading,
        banners: draft.banners,
        popularChips: draft.popularChips,
      },
    }),
    [draft],
  );

  const pushPreview = (target: Window | null) => {
    if (!target) return;
    (target as any).__HOME_CONTENT_PREVIEW__ = previewPayload;
  };

  const broadcastPreview = () => {
    const message = {
      type: "HOME_CONTENT_PREVIEW",
      payload: previewPayload,
    };
    window.postMessage(message, window.location.origin);
    if (previewTabRef.current && !previewTabRef.current.closed) {
      previewTabRef.current.postMessage(message, window.location.origin);
    }
    previewChannelRef.current?.postMessage(message);
  };

  const openPreview = () => {
    const previewWindow = window.open(HOME_PREVIEW_PATH, "_blank");
    previewTabRef.current = previewWindow;
    if (!previewWindow) return;
    window.setTimeout(() => pushPreview(previewWindow), 120);
    window.setTimeout(() => pushPreview(previewWindow), 420);
  };

  const saveDraft = async () => {
    try {
      setIsSaving(true);
      const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
      if (!baseUrl) {
        toast.error("Missing VITE_API_URL");
        return;
      }

      const parsedSections: Record<string, unknown> = {};
      for (const section of EXTRA_SECTION_KEYS) {
        try {
          parsedSections[section.key] = JSON.parse(extraSections[section.key] || "{}");
        } catch {
          toast.error(`${section.label} JSON is invalid`);
          setIsSaving(false);
          return;
        }
      }

      const payload = {
        ...parsedSections,
        ...previewPayload,
      };

      const response = await fetch(`${baseUrl}/admin/home-content`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(errorPayload?.message || `Save failed (${response.status})`);
      }

      toast.success("Home content saved");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save home content");
    } finally {
      setIsSaving(false);
    }
  };

  const addBannerByUrl = () => {
    const url = bannerUrl.trim();
    if (!url) return;
    setDraft((prev) => {
      const emptyIndex = prev.banners.findIndex((item) => !item.trim());
      if (emptyIndex < 0) {
        toast.error(`All ${HERO_BANNER_COUNT} banner slots are already filled`);
        return prev;
      }
      const next = [...prev.banners];
      next[emptyIndex] = url;
      return { ...prev, banners: next };
    });
    setBannerUrl("");
  };

  const addBannerByFile = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setDraft((prev) => {
        const emptyIndex = prev.banners.findIndex((item) => !item.trim());
        if (emptyIndex < 0) {
          toast.error(`All ${HERO_BANNER_COUNT} banner slots are already filled`);
          return prev;
        }
        const next = [...prev.banners];
        next[emptyIndex] = reader.result as string;
        return { ...prev, banners: next };
      });
    };
    reader.readAsDataURL(file);
  };

  const replaceBannerByFile = (index: number, file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setDraft((prev) => {
        const next = [...prev.banners];
        next[index] = reader.result as string;
        return { ...prev, banners: next };
      });
    };
    reader.readAsDataURL(file);
  };

  const addPopularChip = () => {
    const label = popularLabel.trim();
    const slug = popularSlug.trim();
    if (!label || !slug) return;
    setDraft((prev) => ({
      ...prev,
      popularChips: [...prev.popularChips, { label, slug }],
    }));
    setPopularLabel("");
    setPopularSlug("");
  };

  return (
    <div className="space-y-6">
      <TitleBreadCrumbs title="Home Content Studio" breadCrumbTitle="Admin / Catalog / Home Content" />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-600">
          Edit hero heading, subheading, and background images. Click preview to see changes on home instantly.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Hero Content</h2>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={draft.heading}
            onChange={(event) => setDraft((prev) => ({ ...prev, heading: event.target.value }))}
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm"
            placeholder="Hero heading"
          />
          <input
            value={draft.subheading}
            onChange={(event) => setDraft((prev) => ({ ...prev, subheading: event.target.value }))}
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm"
            placeholder="Hero subheading"
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Background Images</h2>

        <div className="flex flex-wrap gap-2">
          <input
            value={bannerUrl}
            onChange={(event) => setBannerUrl(event.target.value)}
            className="h-10 min-w-[260px] flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm"
            placeholder="Paste banner image URL"
          />
          <Button variant="outline" onClick={addBannerByUrl}>
            <Plus className="mr-2 h-4 w-4" />
            Add URL
          </Button>
          <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-400 bg-white px-3 text-sm font-medium text-slate-700">
            <Upload className="mr-2 h-4 w-4" />
            Upload image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                addBannerByFile(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
          </label>
        </div>

        <div className="space-y-2">
          {draft.banners.map((banner, index) => (
            <div key={`banner-${index}`} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 p-2">
              <img src={banner} alt={`banner-${index + 1}`} className="h-14 w-20 rounded-md object-cover" />
              <p className="min-w-[80px] text-xs font-semibold text-slate-500">Banner {index + 1}/7</p>
              <input
                value={banner}
                onChange={(event) =>
                  setDraft((prev) => {
                    const next = [...prev.banners];
                    next[index] = event.target.value;
                    return { ...prev, banners: next };
                  })
                }
                className="h-9 min-w-[240px] flex-1 rounded-lg border border-slate-300 px-2 text-xs"
              />
              <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-400 bg-white px-2 text-xs font-medium text-slate-700">
                Replace
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    replaceBannerByFile(index, event.target.files?.[0]);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    banners: prev.banners.map((item, i) => (i === index ? "" : item)),
                  }))
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Popular Chips</h2>
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
          <input
            value={popularLabel}
            onChange={(event) => setPopularLabel(event.target.value)}
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm"
            placeholder="Chip label (e.g. Spa Deals)"
          />
          <input
            value={popularSlug}
            onChange={(event) => setPopularSlug(event.target.value)}
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm"
            placeholder="Chip slug (e.g. spa-deals)"
          />
          <Button variant="outline" onClick={addPopularChip}>
            <Plus className="mr-2 h-4 w-4" />
            Add chip
          </Button>
        </div>
        <div className="space-y-2">
          {draft.popularChips.map((chip, index) => (
            <div key={`popular-chip-${index}`} className="grid gap-2 rounded-xl border border-slate-200 p-2 md:grid-cols-[1fr_1fr_auto]">
              <input
                value={chip.label}
                onChange={(event) =>
                  setDraft((prev) => {
                    const next = [...prev.popularChips];
                    next[index] = { ...next[index], label: event.target.value };
                    return { ...prev, popularChips: next };
                  })
                }
                className="h-9 rounded-lg border border-slate-300 px-2 text-xs"
              />
              <input
                value={chip.slug}
                onChange={(event) =>
                  setDraft((prev) => {
                    const next = [...prev.popularChips];
                    next[index] = { ...next[index], slug: event.target.value };
                    return { ...prev, popularChips: next };
                  })
                }
                className="h-9 rounded-lg border border-slate-300 px-2 text-xs"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    popularChips: prev.popularChips.filter((_, i) => i !== index),
                  }))
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Other Home Sections</h2>
        <p className="text-sm text-slate-600">
          Edit each section JSON separately. These are saved under Home Content Studio.
        </p>
        <div className="space-y-3">
          {EXTRA_SECTION_KEYS.map((section) => (
            <details key={section.key} className="rounded-xl border border-slate-200 bg-white p-3" open={section.key === "homeDeal"}>
              <summary className="cursor-pointer text-sm font-semibold text-slate-800">{section.label}</summary>
              <textarea
                value={extraSections[section.key] ?? "{}"}
                onChange={(event) =>
                  setExtraSections((prev) => ({
                    ...prev,
                    [section.key]: event.target.value,
                  }))
                }
                className="mt-3 min-h-[180px] w-full rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs text-slate-700"
              />
            </details>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <Button onClick={saveDraft} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
        <Button
          onClick={() => {
            pushPreview(window);
            pushPreview(previewTabRef.current);
            broadcastPreview();
            toast.success("Preview applied");
          }}
        >
          Apply preview
        </Button>
        <Button variant="outline" onClick={openPreview}>
          <Eye className="mr-2 h-4 w-4" />
          Open home preview
        </Button>
      </section>
    </div>
  );
}
