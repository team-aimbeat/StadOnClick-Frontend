import heroImage from "@/assets/images/event.svg"
import highlightImage from "@/assets/images/wheel.svg"
import bowlingImage from "@/assets/images/bowling.svg"
import waterImage from "@/assets/images/aqua.svg"

export default function HomeStudios() {
  return (
    <section className="mt-14 ">
      
      {/* Heading */}
      <div className="max-w-7xl mx-auto px-2 pb-6">
        <h3 className="text-2xl font-semibold text-slate-900">
          Weekend Activities & Experiences
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Discover fun things to do this weekend around you.
        </p>
      </div>

      {/* Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-[1.2fr_1fr] gap-6">
        
        {/* LEFT BIG CARD */}
        <article className="relative h-[460px] overflow-hidden rounded-xl bg-slate-100 p-8">
          <div className="relative z-10 flex h-full max-w-sm flex-col justify-end">
            <h4 className="text-[30px] font-semibold text-slate-900">
              Weekend Activities
            </h4>
            <p className="mt-2 text-[14px] text-[#2C2C2C]">
              Find top-rated places for friends, couples, and families nearby.
            </p>
            <button className="mt-5 h-[56px] w-[190px] rounded-full border border-slate-300 bg-white text-[16px] font-semibold text-black">
              Explore Activities
            </button>
          </div>

          <img
            src={heroImage}
            alt="Weekend activity"
            className="absolute bottom-0 right-6 h-[380px] object-contain"
          />
        </article>

        {/* RIGHT COLUMN */}
        <div className="grid gap-6">
          
          {/* TOP RIGHT CARD */}
          <article className="relative h-[215px] overflow-hidden rounded-xl bg-black p-6 text-white">
            <span className="inline-flex rounded-md bg-[#202020] px-3 py-1 text-xs tracking-widest">
              Weekend highlight
            </span>

            <div className="relative z-10 mt-4 max-w-[60%]">
              <h4 className="text-2xl font-semibold">
                Adventure Activities
              </h4>
              <p className="mt-2 text-sm text-white/90">
                Go-karting, trampoline parks, indoor climbing.
              </p>
              <button className="mt-4 h-[52px] w-[180px] rounded-full bg-white text-[16px] font-semibold text-black">
                Explore
              </button>
            </div>

            <img
              src={highlightImage}
              alt="Adventure"
              className="absolute right-0 top-0 h-full w-[45%] object-cover"
            />
          </article>

          {/* BOTTOM SMALL CARDS */}
          <div className="grid grid-cols-2 gap-6">
            
            <article className="relative h-[215px] overflow-hidden rounded-xl bg-[#4A6A82] p-5 text-white">
              <span className="inline-flex rounded-full bg-white/20 px-2 py-0.5 text-[10px] tracking-widest">
                Popular
              </span>

              <h4 className="mt-4 text-sm font-semibold">
                Bowling & Arcade
              </h4>
              <p className="mt-1 text-xs text-white/70">
                Bowling • Arcade • VR
              </p>

              <button className="mt-4 rounded-full bg-white px-4 py-1 text-xs font-semibold text-black">
                Explore
              </button>

              <img
                src={bowlingImage}
                alt="Bowling"
                className="absolute inset-0 h-full w-full object-cover opacity-20"
              />
            </article>

            <article className="relative h-[215px] overflow-hidden rounded-xl bg-[#5B856F] p-5 text-white">
              <span className="inline-flex rounded-full bg-white/20 px-2 py-0.5 text-[10px] tracking-widest">
                Popular
              </span>

              <h4 className="mt-4 text-sm font-semibold">
                Water Parks & Rides
              </h4>
              <p className="mt-1 text-xs text-white/80">
                Slides • Wave pools • Kids zones
              </p>

              <button className="mt-4 rounded-full bg-white px-4 py-1 text-xs font-semibold text-black">
                Explore
              </button>

              <img
                src={waterImage}
                alt="Water park"
                className="absolute inset-0 h-full w-full object-cover opacity-20"
              />
            </article>

          </div>
        </div>
      </div>
    </section>
  )
}
