import { useMemo } from "react";
import profile1 from "@/assets/Images/profile-7.jpeg";
import profile2 from "@/assets/Images/profile-8.jpeg";
import profile3 from "@/assets/Images/profile-9.jpeg";
import cover1 from "@/assets/Images/hotel1.jpg";
import cover2 from "@/assets/Images/hotel2.jpg";
import cover3 from "@/assets/Images/hotel3.jpg";
import cover4 from "@/assets/Images/hotel4.jpg";

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
    name: "Yeray Rosales",
    role: "UI/UX Designer",
    description: "Thoughtful designer focused on clean systems, fast UX, and friendly visual language.",
    profileImage: profile1,
    coverImage: cover1,
    buttonText: "Follow",
    navigationLink: "#",
  },
  {
    category: "Product",
    name: "Maya Chen",
    role: "Product Designer",
    description: "Thoughtful designer focused on clean systems, fast UX, and friendly visual language.",
    profileImage: profile2,
    coverImage: cover2,
    buttonText: "Follow",
    navigationLink: "#",
  },
  {
    category: "Visual Art",
    name: "Hugo Park",
    role: "Visual Artist",
    description: "Thoughtful designer focused on clean systems, fast UX, and friendly visual language.",
    profileImage: profile3,
    coverImage: cover3,
    buttonText: "Follow",
    navigationLink: "#",
  },
  {
    category: "Branding",
    name: "Sofia Allen",
    role: "Brand Strategist",
    description: "Thoughtful designer focused on clean systems, fast UX, and friendly visual language.",
    profileImage: profile1,
    coverImage: cover4,
    buttonText: "Follow",
    navigationLink: "#",
  },
];

const fallbackContent: BlogsContent = {
  title: "Latest Blogs & Insights",
  subtitle: "Follow top designers and creators to stay inspired.",
  items: fallbackItems,
};

export default function RecentPosts({ content }: BlogsProps) {
  const merged = useMemo<BlogsContent>(() => {
    const rawItems = Array.isArray(content?.items) ? content.items : [];
    const items = Array.from({ length: BLOG_CARD_COUNT }, (_, index) => {
      const fallback = fallbackItems[index];
      const raw = rawItems[index] ?? {};
      return {
        category: String(raw.category ?? "").trim() || fallback.category,
        name: String(raw.name ?? "").trim() || fallback.name,
        role: String(raw.role ?? "").trim() || fallback.role,
        description: String(raw.description ?? "").trim() || fallback.description,
        profileImage: String(raw.profileImage ?? "").trim() || fallback.profileImage,
        coverImage: String(raw.coverImage ?? "").trim() || fallback.coverImage,
        buttonText: String(raw.buttonText ?? "").trim() || fallback.buttonText,
        navigationLink: String(raw.navigationLink ?? "").trim() || fallback.navigationLink,
      };
    });

    return {
      title: String(content?.title ?? "").trim() || fallbackContent.title,
      subtitle: String(content?.subtitle ?? "").trim() || fallbackContent.subtitle,
      items,
    };
  }, [content]);

  return (
    <section className="relative w-screen -mx-[calc((100vw-100%)/2)] bg-slate-50 py-20">
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold text-slate-900 -mt-10">
            {merged.title}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {merged.subtitle}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {merged.items.map((profile, index) => (
            <a
              key={`${profile.name}-${index}`}
              href={profile.navigationLink || "#"}
              className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition hover:-translate-y-2 hover:shadow-lg"
            >
              <div className="relative h-42.5">
                <img
                  src={profile.coverImage}
                  alt={`${profile.name} cover`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="relative -mt-8 px-4 pb-5">
                <div className="flex items-end justify-between">
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="h-14 w-14 rounded-full border-4 border-white object-cover shadow"
                  />
                  <span className=" mt-10 inline-flex rounded-full border border-blue-400 px-4 py-1 text-xs font-semibold text-blue-500 transition group-hover:border-blue-500 group-hover:text-blue-600">
                    {profile.buttonText}
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                  {profile.name}
                </h3>
                <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                  {profile.category}
                </p>
                <p className="text-xs text-slate-500">{profile.role}</p>

                <p className="mt-4  border-slate-100 pt-3 text-sm text-slate-500">{profile.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
