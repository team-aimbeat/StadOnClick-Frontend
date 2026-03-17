import { Link } from "react-router-dom"

import profile1 from "@/assets/Images/profile-7.jpeg"
import profile2 from "@/assets/Images/profile-8.jpeg"
import profile3 from "@/assets/Images/profile-9.jpeg"
import cover1 from "@/assets/Images/hotel1.jpg"
import cover2 from "@/assets/Images/hotel2.jpg"
import cover3 from "@/assets/Images/hotel3.jpg"
import cover4 from "@/assets/Images/hotel4.jpg"

export type BlogPost = {
  id: string
  name: string
  role: string
  image: string
  cover: string
  title: string
  excerpt: string
  category: string
  date: string
  readingTime: string
}

export const blogPosts: BlogPost[] = [
  {
    id: "design-systems",
    name: "Yeray Rosales",
    role: "Lead UI/UX Designer",
    image: profile1,
    cover: cover1,
    title: "Design systems for modern venue experiences",
    excerpt:
      "Reusable patterns that keep every listing, ticket, and confirmation feeling familiar.",
    category: "Product",
    date: "February 15, 2026",
    readingTime: "6 min read",
  },
  {
    id: "community-stories",
    name: "Maya Chen",
    role: "Product Designer",
    image: profile2,
    cover: cover2,
    title: "Stories from Stockholm's boutique spas",
    excerpt:
      "Local partners share how trust, timing, and storytelling keep bookings full.",
    category: "Community",
    date: "February 9, 2026",
    readingTime: "5 min read",
  },
  {
    id: "visual-trends",
    name: "Hugo Park",
    role: "Visual Artist",
    image: profile3,
    cover: cover3,
    title: "Visual storytelling in travel marketing",
    excerpt:
      "3 creative rules we follow when curating lifestyle experiences for new guests.",
    category: "Creative",
    date: "January 28, 2026",
    readingTime: "4 min read",
  },
  {
    id: "brand-strategy",
    name: "Sofia Allen",
    role: "Brand Strategist",
    image: profile1,
    cover: cover4,
    title: "Brand strategy for service-first marketplaces",
    excerpt:
      "How consistent tone, imagery, and policies keep trust high across cities.",
    category: "Brand",
    date: "January 20, 2026",
    readingTime: "5 min read",
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
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900 -mt-10">
              Latest Blogs &amp; Insights
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Follow top designers and creators to stay inspired.
            </p>
          </div>
          <Link
            to="/blogs"
            className="text-sm font-semibold text-blue-500 transition hover:text-blue-600"
          >
            Explore the blog hub →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition hover:-translate-y-2 hover:shadow-lg"
            >
              <div className="relative h-42.5">
                <img
                  src={post.cover}
                  alt={`${post.name} cover`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="relative -mt-8 px-4 pb-5">
                <div className="flex items-end justify-between">
                  {/* <img
                    src={post.image}
                    alt={post.name}
                    className="h-14 w-14 rounded-full border-4 border-white object-cover shadow"
                  /> */}
                  <Link
                    to="/blogs"
                    className="mt-10 ml-5 rounded-full border border-blue-400 px-4 py-1 text-xs font-semibold text-blue-500 transition hover:border-blue-500 hover:text-blue-600"
                  >
                    Read story
                  </Link>
                </div>

                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                  {post.name}
                </h3>
                <p className="text-xs text-slate-500">{post.role}</p>

                <p className="mt-4 border-slate-100 pt-3 text-sm text-slate-500">
                  Thoughtful designer focused on clean systems, fast UX, and
                  friendly visual language.
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
