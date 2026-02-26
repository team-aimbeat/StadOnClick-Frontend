import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
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
            <div className="grid gap-3 md:grid-cols-2">
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
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
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
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                  placeholder="Follow top designers and creators to stay inspired."
                />
              </label>
            </div>

            <div className="space-y-2">
              {blogsContent.items.map((item, index) => (
                <div key={`blog-card-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-slate-600">Blog Card {index + 1}/4</p>
                  <div className="grid gap-3 md:grid-cols-2">
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
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
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
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
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
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
                        placeholder="Follow"
                      />
                    </label>
                    <label className="space-y-1 md:col-span-2">
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
                        className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs"
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
