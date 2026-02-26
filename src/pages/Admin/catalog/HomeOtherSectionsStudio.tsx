import { useEffect, useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";

import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Button } from "@/components/ui/button";

const SECTION_KEYS = [
  { key: "homeCategories", label: "Categories Section" },
  { key: "homeTrending", label: "Trending Section" },
  { key: "homeMind", label: "What's On Mind Section" },
  { key: "homeTravel", label: "Travel Section" },
  { key: "homeSightseeing", label: "Sightseeing Section" },
] as const;
const ADVERTISE_IMAGE_COUNT = 5;
const ADVERTISE_TEXT_FIELDS = [
  { key: "leftBadge", label: "Left Badge", placeholder: "LIMITED WEEKEND SLOTS" },
  { key: "leftTitleLine1", label: "Left Title Line 1", placeholder: "Make This Weekend" },
  { key: "leftTitleLine2", label: "Left Title Line 2", placeholder: "Unforgettable" },
  {
    key: "leftDescription",
    label: "Left Description",
    placeholder: "Discover top-rated experiences for couples, families and friends...",
  },
  { key: "leftCta", label: "Left CTA", placeholder: "Explore Experiences ->" },
  { key: "highlightBadge", label: "Highlight Badge", placeholder: "Weekend Highlight" },
  { key: "highlightTitle", label: "Highlight Title", placeholder: "Adventure Activities" },
  {
    key: "highlightDescription",
    label: "Highlight Description",
    placeholder: "Go-karting, trampoline parks, indoor climbing.",
  },
  { key: "highlightCta", label: "Highlight CTA", placeholder: "Explore" },
  { key: "cardOneBadge", label: "Card One Badge", placeholder: "Popular" },
  { key: "cardOneTitle", label: "Card One Title", placeholder: "Bowling & Arcade" },
  { key: "cardOneDescription", label: "Card One Description", placeholder: "Bowling · Arcade · VR" },
  { key: "cardOneCta", label: "Card One CTA", placeholder: "Explore" },
  { key: "cardTwoBadge", label: "Card Two Badge", placeholder: "Popular" },
  { key: "cardTwoTitle", label: "Card Two Title", placeholder: "Water Parks & Rides" },
  { key: "cardTwoDescription", label: "Card Two Description", placeholder: "Slides · Wave pools · Kids zones" },
  { key: "cardTwoCta", label: "Card Two CTA", placeholder: "Explore" },
  { key: "featuredBadge", label: "Featured Badge", placeholder: "Featured" },
  { key: "featuredTitle", label: "Featured Title", placeholder: "More Weekend Picks" },
  { key: "featuredCta", label: "Featured CTA", placeholder: "View" },
] as const;
type AdvertiseTextKey = (typeof ADVERTISE_TEXT_FIELDS)[number]["key"];
type AdvertiseTextState = Record<AdvertiseTextKey, string>;

function normalizeAdvertiseImages(input: unknown): string[] {
  const raw = Array.isArray(input) ? input.map((item) => String(item || "")) : [];
  return Array.from({ length: ADVERTISE_IMAGE_COUNT }, (_, index) => raw[index] ?? "");
}

function normalizeAdvertiseTexts(input: unknown): AdvertiseTextState {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  return ADVERTISE_TEXT_FIELDS.reduce((acc, field) => {
    acc[field.key] = typeof source[field.key] === "string" ? (source[field.key] as string) : "";
    return acc;
  }, {} as AdvertiseTextState);
}

