import { useEffect, useMemo, useRef, useState } from "react";
import { ImageIcon, Lock, Plus, Upload, X } from "lucide-react";
import toast from "react-hot-toast";

import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import HomeHero from "@/components/shared/home/HomeHero";
import { Button } from "@/components/ui/button";

type HeroDraft = {
  heading: string;
  subheading: string;
  banners: string[];
  popularChips: Array<{ label: string; slug: string }>;
};

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

  const discardChanges = () => {
    const hero = toHeroDraftFromPayload(fullPayload);
    if (hero) {
      setDraft((prev) => ({
        ...defaultDraft,
        ...hero,
        banners: normalizeHeroBanners(hero.banners),
      }));
    } else {
      setDraft(defaultDraft);
    }
    setBannerUrl("");
    setPopularLabel("");
    setPopularSlug("");
    toast.success("Changes discarded");
  };

  return (
    <div className=" ">
      <div className="w-full">
        <TitleBreadCrumbs title="Home Hero Studio" breadCrumbTitle="Admin / Layout Studio / Home Sections / Hero" />

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
           
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-full border-[#DCE6F5] bg-white px-7 text-sm font-semibold text-[#0F2A44] hover:bg-[#F3F7FF]"
              onClick={discardChanges}
            >
              Discard
            </Button>
            <Button
              type="button"
              onClick={async () => {
                await saveDraft();
                pushPreview(window);
                pushPreview(previewTabRef.current);
                broadcastPreview();
              }}
              className="h-12 rounded-full bg-[#2563EB] px-7 text-sm font-semibold text-white hover:bg-[#3B82F6] active:bg-[#1D4ED8]"
            >
              Publish Changes
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.58fr_1.42fr]">
          <div className="space-y-6">
            <section className=" border border-[#DCE6F5] bg-white p-8 ">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DBEAFE] text-[#2563EB]">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#0F2A44]">Hero Content</h2>
                  <p className="text-sm text-[#5F7390]">Shape the title and subheading shown in the hero banner.</p>
                </div>
              </div>

              <div className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0F2A44]">Main Headline</label>
                  <input
                    value={draft.heading}
                    onChange={(event) => setDraft((prev) => ({ ...prev, heading: event.target.value }))}
                    className="h-14 w-full rounded-full border border-[#DCE6F5] bg-[#F3F7FF] px-5 text-base text-[#0F2A44] placeholder:text-[#5F7390]"
                    placeholder="Hero heading"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0F2A44]">
                    Sub-Text / Trending Categories
                  </label>
                  <input
                    value={draft.subheading}
                    onChange={(event) => setDraft((prev) => ({ ...prev, subheading: event.target.value }))}
                    className="h-14 w-full rounded-full border border-[#DCE6F5] bg-[#F3F7FF] px-5 text-base text-[#0F2A44] placeholder:text-[#5F7390]"
                    placeholder="Hero subheading"
                  />
                </div>

                <div className="rounded-[28px] border border-[#DCE6F5] bg-[#F3F7FF] p-4">
                  <div className="flex flex-wrap gap-3">
                    {draft.popularChips.map((chip) => (
                      <span
                        key={`${chip.label}-${chip.slug}`}
                        className="inline-flex items-center gap-2 rounded-full bg-[#6EE7B7] px-4 py-2 text-sm font-semibold text-[#0F2A44]"
                      >
                        {chip.label}
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              popularChips: prev.popularChips.filter((item) => item.slug !== chip.slug),
                            }))
                          }
                          className="rounded-full p-0.5 text-[#0F2A44] hover:bg-white/40"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-dashed border-[#A5B4FC] px-4 py-2 text-sm font-semibold text-[#7C83D8] transition hover:bg-white"
                    >
                      <Plus className="h-4 w-4" />
                      Add Tag
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className=" border border-[#DCE6F5] bg-white p-8 ">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DBEAFE] text-[#2563EB]">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#0F2A44]">Background Banners</h2>
                    <p className="text-sm text-[#5F7390]">Upload and arrange the hero background images.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="h-11 rounded-full border-[#DCE6F5] bg-white px-5 text-sm font-semibold text-[#0F2A44] hover:bg-[#F3F7FF]"
                  >
                    Add URL
                  </Button>
                  <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[#2563EB] px-5 text-sm font-semibold text-white transition hover:bg-[#3B82F6]">
                    Upload Image
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
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {draft.banners.map((banner, index) => {
                  const isLocked = index === HERO_BANNER_COUNT - 1;
                  return (
                    <div
                      key={`hero-banner-${index}`}
                      className="group relative rounded-[22px] border border-[#DCE6F5] bg-[#F7F6FF] p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative overflow-hidden rounded-[18px] border border-dashed border-[#C9D4F2] bg-[#EEECFF]">
                        {banner ? (
                          <img
                            src={banner}
                            alt={`banner-${index + 1}`}
                            className="aspect-square w-full object-cover"
                          />
                        ) : isLocked ? (
                          <div className="flex aspect-square w-full items-center justify-center text-[#C7C9E8]">
                            <Lock className="h-6 w-6" />
                          </div>
                        ) : (
                          <div className="flex aspect-square w-full items-center justify-center text-[#A5B4FC]">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center py-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7C83D8]">
                          Slot {index + 1}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="xl:sticky xl:top-8 xl:w-full">
            <section className="w-full border border-[#DCE6F5] bg-white p-5 ">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-[#0F2A44]">Live preview</p>
                <p className="text-xs text-[#5F7390]">Real-time live preview</p>
              </div>

              <div className="w-full overflow-hidden rounded-[14px] border-[4px] border-[#2A2E63] bg-black">
                
                <div className="pointer-events-none h-[620px] overflow-hidden">
                  <HomeHero
                    heading={draft.heading}
                    subheading={draft.subheading}
                    banners={draft.banners}
                    popularChips={draft.popularChips}
                  />
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
