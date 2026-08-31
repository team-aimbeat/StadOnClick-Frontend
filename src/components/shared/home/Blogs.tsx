import { useMemo } from "react";
import { ArrowRight, Plus } from "lucide-react";

import profile1 from "@/assets/Images/profile-7.jpeg";
import profile2 from "@/assets/Images/profile-8.jpeg";
import profile3 from "@/assets/Images/profile-9.jpeg";
import cover1 from "@/assets/Images/hotel1.jpg";
import cover2 from "@/assets/Images/hotel2.jpg";
import cover3 from "@/assets/Images/hotel3.jpg";
import cover4 from "@/assets/Images/hotel4.jpg";
import ImageWithSkeleton from "@/components/shared/ImageWithSkeleton";

type BlogItem = {
  category: string;
  name: string;
  role: string;
  description: string;
  profileImage: string;
  coverImage: string;
  buttonText: string;
  navigationLink: string;
};

type BlogsContent = {
  title: string;
  subtitle: string;
  items: BlogItem[];
};

type BlogsProps = {
  content?: Partial<BlogsContent>;
};

const BLOG_CARD_COUNT = 4;

const fallbackItems: BlogItem[] = [
  {
    category: "Design",
    name: "Alex Rivera",
    role: "Lead UI/UX Architect",
    description:
      "The intersection of emotion and efficiency is where true product magic happens. This week we break down the psychology behind frictionless discovery.",
    profileImage: profile1,
    coverImage: cover1,
    buttonText: "Follow",
    navigationLink: "#",
  },
  {
    category: "Product Strategy",
    name: "Sarah Chen",
    role: "Product Strategist",
    description:
      "How we reimagined discovery flows to help visitors move from browsing to booking with less cognitive load.",
    profileImage: profile2,
    coverImage: cover2,
    buttonText: "+",
    navigationLink: "#",
  },
  {
    category: "Data Insights",
    name: "Hugo Park",
    role: "Visual Artist",
    description: "Why personalization is becoming the new standard across premium hospitality and lifestyle products.",
    profileImage: profile3,
    coverImage: cover3,
    buttonText: "+",
    navigationLink: "#",
  },
  {
    category: "Team Culture",
    name: "Sofia Allen",
    role: "Brand Strategist",
    description: "Collaborative design in a remote world and how distributed teams keep the voice consistent.",
    profileImage: profile1,
    coverImage: cover4,
    buttonText: "+",
    navigationLink: "#",
  },
];

const fallbackContent: BlogsContent = {
  title: "Latest Blogs & Insights",
  subtitle:
    "Explore deeper narratives and expert breakdowns from the industry's most influential voices in service design and discovery.",
  items: fallbackItems,
};

