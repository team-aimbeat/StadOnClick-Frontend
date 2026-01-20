import { useEffect, useState } from "react"
import profile7 from "@/assets/images/profile-7.jpeg"
import profile8 from "@/assets/images/profile-8.jpeg"
import profile9 from "@/assets/images/profile-9.jpeg"
import { useAppDispatch } from "@/app/hooks"
import { setPageTitle } from "@/features/Layout/themeConfigSlice"

const team = [
  {
    name: "Aarav Mehta",
    role: "Founder & CEO",
    department: "Leadership",
    location: "Mumbai",
    bio: "Product-focused leader building trusted booking experiences.",
    highlights: ["Marketplace strategy", "Partner growth", "User trust"],
    image: profile7,
  },
  {
    name: "Nisha Kapoor",
    role: "Head of Partnerships",
    department: "Partnerships",
    location: "Delhi",
    bio: "Works with venue owners to grow across cities.",
    highlights: ["Onboarding playbooks", "City expansion", "Partner success"],
    image: profile8,
  },
  {
    name: "Rohan Verma",
    role: "Design Lead",
    department: "Design",
    location: "Bangalore",
    bio: "Crafts simple, reliable interfaces for fast bookings.",
    highlights: ["Mobile UX", "Design systems", "Conversion flows"],
    image: profile9,
  },
]

const values = [
  {
    title: "Customer-first",
    body: "Every decision starts with a smoother booking flow.",
  },
  {
    title: "Local expertise",
    body: "We partner with teams who know their city best.",
  },
  {
    title: "Trust & safety",
    body: "Verified listings and protected payments by default.",
  },
]

export default function Teams() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setPageTitle("Teams"))
  }, [dispatch])

  const [activeDept, setActiveDept] = useState("All")
  const [expanded, setExpanded] = useState<string | null>(null)
  const departments = ["All", "Leadership", "Partnerships", "Design"]
  const visibleTeam =
    activeDept === "All"
      ? team
      : team.filter((member) => member.department === activeDept)

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 sm:px-6 lg:px-8 text-slate-900">
     <header
  className="
    relative left-1/2 right-1/2
    -ml-[50vw] -mr-[50vw]
    w-screen
    overflow-hidden
    py-16 text-center text-white
    shadow-[0_30px_70px_-55px_rgba(15,23,42,0.45)]
  "
  style={{
    backgroundImage: `url(${profile7})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {/* overlay */}
  <div className="absolute inset-0 bg-slate-900/60" />

  {/* CONTENT CONTAINER (centered) */}
  <div className="relative mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
      Our Team
    </p>
    <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
      People behind StadOnClick
    </h1>
    <p className="mx-auto mt-3 max-w-xl text-sm text-white/85">
      A small team focused on building trusted, effortless bookings.
    </p>
  </div>
</header>


      <section className="mt-8 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-3">
        {departments.map((dept) => (
          <button
            key={dept}
            type="button"
            onClick={() => {
              setActiveDept(dept)
              setExpanded(null)
            }}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeDept === dept
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300"
            }`}
          >
            {dept}
          </button>
        ))}
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleTeam.map((member) => (
          <article
            key={member.name}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
          >
            <img
              src={member.image}
              alt={member.name}
              className="h-20 w-20 rounded-2xl object-cover shadow-sm"
            />
            <h2 className="mt-4 text-lg font-semibold">{member.name}</h2>
            <p className="text-sm text-slate-600">{member.role}</p>
            <p className="mt-2 text-xs text-slate-500">
              {member.department} · {member.location}
            </p>
            <p className="mt-3 text-sm text-slate-600">{member.bio}</p>
            <button
              type="button"
              onClick={() =>
                setExpanded(expanded === member.name ? null : member.name)
              }
              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-900"
            >
              {expanded === member.name ? "Hide focus areas" : "View focus areas"}
              <span className="text-base">&gt;</span>
            </button>
            {expanded === member.name ? (
              <div className="mt-4 rounded-2xl bg-white p-4 text-xs text-slate-600">
                <p className="font-semibold text-slate-900">Focus areas</p>
                <ul className="mt-2 space-y-1">
                  {member.highlights.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        ))}
      </section>

      <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold">How we work</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((item) => (
            <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
