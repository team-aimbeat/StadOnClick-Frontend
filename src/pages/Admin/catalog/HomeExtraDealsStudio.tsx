import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";

import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Button } from "@/components/ui/button";

const HOME_CATEGORIES_CARD_COUNT = 5;

type HomeCategoriesCardState = {
  category: string;
  image: string;
  author: string;
  title: string;
  description: string;
  location: string;
  price: string;
  slug: string;
};

type HomeCategoriesState = {
  headingPrefix: string;
  headingHighlight: string;
  headingSuffix: string;
  cards: HomeCategoriesCardState[];
};

function normalizeHomeCategories(input: unknown): HomeCategoriesState {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const rawCards = Array.isArray(source.cards) ? source.cards : [];
  const cards = Array.from({ length: HOME_CATEGORIES_CARD_COUNT }, (_, index) => {
    const raw = rawCards[index] as Record<string, unknown> | undefined;
    return {
      category: typeof raw?.category === "string" ? raw.category : "",
      image: typeof raw?.image === "string" ? raw.image : "",
      author: typeof raw?.author === "string" ? raw.author : "",
      title: typeof raw?.title === "string" ? raw.title : "",
      description: typeof raw?.description === "string" ? raw.description : "",
      location: typeof raw?.location === "string" ? raw.location : "",
      price: typeof raw?.price === "string" ? raw.price : "",
      slug: typeof raw?.slug === "string" ? raw.slug : "",
    };
  });
  return {
    headingPrefix: typeof source.headingPrefix === "string" ? source.headingPrefix : "",
    headingHighlight: typeof source.headingHighlight === "string" ? source.headingHighlight : "",
    headingSuffix: typeof source.headingSuffix === "string" ? source.headingSuffix : "",
    cards,
  };
}

export default function HomeExtraDealsStudio() {
  const [isSaving, setIsSaving] = useState(false);
  const [fullPayload, setFullPayload] = useState<Record<string, unknown>>({});
  const [homeCategories, setHomeCategories] = useState<HomeCategoriesState>(normalizeHomeCategories(undefined));

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
          setHomeCategories(normalizeHomeCategories(payload.homeCategories));
          return;
        }

        const legacyResponse = await fetch(`${baseUrl}/home-content`, { credentials: "include" });
        if (!legacyResponse.ok) return;
        const payload = (await legacyResponse.json()) as Record<string, unknown>;
        if (ignore) return;
        setFullPayload(payload);
        setHomeCategories(normalizeHomeCategories(payload.homeCategories));
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
        homeCategories: {
          headingPrefix: homeCategories.headingPrefix,
          headingHighlight: homeCategories.headingHighlight,
          headingSuffix: homeCategories.headingSuffix,
          cards: homeCategories.cards.map((card) => ({
            category: card.category,
            image: card.image,
            author: card.author,
            title: card.title,
            description: card.description,
            location: card.location,
            price: card.price,
            slug: card.slug,
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
      toast.success("Extra deals section saved");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save extra deals section");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <TitleBreadCrumbs
        title="Home Extra Deals Studio"
        breadCrumbTitle="Admin / Catalog / Home Sections / Extra Deals"
      />
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <details className="rounded-xl border border-slate-200 bg-white p-3" open>
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">Extra Deals (Categories) Section</summary>
          <div className="mt-3 space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Heading Prefix</span>
                <input
                  value={homeCategories.headingPrefix}
                  onChange={(event) =>
                    setHomeCategories((prev) => ({
                      ...prev,
                      headingPrefix: event.target.value,
                    }))
                  }
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                  placeholder="Flat Up to"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Heading Highlight</span>
                <input
                  value={homeCategories.headingHighlight}
                  onChange={(event) =>
                    setHomeCategories((prev) => ({
                      ...prev,
                      headingHighlight: event.target.value,
                    }))
                  }
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                  placeholder="50% Off"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Heading Suffix</span>
                <input
                  value={homeCategories.headingSuffix}
                  onChange={(event) =>
                    setHomeCategories((prev) => ({
                      ...prev,
                      headingSuffix: event.target.value,
                    }))
                  }
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                  placeholder="+ Extra Deals"
                />
              </label>
            </div>

            <div className="space-y-2">
              {homeCategories.cards.map((card, index) => (
                <div key={`home-categories-card-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-slate-600">Card {index + 1}/5</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Category Label</span>
                      <input
                        value={card.category}
                        onChange={(event) =>
                          setHomeCategories((prev) => {
                            const next = [...prev.cards];
                            next[index] = { ...next[index], category: event.target.value };
                            return { ...prev, cards: next };
                          })
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                        placeholder="Health & Wellness"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Author/Tag</span>
                      <input
                        value={card.author}
                        onChange={(event) =>
                          setHomeCategories((prev) => {
                            const next = [...prev.cards];
                            next[index] = { ...next[index], author: event.target.value };
                            return { ...prev, cards: next };
                          })
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                        placeholder="Top picks"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Title</span>
                      <input
                        value={card.title}
                        onChange={(event) =>
                          setHomeCategories((prev) => {
                            const next = [...prev.cards];
                            next[index] = { ...next[index], title: event.target.value };
                            return { ...prev, cards: next };
                          })
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                        placeholder="Studios, yoga, and spa escapes"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Description</span>
                      <input
                        value={card.description}
                        onChange={(event) =>
                          setHomeCategories((prev) => {
                            const next = [...prev.cards];
                            next[index] = { ...next[index], description: event.target.value };
                            return { ...prev, cards: next };
                          })
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                        placeholder="Gym, yoga, meditation, massage and spa services."
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Location</span>
                      <input
                        value={card.location}
                        onChange={(event) =>
                          setHomeCategories((prev) => {
                            const next = [...prev.cards];
                            next[index] = { ...next[index], location: event.target.value };
                            return { ...prev, cards: next };
                          })
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                        placeholder="Stockholm, SE"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Price Text</span>
                      <input
                        value={card.price}
                        onChange={(event) =>
                          setHomeCategories((prev) => {
                            const next = [...prev.cards];
                            next[index] = { ...next[index], price: event.target.value };
                            return { ...prev, cards: next };
                          })
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                        placeholder="From $25"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Slug</span>
                      <input
                        value={card.slug}
                        onChange={(event) =>
                          setHomeCategories((prev) => {
                            const next = [...prev.cards];
                            next[index] = { ...next[index], slug: event.target.value };
                            return { ...prev, cards: next };
                          })
                        }
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                        placeholder="health-wellness"
                      />
                    </label>
                    <div className="space-y-1 md:col-span-2">
                      <span className="text-xs font-medium text-slate-600">Card Image URL</span>
                      <div className="flex items-center gap-2">
                        <input
                          value={card.image}
                          onChange={(event) =>
                            setHomeCategories((prev) => {
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
                                setHomeCategories((prev) => {
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </details>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save extra deals section"}
        </Button>
      </section>
    </div>
  );
}
