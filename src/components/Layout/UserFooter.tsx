import { useId, type FormEvent } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      { label: "About", href: "#" },
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

const socialLinks: SocialLink[] = [
  { label: "Follow us on Facebook", href: "#", icon: Facebook },
  { label: "Follow us on Instagram", href: "#", icon: Instagram },
  { label: "Follow us on X", href: "#", icon: X },
  { label: "Connect on LinkedIn", href: "#", icon: Linkedin },
];

const legalLinks: FooterLink[] = [
  { label: "Terms", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Do Not Sell", href: "#" },
  { label: "Sitemap", href: "#" },
  { label: "Licenses", href: "#" },
];

const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
};

const UserFooter = () => {
  const emailInputId = useId();
  const regionSelectId = useId();

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.4fr,1fr,1fr,auto] lg:items-start">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-slate-300 bg-white/70 text-xs font-semibold uppercase tracking-widest text-slate-500 shadow-sm shadow-slate-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                QR
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Marketplace Scale
                </p>
                <h2 className="text-2xl font-semibold leading-tight text-slate-900 dark:text-slate-50">
                  Download the StadOnClick App
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Unlock curated experiences, deals, and vendor intelligence in
                  one trusted destination.
                </p>
                <Button
                  variant="default"
                  className="w-full sm:w-auto"
                  type="button"
                  aria-label="Get the StadOnClick app"
                >
                  Get the App
                </Button>
                <div className="flex items-center gap-2 text-sm font-medium text-amber-500">
                  <Star className="h-4 w-4" aria-hidden />
                  <span className="text-slate-600 dark:text-slate-300">
                    4.9 ┬╖ 120K+ downloads
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Follow us
            </p>
            <div className="flex gap-3 text-slate-600 dark:text-slate-200">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
                  aria-label={link.label}
                  href={link.href}
                >
                  <link.icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10">
          <Separator className="border-slate-200 dark:border-slate-800" />
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {navColumns.map((column) => (
            <div key={column.title} className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {column.title}
              </p>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      className="hover:text-slate-900 hover:underline dark:hover:text-white"
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
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Quick Links
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Categories
            </p>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    className="hover:text-slate-900 hover:underline dark:hover:text-white"
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
            className="rounded-2xl border border-slate-200 bg-white/60 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
          >
            <AccordionItem value="quick-links">
              <AccordionTrigger className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Categories
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {quickLinks.map((link) => (
                    <li key={link.label}>
                      <a
                        className="hover:text-slate-900 hover:underline dark:hover:text-white"
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
        <div className="mt-10 border-t border-slate-200/70 pt-6 text-xs text-slate-600 dark:border-slate-800/80 dark:text-slate-400 sm:flex sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            ┬⌐ {new Date().getFullYear()} StadOnClick. All rights reserved.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400 sm:mt-0">
            {legalLinks.map((link) => (
              <a key={link.label} className="hover:underline" href={link.href}>
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
