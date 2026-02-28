import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Button } from "@/components/ui/button";
import { defaultFooterContent, normalizeFooterContent, type FooterContent } from "@/lib/footerContent";

export default function FooterSectionsStudio() {
  const [isSaving, setIsSaving] = useState(false);
  const [fullPayload, setFullPayload] = useState<Record<string, unknown>>({});
  const [footer, setFooter] = useState<FooterContent>(defaultFooterContent);
  const socialFilled = useMemo(
    () => footer.socialLinks.filter((item) => item.label.trim() || item.href.trim()).length,
    [footer.socialLinks],
  );
  const navLinksCount = useMemo(
    () => footer.columns.reduce((sum, col) => sum + col.links.length, 0),
    [footer.columns],
  );
  const quickCount = footer.quickLinks.length;
  const legalCount = footer.legalLinks.length;

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
          setFooter(normalizeFooterContent(payload.footer));
          return;
        }

        const legacyResponse = await fetch(`${baseUrl}/home-content`, { credentials: "include" });
        if (!legacyResponse.ok) return;
        const payload = (await legacyResponse.json()) as Record<string, unknown>;
        if (ignore) return;
        setFullPayload(payload);
        setFooter(normalizeFooterContent(payload.footer));
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
      const payload = { ...fullPayload, footer };
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
      toast.success("Footer content saved");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save footer content");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <TitleBreadCrumbs title="Footer Sections Studio" breadCrumbTitle="Admin / Layout Studio / Footer Sections" />

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Brand & Social</h2>
            <p className="text-xs text-slate-500">App promo copy, footer identity, and social profiles.</p>
          </div>
          <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {socialFilled}/{footer.socialLinks.length} social links filled
          </p>
        </div>
        <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">QR Label</span>
            <input
              value={footer.app.qrLabel}
              onChange={(event) => setFooter((prev) => ({ ...prev, app: { ...prev.app, qrLabel: event.target.value } }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Eyebrow</span>
            <input
              value={footer.app.eyebrow}
              onChange={(event) => setFooter((prev) => ({ ...prev, app: { ...prev.app, eyebrow: event.target.value } }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Title</span>
            <input
              value={footer.app.title}
              onChange={(event) => setFooter((prev) => ({ ...prev, app: { ...prev.app, title: event.target.value } }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Description</span>
            <input
              value={footer.app.description}
              onChange={(event) => setFooter((prev) => ({ ...prev, app: { ...prev.app, description: event.target.value } }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Button Label</span>
            <input
              value={footer.app.buttonLabel}
              onChange={(event) => setFooter((prev) => ({ ...prev, app: { ...prev.app, buttonLabel: event.target.value } }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Rating Text</span>
            <input
              value={footer.app.ratingText}
              onChange={(event) => setFooter((prev) => ({ ...prev, app: { ...prev.app, ratingText: event.target.value } }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Copyright Text</span>
            <input
              value={footer.copyright}
              onChange={(event) => setFooter((prev) => ({ ...prev, copyright: event.target.value }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {footer.socialLinks.map((item, index) => (
            <div key={`social-${index}`} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">Social {index + 1}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{item.icon}</span>
              </div>
              <div className="grid gap-2">
                <select
                  value={item.icon}
                  onChange={(event) =>
                    setFooter((prev) => {
                      const next = [...prev.socialLinks];
                      next[index] = { ...next[index], icon: event.target.value as typeof item.icon };
                      return { ...prev, socialLinks: next };
                    })
                  }
                  className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                >
                  <option value="facebook">facebook</option>
                  <option value="instagram">instagram</option>
                  <option value="x">x</option>
                  <option value="linkedin">linkedin</option>
                  <option value="globe">globe</option>
                </select>
                <input
                  value={item.label}
                  onChange={(event) =>
                    setFooter((prev) => {
                      const next = [...prev.socialLinks];
                      next[index] = { ...next[index], label: event.target.value };
                      return { ...prev, socialLinks: next };
                    })
                  }
                  className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                  placeholder="Label"
                />
                <input
                  value={item.href}
                  onChange={(event) =>
                    setFooter((prev) => {
                      const next = [...prev.socialLinks];
                      next[index] = { ...next[index], href: event.target.value };
                      return { ...prev, socialLinks: next };
                    })
                  }
                  className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                  placeholder="https://..."
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Links & Legal</h2>
            <p className="text-xs text-slate-500">Navigation columns, quick links, and legal footer links.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Nav links: {navLinksCount}</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Quick: {quickCount}</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Legal: {legalCount}</span>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {footer.columns.map((column, colIndex) => (
            <div key={`column-${colIndex}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Column {colIndex + 1}</p>
              <input
                value={column.title}
                onChange={(event) =>
                  setFooter((prev) => {
                    const next = [...prev.columns];
                    next[colIndex] = { ...next[colIndex], title: event.target.value };
                    return { ...prev, columns: next };
                  })
                }
                className="mb-2 h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                placeholder="Column Title"
              />
              <div className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <div key={`col-${colIndex}-link-${linkIndex}`} className="rounded-md border border-slate-200 bg-white p-2">
                    <input
                      value={link.label}
                      onChange={(event) =>
                        setFooter((prev) => {
                          const next = [...prev.columns];
                          const links = [...next[colIndex].links];
                          links[linkIndex] = { ...links[linkIndex], label: event.target.value };
                          next[colIndex] = { ...next[colIndex], links };
                          return { ...prev, columns: next };
                        })
                      }
                      className="mb-1 h-7 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                      placeholder="Label"
                    />
                    <div className="flex gap-1">
                      <input
                        value={link.href}
                        onChange={(event) =>
                          setFooter((prev) => {
                            const next = [...prev.columns];
                            const links = [...next[colIndex].links];
                            links[linkIndex] = { ...links[linkIndex], href: event.target.value };
                            next[colIndex] = { ...next[colIndex], links };
                            return { ...prev, columns: next };
                          })
                        }
                        className="h-7 flex-1 rounded-md border border-slate-300 bg-white px-2 text-xs"
                        placeholder="/path or https://..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-1.5 text-slate-600 hover:bg-red-50 hover:text-red-600"
                        onClick={() =>
                          setFooter((prev) => {
                            const next = [...prev.columns];
                            const links = next[colIndex].links.filter((_, i) => i !== linkIndex);
                            next[colIndex] = { ...next[colIndex], links };
                            return { ...prev, columns: next };
                          })
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 h-8 w-full"
                onClick={() =>
                  setFooter((prev) => {
                    const next = [...prev.columns];
                    next[colIndex] = { ...next[colIndex], links: [...next[colIndex].links, { label: "", href: "#" }] };
                    return { ...prev, columns: next };
                  })
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add Link
              </Button>
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
            <p className="mb-2 text-sm font-semibold text-slate-800">Quick Links</p>
            <div className="space-y-2">
              {footer.quickLinks.map((link, index) => (
                <div key={`quick-${index}`} className="rounded-md border border-slate-200 bg-white p-2">
                  <input
                    value={link.label}
                    onChange={(event) =>
                      setFooter((prev) => {
                        const next = [...prev.quickLinks];
                        next[index] = { ...next[index], label: event.target.value };
                        return { ...prev, quickLinks: next };
                      })
                    }
                    className="mb-1 h-7 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                    placeholder="Label"
                  />
                  <div className="flex gap-1">
                    <input
                      value={link.href}
                      onChange={(event) =>
                        setFooter((prev) => {
                          const next = [...prev.quickLinks];
                          next[index] = { ...next[index], href: event.target.value };
                          return { ...prev, quickLinks: next };
                        })
                      }
                      className="h-7 flex-1 rounded-md border border-slate-300 bg-white px-2 text-xs"
                      placeholder="/path or https://..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-1.5 text-slate-600 hover:bg-red-50 hover:text-red-600"
                      onClick={() =>
                        setFooter((prev) => ({
                          ...prev,
                          quickLinks: prev.quickLinks.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 h-8 w-full"
              onClick={() => setFooter((prev) => ({ ...prev, quickLinks: [...prev.quickLinks, { label: "", href: "#" }] }))}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Quick Link
            </Button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
            <p className="mb-2 text-sm font-semibold text-slate-800">Legal Links</p>
            <div className="space-y-2">
              {footer.legalLinks.map((link, index) => (
                <div key={`legal-${index}`} className="rounded-md border border-slate-200 bg-white p-2">
                  <input
                    value={link.label}
                    onChange={(event) =>
                      setFooter((prev) => {
                        const next = [...prev.legalLinks];
                        next[index] = { ...next[index], label: event.target.value };
                        return { ...prev, legalLinks: next };
                      })
                    }
                    className="mb-1 h-7 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                    placeholder="Label"
                  />
                  <div className="flex gap-1">
                    <input
                      value={link.href}
                      onChange={(event) =>
                        setFooter((prev) => {
                          const next = [...prev.legalLinks];
                          next[index] = { ...next[index], href: event.target.value };
                          return { ...prev, legalLinks: next };
                        })
                      }
                      className="h-7 flex-1 rounded-md border border-slate-300 bg-white px-2 text-xs"
                      placeholder="/path or https://..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-1.5 text-slate-600 hover:bg-red-50 hover:text-red-600"
                      onClick={() =>
                        setFooter((prev) => ({
                          ...prev,
                          legalLinks: prev.legalLinks.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 h-8 w-full"
              onClick={() => setFooter((prev) => ({ ...prev, legalLinks: [...prev.legalLinks, { label: "", href: "#" }] }))}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Legal Link
            </Button>
          </div>
        </div>
      </section>

      <section className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-md backdrop-blur">
        <p className="text-xs text-slate-500">Changes apply to the live website footer after saving.</p>
        <Button onClick={save} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save footer changes"}
        </Button>
      </section>
    </div>
  );
}

