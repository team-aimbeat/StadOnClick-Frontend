import eventImage from "@/assets/images/event.jpg"
import vacationImage from "@/assets/images/vacation.jpeg"
import movieImage from "@/assets/images/movie.jpg"

export default function HomeNewYearDeals() {
  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[#246af7c7] mt-10">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid items-center gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          
          {/* LEFT CONTENT */}
          <div className="text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
              Sale ends: Jan 8, 13:29 (GMT+5.5)
            </p>

            <div className="mt-2 flex items-center gap-3">
              <h2 className="text-2xl font-semibold sm:text-3xl">
                New Year Deals
              </h2>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/40 text-sm">
                →
              </span>
            </div>

            {/* DEAL CARDS */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white px-4 py-3 text-center text-slate-900">
                <p className="text-sm font-semibold text-emerald-600">
                  Rs 186 OFF
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  orders Rs 1,399+
                </p>
                <p className="mt-1 text-[11px] font-semibold text-slate-700">
                  Code: O1CD02
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-white/90 px-3 py-3 text-slate-900">
                <div className="h-12 w-12 overflow-hidden rounded-lg">
                  <img
                    src={movieImage}
                    alt="Top deals"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">Top deals</p>
                  <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold">
                    Rs 1,220
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-white/90 px-3 py-3 text-slate-900">
                <div className="h-12 w-12 overflow-hidden rounded-lg">
                  <img
                    src={vacationImage}
                    alt="New year gifts"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">New year gifts</p>
                  <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold">
                    Rs 746
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative">
            <div className="overflow-hidden  p-2">
              <img
                src={eventImage}
                alt="Featured deal"
                className="h-40 w-full rounded-xl object-cover sm:h-44 lg:h-48"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
