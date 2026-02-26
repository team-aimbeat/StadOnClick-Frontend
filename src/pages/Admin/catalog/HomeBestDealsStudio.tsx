import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";

import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Button } from "@/components/ui/button";

const HOME_DISCOUNT_CARD_COUNT = 5;

type HomeDiscountCardState = {
  title: string;
  subtitle: string;
  price: string;
  image: string;
  bgImage: string;
  slug: string;
  navigationLink: string;
};

type HomeDiscountState = {
  heading: string;
  cards: HomeDiscountCardState[];
};

function normalizeHomeDiscount(input: unknown): HomeDiscountState {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const rawCards = Array.isArray(source.cards) ? source.cards : [];
  const cards = Array.from({ length: HOME_DISCOUNT_CARD_COUNT }, (_, index) => {
    const raw = rawCards[index] as Record<string, unknown> | undefined;
    return {
      title: typeof raw?.title === "string" ? raw.title : "",
      subtitle: typeof raw?.subtitle === "string" ? raw.subtitle : "",
      price: typeof raw?.price === "string" ? raw.price : "",
      image: typeof raw?.image === "string" ? raw.image : "",
      bgImage: typeof raw?.bgImage === "string" ? raw.bgImage : "",
      slug: typeof raw?.slug === "string" ? raw.slug : "",
      navigationLink: typeof raw?.navigationLink === "string" ? raw.navigationLink : "",
    };
  });

  return {
    heading: typeof source.heading === "string" ? source.heading : "",
    cards,
  };
}

export default function HomeBestDealsStudio() {
  const [isSaving, setIsSaving] = useState(false);
  const [fullPayload, setFullPayload] = useState<Record<string, unknown>>({});
  const [homeDiscount, setHomeDiscount] = useState<HomeDiscountState>(normalizeHomeDiscount(undefined));

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
          setHomeDiscount(normalizeHomeDiscount(payload.homeDiscount));
          return;
        }

        const legacyResponse = await fetch(`${baseUrl}/home-content`, { credentials: "include" });
        if (!legacyResponse.ok) return;
        const payload = (await legacyResponse.json()) as Record<string, unknown>;
        if (ignore) return;
        setFullPayload(payload);
        setHomeDiscount(normalizeHomeDiscount(payload.homeDiscount));
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
        homeDiscount: {
          heading: homeDiscount.heading,
          cards: homeDiscount.cards.map((card) => ({
            title: card.title,
            subtitle: card.subtitle,
            price: card.price,
            image: card.image,
            bgImage: card.bgImage,
            slug: card.slug,
            navigationLink: card.navigationLink,
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
      toast.success("Best deals section saved");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save best deals section");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <TitleBreadCrumbs
        title="Home Best Deals Studio"
        breadCrumbTitle="Admin / Catalog / Home Sections / Best Deals"
      />
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <details className="rounded-xl border border-slate-200 bg-white p-3" open>
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">Grab the Best Deals Today</summary>
          <div className="mt-3 space-y-3">
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Section Heading</span>
              <input
                value={homeDiscount.heading}
                onChange={(event) =>
                  setHomeDiscount((prev) => ({
                    ...prev,
                    heading: event.target.value,
                  }))
                }
                className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                placeholder="Grab the Best Deals Today"
              />
            </label>

            <div className="space-y-2">
              {homeDiscount.cards.map((card, index) => (
                <div key={`home-discount-card-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-slate-600">Card {index + 1}/5</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Title</span>
                      <input
                        value={card.title}
                        onChange={(event) =>
                          setHomeDiscount((prev) => {
                            const next = [...prev.cards];
                            next[index] = { ...next[index], title: event.target.value };
                            return { ...prev, cards: next };
                          })
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                        placeholder="Buffet"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Subtitle</span>
                      <input
                        value={card.subtitle}
                        onChange={(event) =>
                          setHomeDiscount((prev) => {
                            const next = [...prev.cards];
                            next[index] = { ...next[index], subtitle: event.target.value };
                            return { ...prev, cards: next };
                          })
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                        placeholder="Offers from"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Price</span>
                      <input
                        value={card.price}
                        onChange={(event) =>
                          setHomeDiscount((prev) => {
                            const next = [...prev.cards];
                            next[index] = { ...next[index], price: event.target.value };
                            return { ...prev, cards: next };
                          })
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                        placeholder="₹249"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Slug</span>
                      <input
                        value={card.slug}
                        onChange={(event) =>
                          setHomeDiscount((prev) => {
                            const next = [...prev.cards];
                            next[index] = { ...next[index], slug: event.target.value };
                            return { ...prev, cards: next };
                          })
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                        placeholder="buffet-deals"
                      />
                    </label>
                    <label className="space-y-1 md:col-span-2">
                      <span className="text-xs font-medium text-slate-600">Navigation Link</span>
                      <input
                        value={card.navigationLink}
                        onChange={(event) =>
                          setHomeDiscount((prev) => {
                            const next = [...prev.cards];
                            next[index] = { ...next[index], navigationLink: event.target.value };
                            return { ...prev, cards: next };
                          })
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                        placeholder="/marketplace?category=buffet-deals"
                      />
                    </label>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Foreground Image URL</span>
                      <div className="flex items-center gap-2">
                        <input
                          value={card.image}
                          onChange={(event) =>
                            setHomeDiscount((prev) => {
                              const next = [...prev.cards];
                              next[index] = { ...next[index], image: event.target.value };
                              return { ...prev, cards: next };
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
                                setHomeDiscount((prev) => {
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
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Background Image URL</span>
                      <div className="flex items-center gap-2">
                        <input
                          value={card.bgImage}
                          onChange={(event) =>
                            setHomeDiscount((prev) => {
                              const next = [...prev.cards];
                              next[index] = { ...next[index], bgImage: event.target.value };
                              return { ...prev, cards: next };
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
                                setHomeDiscount((prev) => {
                                  const next = [...prev.cards];
                                  next[index] = { ...next[index], bgImage: reader.result as string };
                                  return { ...prev, cards: next };
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
          {isSaving ? "Saving..." : "Save best deals section"}
        </Button>
      </section>
    </div>
  );
}
