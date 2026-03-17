import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Button } from "@/components/ui/button";
import { defaultFooterContent, normalizeFooterContent, type FooterContent } from "@/lib/footerContent";

export default function FooterLinksStudio() {
  const [isSaving, setIsSaving] = useState(false);
  const [fullPayload, setFullPayload] = useState<Record<string, unknown>>({});
  const [footer, setFooter] = useState<FooterContent>(defaultFooterContent);

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
      toast.success("Footer links saved");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save footer links");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <TitleBreadCrumbs title="Footer Links Studio" breadCrumbTitle="Admin / Catalog / Footer / Links & Legal" />

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Navigation Columns</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {footer.columns.map((column, colIndex) => (
            <div key={`column-${colIndex}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <label className="mb-2 block space-y-1">
                <span className="text-xs font-medium text-slate-600">Column Title</span>
                <input
                  value={column.title}
                  onChange={(event) =>
                    setFooter((prev) => {
                      const next = [...prev.columns];
                      next[colIndex] = { ...next[colIndex], title: event.target.value };
                      return { ...prev, columns: next };
                    })
                  }
                  className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                />
              </label>
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
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Quick Links</h2>
          <div className="space-y-2">
            {footer.quickLinks.map((link, index) => (
              <div key={`quick-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-2">
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

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Legal Links</h2>
          <div className="space-y-2">
            {footer.legalLinks.map((link, index) => (
              <div key={`legal-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-2">
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
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={isSaving}>{isSaving ? "Saving..." : "Save footer links"}</Button>
      </section>
    </div>
  );
}
