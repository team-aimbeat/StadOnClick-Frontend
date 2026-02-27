export type HeaderContent = {
  brand: {
    line1: string;
    line2: string;
    logoHref: string;
  };
  search: {
    placeholder: string;
    buttonLabel: string;
  };
  actions: {
    businessLabel: string;
    affiliateLabel: string;
  };
  notifications: {
    utilityLinks: string[];
  };
};

export const defaultHeaderContent: HeaderContent = {
  brand: {
    line1: "StadOnClick",
    line2: "Discover Sweden",
    logoHref: "/",
  },
  search: {
    placeholder: "Search salons, gyms, restaurants, experiences...",
    buttonLabel: "Search",
  },
  actions: {
    businessLabel: "Business on StadOnClick",
    affiliateLabel: "Affiliate Program",
  },
  notifications: {
    utilityLinks: [
      "Curated local moments",
      "Download the companion app",
      "24/7 help on live chat",
    ],
  },
};

export function normalizeHeaderContent(input: unknown): HeaderContent {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const brand = source.brand && typeof source.brand === "object" ? (source.brand as Record<string, unknown>) : {};
  const search = source.search && typeof source.search === "object" ? (source.search as Record<string, unknown>) : {};
  const actions = source.actions && typeof source.actions === "object" ? (source.actions as Record<string, unknown>) : {};
  const notifications =
    source.notifications && typeof source.notifications === "object"
      ? (source.notifications as Record<string, unknown>)
      : {};
  const utilityLinksRaw = Array.isArray(notifications.utilityLinks) ? notifications.utilityLinks : [];
  const utilityLinks = utilityLinksRaw
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, 6);

  return {
    brand: {
      line1: typeof brand.line1 === "string" ? brand.line1 : defaultHeaderContent.brand.line1,
      line2: typeof brand.line2 === "string" ? brand.line2 : defaultHeaderContent.brand.line2,
      logoHref: typeof brand.logoHref === "string" ? brand.logoHref : defaultHeaderContent.brand.logoHref,
    },
    search: {
      placeholder:
        typeof search.placeholder === "string"
          ? search.placeholder
          : defaultHeaderContent.search.placeholder,
      buttonLabel:
        typeof search.buttonLabel === "string"
          ? search.buttonLabel
          : defaultHeaderContent.search.buttonLabel,
    },
    actions: {
      businessLabel:
        typeof actions.businessLabel === "string"
          ? actions.businessLabel
          : defaultHeaderContent.actions.businessLabel,
      affiliateLabel:
        typeof actions.affiliateLabel === "string"
          ? actions.affiliateLabel
          : defaultHeaderContent.actions.affiliateLabel,
    },
    notifications: {
      utilityLinks:
        utilityLinks.length > 0
          ? utilityLinks
          : [...defaultHeaderContent.notifications.utilityLinks],
    },
  };
}
