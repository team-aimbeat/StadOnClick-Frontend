import { useEffect } from "react"
import { useAppDispatch } from "@/app/hooks"
import { setPageTitle } from "@/features/Layout/themeConfigSlice"
import eventImage from "@/assets/images/event.jpg"
import vacationImage from "@/assets/images/vacation.jpeg"
import hotel1 from "@/assets/images/hotel1.jpg"
import hotel2 from "@/assets/images/hotel2.jpg"
import hotel3 from "@/assets/images/hotel3.jpg"

const stats = [
  { label: "Bookings completed", value: "120k+" },
  { label: "Verified venues", value: "4,800+" },
  { label: "Cities covered", value: "28" },
  { label: "Repeat customers", value: "62%" },
]

const values = [
  {
    title: "Verified from the start",
    body: "We onboard venues with real checks so you can book with confidence.",
  },
  {
    title: "Fast, human support",
    body: "A local team that helps with availability, reschedules, and refunds.",
  },
  {
    title: "Transparent pricing",
    body: "No hidden fees. What you see is what you pay at checkout.",
  },
]

const timeline = [
  { year: "2021", text: "Started with sports venues in two cities." },
  { year: "2022", text: "Expanded into events, salons, and wellness." },
  { year: "2023", text: "Launched instant booking and secure payments." },
  { year: "2024", text: "Scaled to 28 cities with 120k+ bookings." },
]

export default function About() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setPageTitle("About"))
  }, [dispatch])

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 sm:px-6 lg:px-8 text-slate-900">
   <header
  className="
    relative left-1/2 right-1/2
    -ml-[50vw] -mr-[50vw]
    w-screen mb-10
    overflow-hidden py-16
    text-center text-white
  "
  style={{
    backgroundImage: `url(${eventImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {/* overlay */}
  <div className="absolute inset-0 bg-slate-900/65" />

  {/* content container */}
  <div className="relative mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
    <h1 className="text-3xl font-semibold sm:text-4xl">
      About Us
    </h1>
    <p className="mx-auto mt-3 max-w-xl text-sm text-white/85">
      Making venue booking simple, fast, and trusted across cities.
    </p>
  </div>
</header>


      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EEF2FF] via-[#F8FAFC] to-[#ECFEFF] px-6 py-12 shadow-[0_30px_70px_-55px_rgba(15,23,42,0.45)] sm:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          {/* left */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              About StadOnClick
            </p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
              We make booking venues simple, fast, and trusted.
            </h1>
            <p className="mt-4 text-sm text-slate-600">
              StadOnClick connects people with verified venues and experiences.
              From sports and events to wellness and beauty, we help you find the
              right place, the right slot, and the right price.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white">
                Explore venues
              </button>
              <button className="rounded-full border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-800">
                Contact us
              </button>
            </div>
          </div>

          {/* right images */}
          <div className="grid gap-4 sm:grid-cols-2">
            <img src={eventImage} className="h-40 w-full rounded-2xl object-cover shadow-md sm:h-44" />
            <img src={vacationImage} className="h-40 w-full rounded-2xl object-cover shadow-md sm:h-44" />
            <img src={hotel1} className="h-40 w-full rounded-2xl object-cover shadow-md sm:h-44" />
            <img src={hotel2} className="h-40 w-full rounded-2xl object-cover shadow-md sm:h-44" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-2xl font-semibold">{item.value}</p>
            <p className="mt-1 text-xs text-slate-500">{item.label}</p>
          </div>
        ))}
      </section>

      {/* VALUES + JOURNEY */}
      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Our values</h2>
          <div className="mt-5 space-y-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold">{v.title}</p>
                <p className="mt-1 text-xs text-slate-600">{v.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Our journey</h2>
          <div className="mt-5 space-y-4">
            {timeline.map((item) => (
              <div key={item.year} className="flex gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white">
                  {item.year}
                </div>
                <p className="text-xs text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-r from-[#EDE9FE] via-[#FCE7F3] to-[#DBEAFE] p-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-2xl font-semibold">Built with local partners</h2>
            <p className="mt-3 text-sm text-slate-700">
              We partner with venue owners, coaches, and service teams to keep listings accurate.
            </p>
          </div>

          <div className="relative min-h-[240px] overflow-hidden rounded-3xl">
            <img src={hotel3} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="mt-12 rounded-3xl bg-slate-50 p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex justify-center">
            <img
              src={eventImage}
              alt="Merchant community"
              className="h-64 w-full max-w-sm rounded-2xl object-cover shadow-md"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Supporting a Vibrant Merchant Community</h2>
            <p className="mt-3 text-sm text-slate-700">
              StadOnClick is committed to championing our local merchant base.
              We invest in visibility, training, and tools that help partners
              grow while keeping experiences affordable for customers.
            </p>
            <p className="mt-3 text-sm text-slate-700">
              Through curated campaigns and local collaborations, we spotlight
              community-first venues and services that make every booking feel
              personal.
            </p>
            <p className="mt-3 text-sm text-slate-700">
              Our team works alongside partners to improve listings, availability,
              and service quality to drive repeat bookings.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-3xl bg-white p-8 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-xl font-semibold">DEI Values in Action</h2>
            <p className="mt-3 text-sm text-slate-700">
              We strive to build an inclusive platform where people feel seen,
              respected, and supported. Our initiatives focus on fair access,
              representation, and growth opportunities for partners.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>Supporting emerging founders across categories.</li>
              <li>Inclusive programming and community workshops.</li>
              <li>Fair visibility across brands and regions.</li>
              <li>Partner success stories that celebrate diversity.</li>
            </ul>
          </div>
          <div className="flex justify-center">
            <img
              src={hotel2}
              alt="Team community"
              className="h-56 w-full max-w-sm rounded-2xl object-cover shadow-md"
            />
          </div>
        </div>
      </section>

    </main>
  )
}

