import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HomeSectionsStudio() {
  return (
    <div className="space-y-6">
      <TitleBreadCrumbs title="Home Sections Studio" breadCrumbTitle="Admin / Catalog / Home Sections" />

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Section Pages</h2>
        <p className="text-sm text-slate-600">Open each child page to edit section-wise content.</p>
        <div className="grid gap-3 md:grid-cols-4">
          <Link to="/admin/catalog/home-sections/hero" className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Hero Section</p>
            <p className="mt-1 text-xs text-slate-600">Heading, subheading, banners, popular chips.</p>
          </Link>
          <Link to="/admin/catalog/home-sections/deals" className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Deals Section</p>
            <p className="mt-1 text-xs text-slate-600">Edit only deals content JSON.</p>
          </Link>
          <Link to="/admin/catalog/home-sections/blogs" className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Blogs Section</p>
            <p className="mt-1 text-xs text-slate-600">Edit blogs heading, cards, and images.</p>
          </Link>
          <Link to="/admin/catalog/home-sections/other" className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Other Sections</p>
            <p className="mt-1 text-xs text-slate-600">Categories, trending, travel, and more.</p>
          </Link>
        </div>
      </section>
      <section>
        <Button asChild>
          <Link to="/admin/catalog/home-sections/hero">Open Hero Section</Link>
        </Button>
      </section>
    </div>
  );
}
