import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";

import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Button } from "@/components/ui/button";

const TRENDING_CARD_COUNT = 4;

type TrendingCardState = {
  title: string;
  offers: string;
  price: string;
  image: string;
  link: string;
};

type HomeTrendingState = {
  heading: string;
  backgroundImage: string;
  places: TrendingCardState[];
};

function normalizeHomeTrending(input: unknown): HomeTrendingState {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const rawPlaces = Array.isArray(source.places) ? source.places : [];
  const places = Array.from({ length: TRENDING_CARD_COUNT }, (_, index) => {
    const raw = rawPlaces[index] as Record<string, unknown> | undefined;
    return {
      title: typeof raw?.title === "string" ? raw.title : "",
      offers: typeof raw?.offers === "string" ? raw.offers : "",
      price: typeof raw?.price === "string" ? raw.price : "",
      image: typeof raw?.image === "string" ? raw.image : "",
      link: typeof raw?.link === "string" ? raw.link : "",
    };
  });
  return {
    heading: typeof source.heading === "string" ? source.heading : "",
    backgroundImage: typeof source.backgroundImage === "string" ? source.backgroundImage : "",
    places,
  };
}

export default function HomeTrendingStudio() {
  const [isSaving, setIsSaving] = useState(false);
  const [fullPayload, setFullPayload] = useState<Record<string, unknown>>({});
  const [homeTrending, setHomeTrending] = useState<HomeTrendingState>(normalizeHomeTrending(undefined));

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
          setHomeTrending(normalizeHomeTrending(payload.homeTrending));
          return;
        }

        const legacyResponse = await fetch(`${baseUrl}/home-content`, { credentials: "include" });
        if (!legacyResponse.ok) return;
        const payload = (await legacyResponse.json()) as Record<string, unknown>;
        if (ignore) return;
        setFullPayload(payload);
        setHomeTrending(normalizeHomeTrending(payload.homeTrending));
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
      const payload = {
        ...fullPayload,
        homeTrending: {
          heading: homeTrending.heading,
          backgroundImage: homeTrending.backgroundImage,
          places: homeTrending.places.map((place) => ({
            title: place.title,
            offers: place.offers,
            price: place.price,
            image: place.image,
            link: place.link,
          })),
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
      toast.success("Trending section saved");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save trending section");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <TitleBreadCrumbs
        title="Home Trending Studio"
        breadCrumbTitle="Admin / Catalog / Home Sections / Trending"
      />

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <details className="rounded-xl border border-slate-200 bg-white p-3" open>
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">
            Elevated Experiences (Trending)
          </summary>
          <div className="mt-3 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Section Heading</span>
                <input
                  value={homeTrending.heading}
                  onChange={(event) =>
                    setHomeTrending((prev) => ({
                      ...prev,
                      heading: event.target.value,
                    }))
                  }
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                  placeholder="Elevated Experiences Nearby"
                />
              </label>
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Background Image URL</span>
                <div className="flex items-center gap-2">
                  <input
                    value={homeTrending.backgroundImage}
                    onChange={(event) =>
                      setHomeTrending((prev) => ({
                        ...prev,
                        backgroundImage: event.target.value,
                      }))
                    }
                    className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                    placeholder="https://..."
                  />
                  <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-400 bg-white px-2 text-xs font-medium text-slate-700">
                    <Upload className="mr-1 h-3.5 w-3.5" />
                    Upload
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
                          setHomeTrending((prev) => ({
                            ...prev,
                            backgroundImage: reader.result as string,
                          }));
                        };
                        reader.readAsDataURL(file);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {homeTrending.places.map((place, index) => (
                <div key={`trending-card-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-slate-600">Card {index + 1}/4</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Title</span>
                      <input
                        value={place.title}
                        onChange={(event) =>
                          setHomeTrending((prev) => {
                            const next = [...prev.places];
                            next[index] = { ...next[index], title: event.target.value };
                            return { ...prev, places: next };
                          })
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                        placeholder="Connaught Place"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Offers Text</span>
                      <input
                        value={place.offers}
                        onChange={(event) =>
                          setHomeTrending((prev) => {
                            const next = [...prev.places];
                            next[index] = { ...next[index], offers: event.target.value };
                            return { ...prev, places: next };
                          })
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                        placeholder="25 Offers"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Price Text</span>
                      <input
                        value={place.price}
                        onChange={(event) =>
                          setHomeTrending((prev) => {
                            const next = [...prev.places];
                            next[index] = { ...next[index], price: event.target.value };
                            return { ...prev, places: next };
                          })
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                        placeholder="Rs 119"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Redirect Link</span>
                      <input
                        value={place.link}
                        onChange={(event) =>
                          setHomeTrending((prev) => {
                            const next = [...prev.places];
                            next[index] = { ...next[index], link: event.target.value };
                            return { ...prev, places: next };
                          })
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                        placeholder="/marketplace?place=connaught-place"
                      />
                    </label>
                    <div className="space-y-1 md:col-span-2">
                      <span className="text-xs font-medium text-slate-600">Card Image URL</span>
                      <div className="flex items-center gap-2">
                        <input
                          value={place.image}
                          onChange={(event) =>
                            setHomeTrending((prev) => {
                              const next = [...prev.places];
                              next[index] = { ...next[index], image: event.target.value };
                              return { ...prev, places: next };
                            })
                          }
                          className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                          placeholder="https://..."
                        />
                        <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-400 bg-white px-2 text-xs font-medium text-slate-700">
                          <Upload className="mr-1 h-3.5 w-3.5" />
                          Upload
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
                                setHomeTrending((prev) => {
                                  const next = [...prev.places];
                                  next[index] = { ...next[index], image: reader.result as string };
                                  return { ...prev, places: next };
                                });
                              };
                              reader.readAsDataURL(file);
                              event.currentTarget.value = "";
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </details>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save trending section"}
        </Button>
      </section>
    </div>
  );
}
