import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, ImageIcon, Plus, Trash2, Upload } from "lucide-react";
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
  return Array.from({ length: HERO_BANNER_COUNT }, (_, index) => raw[index] ?? "");
}

function toHeroDraftFromPayload(payload: unknown): Partial<HeroDraft> | null {
  if (!payload || typeof payload !== "object") return null;
  const content = payload as Record<string, unknown>;
  const hero = content.homeHero && typeof content.homeHero === "object"
    ? (content.homeHero as Record<string, unknown>)
    : null;

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

export default function HomeHeroStudio() {
  const [draft, setDraft] = useState<HeroDraft>(defaultDraft);
  const [fullPayload, setFullPayload] = useState<Record<string, unknown>>({});
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
          const payload = (await cmsResponse.json()) as Record<string, unknown>;
          const heroDraft = toHeroDraftFromPayload(payload);
          if (!ignore) {
            setFullPayload(payload);
            if (heroDraft) {
              setDraft((prev) => ({ ...prev, ...heroDraft, banners: normalizeHeroBanners(heroDraft.banners) }));
            }
          }
          return;
        }

        const legacyResponse = await fetch(`${baseUrl}/home-content`, { credentials: "include" });
        if (!legacyResponse.ok) return;
        const payload = (await legacyResponse.json()) as Record<string, unknown>;
        const heroDraft = toHeroDraftFromPayload(payload);
        if (!ignore) {
          setFullPayload(payload);
          if (heroDraft) {
            setDraft((prev) => ({ ...prev, ...heroDraft, banners: normalizeHeroBanners(heroDraft.banners) }));
          }
        }
      } catch {
        // Keep defaults
      }
    };
    void loadDraft();
    return () => {
      ignore = true;
    };
  }, []);

  const previewPayload = useMemo(
    () => ({
      ...fullPayload,
      homeHero: {
        heading: draft.heading,
        subheading: draft.subheading,
        banners: draft.banners,
        popularChips: draft.popularChips,
      },
    }),
    [draft, fullPayload],
  );
  const filledBanners = useMemo(() => draft.banners.filter((item) => item.trim()).length, [draft.banners]);

  const pushPreview = (target: Window | null) => {
    if (!target) return;
    (target as any).__HOME_CONTENT_PREVIEW__ = previewPayload;
  };

  const broadcastPreview = () => {
    const message = { type: "HOME_CONTENT_PREVIEW", payload: previewPayload };
    window.postMessage(message, window.location.origin);
    if (previewTabRef.current && !previewTabRef.current.closed) {
      previewTabRef.current.postMessage(message, window.location.origin);
    }
    previewChannelRef.current?.postMessage(message);
  };

  const saveDraft = async () => {
    try {
      setIsSaving(true);
      const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
      if (!baseUrl) {
        toast.error("Missing VITE_API_URL");
        return;
      }
      const response = await fetch(`${baseUrl}/admin/home-content`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(previewPayload),
      });
      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(errorPayload?.message || `Save failed (${response.status})`);
      }
      setFullPayload(previewPayload);
      toast.success("Hero content saved");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save hero content");
    } finally {
      setIsSaving(false);
    }
  };

  const openPreview = () => {
    const previewWindow = window.open(HOME_PREVIEW_PATH, "_blank");
    previewTabRef.current = previewWindow;
    if (!previewWindow) return;
    window.setTimeout(() => pushPreview(previewWindow), 120);
    window.setTimeout(() => pushPreview(previewWindow), 420);
  };

  return (
    <div className="space-y-6">
      <TitleBreadCrumbs title="Home Hero Studio" breadCrumbTitle="Admin / Catalog / Home Hero" />

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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Background Images</h2>
            <p className="text-xs text-slate-500">Manage hero visuals in a compact card grid.</p>
          </div>
          <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {filledBanners}/{HERO_BANNER_COUNT} filled
          </p>
        </div>
        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
          <input
            value={bannerUrl}
            onChange={(event) => setBannerUrl(event.target.value)}
            className="h-10 min-w-[260px] flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm"
            placeholder="Paste banner image URL"
          />
          <Button
            variant="outline"
            onClick={() => {
              const url = bannerUrl.trim();
              if (!url) return;
              setDraft((prev) => {
                const emptyIndex = prev.banners.findIndex((item) => !item.trim());
                if (emptyIndex < 0) {
                  toast.error(`All ${HERO_BANNER_COUNT} banner slots are filled`);
                  return prev;
                }
                const next = [...prev.banners];
                next[emptyIndex] = url;
                return { ...prev, banners: next };
              });
              setBannerUrl("");
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add URL
          </Button>
          <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-400 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:bg-slate-100">
            <Upload className="mr-2 h-4 w-4" />
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
                  setDraft((prev) => {
                    const emptyIndex = prev.banners.findIndex((item) => !item.trim());
                    if (emptyIndex < 0) {
                      toast.error(`All ${HERO_BANNER_COUNT} banner slots are filled`);
                      return prev;
                    }
                    const next = [...prev.banners];
                    next[emptyIndex] = reader.result as string;
                    return { ...prev, banners: next };
                  });
                };
                reader.readAsDataURL(file);
                event.currentTarget.value = "";
              }}
            />
          </label>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {draft.banners.map((banner, index) => (
            <div
              key={`hero-banner-${index}`}
              className="group rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative mb-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                {banner ? (
                  <img src={banner} alt={`banner-${index + 1}`} className="aspect-square w-full object-cover" />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center gap-1 text-slate-400">
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span className="text-[11px] font-medium">No image</span>
                  </div>
                )}
                <p className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-600">
                  Banner {index + 1}/7
                </p>
              </div>
              <input
                value={banner}
                onChange={(event) =>
                  setDraft((prev) => {
                    const next = [...prev.banners];
                    next[index] = event.target.value;
                    return { ...prev, banners: next };
                  })
                }
                className="mb-2 h-7 w-full rounded-md border border-slate-300 bg-white px-2 text-[11px]"
                placeholder="Paste image URL or base64 value"
              />
              <div className="flex items-center gap-2">
                <label className="inline-flex h-7 flex-1 cursor-pointer items-center justify-center rounded-md border border-dashed border-slate-400 bg-slate-50 px-2 text-[11px] font-medium text-slate-700 transition hover:border-slate-500 hover:bg-slate-100">
                  Replace
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
                        setDraft((prev) => {
                          const next = [...prev.banners];
                          next[index] = reader.result as string;
                          return { ...prev, banners: next };
                        });
                      };
                      reader.readAsDataURL(file);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-1.5 text-slate-600 hover:bg-red-50 hover:text-red-600"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      banners: prev.banners.map((item, i) => (i === index ? "" : item)),
                    }))
                  }
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
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
            placeholder="Chip label"
          />
          <input
            value={popularSlug}
            onChange={(event) => setPopularSlug(event.target.value)}
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm"
            placeholder="Chip slug"
          />
          <Button
            variant="outline"
            onClick={() => {
              const label = popularLabel.trim();
              const slug = popularSlug.trim();
              if (!label || !slug) return;
              setDraft((prev) => ({ ...prev, popularChips: [...prev.popularChips, { label, slug }] }));
              setPopularLabel("");
              setPopularSlug("");
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add chip
          </Button>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <Button onClick={saveDraft} disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</Button>
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
