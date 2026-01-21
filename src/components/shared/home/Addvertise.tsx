import heroImage from "@/assets/images/event.svg"
import highlightImage from "@/assets/images/wheel.svg"
import bowlingImage from "@/assets/images/bowling.svg"
import waterImage from "@/assets/images/aqua.svg"

export default function Addvertise() {
  return (
    <section className="mt-12">
      <div className="max-w-4xl pb-6 ">
        <h3 className="text-[32px] font-bold text-black sm:text-2xl ">
  Weekend Activities & Experiences
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Discover fun things to do this weekend around you.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="relative min-h-[451px] overflow-hidden  bg-[#E5E5E5] p-6 mt-30">
          <div className="relative z-10 flex h-full max-w-xs flex-col justify-end">
            <h4 className="text-[28px] font-semibold text-slate-900">
              Weekend Activities
            </h4>
            <p className="mt-2 text-[14px] text-slate-600">
              Find top-rated places for friends, couples, and families nearby.
            </p>
            <button className="mt-4 h-[56px] w-[180px] rounded-full border border-slate-300 bg-white px-4 text-[14px] font-semibold text-black">
              Explore Activities
            </button>
          </div>
          <img
            src={heroImage}
            alt="Weekend activity"
            className="absolute bottom-0 right-0 h-[320px] w-[260px] rounded-tl-2xl object-cover"
          />
        </article>
        <div className="grid gap-5">
          <article className="relative min-h-[284px] w-[620px] overflow-hidden  bg-slate-950 p-5 text-white">
            <span className="inline-flex rounded-lg bg-[#202020] px-3 py-1 text-[12px] font-medium tracking-[0.2em] text-[#F9F9F9]">
              Weekend highlight
            </span>
            <div className="relative z-10 mt-3 max-w-[60%]">
              <h4 className="text-[22px] font-semibold">Adventure Activities</h4>
              <p className="mt-2 text-[13px] font-medium text-white/90">
                Go-karting, trampoline parks, indoor climbing.
              </p>
              <button className="mt-3 h-[56px] w-[180px] rounded-full bg-white px-4 text-[16px] font-semibold text-black">
                Explore
              </button>
            </div>
            <img
              src={highlightImage}
              alt="Adventure activities"
              className="absolute inset-y-0 right-0 h-full w-[46%] object-cover"
            />
          </article>
        
          <div className="grid gap-5 sm:grid-cols-2">
            <article className="relative min-h-[284px]  overflow-hidden  bg-gradient-to-br from-[#5f7d92] via-[#4a6a82] to-[#2b3e4d] p-4 text-white">
              <span className="inline-flex rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                Popular
              </span>
              <h4 className="mt-3 text-sm font-semibold">Bowling & Arcade</h4>
              <p className="mt-1 text-[11px] text-white/70">
                Bowling · Arcade · VR
              </p>
              <button className="mt-3 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-900">
                Explore
              </button>
              <img
                src={bowlingImage}
                alt="Bowling"
                className="absolute inset-0 h-full w-full object-cover opacity-25"
              />
            </article>

            <article className="relative min-h-[284px] overflow-hidden  bg-gradient-to-br from-[#5f8f74] via-[#5b856f] to-[#3f5f4d] p-4 text-white">
              <span className="inline-flex rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                Popular
              </span>
              <h4 className="mt-3 text-sm font-semibold">Water Parks & Rides</h4>
              <p className="mt-1 text-[11px] text-white">
                Slides · Wave pools · Kids zones
              </p>
              <button className="mt-3 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-900">
                Explore
              </button>
              <img
                src={waterImage}
                alt="Water park"
                className="absolute inset-0 h-full w-full object-cover opacity-25"
              />
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
