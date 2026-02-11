export const slugifyServiceTitle = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const slugToSearchQuery = (slug: string) =>
  slug
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
