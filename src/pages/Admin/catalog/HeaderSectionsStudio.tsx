import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Button } from "@/components/ui/button";
import { defaultHeaderContent, normalizeHeaderContent, type HeaderContent } from "@/lib/headerContent";
import { Link } from "react-router-dom";

export default function HeaderSectionsStudio() {
  const [isSaving, setIsSaving] = useState(false);
  const [fullPayload, setFullPayload] = useState<Record<string, unknown>>({});
  const [header, setHeader] = useState<HeaderContent>(defaultHeaderContent);

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
          setHeader(normalizeHeaderContent(payload.header));
          return;
        }

        const legacyResponse = await fetch(`${baseUrl}/home-content`, { credentials: "include" });
        if (!legacyResponse.ok) return;
        const payload = (await legacyResponse.json()) as Record<string, unknown>;
        if (ignore) return;
        setFullPayload(payload);
        setHeader(normalizeHeaderContent(payload.header));
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
      const payload = { ...fullPayload, header };
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
      toast.success("Header content saved");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save header content");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <TitleBreadCrumbs title="Header Sections Studio" breadCrumbTitle="Admin / Layout Studio / Header Sections" />

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Brand & Search</h2>
        <div className="grid gap-2 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Brand Line 1</span>
            <input
              value={header.brand.line1}
              onChange={(event) => setHeader((prev) => ({ ...prev, brand: { ...prev.brand, line1: event.target.value } }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Brand Line 2</span>
            <input
              value={header.brand.line2}
              onChange={(event) => setHeader((prev) => ({ ...prev, brand: { ...prev.brand, line2: event.target.value } }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Logo Link</span>
            <input
              value={header.brand.logoHref}
              onChange={(event) => setHeader((prev) => ({ ...prev, brand: { ...prev.brand, logoHref: event.target.value } }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
              placeholder="/"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Search Placeholder</span>
            <input
              value={header.search.placeholder}
              onChange={(event) => setHeader((prev) => ({ ...prev, search: { ...prev.search, placeholder: event.target.value } }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Search Button Label</span>
            <input
              value={header.search.buttonLabel}
              onChange={(event) => setHeader((prev) => ({ ...prev, search: { ...prev.search, buttonLabel: event.target.value } }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Header Actions</h2>
        <div className="grid gap-2 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Business Button Label</span>
            <input
              value={header.actions.businessLabel}
              onChange={(event) => setHeader((prev) => ({ ...prev, actions: { ...prev.actions, businessLabel: event.target.value } }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Affiliate Button Label</span>
            <input
              value={header.actions.affiliateLabel}
              onChange={(event) => setHeader((prev) => ({ ...prev, actions: { ...prev.actions, affiliateLabel: event.target.value } }))}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Notification Utility Links</h2>
        <div className="space-y-2">
          {header.notifications.utilityLinks.map((item, index) => (
            <div key={`utility-${index}`} className="flex gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
              <input
                value={item}
                onChange={(event) =>
                  setHeader((prev) => {
                    const next = [...prev.notifications.utilityLinks];
                    next[index] = event.target.value;
                    return { ...prev, notifications: { ...prev.notifications, utilityLinks: next } };
                  })
                }
                className="h-8 flex-1 rounded-md border border-slate-300 bg-white px-2 text-xs"
                placeholder="Utility link text"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-slate-600 hover:bg-red-50 hover:text-red-600"
                onClick={() =>
                  setHeader((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      utilityLinks: prev.notifications.utilityLinks.filter((_, i) => i !== index),
                    },
                  }))
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() =>
            setHeader((prev) => ({
              ...prev,
              notifications: {
                ...prev.notifications,
                utilityLinks: [...prev.notifications.utilityLinks, ""],
              },
            }))
          }
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add Utility Link
        </Button>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <Button variant="outline" asChild>
          <Link to="/admin/layout-studio/header-dropdown">Open Header Dropdown Studio</Link>
        </Button>
        <Button onClick={save} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save header changes"}
        </Button>
      </section>
    </div>
  );
}

