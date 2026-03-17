import { useEffect, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Star,
  X,
  type LucideIcon,
} from "lucide-react";

type FooterLink = {
  label: string;
  href: string;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

type RegionOption = {
  value: string;
  label: string;
};

type SocialLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navColumns: FooterColumn[] = [
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
      { label: "Blog", href: "/blogs" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Investor Relations", href: "#" },
      { label: "Leadership", href: "#" },
    ],
  },
];

const quickLinks: FooterLink[] = [
  { label: "Gift Collections", href: "#" },
  { label: "Curated Deals", href: "#" },
  { label: "Premium Experiences", href: "#" },
];

const regionOptions: RegionOption[] = [
  { value: "usa", label: "USA" },
  { value: "india", label: "India" },
  { value: "uk", label: "United Kingdom" },
  { value: "eu", label: "European Union" },
];

const iconMap = {
  facebook: Facebook,
  instagram: Instagram,
  x: X,
  linkedin: Linkedin,
  globe: Globe,
} as const;

const UserFooter = () => {
  const [footerContent, setFooterContent] =
    useState<FooterContent>(defaultFooterContent);

  useEffect(() => {
    let ignore = false;
    const loadFooter = async () => {
      try {
        const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(
          /\/+$/,
          "",
        );
        if (!baseUrl) return;

        const cmsResponse = await fetch(`${baseUrl}/pages/home`, {
          credentials: "include",
        });
        if (cmsResponse.ok) {
          const payload = (await cmsResponse.json()) as Record<string, unknown>;
          if (!ignore) setFooterContent(normalizeFooterContent(payload.footer));
          return;
        }

        const legacyResponse = await fetch(`${baseUrl}/home-content`, {
          credentials: "include",
        });
        if (!legacyResponse.ok) return;
        const payload = (await legacyResponse.json()) as Record<
          string,
          unknown
        >;
        if (!ignore) setFooterContent(normalizeFooterContent(payload.footer));
      } catch {
        // keep defaults
      }
    };

    void loadFooter();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <footer className="bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.4fr,1fr,1fr,auto] lg:items-start">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-slate-300 bg-white/70 text-xs font-semibold uppercase tracking-widest text-slate-500 shadow-sm shadow-slate-200">
                {footerContent.app.qrLabel}
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-700">
                  {footerContent.app.eyebrow}
                </p>
                <h2 className="text-2xl font-semibold leading-tight text-slate-900">
                  {footerContent.app.title}
                </h2>
                <p className="text-sm text-slate-700">
                  {footerContent.app.description}
                </p>
                <Button
                  variant="default"
                  className="w-full sm:w-auto"
                  type="button"
                  aria-label="Get the StadOnClick app"
                >
                  {footerContent.app.buttonLabel}
                </Button>
                <div className="flex items-center gap-2 text-sm font-medium text-amber-500">
                  <Star className="h-4 w-4" aria-hidden />
                  <span className="text-slate-700">
                    {footerContent.app.ratingText}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-700">
              Follow us
            </p>
            <div className="flex gap-3 text-slate-600">
              {footerContent.socialLinks.map((link) => {
                const Icon = iconMap[link.icon] ?? Globe;
                return (
                  <a
                    key={`${link.label}-${link.href}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                    aria-label={link.label}
                    href={link.href}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-10">
          <Separator className="border-slate-200" />
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {footerContent.columns.map((column) => (
            <div key={column.title} className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-700">
                {column.title}
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                {column.links.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <a
                      className="hover:text-slate-900 hover:underline"
                      href={link.href}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="hidden flex-col gap-3 lg:flex">
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-700">
              Quick Links
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Categories
            </p>
            <ul className="space-y-2 text-sm text-slate-700">
              {footerContent.quickLinks.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  <a
                    className="hover:text-slate-900 hover:underline"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-6 lg:hidden">
          <Accordion
            type="single"
            collapsible
            className="rounded-2xl border border-slate-200 bg-white/60 shadow-sm"
          >
            <AccordionItem value="quick-links">
              <AccordionTrigger className="text-sm font-semibold uppercase tracking-widest text-slate-700">
                Categories
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm text-slate-700">
                  {footerContent.quickLinks.map((link) => (
                    <li key={`${link.label}-${link.href}`}>
                      <a
                        className="hover:text-slate-900 hover:underline"
                        href={link.href}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className="mt-10 border-t border-slate-200/70 pt-6 text-xs text-slate-600 sm:flex sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600">
            (c) {new Date().getFullYear()} {footerContent.copyright}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500 sm:mt-0">
            {footerContent.legalLinks.map((link) => (
              <a
                key={`${link.label}-${link.href}`}
                className="hover:underline"
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UserFooter;
