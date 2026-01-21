import sight1 from "@/assets/Images/sight1.svg"
import sight2 from "@/assets/Images/sight2.svg"
import sight3 from "@/assets/Images/sight3.svg"
import sight4 from "@/assets/Images/sight4.svg"
import sight5 from "@/assets/Images/sight5.svg"

export default function HomeSightseeing() {
  return (
    <section className="mt-14">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">

        {/* LEFT COLUMN */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="inline-block rounded-sm bg-[#F1FAFF] px-3 py-1 text-[13px] font-medium text-black">
              Curated spots • Real photos • Updated info
            </span>

            <h2 className="mt-3 text-[30px] font-semibold text-green-950 ">
              Discover sightseeing near you
            </h2>

            <p className="mt-2 max-w-lg text-[14px] leading-6 text-gray-700">
              Browse handpicked viewpoints, parks, and local attractions.
              See what’s open, what’s trending, and plan your visit in minutes.
            </p>

            <button className="mt-5 rounded-full border border-[#3289FF] px-6 py-2 text-sm font-semibold text-[#3289FF] hover:border-blue-600 hover:text-blue-700">
              Explore
            </button>
          </div>

          {/* Bottom image */}
          <div className="mt-5 overflow-hidden">
            <img
              src={sight3}
              alt="City skyline at night"
              className="h-[210px] w-[420px] object-cover"
            />
          </div>
        </div>

        {/* MIDDLE COLUMN (STACKED IMAGES) */}
       <div className="flex flex-col gap-2">
  <div className="overflow-hidden">
    <img
      src={sight4}
      alt="Mountain river view"
      className="h-[448px] w-[350px] object-cover object-top"
    />
  </div>

  <div className="overflow-hidden ">
    <img
      src={sight1}
      alt="Scenic landscape"
      className="h-[70px] w-[350px] object-cover object-bottom"
    />
  </div>
</div>


        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-2">
          <div className="overflow-hidden">
            <img
              src={sight2}
              alt="Forest river"
              className="h-[224px] w-[350px] object-cover"
            />
          </div>

          <div className="overflow-hidden">
            <img
              src={sight5}
              alt="Lake pier at sunset"
              className="h-[294px] w-[350px] object-cover"
            />
          </div>
        </div>

      </div>
    </section>
  )
}
