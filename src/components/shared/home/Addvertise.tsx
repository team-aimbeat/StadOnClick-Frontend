import heroImage from "@/assets/images/event.svg";
import highlightImage from "@/assets/images/wheel.svg";
import bowlingImage from "@/assets/images/bowling.svg";
import waterImage from "@/assets/images/aqua.svg";

export default function Addvertise() {
  return (
    <section className="mt-20">
      <div className="mx-auto max-w-7xl">

        {/* SECTION HEADING */}
        <div className="mx-auto mb-10 w-full max-w-3xl text-center">
          <h3 className="text-[30px] font-bold text-black tracking-wider">
            Weekend Activities & Experiences
          </h3>
          <p className="mt-2 text-[16px] text-slate-600">
            Discover fun things to do this weekend around you.
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">

          {/* LEFT BIG CARD */}
          <article className="relative min-h-[560px] overflow-hidden  bg-[#E5E5E5]">
            <div className="absolute bottom-8 left-8 z-10 max-w-xs">
              <h4 className="text-[28px] font-semibold text-slate-900">
                Weekend Activities
              </h4>

              <p className="mt-2 text-[14px] text-slate-600">
                Find top-rated places for friends, couples, and families nearby.
              </p>

              <button className="mt-4 h-[48px] w-[200px] rounded-full border border-slate-300 bg-white text-[14px] font-semibold tracking-widest">
                Explore Activities
              </button>
            </div>

            <img
              src={heroImage}
              alt="Weekend activity"
              className="absolute bottom-0 right-0 h-[420px] w-[320px] object-contain"
            />
          </article>

          {/* RIGHT COLUMN */}
          <div className="grid gap-5">

            {/* HIGHLIGHT CARD */}
            <article className="relative min-h-[270px] overflow-hidden  bg-black p-6 text-white">
              <span className="inline-flex rounded-lg bg-white/10 px-3 py-1 text-[12px] uppercase tracking-widest">
                Weekend Highlight
              </span>

              <div className="relative z-10 mt-4 max-w-[60%]">
                <h4 className="text-[22px] font-semibold">
                  Adventure Activities
                </h4>
                <p className="mt-2 text-[13px] text-white/80">
                  Go-karting, trampoline parks, indoor climbing.
                </p>

                <button className="mt-4 h-[36px] w-[120px] rounded-full bg-white text-[14px] font-medium text-black">
                  Explore
                </button>
              </div>

              <img
                src={highlightImage}
                alt="Adventure"
                className="absolute right-0 top-0 h-full w-[45%] object-contain"
              />
            </article>

            {/* SMALL CARDS */}
            <div className="grid gap-5 sm:grid-cols-2">

              {/* BOWLING */}
              <article
                className="relative min-h-[260px] overflow-hidden  bg-cover bg-center p-6 text-white"
                style={{ backgroundImage: `url(${bowlingImage})` }}
              >
                <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[12px] uppercase tracking-widest">
                  Popular
                </span>

                <div className="absolute bottom-6 left-6">
                  <h4 className="text-[22px] font-semibold">
                    Bowling & Arcade
                  </h4>
                  <p className="mt-1 text-[13px] text-white/90">
                    Bowling · Arcade · VR
                  </p>

                  <button className="mt-3 h-[36px] w-[120px] rounded-full bg-white text-[14px] text-black">
                    Explore
                  </button>
                </div>
              </article>

              {/* WATER PARK */}
              <article
                className="relative min-h-[260px] overflow-hidden  bg-cover bg-center p-6 text-white"
                style={{ backgroundImage: `url(${waterImage})` }}
              >
                <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[12px] uppercase tracking-widest">
                  Popular
                </span>

                <div className="absolute bottom-6 left-6">
                  <h4 className="text-[22px] font-semibold">
                    Water Parks & Rides
                  </h4>
                  <p className="mt-1 text-[13px] text-white/90">
                    Slides · Wave pools · Kids zones
                  </p>

                  <button className="mt-3 h-[36px] w-[120px] rounded-full bg-white text-[14px] text-black">
                    Explore
                  </button>
                </div>
              </article>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
