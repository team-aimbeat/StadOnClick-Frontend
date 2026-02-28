import { plannedCategories } from "@/data/vendorServiceCategories";

export type HeaderDropdownCard = {
  slug: string;
  title: string;
  badge: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  imageOptimized?: string;
  showSubcategories: boolean;
  hiddenSubcategorySlugs: string[];
};

export type HeaderDropdownContent = {
  cards: HeaderDropdownCard[];
};

export const defaultHeaderDropdownContent: HeaderDropdownContent = {
  cards: plannedCategories.map((category) => ({
    slug: category.slug,
    title: category.name,
    badge: "Featured Category",
    ctaLabel: "Explore Now ->",
    ctaHref: `/services/${category.slug}`,
    image: category.image,
    imageOptimized: category.imageOptimized,
    showSubcategories: true,
    hiddenSubcategorySlugs: [],
  })),
};

export function normalizeHeaderDropdownContent(input: unknown): HeaderDropdownContent {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const rawCards = Array.isArray(source.cards) ? source.cards : [];

  const rawBySlug = new Map<string, Record<string, unknown>>();
  rawCards.forEach((item) => {
    if (!item || typeof item !== "object") return;
    const record = item as Record<string, unknown>;
    const slug = typeof record.slug === "string" ? record.slug : "";
    if (!slug) return;
    rawBySlug.set(slug, record);
  });

  return {
    cards: plannedCategories.map((category) => {
      const raw = rawBySlug.get(category.slug);
      return {
        slug: category.slug,
        title: typeof raw?.title === "string" ? raw.title : category.name,
        badge: typeof raw?.badge === "string" ? raw.badge : "Featured Category",
        ctaLabel: typeof raw?.ctaLabel === "string" ? raw.ctaLabel : "Explore Now ->",
        ctaHref: typeof raw?.ctaHref === "string" ? raw.ctaHref : `/services/${category.slug}`,
        image: typeof raw?.image === "string" ? raw.image : category.image,
        imageOptimized:
          typeof raw?.imageOptimized === "string"
            ? raw.imageOptimized
            : category.imageOptimized,
        showSubcategories:
          typeof raw?.showSubcategories === "boolean"
            ? raw.showSubcategories
            : true,
        hiddenSubcategorySlugs: Array.isArray(raw?.hiddenSubcategorySlugs)
          ? raw.hiddenSubcategorySlugs
              .map((item) => String(item ?? "").trim())
              .filter(Boolean)
          : [],
      };
    }),
  };
}
