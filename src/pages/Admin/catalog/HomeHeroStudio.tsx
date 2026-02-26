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
        <h2 className="text-lg font-semibold text-slate-900">Background Images (7)</h2>
        <div className="flex flex-wrap gap-2">
          <input
            value={bannerUrl}
            onChange={(event) => setBannerUrl(event.target.value)}
            className="h-10 min-w-[260px] flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm"
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
          <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-400 bg-white px-3 text-sm font-medium text-slate-700">
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
        <div className="space-y-2">
          {draft.banners.map((banner, index) => (
            <div key={`hero-banner-${index}`} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 p-2">
              <img src={banner || undefined} alt={`banner-${index + 1}`} className="h-14 w-20 rounded-md object-cover bg-slate-100" />
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
