import sight1 from "@/assets/Images/sight1.svg"
import sight2 from "@/assets/Images/sight2.svg"
import sight3 from "@/assets/Images/sight3.svg"
import sight4 from "@/assets/Images/sight4.svg"
import sight5 from "@/assets/Images/sight5.svg"

export default function HomeSightseeing() {
  return (
    <section className="mt-16 bg-slate-100 py-10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 lg:grid-cols-[1fr_1.2fr_1fr]">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[16px] italic text-slate-600">
              It helps me avoid traffic jams
            </p>
            <p className="mt-2 text-[14px] font-semibold text-slate-700">
              Sam Carter
            </p>
            <p className="text-[12px] text-slate-400">Tourist, UK</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl shadow-sm">
            <img
              src={sight2}
              alt="City drive"
              className="h-[250px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/40" />
            <p className="absolute bottom-3 left-3 text-[16px] font-semibold text-white">
              I never want to drive a city-less car
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[16px] font-semibold text-slate-700">
              Related experiences
            </p>
            <ul className="mt-2 space-y-1 text-[14px] text-slate-500">
              <li>Scenic coastlines</li>
              <li>Local attractions</li>
              <li>Mountain getaways</li>
            </ul>
            <button className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-slate-900">
              ↗ Visit site
            </button>
          </div>

          
        </div>

        {/* CENTER COLUMN */}
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <img
            src={sight5}
            alt="Main scenic view"
            className="h-full min-h-[380px] w-full object-cover "
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-2xl shadow-sm">
            <img
              src={sight4}
              alt="Traveler"
              className="h-[250px] w-full object-cover"
            />
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-2xl font-semibold text-slate-200">“</p>
            <p className="mt-2 text-[14px] text-slate-600">
              I love SYNC because it helps me save money.
            </p>
            <p className="mt-3 text-sm font-semibold text-slate-700">
              Daniel Smith
            </p>
            <p className="text-[12px] text-slate-400">Marketing, USA</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-800">
              The automotive user experience is being redefined.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Enjoy curated places with real-time updates and simpler planning.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-1">
                Need help
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1">
                Recommend
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
