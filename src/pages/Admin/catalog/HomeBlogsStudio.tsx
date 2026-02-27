import { useEffect, useMemo, useState } from "react";
import { ImageIcon, Upload } from "lucide-react";
import toast from "react-hot-toast";

import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Button } from "@/components/ui/button";

const BLOG_CARD_COUNT = 4;

type BlogCardState = {
  name: string;
  role: string;
  description: string;
  profileImage: string;
  coverImage: string;
  buttonText: string;
  navigationLink: string;
};

type BlogsContentState = {
  title: string;
  subtitle: string;
  items: BlogCardState[];
};

function normalizeBlogsContent(input: unknown): BlogsContentState {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const rawItems = Array.isArray(source.items) ? source.items : [];
  const items = Array.from({ length: BLOG_CARD_COUNT }, (_, index) => {
    const raw = rawItems[index] as Record<string, unknown> | undefined;
    return {
      name: typeof raw?.name === "string" ? raw.name : "",
      role: typeof raw?.role === "string" ? raw.role : "",
      description: typeof raw?.description === "string" ? raw.description : "",
      profileImage: typeof raw?.profileImage === "string" ? raw.profileImage : "",
      coverImage: typeof raw?.coverImage === "string" ? raw.coverImage : "",
      buttonText: typeof raw?.buttonText === "string" ? raw.buttonText : "",
      navigationLink: typeof raw?.navigationLink === "string" ? raw.navigationLink : "",
    };
  });

  return {
    title: typeof source.title === "string" ? source.title : "",
    subtitle: typeof source.subtitle === "string" ? source.subtitle : "",
    items,
  };
}

