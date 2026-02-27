import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Button } from "@/components/ui/button";
import { defaultFooterContent, normalizeFooterContent, type FooterContent } from "@/lib/footerContent";

export default function FooterBrandStudio() {
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
      toast.success("Footer brand content saved");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save footer brand content");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <TitleBreadCrumbs title="Footer Brand Studio" breadCrumbTitle="Admin / Catalog / Footer / Brand & Social" />

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">App Promo Content</h2>
        <div className="grid gap-2 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">QR Label</span>
            <input
              value={footer.app.qrLabel}
              onChange={(event) => setFooter((prev) => ({ ...prev, app: { ...prev.app, qrLabel: event.target.value } }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
              placeholder="QR"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Eyebrow</span>
            <input
              value={footer.app.eyebrow}
              onChange={(event) => setFooter((prev) => ({ ...prev, app: { ...prev.app, eyebrow: event.target.value } }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
              placeholder="Marketplace Scale"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Title</span>
            <input
              value={footer.app.title}
              onChange={(event) => setFooter((prev) => ({ ...prev, app: { ...prev.app, title: event.target.value } }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
              placeholder="Download the StadOnClick App"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Description</span>
            <input
              value={footer.app.description}
              onChange={(event) => setFooter((prev) => ({ ...prev, app: { ...prev.app, description: event.target.value } }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
              placeholder="Unlock curated experiences..."
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Button Label</span>
            <input
              value={footer.app.buttonLabel}
              onChange={(event) => setFooter((prev) => ({ ...prev, app: { ...prev.app, buttonLabel: event.target.value } }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
              placeholder="Get the App"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Rating Text</span>
            <input
              value={footer.app.ratingText}
              onChange={(event) => setFooter((prev) => ({ ...prev, app: { ...prev.app, ratingText: event.target.value } }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
              placeholder="4.9 - 120K+ downloads"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Copyright Text</span>
            <input
              value={footer.copyright}
              onChange={(event) => setFooter((prev) => ({ ...prev, copyright: event.target.value }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
              placeholder="StadOnClick. All rights reserved."
            />
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Social Links</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {footer.socialLinks.map((item, index) => (
            <div key={`social-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold text-slate-700">Icon {index + 1}</p>
              <div className="grid gap-2">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-600">Icon Key</span>
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
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-600">Label</span>
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
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-600">Href</span>
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
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={isSaving}>{isSaving ? "Saving..." : "Save footer brand"}</Button>
      </section>
    </div>
  );
}