function pickText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export default function Blogs({ content }: BlogsProps) {
  const merged = useMemo<BlogsContent>(() => {
    const rawItems = Array.isArray(content?.items) ? content.items : [];
    const items = Array.from({ length: BLOG_CARD_COUNT }, (_, index) => {
      const fallback = fallbackItems[index];
      const raw = rawItems[index] ?? {};
      return {
        category: pickText(raw.category, fallback.category),
        name: pickText(raw.name, fallback.name),
        role: pickText(raw.role, fallback.role),
        description: pickText(raw.description, fallback.description),
        profileImage: pickText(raw.profileImage, fallback.profileImage),
        coverImage: pickText(raw.coverImage, fallback.coverImage),
        buttonText: pickText(raw.buttonText, fallback.buttonText),
        navigationLink: pickText(raw.navigationLink, fallback.navigationLink),
      };
    });

    return {
      title: pickText(content?.title, fallbackContent.title),
      subtitle: pickText(content?.subtitle, fallbackContent.subtitle),
      items,
    };
  }, [content]);

  const [featured, curator, insight, culture] = merged.items;
  const creatorName = "Sarah Chen";
  const creatorRole = "Product Strategist";
  const featureTitle = "Scaling Global Service Nodes";
  const featureDescription =
    "How we reimagined discovery flows to help visitors move from browsing to booking with less cognitive load.";
  const insightTitle = "Why Personalization is the New Standard";
  const cultureTitle = "Collaborative Design in a Remote World";

  return (
    <section className="relative w-screen -mx-[calc((100vw-100%)/2)] bg-slate-50 py-8 sm:py-8">
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="rounded-[2rem] border border-white/60 bg-gradient-to-br px-4 py-6  sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-8 grid gap-4 lg:grid-cols-[1.2fr_0.9fr] lg:items-start">
            <div>
              <p className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Curated Perspectives
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-[0.95] text-slate-900 sm:text-4xl lg:text-[3.1rem]">
                {merged.title}
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-slate-500 lg:ml-auto lg:mt-10 lg:text-base">
              {merged.subtitle}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.82fr] lg:gap-8">
            <a
              href={featured?.navigationLink || "#"}
              className="group block overflow-hidden rounded-[1.8rem] bg-white  transition duration-300 hover:-translate-y-1 "
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <ImageWithSkeleton
                  src={featured?.coverImage || cover1}
                  alt={`${featured?.name || "Featured creator"} cover`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  containerClassName="h-full w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
              </div>

              <div className="px-5 pb-5 pt-4 sm:px-6">
                <div className="-mt-10 flex items-end justify-between gap-4">
                  <div className="relative h-14 w-14 shrink-0 rounded-full border-4 border-white bg-white shadow-lg">
                    <img
                      src={featured?.profileImage || profile1}
                      alt={featured?.name || "Featured creator"}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>

                  <span className="inline-flex rounded-full border border-blue-400 px-4 py-1.5 text-xs font-semibold text-blue-600 transition group-hover:border-blue-500 group-hover:bg-blue-50">
                    {featured?.buttonText || "Follow"}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
                    {featured?.name || "Alex Rivera"}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-emerald-700">
                    {featured?.category || "Design"}
                  </p>
                  <p className="text-sm text-slate-500">{featured?.role || "Lead UI/UX Architect"}</p>
                </div>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                  {featured?.description ||
                    "The intersection of emotion and efficiency is where true product magic happens. This week we break down the psychology behind frictionless discovery."}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span>Oct 24, 2024</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>12 min read</span>
                  </div>
                  <span className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition group-hover:bg-blue-700">
                    Follow
                  </span>
                </div>
              </div>
            </a>

            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-white shadow-md">
                    <img
                      src={curator?.profileImage || profile2}
                      alt={curator?.name || "Creator"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {creatorName}
                    </h3>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {creatorRole}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
                  aria-label="Add creator"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <a
                href={curator?.navigationLink || "#"}
                className="group mt-4 overflow-hidden rounded-[1.6rem] bg-white  transition duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <ImageWithSkeleton
                    src={curator?.coverImage || cover2}
                    alt={`${curator?.name || "Creator"} cover`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    containerClassName="h-full w-full"
                  />
                </div>
                <div className="p-4 sm:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-500">
                    {curator?.category || "Data Insights"}
                  </p>
                  <h4 className="mt-2 text-lg font-semibold leading-snug text-slate-900">
                    {featureTitle}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {featureDescription}
                  </p>
                </div>
              </a>

              <div className="mt-4 space-y-3">
                {[insight, culture].map((item, index) => (
                  <a
                    key={`${item?.name || "item"}-${index}`}
                    href={item?.navigationLink || "#"}
                    className="group flex items-center gap-4 rounded-2xl bg-white px-3 py-3  transition "
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      <ImageWithSkeleton
                        src={item?.coverImage || (index === 0 ? cover3 : cover4)}
                        alt={`${item?.name || "Creator"} thumbnail`}
                        className="h-full w-full object-cover"
                        containerClassName="h-full w-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        {item?.category || (index === 0 ? "Data Insights" : "Team Culture")}
                      </p>
                      <h5 className="truncate text-sm font-semibold text-slate-900">
                        {index === 0 ? insightTitle : cultureTitle}
                      </h5>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                  </a>
                ))}
              </div>

              <a
                href="#"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                View All Creators
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