export default function HomeBlogsStudio() {
  const [isSaving, setIsSaving] = useState(false);
  const [fullPayload, setFullPayload] = useState<Record<string, unknown>>({});
  const [blogsContent, setBlogsContent] = useState<BlogsContentState>(normalizeBlogsContent(undefined));
  const cardsWithImages = useMemo(
    () => blogsContent.items.filter((item) => item.profileImage.trim() || item.coverImage.trim()).length,
    [blogsContent.items],
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
          setBlogsContent(normalizeBlogsContent(payload.blogs));
          return;
        }

        const legacyResponse = await fetch(`${baseUrl}/home-content`, { credentials: "include" });
        if (!legacyResponse.ok) return;
        const payload = (await legacyResponse.json()) as Record<string, unknown>;
        if (ignore) return;
        setFullPayload(payload);
        setBlogsContent(normalizeBlogsContent(payload.blogs));
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
        blogs: {
          title: blogsContent.title,
          subtitle: blogsContent.subtitle,
          items: blogsContent.items.map((item) => ({
            name: item.name,
            role: item.role,
            description: item.description,
            profileImage: item.profileImage,
            coverImage: item.coverImage,
            buttonText: item.buttonText,
            navigationLink: item.navigationLink,
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
      toast.success("Blogs section saved");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save blogs section");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <TitleBreadCrumbs title="Home Blogs Studio" breadCrumbTitle="Admin / Catalog / Home Sections / Blogs" />

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <details className="rounded-xl border border-slate-200 bg-white p-3" open>
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">Blogs Section Content</summary>

          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
              <div className="grid min-w-[260px] flex-1 gap-2 md:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-600">Section Title</span>
                  <input
                    value={blogsContent.title}
                    onChange={(event) =>
                      setBlogsContent((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                    placeholder="Latest Blogs & Insights"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-600">Section Subtitle</span>
                  <input
                    value={blogsContent.subtitle}
                    onChange={(event) =>
                      setBlogsContent((prev) => ({
                        ...prev,
                        subtitle: event.target.value,
                      }))
                    }
                    className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                    placeholder="Follow top designers and creators to stay inspired."
                  />
                </label>
              </div>
              <p className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                {cardsWithImages}/{BLOG_CARD_COUNT} cards with image
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {blogsContent.items.map((item, index) => (
                <div
                  key={`blog-card-${index}`}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-700">Blog Card {index + 1}/4</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      Blog
                    </span>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      {item.profileImage ? (
                        <img
                          src={item.profileImage}
                          alt={`blog-profile-${index + 1}`}
                          className="aspect-square w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-square items-center justify-center gap-1 text-slate-400">
                          <ImageIcon className="h-3.5 w-3.5" />
                          <span className="text-[11px]">No profile</span>
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      {item.coverImage ? (
                        <img src={item.coverImage} alt={`blog-cover-${index + 1}`} className="aspect-square w-full object-cover" />
                      ) : (
                        <div className="flex aspect-square items-center justify-center gap-1 text-slate-400">
                          <ImageIcon className="h-3.5 w-3.5" />
                          <span className="text-[11px]">No cover</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Name</span>
                      <input
                        value={item.name}
                        onChange={(event) =>
                          setBlogsContent((prev) => {
                            const next = [...prev.items];
                            next[index] = { ...next[index], name: event.target.value };
                            return { ...prev, items: next };
                          })
                        }
                        className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                        placeholder="Yeray Rosales"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Role</span>
                      <input
                        value={item.role}
                        onChange={(event) =>
                          setBlogsContent((prev) => {
                            const next = [...prev.items];
                            next[index] = { ...next[index], role: event.target.value };
                            return { ...prev, items: next };
                          })
                        }
                        className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                        placeholder="UI/UX Designer"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Button Text</span>
                      <input
                        value={item.buttonText}
                        onChange={(event) =>
                          setBlogsContent((prev) => {
                            const next = [...prev.items];
                            next[index] = { ...next[index], buttonText: event.target.value };
                            return { ...prev, items: next };
                          })
                        }
                        className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                        placeholder="Follow"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Navigation Link</span>
                      <input
                        value={item.navigationLink}
                        onChange={(event) =>
                          setBlogsContent((prev) => {
                            const next = [...prev.items];
                            next[index] = { ...next[index], navigationLink: event.target.value };
                            return { ...prev, items: next };
                          })
                        }
                        className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                        placeholder="/blogs/author-profile"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Description</span>
                      <input
                        value={item.description}
                        onChange={(event) =>
                          setBlogsContent((prev) => {
                            const next = [...prev.items];
                            next[index] = { ...next[index], description: event.target.value };
                            return { ...prev, items: next };
                          })
                        }
                        className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                        placeholder="Thoughtful designer focused on clean systems, fast UX, and friendly visual language."
                      />
                    </label>

                    <div className="space-y-1">
                      <span className="text-xs font-medium text-slate-600">Profile Image URL</span>
                      <div className="flex items-center gap-2">
                        <input
                          value={item.profileImage}
                          onChange={(event) =>
                            setBlogsContent((prev) => {
                              const next = [...prev.items];
                              next[index] = { ...next[index], profileImage: event.target.value };
                              return { ...prev, items: next };
                            })
                          }
                          className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                          placeholder="https://..."
                        />
                        <label className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-dashed border-slate-400 bg-slate-50 px-2 text-xs font-medium text-slate-700 transition hover:border-slate-500 hover:bg-slate-100">
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
                                setBlogsContent((prev) => {
                                  const next = [...prev.items];
                                  next[index] = { ...next[index], profileImage: reader.result as string };
                                  return { ...prev, items: next };
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
                      <span className="text-xs font-medium text-slate-600">Cover Image URL</span>
                      <div className="flex items-center gap-2">
                        <input
                          value={item.coverImage}
                          onChange={(event) =>
                            setBlogsContent((prev) => {
                              const next = [...prev.items];
                              next[index] = { ...next[index], coverImage: event.target.value };
                              return { ...prev, items: next };
                            })
                          }
                          className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                          placeholder="https://..."
                        />
                        <label className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-dashed border-slate-400 bg-slate-50 px-2 text-xs font-medium text-slate-700 transition hover:border-slate-500 hover:bg-slate-100">
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
                                setBlogsContent((prev) => {
                                  const next = [...prev.items];
                                  next[index] = { ...next[index], coverImage: reader.result as string };
                                  return { ...prev, items: next };
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
          {isSaving ? "Saving..." : "Save blogs section"}
        </Button>
      </section>
    </div>
  );
}
