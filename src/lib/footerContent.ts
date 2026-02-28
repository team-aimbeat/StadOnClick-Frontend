export type FooterLinkItem = {
  label: string;
  href: string;
};

export type FooterColumnContent = {
  title: string;
  links: FooterLinkItem[];
};

export type FooterSocialLink = {
  label: string;
  href: string;
  icon: "facebook" | "instagram" | "x" | "linkedin" | "globe";
};

export type FooterAppContent = {
  qrLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  ratingText: string;
};

export type FooterContent = {
  app: FooterAppContent;
  columns: FooterColumnContent[];
  quickLinks: FooterLinkItem[];
  legalLinks: FooterLinkItem[];
  socialLinks: FooterSocialLink[];
  copyright: string;
};

export const defaultFooterContent: FooterContent = {
  app: {
    qrLabel: "QR",
    eyebrow: "Marketplace Scale",
    title: "Download the StadOnClick App",
    description: "Unlock curated experiences, deals, and vendor intelligence in one trusted destination.",
    buttonLabel: "Get the App",
    ratingText: "4.9 - 120K+ downloads",
  },
  columns: [
    {
      title: "Support",
      links: [
        { label: "Customer Support", href: "#" },
        { label: "Refund Policy", href: "#" },
        { label: "Report an Issue", href: "#" },
        { label: "Accessibility", href: "#" },
        { label: "Legal Notice", href: "#" },
      ],
    },
    {
      title: "Sell With Us",
      links: [
        { label: "Join Marketplace", href: "#" },
        { label: "Run a Campaign", href: "#" },
        { label: "Affiliate Program", href: "#" },
        { label: "Vendor Guidelines", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Careers", href: "#" },
        { label: "Press", href: "#" },
        { label: "Investor Relations", href: "#" },
        { label: "Leadership", href: "#" },
      ],
    },
  ],
  quickLinks: [
    { label: "Gift Collections", href: "#" },
    { label: "Curated Deals", href: "#" },
    { label: "Premium Experiences", href: "#" },
  ],
  legalLinks: [
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Do Not Sell", href: "#" },
    { label: "Sitemap", href: "#" },
    { label: "Licenses", href: "#" },
  ],
  socialLinks: [
    { label: "Follow us on Facebook", href: "#", icon: "facebook" },
    { label: "Follow us on Instagram", href: "#", icon: "instagram" },
    { label: "Follow us on X", href: "#", icon: "x" },
    { label: "Connect on LinkedIn", href: "#", icon: "linkedin" },
  ],
  copyright: "StadOnClick. All rights reserved.",
};

function normalizeLinkItem(input: unknown, fallback: FooterLinkItem): FooterLinkItem {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  return {
    label: typeof source.label === "string" ? source.label : fallback.label,
    href: typeof source.href === "string" ? source.href : fallback.href,
  };
}

function normalizeColumn(input: unknown, fallback: FooterColumnContent): FooterColumnContent {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const rawLinks = Array.isArray(source.links) ? source.links : [];
  return {
    title: typeof source.title === "string" ? source.title : fallback.title,
    links:
      rawLinks.length > 0
        ? rawLinks.map((item, index) => normalizeLinkItem(item, fallback.links[index] ?? { label: "", href: "#" }))
        : fallback.links.map((item) => ({ ...item })),
  };
}

function normalizeSocial(input: unknown, fallback: FooterSocialLink): FooterSocialLink {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const icon = typeof source.icon === "string" ? source.icon : fallback.icon;
  const safeIcon = ["facebook", "instagram", "x", "linkedin", "globe"].includes(icon) ? icon : fallback.icon;
  return {
    label: typeof source.label === "string" ? source.label : fallback.label,
    href: typeof source.href === "string" ? source.href : fallback.href,
    icon: safeIcon as FooterSocialLink["icon"],
  };
}

export function normalizeFooterContent(input: unknown): FooterContent {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const rawApp = source.app && typeof source.app === "object" ? (source.app as Record<string, unknown>) : {};
  const rawColumns = Array.isArray(source.columns) ? source.columns : [];
  const rawQuick = Array.isArray(source.quickLinks) ? source.quickLinks : [];
  const rawLegal = Array.isArray(source.legalLinks) ? source.legalLinks : [];
  const rawSocial = Array.isArray(source.socialLinks) ? source.socialLinks : [];

  return {
    app: {
      qrLabel: typeof rawApp.qrLabel === "string" ? rawApp.qrLabel : defaultFooterContent.app.qrLabel,
      eyebrow: typeof rawApp.eyebrow === "string" ? rawApp.eyebrow : defaultFooterContent.app.eyebrow,
      title: typeof rawApp.title === "string" ? rawApp.title : defaultFooterContent.app.title,
      description: typeof rawApp.description === "string" ? rawApp.description : defaultFooterContent.app.description,
      buttonLabel: typeof rawApp.buttonLabel === "string" ? rawApp.buttonLabel : defaultFooterContent.app.buttonLabel,
      ratingText: typeof rawApp.ratingText === "string" ? rawApp.ratingText : defaultFooterContent.app.ratingText,
    },
    columns: defaultFooterContent.columns.map((fallback, index) => normalizeColumn(rawColumns[index], fallback)),
    quickLinks:
      rawQuick.length > 0
        ? rawQuick.map((item, index) => normalizeLinkItem(item, defaultFooterContent.quickLinks[index] ?? { label: "", href: "#" }))
        : defaultFooterContent.quickLinks.map((item) => ({ ...item })),
    legalLinks:
      rawLegal.length > 0
        ? rawLegal.map((item, index) => normalizeLinkItem(item, defaultFooterContent.legalLinks[index] ?? { label: "", href: "#" }))
        : defaultFooterContent.legalLinks.map((item) => ({ ...item })),
    socialLinks:
      rawSocial.length > 0
        ? rawSocial.map((item, index) => normalizeSocial(item, defaultFooterContent.socialLinks[index] ?? defaultFooterContent.socialLinks[0]))
        : defaultFooterContent.socialLinks.map((item) => ({ ...item })),
    copyright:
      typeof source.copyright === "string"
        ? source.copyright
        : defaultFooterContent.copyright,
  };
}
