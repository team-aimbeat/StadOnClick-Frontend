import { Link } from "react-router-dom"
import { useEffect } from "react"
import { useAppDispatch } from "@/app/hooks"
import { setPageTitle } from "@/features/Layout/themeConfigSlice"
import heroImage from "@/assets/Images/hotel4.jpg"
import { blogPosts } from "@/components/shared/home/Blogs"
import eventImage from "@/assets/images/event.jpg"

const topicHighlights = [
  {
    title: "Community stories",
    detail:
      "Partner spotlights from spas, salons, and experience hosts who keep the guest loop tight.",
  },
  {
    title: "Creator insights",
    detail:
      "Design, product, and marketing teams share how we keep the StadOnClick voice consistent.",
  },
  {
    title: "Marketplace growth",
    detail:
      "Ops, analytics, and partnerships explain how we scale safety, trust, and revenue.",
  },
]

export default function BlogsPage() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setPageTitle("Blogs"))
  }, [dispatch])

  const categories = Array.from(new Set(blogPosts.map((post) => post.category)))
  const featuredPost = blogPosts[0]
  const curatedReads = blogPosts.slice(1, 3)
  const stats = [
    {
      value: `${blogPosts.length}+`,
      label: "Stories published",
      detail: "Hand-picked threads from creators, hosts, and operators.",
    },
    {
      value: "18 cities",
      label: "Local perspectives",
      detail: "Insights pulled from partner teams worldwide.",
    },
    {
      value: "4 min avg.",
      label: "Read time",
      detail: "Bite-sized stories designed for busy local pros.",
    },
  ]
  const trendingTopics = Array.from(
    new Set([
      ...categories,
      "Creator tips",
      "Community trust",
      "Marketplace strategy",
      "Guest stories",
      "Visual trends",
    ])
  ).slice(0, 6)

  return (
    <main className="mx-auto w-full max-w-387.5 px-4  sm:px-6 lg:px-8 text-slate-900">
   <header
  className="
    relative left-1/2 right-1/2
    -ml-[50vw] -mr-[50vw]
    w-screen mb-10
    overflow-hidden py-6
    text-center text-white
  "
  style={{
    backgroundImage: `url(${eventImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Editorial atmosphere"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-800/80" />
        </div>
        <div className="relative flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 py-16 text-center text-white sm:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            StadOnClick Journal
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
            Stories that spark local discovery
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            Deep dives, creator spotlights, and behind-the-scenes notes from the
            whole StadOnClick team.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/marketplace"
              className="rounded-full border border-white/40 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white hover:bg-white/20"
            >
              Browse experiences
            </Link>
            <Link
              to="/about"
              className="rounded-full border border-white/40 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white hover:bg-white/20"
            >
              Meet the team
            </Link>
          </div>
        </div>
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topicHighlights.map((topic) => (
          <article
            key={topic.title}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              {topic.title}
            </p>
            <p className="mt-3 text-sm text-slate-600">{topic.detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {stat.label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {stat.value}
            </p>
            <p className="mt-4 text-sm text-slate-500">{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900/80 via-slate-900 to-slate-800 p-6 text-white shadow-2xl sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-300">
              Trending now
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Fresh angles to explore</h3>
          </div>
          <div className="text-right text-xs uppercase tracking-[0.3em] text-slate-300">
            Curated every week
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-200">
          Jump directly into the stories that matter most to creators, market
          leaders, and local operators.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {trendingTopics.map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white hover:bg-white/20"
            >
              {topic}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          {featuredPost && (
            <>
              <div className="flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-400">
                <span>Editor&apos;s spotlight</span>
                <span>{featuredPost.category}</span>
              </div>
              <div className="mt-4 h-44 overflow-hidden rounded-2xl">
                <img
                  src={featuredPost.cover}
                  alt={featuredPost.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="mt-4 text-3xl font-semibold text-slate-900">
                {featuredPost.title}
              </h3>
              <p className="mt-3 text-sm text-slate-600">{featuredPost.excerpt}</p>
              <div className="mt-6 flex items-center gap-3">
                <span className="inline-flex h-12 w-12 overflow-hidden rounded-full bg-slate-100">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.name}
                    className="h-full w-full object-cover"
                  />
                </span>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-900">
                    {featuredPost.name}
                  </p>
                  <p className="text-xs text-slate-500">{featuredPost.role}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">
                <span>{featuredPost.date}</span>
                <span>{featuredPost.readingTime}</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.3em]">
                <Link
                  to="/blogs"
                  className="text-blue-500 transition hover:text-blue-600"
                >
                  Read featured story →
                </Link>
                <Link
                  to="/blogs"
                  className="text-slate-500 transition hover:text-slate-700"
                >
                  Browse the journal →
                </Link>
              </div>
            </>
          )}
        </article>
        <article className="rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
          <div className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-200">
            Backstage picks
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-[0.1em] text-white">
            What to read next
          </h3>
          <div className="mt-5 space-y-4 text-slate-100">
            {curatedReads.map((post) => (
              <div key={post.id} className="flex items-start gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-2xl bg-slate-800">
                  <img
                    src={post.cover}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{post.title}</p>
                  <p className="mt-1 text-[0.65rem] uppercase tracking-[0.3em] text-slate-200">
                    {post.date} · {post.readingTime}
                  </p>
                  <p className="mt-2 text-xs text-slate-200">{post.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-200">
            Send us your angle and we may spotlight it in the next issue.
          </p>
          <Link
            to="/blogs"
            className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.3em] text-white underline decoration-white/80 transition hover:text-white"
          >
            Share a story →
          </Link>
        </article>
      </section>

      <section className="mt-12">
        <div className="rounded-3xl bg-slate-50 px-6 py-10 shadow-xl transition sm:px-10">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-slate-400">
              Insights
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
              Discover Tips, Trends &amp; Strategies
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Learn quick, actionable stories from our team of creators, hosts,
              and operators so your next experience feels effortless.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-44 overflow-hidden rounded-2xl">
                  <img
                    src={post.cover}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-5 flex-1">
                  <div className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-slate-400">
                    {post.category}
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {post.excerpt}
                  </p>
                </div>
                <div className="mt-6 flex flex-col gap-3 text-[0.7rem] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 overflow-hidden rounded-full bg-slate-100">
                      <img
                        src={post.image}
                        alt={post.name}
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-900">
                        {post.name}
                      </p>
                      <p className="text-[0.55rem] text-slate-500">
                        {post.role}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p>{post.date}</p>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-400">
                      {post.readingTime}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link
                    to="/blogs"
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500 transition hover:text-blue-600"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
              Newsletter
            </p>
            <p className="mt-1 text-xl font-semibold sm:text-2xl">
              Get the latest posts straight to your inbox.
            </p>
          </div>
          <Link
            to="/sign-up"
            className="rounded-full border border-white/60 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white"
          >
            Join the list
          </Link>
        </div>
      </section>
    </main>
  )
}