export default function HomeOtherSectionsStudio() {
  const [isSaving, setIsSaving] = useState(false);
  const [fullPayload, setFullPayload] = useState<Record<string, unknown>>({});
  const [sections, setSections] = useState<Record<string, string>>(
    Object.fromEntries(SECTION_KEYS.map((item) => [item.key, "{}"])),
  );
  const [advertiseImages, setAdvertiseImages] = useState<string[]>(normalizeAdvertiseImages(undefined));
  const [advertiseTexts, setAdvertiseTexts] = useState<AdvertiseTextState>(
    normalizeAdvertiseTexts(undefined),
  );
  const [advertiseUrl, setAdvertiseUrl] = useState("");

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
          const addvertise = payload.addvertise as Record<string, unknown> | undefined;
          setAdvertiseImages(normalizeAdvertiseImages(addvertise?.images));
          setAdvertiseTexts(normalizeAdvertiseTexts(addvertise));
          setSections((prev) => {
            const next = { ...prev };
            for (const section of SECTION_KEYS) {
              next[section.key] = JSON.stringify(payload[section.key] ?? {}, null, 2);
            }
            return next;
          });
          return;
        }

        const legacyResponse = await fetch(`${baseUrl}/home-content`, { credentials: "include" });
        if (!legacyResponse.ok) return;
        const payload = (await legacyResponse.json()) as Record<string, unknown>;
        if (ignore) return;
        setFullPayload(payload);
        const addvertise = payload.addvertise as Record<string, unknown> | undefined;
        setAdvertiseImages(normalizeAdvertiseImages(addvertise?.images));
        setAdvertiseTexts(normalizeAdvertiseTexts(addvertise));
        setSections((prev) => {
          const next = { ...prev };
          for (const section of SECTION_KEYS) {
            next[section.key] = JSON.stringify(payload[section.key] ?? {}, null, 2);
          }
          return next;
        });
      } catch {
        // keep defaults
      }
    };
    void load();
    return () => {
      ignore = true;
    };
  }, []);

  const save = async () => {
    try {
      setIsSaving(true);
      const parsed: Record<string, unknown> = {};
      for (const section of SECTION_KEYS) {
        try {
          parsed[section.key] = JSON.parse(sections[section.key] || "{}");
        } catch {
          toast.error(`${section.label} JSON is invalid`);
          setIsSaving(false);
          return;
        }
      }

      const existingAddvertise =
        fullPayload.addvertise && typeof fullPayload.addvertise === "object"
          ? (fullPayload.addvertise as Record<string, unknown>)
          : {};

      const payload = {
        ...fullPayload,
        ...parsed,
        addvertise: {
          ...existingAddvertise,
          images: normalizeAdvertiseImages(advertiseImages),
          ...advertiseTexts,
        },
      };
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
      toast.success("Other sections saved");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save other sections");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <TitleBreadCrumbs title="Home Other Sections Studio" breadCrumbTitle="Admin / Catalog / Home Sections / Other" />
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <details className="rounded-xl border border-slate-200 bg-white p-3" open>
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">Advertise Images (up to 5)</summary>
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              <input
                value={advertiseUrl}
                onChange={(event) => setAdvertiseUrl(event.target.value)}
                className="h-10 min-w-[260px] flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm"
                placeholder="Paste advertise image URL"
              />
              <Button
                variant="outline"
                onClick={() => {
                  const url = advertiseUrl.trim();
                  if (!url) return;
                  const emptyIndex = advertiseImages.findIndex((item) => !item.trim());
                  if (emptyIndex < 0) {
                    toast.error(`All ${ADVERTISE_IMAGE_COUNT} advertise image slots are filled`);
                    return;
                  }
                  setAdvertiseImages((prev) => {
                    const next = [...prev];
                    next[emptyIndex] = url;
                    return next;
                  });
                  setAdvertiseUrl("");
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
                      const emptyIndex = advertiseImages.findIndex((item) => !item.trim());
                      if (emptyIndex < 0) {
                        toast.error(`All ${ADVERTISE_IMAGE_COUNT} advertise image slots are filled`);
                        return;
                      }
                      setAdvertiseImages((prev) => {
                        const next = [...prev];
                        next[emptyIndex] = reader.result as string;
                        return next;
                      });
                    };
                    reader.readAsDataURL(file);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
            <div className="space-y-2">
              {advertiseImages.map((image, index) => (
                <div key={`advertise-image-${index}`} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 p-2">
                  <img src={image || undefined} alt={`advertise-${index + 1}`} className="h-14 w-20 rounded-md object-cover bg-slate-100" />
                  <p className="min-w-[95px] text-xs font-semibold text-slate-500">Image {index + 1}/5</p>
                  <input
                    value={image}
                    onChange={(event) =>
                      setAdvertiseImages((prev) => {
                        const next = [...prev];
                        next[index] = event.target.value;
                        return next;
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
                          setAdvertiseImages((prev) => {
                            const next = [...prev];
                            next[index] = reader.result as string;
                            return next;
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
                      setAdvertiseImages((prev) => {
                        const next = [...prev];
                        next[index] = "";
                        return next;
                      })
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-3 text-sm font-semibold text-slate-800">Advertise Text Content</p>
              <div className="grid gap-3 md:grid-cols-2">
                {ADVERTISE_TEXT_FIELDS.map((field) => (
                  <label key={field.key} className="space-y-1">
                    <span className="text-xs font-medium text-slate-600">{field.label}</span>
                    <input
                      value={advertiseTexts[field.key]}
                      onChange={(event) =>
                        setAdvertiseTexts((prev) => ({
                          ...prev,
                          [field.key]: event.target.value,
                        }))
                      }
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                      placeholder={field.placeholder}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </details>

        {SECTION_KEYS.map((section) => (
          <details key={section.key} className="rounded-xl border border-slate-200 bg-white p-3" open={section.key === "homeCategories"}>
            <summary className="cursor-pointer text-sm font-semibold text-slate-800">{section.label}</summary>
            <textarea
              value={sections[section.key] ?? "{}"}
              onChange={(event) =>
                setSections((prev) => ({
                  ...prev,
                  [section.key]: event.target.value,
                }))
              }
              className="mt-3 min-h-[180px] w-full rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs text-slate-700"
            />
          </details>
        ))}
      </section>
      <section className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </section>
    </div>
  );
}
